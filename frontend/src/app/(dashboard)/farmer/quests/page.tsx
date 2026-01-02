'use client';

import React, { useState, useEffect } from 'react';
import {
    Target,
    CheckCircle2,
    Circle,
    Star,
    Trophy,
    Flame,
    Camera,
    BarChart3,
    FileText,
    Cpu,
    LogIn,
    Sparkles,
    Gift,
    ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const QUEST_ICONS: Record<string, React.ReactNode> = {
    DAILY_LOGIN: <LogIn size={24} />,
    LOG_ACTIVITY: <FileText size={24} />,
    PHOTO_UPLOAD: <Camera size={24} />,
    MARKET_CHECK: <BarChart3 size={24} />,
    PLAN_UPDATE: <Target size={24} />,
    IOT_CHECK: <Cpu size={24} />,
};

const QUEST_COLORS: Record<string, string> = {
    DAILY_LOGIN: 'from-blue-500 to-indigo-600',
    LOG_ACTIVITY: 'from-emerald-500 to-teal-600',
    PHOTO_UPLOAD: 'from-pink-500 to-rose-600',
    MARKET_CHECK: 'from-amber-500 to-orange-600',
    PLAN_UPDATE: 'from-purple-500 to-violet-600',
    IOT_CHECK: 'from-cyan-500 to-blue-600',
};

interface Quest {
    id: string;
    type: string;
    title: string;
    description: string;
    pointsReward: number;
    iconName?: string;
    isActive: boolean;
    isCompletedToday: boolean;
}

interface QuestsData {
    quests: Quest[];
    userPoints: number;
    completedToday: number;
    totalQuests: number;
}

export default function QuestsPage() {
    const [data, setData] = useState<QuestsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [completingId, setCompletingId] = useState<string | null>(null);
    const [celebratePoints, setCelebratePoints] = useState<number | null>(null);

    useEffect(() => {
        fetchQuests();
    }, []);

    const fetchQuests = async () => {
        try {
            const res = await fetch('/api/quests');
            if (res.ok) {
                const questsData = await res.json();
                setData(questsData);
            }
        } catch (error) {
            console.error('Error fetching quests:', error);
        } finally {
            setLoading(false);
        }
    };

    const completeQuest = async (questId: string) => {
        setCompletingId(questId);
        try {
            const res = await fetch(`/api/quests/${questId}/complete`, {
                method: 'POST',
            });

            if (res.ok) {
                const result = await res.json();
                setCelebratePoints(result.pointsEarned);

                // Update local state
                setData(prev => prev ? {
                    ...prev,
                    userPoints: result.newPointsBalance,
                    completedToday: prev.completedToday + 1,
                    quests: prev.quests.map(q =>
                        q.id === questId ? { ...q, isCompletedToday: true } : q
                    ),
                } : null);

                // Clear celebration after animation
                setTimeout(() => setCelebratePoints(null), 2000);
            } else {
                const error = await res.json();
                alert(error.error || 'ไม่สามารถทำภารกิจได้');
            }
        } catch (error) {
            console.error('Error completing quest:', error);
        } finally {
            setCompletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-500 border-t-transparent" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-16">
                <p className="text-slate-400">ไม่สามารถโหลดข้อมูลได้</p>
            </div>
        );
    }

    const progress = data.totalQuests > 0 ? (data.completedToday / data.totalQuests) * 100 : 0;

    return (
        <div className="space-y-6 relative">
            {/* Celebration Overlay */}
            {celebratePoints && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="animate-bounce">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                            <Sparkles className="animate-spin" size={32} />
                            <span className="text-2xl font-bold">+{celebratePoints} แต้ม!</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Target className="text-white" size={22} />
                        </div>
                        ภารกิจประจำวัน
                    </h1>
                    <p className="text-slate-400 mt-1">ทำภารกิจสะสมแต้มแลกของรางวัล</p>
                </div>
                <Link
                    href="/farmer/rewards"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all"
                >
                    <Gift size={20} />
                    แลกของรางวัล
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Points Balance */}
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-2xl border border-amber-500/30 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Star className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-amber-300">แต้มสะสม</p>
                            <p className="text-3xl font-bold text-white">{data.userPoints.toLocaleString()}</p>
                        </div>
                    </div>
                    <Link
                        href="/farmer/rewards"
                        className="inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300"
                    >
                        ดูของรางวัล <ArrowRight size={16} />
                    </Link>
                </div>

                {/* Today's Progress */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <Flame className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">ความคืบหน้าวันนี้</p>
                            <p className="text-3xl font-bold text-white">{data.completedToday}/{data.totalQuests}</p>
                        </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Streak (placeholder) */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                            <Trophy className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">ภารกิจวันนี้</p>
                            <p className="text-3xl font-bold text-white">{data.totalQuests}</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-400">ภารกิจทั้งหมด</p>
                </div>
            </div>

            {/* Quests List */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">ภารกิจวันนี้</h2>

                {data.quests.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700">
                        <Target className="mx-auto text-slate-500 mb-4" size={48} />
                        <p className="text-slate-400">ยังไม่มีภารกิจในระบบ</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {data.quests.map(quest => {
                            const Icon = QUEST_ICONS[quest.type] || <Target size={24} />;
                            const gradient = QUEST_COLORS[quest.type] || 'from-slate-500 to-slate-600';
                            const isCompleting = completingId === quest.id;

                            return (
                                <div
                                    key={quest.id}
                                    className={`bg-slate-800/50 rounded-2xl border transition-all ${quest.isCompletedToday
                                            ? 'border-emerald-500/50 bg-emerald-900/10'
                                            : 'border-slate-700 hover:border-amber-500/50'
                                        }`}
                                >
                                    <div className="p-5 flex items-center gap-4">
                                        {/* Icon */}
                                        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                                            {Icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white text-lg">{quest.title}</h3>
                                            <p className="text-slate-400 text-sm mt-1">{quest.description}</p>
                                        </div>

                                        {/* Points & Action */}
                                        <div className="flex items-center gap-4 flex-shrink-0">
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-amber-400">
                                                    <Star size={18} fill="currentColor" />
                                                    <span className="font-bold text-lg">{quest.pointsReward}</span>
                                                </div>
                                                <span className="text-sm text-slate-400">แต้ม</span>
                                            </div>

                                            {quest.isCompletedToday ? (
                                                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                                                    <CheckCircle2 className="text-white" size={24} />
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => completeQuest(quest.id)}
                                                    disabled={isCompleting}
                                                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isCompleting ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                                    ) : (
                                                        'รับรางวัล'
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
