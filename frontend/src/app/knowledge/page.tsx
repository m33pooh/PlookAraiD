'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    BookOpen,
    Search,
    Filter,
    Sprout,
    Bug,
    Droplets,
    Sun,
    Package,
    TrendingUp,
    Wrench,
    Eye,
    ChevronRight,
    Loader2,
    Leaf,
    Tag
} from 'lucide-react';

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
    coverImageUrl: string | null;
    tags: string[];
    viewCount: number;
    createdAt: string;
    author: {
        id: string;
        username: string;
        profile: {
            fullName: string | null;
            avatarUrl: string | null;
        } | null;
    } | null;
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

export default function KnowledgePage() {
    const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | ''>('');

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedCategory) params.append('category', selectedCategory);

            const res = await fetch(`/api/knowledge?${params}`);
            const data = await res.json();
            // Ensure data is an array before setting state
            setArticles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching articles:', error);
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchArticles();
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, selectedCategory]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchArticles();
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-emerald-900/50 via-slate-900 to-slate-900 py-16 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="text-white" size={40} />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        คลังความรู้เกษตร
                    </h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
                        แหล่งรวมความรู้ เทคนิค และคู่มือการเกษตรครบวงจร
                        จากผู้เชี่ยวชาญและเกษตรกรผู้มีประสบการณ์
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="ค้นหาบทความ เช่น การปลูกข้าว, กำจัดแมลง..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-800/80 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-lg"
                            />
                        </div>
                    </form>
                </div>
            </div>

            {/* Category Filter */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-wrap gap-2 justify-center">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedCategory === ''
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                    >
                        ทั้งหมด
                    </button>
                    {Object.entries(categoryInfo).map(([key, { label, icon: Icon }]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedCategory(key as ArticleCategory)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${selectedCategory === key
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Articles Grid */}
            <div className="max-w-6xl mx-auto px-4 pb-16">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-emerald-500" size={40} />
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-20">
                        <BookOpen className="mx-auto text-slate-600 mb-4" size={48} />
                        <p className="text-slate-400">ไม่พบบทความที่ตรงกับเงื่อนไข</p>
                        <p className="text-slate-500 text-sm mt-1">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => {
                            const catInfo = categoryInfo[article.category];
                            const CatIcon = catInfo.icon;
                            return (
                                <Link
                                    key={article.id}
                                    href={`/knowledge/${article.slug}`}
                                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all group"
                                >
                                    {/* Cover Image */}
                                    <div className={`h-40 bg-gradient-to-br ${catInfo.color} relative`}>
                                        {article.coverImageUrl ? (
                                            <img
                                                src={article.coverImageUrl}
                                                alt={article.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <CatIcon className="text-white/30" size={64} />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1">
                                                <CatIcon size={12} />
                                                {catInfo.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                                            {article.title}
                                        </h3>
                                        <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                                            {article.summary}
                                        </p>

                                        {/* Tags */}
                                        {article.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {article.tags.slice(0, 3).map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded-full"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                <Eye size={14} />
                                                <span>{article.viewCount.toLocaleString()} อ่าน</span>
                                            </div>
                                            <span className="text-emerald-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                                อ่านเพิ่มเติม
                                                <ChevronRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
