'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    BookOpen,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Search,
    Loader2,
    Save,
    X,
    Tag,
    FileText
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
    content: string;
    coverImageUrl: string | null;
    tags: string[];
    viewCount: number;
    isPublished: boolean;
    createdAt: string;
}

const categoryLabels: Record<ArticleCategory, string> = {
    CROP_GUIDE: 'คู่มือปลูกพืช',
    LIVESTOCK_GUIDE: 'คู่มือเลี้ยงสัตว์',
    PEST_CONTROL: 'การกำจัดศัตรูพืช',
    SOIL_MANAGEMENT: 'การจัดการดิน',
    WATER_MANAGEMENT: 'การจัดการน้ำ',
    HARVESTING: 'การเก็บเกี่ยว',
    POST_HARVEST: 'หลังการเก็บเกี่ยว',
    MARKET_TIPS: 'เคล็ดลับการตลาด',
    EQUIPMENT: 'เครื่องมือและอุปกรณ์',
    GENERAL: 'ความรู้ทั่วไป',
};

export default function AdminKnowledgePage() {
    const { data: session } = useSession();
    const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ published: 'all' });
            if (searchQuery) params.append('search', searchQuery);

            const res = await fetch(`/api/knowledge?${params}`);
            const data = await res.json();
            setArticles(data);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchArticles();
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const togglePublish = async (article: KnowledgeArticle) => {
        try {
            const res = await fetch(`/api/knowledge/${article.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublished: !article.isPublished }),
            });
            if (res.ok) {
                setArticles(articles.map(a =>
                    a.id === article.id ? { ...a, isPublished: !a.isPublished } : a
                ));
            }
        } catch (error) {
            console.error('Error updating article:', error);
        }
    };

    const deleteArticle = async (id: string) => {
        if (!confirm('ต้องการลบบทความนี้หรือไม่?')) return;
        try {
            const res = await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setArticles(articles.filter(a => a.id !== id));
            }
        } catch (error) {
            console.error('Error deleting article:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <BookOpen className="text-white" size={22} />
                            </div>
                            จัดการคลังความรู้
                        </h1>
                        <p className="text-slate-400 mt-1">เพิ่ม แก้ไข และจัดการบทความความรู้</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-white font-medium flex items-center gap-2 transition-all"
                    >
                        <Plus size={18} />
                        เพิ่มบทความ
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหาบทความ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <FileText className="text-blue-400" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{articles.length}</p>
                                <p className="text-sm text-slate-400">บทความทั้งหมด</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <Eye className="text-emerald-400" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {articles.filter(a => a.isPublished).length}
                                </p>
                                <p className="text-sm text-slate-400">เผยแพร่แล้ว</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                <Eye className="text-amber-400" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {articles.reduce((sum, a) => sum + a.viewCount, 0).toLocaleString()}
                                </p>
                                <p className="text-sm text-slate-400">ยอดอ่านรวม</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Articles List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-emerald-500" size={40} />
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
                        <BookOpen className="mx-auto text-slate-600 mb-4" size={48} />
                        <p className="text-slate-400">ยังไม่มีบทความ</p>
                    </div>
                ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium">บทความ</th>
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium">หมวดหมู่</th>
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium">ยอดอ่าน</th>
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium">สถานะ</th>
                                    <th className="text-right py-4 px-6 text-slate-400 font-medium">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles.map((article) => (
                                    <tr key={article.id} className="border-b border-slate-800 last:border-0">
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="font-medium text-white">{article.title}</p>
                                                <p className="text-sm text-slate-500 truncate max-w-md">{article.summary}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-slate-400">{categoryLabels[article.category]}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-slate-400">{article.viewCount.toLocaleString()}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={() => togglePublish(article)}
                                                className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 transition-colors ${article.isPublished
                                                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                                    }`}
                                            >
                                                {article.isPublished ? (
                                                    <>
                                                        <Eye size={12} />
                                                        เผยแพร่
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff size={12} />
                                                        ฉบับร่าง
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingArticle(article)}
                                                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="แก้ไข"
                                                >
                                                    <Edit className="text-slate-400" size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteArticle(article.id)}
                                                    className="p-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg transition-colors"
                                                    title="ลบ"
                                                >
                                                    <Trash2 className="text-rose-400" size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {(isCreating || editingArticle) && (
                <ArticleEditor
                    article={editingArticle}
                    onClose={() => {
                        setIsCreating(false);
                        setEditingArticle(null);
                    }}
                    onSaved={() => {
                        setIsCreating(false);
                        setEditingArticle(null);
                        fetchArticles();
                    }}
                />
            )}
        </div>
    );
}

// Article Editor Modal
function ArticleEditor({
    article,
    onClose,
    onSaved
}: {
    article: KnowledgeArticle | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<{ id: number; name: string; imageUrl: string | null }[]>([]);
    const [form, setForm] = useState({
        title: article?.title || '',
        slug: article?.slug || '',
        category: article?.category || 'GENERAL' as ArticleCategory,
        summary: article?.summary || '',
        content: article?.content || '',
        coverImageUrl: article?.coverImageUrl || '',
        tags: article?.tags.join(', ') || '',
        productIds: (article as any)?.productIds || [] as number[],
        isPublished: article?.isPublished || false,
    });

    // Fetch products for linking
    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error('Error fetching products:', err));
    }, []);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9ก-๙\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...form,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            productIds: form.productIds,
        };

        try {
            const url = article ? `/api/knowledge/${article.id}` : '/api/knowledge';
            const method = article ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                onSaved();
            }
        } catch (error) {
            console.error('Error saving article:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl my-8" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="text-emerald-400" size={24} />
                        {article ? 'แก้ไขบทความ' : 'เพิ่มบทความใหม่'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="text-slate-400" size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">ชื่อบทความ</label>
                        <input
                            type="text"
                            required
                            value={form.title}
                            onChange={(e) => {
                                setForm({
                                    ...form,
                                    title: e.target.value,
                                    slug: form.slug || generateSlug(e.target.value)
                                });
                            }}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Slug (URL)</label>
                            <input
                                type="text"
                                required
                                value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">หมวดหมู่</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value as ArticleCategory })}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                            >
                                {Object.entries(categoryLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">สรุปย่อ</label>
                        <textarea
                            rows={2}
                            required
                            value={form.summary}
                            onChange={(e) => setForm({ ...form, summary: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">เนื้อหา (Markdown)</label>
                        <textarea
                            rows={12}
                            required
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            placeholder="# หัวข้อ&#10;&#10;เนื้อหาของบทความ...&#10;&#10;## หัวข้อย่อย&#10;&#10;- รายการ 1&#10;- รายการ 2"
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none font-mono text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">รูปหน้าปก (URL)</label>
                            <input
                                type="url"
                                value={form.coverImageUrl}
                                onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">แท็ก (คั่นด้วยคอมม่า)</label>
                            <input
                                type="text"
                                value={form.tags}
                                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                placeholder="ข้าว, เกษตรอินทรีย์, ปุ๋ย"
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Product Linking */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">เชื่อมโยงกับผลผลิต (สำหรับปุ่ม "สร้างแผน")</label>
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl max-h-40 overflow-y-auto">
                            {products.map((product) => (
                                <label
                                    key={product.id}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${form.productIds.includes(product.id)
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.productIds.includes(product.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setForm({ ...form, productIds: [...form.productIds, product.id] });
                                            } else {
                                                setForm({ ...form, productIds: form.productIds.filter((id: number) => id !== product.id) });
                                            }
                                        }}
                                        className="sr-only"
                                    />
                                    <span className="text-sm">{product.name}</span>
                                </label>
                            ))}
                            {products.length === 0 && (
                                <span className="text-slate-500 text-sm">กำลังโหลดผลผลิต...</span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">เลือกผลผลิตที่เกี่ยวข้องกับบทความนี้</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="published"
                            checked={form.isPublished}
                            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                        />
                        <label htmlFor="published" className="text-slate-300">
                            เผยแพร่บทความทันที
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-all"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {article ? 'บันทึก' : 'สร้างบทความ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
