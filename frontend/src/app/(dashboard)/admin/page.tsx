'use client';

import { useState } from 'react';
import {
    RefreshCw,
    Database,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DataSource {
    id: string;
    name: string;
    description: string;
    lastSync: Date | null;
    status: 'connected' | 'disconnected' | 'syncing';
}

const initialDataSources: DataSource[] = [
    {
        id: 'talad-thai',
        name: 'ตลาดไท',
        description: 'ตลาดกลางค้าส่งสินค้าเกษตร กรุงเทพฯ',
        lastSync: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        status: 'connected',
    },
    {
        id: 'si-mum-mueang',
        name: 'สี่มุมเมือง',
        description: 'ตลาดกลางสินค้าการเกษตร รังสิต',
        lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        status: 'connected',
    },
    {
        id: 'thai-rice-exporters',
        name: 'สมาคมผู้ส่งออกข้าวไทย',
        description: 'Thai Rice Exporters Association',
        lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        status: 'disconnected',
    },
    {
        id: 'horticultural-association',
        name: 'สมาคมพืชสวนแห่งประเทศไทย',
        description: 'Horticultural Association of Thailand',
        lastSync: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
        status: 'connected',
    },
];

function formatLastSync(date: Date | null): string {
    if (!date) return 'ยังไม่เคยซิงค์';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    return `${days} วันที่แล้ว`;
}

export default function AdminPage() {
    const [dataSources, setDataSources] = useState<DataSource[]>(initialDataSources);
    const [syncingAll, setSyncingAll] = useState(false);

    const handleSync = async (sourceId: string) => {
        // Update status to syncing
        setDataSources(prev =>
            prev.map(source =>
                source.id === sourceId ? { ...source, status: 'syncing' as const } : source
            )
        );

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

        // Update status to connected and set last sync time
        setDataSources(prev =>
            prev.map(source =>
                source.id === sourceId
                    ? { ...source, status: 'connected' as const, lastSync: new Date() }
                    : source
            )
        );
    };

    const handleSyncAll = async () => {
        setSyncingAll(true);

        // Set all to syncing
        setDataSources(prev =>
            prev.map(source => ({ ...source, status: 'syncing' as const }))
        );

        // Simulate staggered API calls
        for (const source of dataSources) {
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
            setDataSources(prev =>
                prev.map(s =>
                    s.id === source.id
                        ? { ...s, status: 'connected' as const, lastSync: new Date() }
                        : s
                )
            );
        }

        setSyncingAll(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Database className="text-amber-500" size={28} />
                        จัดการข้อมูลราคา
                    </h1>
                    <p className="text-slate-400 mt-1">
                        ตรวจสอบและซิงค์ข้อมูลราคาจากแหล่งข้อมูลต่างๆ
                    </p>
                </div>
                <button
                    onClick={handleSyncAll}
                    disabled={syncingAll}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                >
                    {syncingAll ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <RefreshCw size={18} />
                    )}
                    ดึงข้อมูลทั้งหมด
                </button>
            </div>

            {/* Data Source Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataSources.map((source) => (
                    <Card key={source.id} variant="elevated">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg">{source.name}</CardTitle>
                                    <p className="text-sm text-slate-400 mt-1">{source.description}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    {source.status === 'syncing' ? (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                                            <Loader2 size={14} className="animate-spin" />
                                            กำลังซิงค์...
                                        </div>
                                    ) : source.status === 'connected' ? (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm">
                                            <CheckCircle2 size={14} />
                                            เชื่อมต่อสำเร็จ
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-sm">
                                            <XCircle size={14} />
                                            ไม่สามารถเชื่อมต่อ
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Clock size={14} />
                                    <span>อัพเดทล่าสุด: {formatLastSync(source.lastSync)}</span>
                                </div>
                                <button
                                    onClick={() => handleSync(source.id)}
                                    disabled={source.status === 'syncing'}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {source.status === 'syncing' ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <RefreshCw size={14} />
                                    )}
                                    ดึงข้อมูลทันที
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Info Section */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg">
                            <Database size={20} className="text-slate-400" />
                        </div>
                        <div>
                            <h3 className="font-medium text-white">เกี่ยวกับการซิงค์ข้อมูล</h3>
                            <p className="text-sm text-slate-400 mt-1">
                                ระบบจะดึงข้อมูลราคาจากแหล่งข้อมูลต่างๆ โดยอัตโนมัติทุกๆ 1 ชั่วโมง
                                คุณสามารถกดปุ่ม "ดึงข้อมูลทันที" เพื่อดึงข้อมูลล่าสุดได้ทันที
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
