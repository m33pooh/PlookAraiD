import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Get article by ID or slug
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const incrementView = searchParams.get("view") !== 'false';

    try {
        // Try to find by slug first (more SEO friendly), then by ID
        let article = await db.knowledgeArticle.findFirst({
            where: {
                OR: [
                    { slug: id },
                    { id: id },
                ],
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        profile: {
                            select: {
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });

        if (!article) {
            return NextResponse.json({ error: "Article not found" }, { status: 404 });
        }

        // Increment view count
        if (incrementView && article.isPublished) {
            await db.knowledgeArticle.update({
                where: { id: article.id },
                data: { viewCount: { increment: 1 } },
            });
            article = { ...article, viewCount: article.viewCount + 1 };
        }

        // Get related articles (same category, different article)
        const relatedArticles = await db.knowledgeArticle.findMany({
            where: {
                category: article.category,
                id: { not: article.id },
                isPublished: true,
            },
            select: {
                id: true,
                title: true,
                slug: true,
                summary: true,
                coverImageUrl: true,
            },
            take: 4,
            orderBy: { viewCount: 'desc' },
        });

        // Get product details for linked products (for Create Plan feature)
        let relatedProducts: any[] = [];
        if (article.productIds && article.productIds.length > 0) {
            relatedProducts = await db.product.findMany({
                where: {
                    id: { in: article.productIds },
                },
                select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                    growthDurationDays: true,
                    category: true,
                },
            });
        }

        return NextResponse.json({
            ...article,
            relatedArticles,
            relatedProducts,
        });
    } catch (error) {
        console.error("Error fetching knowledge article:", error);
        return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
    }
}

// PATCH - Update article
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const existingArticle = await db.knowledgeArticle.findUnique({
            where: { id },
        });

        if (!existingArticle) {
            return NextResponse.json({ error: "Article not found" }, { status: 404 });
        }

        // Check authorization (author or admin)
        const isAuthor = existingArticle.authorId === session.user.id;
        // const isAdmin = session.user.role === 'ADMIN';
        // if (!isAuthor && !isAdmin) {
        //     return NextResponse.json({ error: "Not authorized to update this article" }, { status: 403 });
        // }

        const body = await req.json();
        const {
            title,
            slug,
            category,
            summary,
            content,
            coverImageUrl,
            tags,
            productIds,
            isPublished
        } = body;

        // Check slug uniqueness if changing
        if (slug && slug !== existingArticle.slug) {
            const slugExists = await db.knowledgeArticle.findUnique({
                where: { slug },
            });
            if (slugExists) {
                return NextResponse.json(
                    { error: "An article with this slug already exists" },
                    { status: 400 }
                );
            }
        }

        const updatedArticle = await db.knowledgeArticle.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(slug && { slug }),
                ...(category && { category }),
                ...(summary && { summary }),
                ...(content && { content }),
                ...(coverImageUrl !== undefined && { coverImageUrl }),
                ...(tags !== undefined && { tags }),
                ...(productIds !== undefined && { productIds }),
                ...(isPublished !== undefined && { isPublished }),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        profile: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(updatedArticle);
    } catch (error) {
        console.error("Error updating knowledge article:", error);
        return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
    }
}

// DELETE - Delete article
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const existingArticle = await db.knowledgeArticle.findUnique({
            where: { id },
        });

        if (!existingArticle) {
            return NextResponse.json({ error: "Article not found" }, { status: 404 });
        }

        // Check authorization
        const isAuthor = existingArticle.authorId === session.user.id;
        // const isAdmin = session.user.role === 'ADMIN';
        // if (!isAuthor && !isAdmin) {
        //     return NextResponse.json({ error: "Not authorized to delete this article" }, { status: 403 });
        // }

        await db.knowledgeArticle.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting knowledge article:", error);
        return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
    }
}
