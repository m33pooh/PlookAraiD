'use client';

import React, { useState, useEffect } from 'react';
import {
    Gift,
    Star,
    ArrowLeft,
    Package,
    Leaf,
    Truck,
    Sparkles,
    Check,
    History,
    AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface RewardItem {
    id: string;
    name: string;
    description: string;
    pointsCost: number;
    category: string;
    imageUrl?: string;
    stockQuantity?: number;
    isActive: boolean;
}

interface PointTransaction {
    id: string;
    type: string;
    points: number;
    description?: string;
    createdAt: string;
    rewardItem?: {
        name: string;
        category: string;
    };
}

interface PointsData {
    balance: number;
    transactions: PointTransaction[];
    stats: {
        totalEarned: number;
        totalRedeemed: number;
    };
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    fertilizer: <Leaf size={24} />,
    seeds: <Package size={24} />,
    service: <Truck size={24} />,
    default: <Gift size={24} />,
};

const CATEGORY_LABELS: Record<string, string> = {
    fertilizer: 'ส่วนลดปุ๋ย',
    seeds: 'เมล็ดพันธุ์',
    service: 'บริการ',
};

export default function RewardsPage() {
    const [rewards, setRewards] = useState<RewardItem[]>([]);
    const [pointsData, setPointsData] = useState<PointsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [redeemingId, setRedeemingId] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<RewardItem | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        Promise.all([fetchRewards(), fetchPoints()]).finally(() => setLoading(false));
    }, []);

    const fetchRewards = async () => {
        try {
            const res = await fetch('/api/rewards');
            if (res.ok) {
                const data = await res.json();
                setRewards(data);
            }
        } catch (error) {
            console.error('Error fetching rewards:', error);
        }
    };

    const fetchPoints = async () => {
        try {
            const res = await fetch('/api/user/points?limit=20');
            if (res.ok) {
                const data = await res.json();
                setPointsData(data);
            }
        } catch (error) {
            console.error('Error fetching points:', error);
        }
    };

    const handleRedeem = async (reward: RewardItem) => {
        if (!pointsData || pointsData.balance < reward.pointsCost) {
            alert('แต้มไม่เพียงพอ');
            return;
        }

        setRedeemingId(reward.id);
        try {
            const res = await fetch('/api/rewards/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rewardItemId: reward.id }),
            });

            if (res.ok) {
                const result = await res.json();
                setPointsData(prev => prev ? {
                    ...prev,
                    balance: result.newPointsBalance,
                    transactions: [result.transaction, ...prev.transactions],
                } : null);
                setShowConfirm(null);
                alert(`แลกของรางวัล "${reward.name}" สำเร็จ!`);
            } else {
                const error = await res.json();
                alert(error.error || 'ไม่สามารถแลกของรางวัลได้');
            }
        } catch (error) {
            console.error('Error redeeming reward:', error);
        } finally {
            setRedeemingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/farmer/quests"
                        className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition"
                    >
                        <ArrowLeft size={20} className="text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                                <Gift className="text-white" size={22} />
                            </div>
                            ของรางวัล
                        </h1>
                        <p className="text-slate-400 mt-1">แลกแต้มสะสมเป็นของรางวัลได้ที่นี่</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${showHistory
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                >
                    <History size={20} />
                    ประวัติ
                </button>
            </div>

            {/* Points Balance Card */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-2xl border border-amber-500/30 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                            <Star className="text-white" size={32} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-sm text-amber-300">แต้มสะสมของคุณ</p>
                            <p className="text-4xl font-bold text-white">
                                {pointsData?.balance.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-400 mb-1">สะสมทั้งหมด</div>
                        <div className="text-emerald-400 font-medium">
                            +{pointsData?.stats.totalEarned.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-slate-400 mt-2">ใช้ไปแล้ว</div>
                        <div className="text-rose-400 font-medium">
                            -{pointsData?.stats.totalRedeemed.toLocaleString() || 0}
                        </div>
                    </div>
                </div>
            </div>

            {/* History or Rewards */}
            {showHistory ? (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">ประวัติแต้ม</h2>
                    {!pointsData?.transactions.length ? (
                        <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700">
                            <History className="mx-auto text-slate-500 mb-4" size={48} />
                            <p className="text-slate-400">ยังไม่มีประวัติ</p>
                        </div>
                    ) : (
                        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 divide-y divide-slate-700">
                            {pointsData.transactions.map(tx => (
                                <div key={tx.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'EARNED' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                                            }`}>
                                            {tx.type === 'EARNED' ? (
                                                <Sparkles className="text-emerald-400" size={20} />
                                            ) : (
                                                <Gift className="text-rose-400" size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">
                                                {tx.description || (tx.type === 'EARNED' ? 'รับแต้ม' : 'แลกของรางวัล')}
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                {new Date(tx.createdAt).toLocaleDateString('th-TH', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-lg ${tx.points > 0 ? 'text-emerald-400' : 'text-rose-400'
                                        }`}>
                                        {tx.points > 0 ? '+' : ''}{tx.points}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">ของรางวัลที่พร้อมแลก</h2>

                    {rewards.length === 0 ? (
                        <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700">
                            <Gift className="mx-auto text-slate-500 mb-4" size={48} />
                            <p className="text-slate-400">ยังไม่มีของรางวัลในขณะนี้</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rewards.map(reward => {
                                const Icon = CATEGORY_ICONS[reward.category] || CATEGORY_ICONS.default;
                                const canAfford = pointsData && pointsData.balance >= reward.pointsCost;
                                const isLowStock = reward.stockQuantity != null && reward.stockQuantity <= 5;

                                return (
                                    <div
                                        key={reward.id}
                                        className={`bg-slate-800/50 rounded-2xl border overflow-hidden transition-all ${canAfford
                                            ? 'border-slate-700 hover:border-amber-500/50'
                                            : 'border-slate-700 opacity-60'
                                            }`}
                                    >
                                        {/* Category Header */}
                                        <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 px-4 py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-amber-400">{Icon}</span>
                                                <span className="text-sm font-medium text-amber-300">
                                                    {CATEGORY_LABELS[reward.category] || reward.category}
                                                </span>
                                            </div>
                                            {isLowStock && (
                                                <span className="px-2 py-0.5 bg-rose-500 text-white text-xs font-medium rounded-full">
                                                    เหลือ {reward.stockQuantity}
                                                </span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 space-y-3">
                                            <h3 className="font-semibold text-white text-lg">{reward.name}</h3>
                                            <p className="text-slate-400 text-sm line-clamp-2">{reward.description}</p>

                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center gap-1 text-amber-400">
                                                    <Star size={20} fill="currentColor" />
                                                    <span className="font-bold text-xl">{reward.pointsCost.toLocaleString()}</span>
                                                    <span className="text-sm text-slate-400 ml-1">แต้ม</span>
                                                </div>
                                                <button
                                                    onClick={() => setShowConfirm(reward)}
                                                    disabled={!canAfford}
                                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${canAfford
                                                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
                                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                        }`}
                                                >
                                                    แลก
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-md p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Gift className="text-white" size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">ยืนยันการแลกของรางวัล</h2>
                            <p className="text-slate-400 mb-4">{showConfirm.name}</p>

                            <div className="bg-slate-800 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-slate-400">แต้มที่ใช้</span>
                                    <span className="font-bold text-amber-400">
                                        {showConfirm.pointsCost.toLocaleString()} แต้ม
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">แต้มคงเหลือ</span>
                                    <span className="font-bold text-white">
                                        {((pointsData?.balance || 0) - showConfirm.pointsCost).toLocaleString()} แต้ม
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(null)}
                                    className="flex-1 px-4 py-3 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => handleRedeem(showConfirm)}
                                    disabled={redeemingId === showConfirm.id}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 transition disabled:opacity-50"
                                >
                                    {redeemingId === showConfirm.id ? 'กำลังแลก...' : 'ยืนยัน'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
