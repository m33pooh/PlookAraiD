'use client';

import { Crop } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Calendar,
    DollarSign,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Minus,
    FileText,
    Sprout
} from 'lucide-react';

interface CropDetailPanelProps {
    crop: Crop | null;
    isOpen: boolean;
    onClose: () => void;
}

// Mock market analysis data - in production this would come from API
const getMarketAnalysis = (crop: Crop) => {
    const analyses: Record<number, {
        bestPricePeriod: string;
        bestPriceReason: string;
        contractValue: string;
        contractDetail: string;
        risks: { title: string; level: 'high' | 'medium' | 'low' }[];
    }> = {
        1: { // ข้าวหอมมะลิ
            bestPricePeriod: 'พ.ย. - ก.พ.',
            bestPriceReason: 'หลังฤดูเก็บเกี่ยว ราคาตลาดสูงสุด',
            contractValue: '12,000 - 15,000 บาท/ตัน',
            contractDetail: 'สัญญาล่วงหน้าจากโรงสี 3 ราย',
            risks: [
                { title: 'ภัยแล้ง/น้ำท่วม', level: 'high' },
                { title: 'ราคาผันผวน', level: 'medium' },
            ]
        },
        2: { // มันสำปะหลัง
            bestPricePeriod: 'ม.ค. - มี.ค.',
            bestPriceReason: 'ช่วงโรงงานรับซื้อสูงสุด',
            contractValue: '2.8 - 3.2 บาท/กก.',
            contractDetail: 'สัญญาประกันราคาจากโรงงานแป้ง',
            risks: [
                { title: 'โรคใบด่าง', level: 'high' },
                { title: 'ราคาแป้งตกต่ำ', level: 'medium' },
            ]
        },
        3: { // อ้อย
            bestPricePeriod: 'ธ.ค. - เม.ย.',
            bestPriceReason: 'ฤดูหีบอ้อย ราคาตามสัญญา',
            contractValue: '1,000 - 1,100 บาท/ตัน',
            contractDetail: 'สัญญาโควตากับโรงงานน้ำตาล',
            risks: [
                { title: 'อ้อยไฟไหม้', level: 'medium' },
                { title: 'ราคาน้ำตาลโลกตก', level: 'low' },
            ]
        },
        4: { // ข้าวโพดเลี้ยงสัตว์
            bestPricePeriod: 'ก.ย. - พ.ย.',
            bestPriceReason: 'หลังเก็บเกี่ยวใหม่ ความชื้นต่ำ',
            contractValue: '8.5 - 10 บาท/กก.',
            contractDetail: 'สัญญาซื้อขายกับบริษัทอาหารสัตว์',
            risks: [
                { title: 'หนอนกระทู้', level: 'high' },
                { title: 'ราคานำเข้าถูกกว่า', level: 'medium' },
            ]
        },
        5: { // ยางพารา
            bestPricePeriod: 'ก.พ. - พ.ค.',
            bestPriceReason: 'ช่วงยางผลัดใบ ผลผลิตน้อย ราคาสูง',
            contractValue: '48 - 55 บาท/กก.',
            contractDetail: 'ขายตลาดกลางยางพารา',
            risks: [
                { title: 'โรคใบร่วง', level: 'high' },
                { title: 'ราคายางโลกผันผวน', level: 'high' },
            ]
        },
        6: { // ปาล์มน้ำมัน
            bestPricePeriod: 'มี.ค. - มิ.ย.',
            bestPriceReason: 'ช่วงผลผลิตน้อย ราคาน้ำมันปาล์มสูง',
            contractValue: '5.5 - 6.5 บาท/กก.',
            contractDetail: 'สัญญากับโรงงานสกัดน้ำมัน',
            risks: [
                { title: 'ราคาพลังงานตกต่ำ', level: 'medium' },
                { title: 'คู่แข่งจากอินโดนีเซีย', level: 'low' },
            ]
        },
    };

    return analyses[crop.id] || {
        bestPricePeriod: 'ม.ค. - ธ.ค.',
        bestPriceReason: 'ราคาคงที่ตลอดปี',
        contractValue: `${crop.currentPrice.min.toLocaleString()} - ${crop.currentPrice.max.toLocaleString()} ${crop.currentPrice.unit}`,
        contractDetail: 'สามารถเจรจาสัญญาล่วงหน้าได้',
        risks: [
            { title: 'สภาพอากาศแปรปรวน', level: 'medium' as const },
        ]
    };
};

const getRiskColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
        case 'high':
            return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
        case 'medium':
            return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        case 'low':
            return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
};

const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
        case 'up':
            return <TrendingUp className="text-emerald-400" size={20} />;
        case 'down':
            return <TrendingDown className="text-rose-400" size={20} />;
        default:
            return <Minus className="text-slate-500" size={20} />;
    }
};

export const CropDetailPanel = ({ crop, isOpen, onClose }: CropDetailPanelProps) => {
    if (!crop) return null;

    const analysis = getMarketAnalysis(crop);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0f172a] shadow-2xl z-50 overflow-y-auto border-l border-slate-700/50"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-700/50 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600/30 to-teal-600/30 rounded-xl flex items-center justify-center border border-emerald-500/30">
                                    {crop.imageUrl ? (
                                        <img src={crop.imageUrl} alt={crop.name} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <span className="text-2xl">🌱</span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-bold text-xl text-slate-100">{crop.name}</h2>
                                    <p className="text-sm text-slate-400">{crop.growthDurationDays} วัน</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-700"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Market Analysis Section - Green Box */}
                            <section className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 rounded-2xl p-5 border border-emerald-500/30">
                                <h3 className="font-bold text-emerald-400 text-lg mb-4 flex items-center gap-2">
                                    <TrendingUp size={20} />
                                    วิเคราะห์ตลาดและราคา
                                </h3>

                                <div className="space-y-4">
                                    {/* Best Price Period */}
                                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                                                <Calendar size={20} className="text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-400">ช่วงราคาดีที่สุด</p>
                                                <p className="font-bold text-emerald-400 text-lg">{analysis.bestPricePeriod}</p>
                                                <p className="text-xs text-slate-500 mt-1">{analysis.bestPriceReason}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contract Value */}
                                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                                                <FileText size={20} className="text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-400">ความคุ้มค่า / สัญญา</p>
                                                <p className="font-bold text-slate-100 text-lg">{analysis.contractValue}</p>
                                                <p className="text-xs text-slate-500 mt-1">{analysis.contractDetail}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Risks */}
                                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                                                <AlertTriangle size={20} className="text-amber-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-400 mb-2">ความเสี่ยงที่ต้องระวัง</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.risks.map((risk, index) => (
                                                        <span
                                                            key={index}
                                                            className={`text-xs px-2 py-1 rounded-full border ${getRiskColor(risk.level)}`}
                                                        >
                                                            {risk.title}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Current Price */}
                            <section className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                                    <DollarSign size={18} className="text-emerald-400" />
                                    ราคาตลาดปัจจุบัน
                                </h3>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-emerald-400">
                                            {crop.currentPrice.min.toLocaleString()} - {crop.currentPrice.max.toLocaleString()}
                                        </p>
                                        <p className="text-slate-400">{crop.currentPrice.unit}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getTrendIcon(crop.currentPrice.trend)}
                                        <span className={`text-sm font-medium ${crop.currentPrice.trend === 'up' ? 'text-emerald-400' :
                                            crop.currentPrice.trend === 'down' ? 'text-rose-400' : 'text-slate-500'
                                            }`}>
                                            {crop.currentPrice.trend === 'up' ? 'ขาขึ้น' :
                                                crop.currentPrice.trend === 'down' ? 'ขาลง' : 'คงที่'}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Quick Info */}
                            <section className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                                <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                                    <Sprout size={18} className="text-emerald-400" />
                                    ข้อมูลการปลูก
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900/50 rounded-xl p-3 text-center border border-slate-700/50">
                                        <p className="text-2xl font-bold text-slate-100">{crop.growthDurationDays}</p>
                                        <p className="text-xs text-slate-400">วันจนเก็บเกี่ยว</p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-xl p-3 text-center border border-slate-700/50">
                                        <p className="text-2xl font-bold text-slate-100">
                                            {crop.marketDemand === 'high' ? 'สูง' :
                                                crop.marketDemand === 'medium' ? 'กลาง' : 'ต่ำ'}
                                        </p>
                                        <p className="text-xs text-slate-400">ความต้องการตลาด</p>
                                    </div>
                                </div>
                            </section>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-900/30 border border-emerald-500/30">
                                    เริ่มวางแผนปลูก
                                </button>
                                <button className="w-full py-4 bg-slate-800 text-slate-200 font-medium rounded-xl hover:bg-slate-700 transition-colors border border-slate-700">
                                    ดูสัญญาที่เปิดรับ
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
