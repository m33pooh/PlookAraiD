import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArticleCategory } from "@prisma/client";

// GET - List/search knowledge articles
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const productId = searchParams.get("productId");
    const published = searchParams.get("published");
    const limit = searchParams.get("limit");

    const whereClause: any = {};

    // Public view only shows published articles
    if (published !== 'all') {
        whereClause.isPublished = true;
    }

    // Filter by category
    if (category && Object.values(ArticleCategory).includes(category as ArticleCategory)) {
        whereClause.category = category as ArticleCategory;
    }

    // Search in title and summary
    if (search) {
        whereClause.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { summary: { contains: search, mode: 'insensitive' } },
        ];
    }

    // Filter by tag
    if (tag) {
        whereClause.tags = { has: tag };
    }

    // Filter by related product
    if (productId) {
        whereClause.productIds = { has: parseInt(productId) };
    }

    try {
        const articles = await db.knowledgeArticle.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                summary: true,
                coverImageUrl: true,
                tags: true,
                viewCount: true,
                isPublished: true,
                createdAt: true,
                updatedAt: true,
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
            orderBy: [
                { viewCount: 'desc' },
                { createdAt: 'desc' }
            ],
            ...(limit && { take: parseInt(limit) }),
        });

        return NextResponse.json(articles);
    } catch (error) {
        console.error("Error fetching knowledge articles:", error);
        return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
    }
}

// POST - Create new article (admin only)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (optional - remove if allowing all users to contribute)
    // if (session.user.role !== 'ADMIN') {
    //     return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    // }

    try {
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

        // Validate required fields
        if (!title || !slug || !category || !summary || !content) {
            return NextResponse.json(
                { error: "Missing required fields: title, slug, category, summary, content" },
                { status: 400 }
            );
        }

        // Check slug uniqueness
        const existingArticle = await db.knowledgeArticle.findUnique({
            where: { slug },
        });

        if (existingArticle) {
            return NextResponse.json(
                { error: "An article with this slug already exists" },
                { status: 400 }
            );
        }

        const article = await db.knowledgeArticle.create({
            data: {
                title,
                slug,
                category,
                summary,
                content,
                coverImageUrl,
                tags: tags || [],
                productIds: productIds || [],
                isPublished: isPublished || false,
                authorId: session.user.id,
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

        return NextResponse.json(article);
    } catch (error) {
        console.error("Error creating knowledge article:", error);
        return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
    }
}
