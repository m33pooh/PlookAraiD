'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    BookOpen,
    ArrowLeft,
    Eye,
    Calendar,
    User,
    Tag,
    ChevronRight,
    Loader2,
    Sprout,
    Leaf,
    Bug,
    Droplets,
    Sun,
    Package,
    TrendingUp,
    Wrench,
    Share2,
    CalendarPlus,
    X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type ArticleCategory =
    | 'CROP_GUIDE'
    | 'LIVESTOCK_GUIDE'
    | 'PEST_CONTROL'
    | 'SOIL_MANAGEMENT'
    | 'WATER_MANAGEMENT'
    | 'HARVESTING'
    | 'POST_HARVEST'
    | 'MARKET_TIPS'
    | 'EQUIPMENT'
    | 'GENERAL';

interface KnowledgeArticle {
    id: string;
    title: string;
    slug: string;
    category: ArticleCategory;
    summary: string;
    content: string;
    coverImageUrl: string | null;
    tags: string[];
    viewCount: number;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        username: string;
        profile: {
            fullName: string | null;
            avatarUrl: string | null;
        } | null;
    } | null;
    relatedArticles: {
        id: string;
        title: string;
        slug: string;
        summary: string;
        coverImageUrl: string | null;
    }[];
    relatedProducts?: {
        id: number;
        name: string;
        imageUrl: string | null;
        growthDurationDays: number;
        category: string;
    }[];
}

const categoryInfo: Record<ArticleCategory, { label: string; icon: React.ElementType; color: string }> = {
    CROP_GUIDE: { label: 'คู่มือปลูกพืช', icon: Sprout, color: 'from-emerald-500 to-green-600' },
    LIVESTOCK_GUIDE: { label: 'คู่มือเลี้ยงสัตว์', icon: Leaf, color: 'from-amber-500 to-orange-600' },
    PEST_CONTROL: { label: 'การกำจัดศัตรูพืช', icon: Bug, color: 'from-rose-500 to-red-600' },
    SOIL_MANAGEMENT: { label: 'การจัดการดิน', icon: Package, color: 'from-yellow-600 to-amber-700' },
    WATER_MANAGEMENT: { label: 'การจัดการน้ำ', icon: Droplets, color: 'from-blue-500 to-cyan-600' },
    HARVESTING: { label: 'การเก็บเกี่ยว', icon: Sun, color: 'from-orange-500 to-yellow-600' },
    POST_HARVEST: { label: 'หลังการเก็บเกี่ยว', icon: Package, color: 'from-purple-500 to-pink-600' },
    MARKET_TIPS: { label: 'เคล็ดลับการตลาด', icon: TrendingUp, color: 'from-teal-500 to-emerald-600' },
    EQUIPMENT: { label: 'เครื่องมือและอุปกรณ์', icon: Wrench, color: 'from-slate-500 to-gray-600' },
    GENERAL: { label: 'ความรู้ทั่วไป', icon: BookOpen, color: 'from-indigo-500 to-purple-600' },
};

export default function ArticlePage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const slug = params.slug as string;
    const [article, setArticle] = useState<KnowledgeArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showProductModal, setShowProductModal] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const res = await fetch(`/api/knowledge/${slug}`);
                if (!res.ok) {
                    throw new Error('Article not found');
                }
                const data = await res.json();
                setArticle(data);
            } catch (err) {
                setError('ไม่พบบทความที่ต้องการ');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchArticle();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="mx-auto text-slate-600 mb-4" size={48} />
                    <p className="text-slate-400 mb-4">{error || 'ไม่พบบทความ'}</p>
                    <Link
                        href="/knowledge"
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 justify-center"
                    >
                        <ArrowLeft size={16} />
                        กลับไปหน้าคลังความรู้
                    </Link>
                </div>
            </div>
        );
    }

    const catInfo = categoryInfo[article.category];
    const CatIcon = catInfo.icon;

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Hero Section */}
            <div className={`relative bg-gradient-to-br ${catInfo.color} py-16 px-4`}>
                <div className="absolute inset-0 bg-black/40" />
                <div className="max-w-4xl mx-auto relative">
                    <Link
                        href="/knowledge"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        กลับไปคลังความรู้
                    </Link>

                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                        <CatIcon size={14} />
                        {catInfo.label}
                    </span>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {article.title}
                    </h1>

                    <p className="text-white/80 text-lg mb-6">
                        {article.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
                        {article.author && (
                            <div className="flex items-center gap-2">
                                <User size={14} />
                                <span>{article.author.profile?.fullName || article.author.username}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>{new Date(article.createdAt).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye size={14} />
                            <span>{article.viewCount.toLocaleString()} อ่าน</span>
                        </div>
                    </div>

                    {/* Create Plan Button */}
                    {article.relatedProducts && article.relatedProducts.length > 0 && (
                        <div className="mt-6">
                            <button
                                onClick={() => {
                                    if (!session) {
                                        router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
                                        return;
                                    }
                                    if (article.relatedProducts!.length === 1) {
                                        // Single product - navigate directly
                                        router.push(`/farmer/plan?productId=${article.relatedProducts![0].id}`);
                                    } else {
                                        // Multiple products - show modal
                                        setShowProductModal(true);
                                    }
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-xl transition-all border border-white/30"
                            >
                                <CalendarPlus size={18} />
                                สร้างแผนการผลิต
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Tags */}
                        {article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {article.tags.map((tag, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/knowledge?tag=${tag}`}
                                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-full transition-colors flex items-center gap-1"
                                    >
                                        <Tag size={12} />
                                        {tag}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Article Content */}
                        <article className="prose prose-invert prose-emerald max-w-none">
                            <div
                                className="text-slate-300 leading-relaxed space-y-4"
                                dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
                            />
                        </article>

                        {/* Share */}
                        <div className="mt-12 pt-8 border-t border-slate-800">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">แชร์บทความนี้</span>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                                        <Share2 className="text-slate-400" size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {article.relatedArticles.length > 0 && (
                            <div className="sticky top-8">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <BookOpen size={18} className="text-emerald-400" />
                                    บทความที่เกี่ยวข้อง
                                </h3>
                                <div className="space-y-4">
                                    {article.relatedArticles.map((related) => (
                                        <Link
                                            key={related.id}
                                            href={`/knowledge/${related.slug}`}
                                            className="block bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-emerald-500/50 transition-all"
                                        >
                                            <h4 className="text-white font-medium text-sm mb-2 line-clamp-2 hover:text-emerald-400 transition-colors">
                                                {related.title}
                                            </h4>
                                            <span className="text-emerald-400 text-xs flex items-center gap-1">
                                                อ่านเพิ่มเติม
                                                <ChevronRight size={12} />
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Selector Modal */}
            {showProductModal && article.relatedProducts && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowProductModal(false)}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-slate-800">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <CalendarPlus className="text-emerald-400" size={24} />
                                เลือกพืชที่จะปลูก
                            </h2>
                            <button onClick={() => setShowProductModal(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <X className="text-slate-400" size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-3">
                            {article.relatedProducts.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => router.push(`/farmer/plan?productId=${product.id}`)}
                                    className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 hover:border-emerald-500/50 text-left"
                                >
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                                            <Sprout className="text-slate-500" size={24} />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white">{product.name}</h3>
                                        <p className="text-sm text-slate-400">ใช้เวลา {product.growthDurationDays} วัน</p>
                                    </div>
                                    <ChevronRight className="text-emerald-400" size={20} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple markdown-like content formatter
function formatContent(content: string): string {
    return content
        // Headers
        .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-white mt-8 mb-4">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-white mt-10 mb-4">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-white mt-12 mb-6">$1</h1>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
        .replace(/(<li[^>]*>.*<\/li>\n)+/g, '<ul class="list-disc list-inside space-y-2 my-4">$&</ul>')
        // Paragraphs
        .replace(/^(?!<[h|u|l])(.+)$/gm, '<p class="mb-4">$1</p>')
        // Line breaks
        .replace(/\n\n/g, '');
}
