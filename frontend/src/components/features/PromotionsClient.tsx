'use client';

import { useState } from 'react';
import { Gift, Sparkles, Filter, Clock } from 'lucide-react';
import { PromotionBanner } from '@/components/features/PromotionBanner';
import { PromotionCard } from '@/components/features/PromotionCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Promotion {
    id: string;
    name: string;
    description?: string | null;
    type: string;
    discountValue?: number | null;
    minPurchase?: number | null;
    startDate: string | Date;
    endDate: string | Date;
    imageUrl?: string | null;
    bannerUrl?: string | null;
    status: string;
}

interface PromotionsClientProps {
    initialPromotions: Promotion[];
}

export default function PromotionsClient({ initialPromotions }: PromotionsClientProps) {
    const [promotions] = useState<Promotion[]>(initialPromotions);
    const [filter, setFilter] = useState<string>('all');

    // Derived state for filtered promotions
    const filteredPromotions = filter === 'all'
        ? promotions
        : promotions.filter(p => p.type === filter);

    const featuredPromotion = promotions.length > 0 ? promotions[0] : null;

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Hero Section */}
            <section className="relative py-12 px-4 lg:px-8 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 to-transparent" />
                <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />

                <div className="relative max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-sm font-medium px-4 py-2 rounded-full mb-4">
                            <Sparkles size={16} />
                            โปรโมชั่นพิเศษ
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                            <span className="gradient-text">โปรโมชั่น</span> และข้อเสนอพิเศษ
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            รวมโปรโมชั่นสุดพิเศษสำหรับเกษตรกรและผู้ซื้อ พร้อมส่วนลดและสิทธิพิเศษมากมาย
                        </p>
                    </div>

                    {/* Featured Promotion Banner */}
                    {featuredPromotion && (
                        <PromotionBanner promotion={featuredPromotion as any} className="mb-8" />
                    )}
                </div>
            </section>

            {/* Promotions Grid */}
            <section className="py-8 px-4 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
                        <div className="flex items-center gap-2 text-slate-400 mr-4">
                            <Filter size={18} />
                            <span className="text-sm font-medium">กรอง:</span>
                        </div>
                        {[
                            { value: 'all', label: 'ทั้งหมด' },
                            { value: 'PERCENTAGE_DISCOUNT', label: 'ส่วนลด %' },
                            { value: 'FIXED_DISCOUNT', label: 'ลดราคา' },
                            { value: 'FREE_SHIPPING', label: 'ฟรีค่าส่ง' },
                            { value: 'BUNDLE_DEAL', label: 'แพ็คเกจ' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setFilter(option.value)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${filter === option.value
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    {filteredPromotions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPromotions.map((promotion) => (
                                <Link key={promotion.id} href={`/promotions/${promotion.id}`}>
                                    <PromotionCard promotion={promotion as any} />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Gift className="text-slate-600" size={40} />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                ยังไม่มีโปรโมชั่น
                            </h3>
                            <p className="text-slate-400 mb-6">
                                ติดตามโปรโมชั่นใหม่ๆ ได้เร็วๆ นี้
                            </p>
                            <Link href="/">
                                <Button variant="primary">กลับหน้าหลัก</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Promotional Banner Section */}
            <section className="py-12 px-4 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 lg:p-12 border border-slate-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                            <div className="flex-1 text-center lg:text-left">
                                <div className="flex items-center gap-2 text-amber-400 mb-4 justify-center lg:justify-start">
                                    <Clock size={20} />
                                    <span className="font-medium">อย่าพลาด!</span>
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                                    มีรหัสโปรโมชั่น?
                                </h2>
                                <p className="text-slate-400 mb-6">
                                    หากคุณมีรหัสโปรโมชั่น สามารถใช้งานได้เมื่อทำสัญญาซื้อขายกับเกษตรกร
                                </p>
                                <Link href="/farmer">
                                    <Button variant="primary" size="lg">
                                        เริ่มต้นใช้งาน
                                    </Button>
                                </Link>
                            </div>

                            <div className="text-6xl">🎁</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
