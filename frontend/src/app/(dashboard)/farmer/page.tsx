'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Sprout, TrendingUp, CloudSun, Calendar, ArrowRight, DollarSign, Droplets, MapPin, Store } from 'lucide-react';
import Link from 'next/link';

export default function FarmerDashboard() {
    const { data: session } = useSession();

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        สวัสดี, {session?.user?.name || 'เกษตรกรแสนขยัน'} 👋
                    </h1>
                    <p className="text-slate-400">
                        วันนี้อากาศแจ่มใส เหมาะแก่การเก็บเกี่ยวผลผลิต
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    <CloudSun className="text-yellow-400" size={24} />
                    <div>
                        <div className="text-sm font-medium text-white">32°C</div>
                        <div className="text-xs text-slate-400">แดดจัด</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Sprout className="text-emerald-500" size={24} />
                            </div>
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                                +2 แปลง
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">45 ไร่</div>
                        <div className="text-sm text-slate-400">พื้นที่เพาะปลูกทั้งหมด</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <DollarSign className="text-blue-500" size={24} />
                            </div>
                            <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                                คาดการณ์
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">฿150,000</div>
                        <div className="text-sm text-slate-400">รายได้ที่คาดว่าจะได้รับ</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Calendar className="text-orange-500" size={24} />
                            </div>
                            <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                                14 วัน
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">15 ม.ค.</div>
                        <div className="text-sm text-slate-400">กำหนดเก็บเกี่ยวถัดไป</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <Droplets className="text-indigo-500" size={24} />
                            </div>
                            <span className="text-xs text-slate-500">วันนี้</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">เหมาะสม</div>
                        <div className="text-sm text-slate-400">สถานะแหล่งน้ำ</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Cultivations */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">แปลงเกษตรของคุณ</h2>
                        <Link href="/farmer/cultivations">
                            <Button variant="outline" size="sm" className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
                                ดูทั้งหมด
                            </Button>
                        </Link>
                    </div>

                    <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-900/50 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🌾</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-white">ข้าวหอมมะลิ 105</h3>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">กำลังเติบโต</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <MapPin size={14} />
                                    ไร่สมชาย ทำนา (25 ไร่)
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-900/50">
                            <div className="flex justify-between text-sm text-slate-400 mb-2">
                                <span>ความคืบหน้า (60 วัน)</span>
                                <span>50%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-1/2 rounded-full" />
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800/50">
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">เริ่มปลูก</div>
                                    <div className="text-sm text-white">1 พ.ย. 66</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">เก็บเกี่ยว</div>
                                    <div className="text-sm text-white">28 ก.พ. 67</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">คาดการณ์</div>
                                    <div className="text-sm text-emerald-400">12 ตัน</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-900/50 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🌽</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-white">ข้าวโพดเลี้ยงสัตว์</h3>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">กำลังเติบโต</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <MapPin size={14} />
                                    ไร่สมชาย 2 (15 ไร่)
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-900/50">
                            <div className="flex justify-between text-sm text-slate-400 mb-2">
                                <span>ความคืบหน้า (30 วัน)</span>
                                <span>27%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500 w-[27%] rounded-full" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Market Trends Widget */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="text-emerald-500" size={20} />
                                ราคาตลาดวันนี้
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🍚</span>
                                    <div>
                                        <div className="text-sm font-medium text-white">ข้าวหอมมะลิ</div>
                                        <div className="text-xs text-slate-400">จ.พิษณุโลก</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-emerald-400">฿16,000</div>
                                    <div className="text-xs text-green-500 flex items-center justify-end gap-1">
                                        ▲ +200
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🌽</span>
                                    <div>
                                        <div className="text-sm font-medium text-white">ข้าวโพดเลี้ยงสัตว์</div>
                                        <div className="text-xs text-slate-400">ตลาดไท</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-emerald-400">฿9.50</div>
                                    <div className="text-xs text-slate-500">
                                        - ทรงตัว
                                    </div>
                                </div>
                            </div>

                            <Link href="/market">
                                <Button variant="ghost" className="w-full text-slate-400 hover:text-emerald-400">
                                    ดูราคาทั้งหมด <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Smart Suggestion Widget */}
                    <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-500/30">
                        <CardContent className="p-6">
                            <div className="mb-4">
                                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mb-3">
                                    <Sprout className="text-indigo-400" size={20} />
                                </div>
                                <h3 className="font-bold text-white text-lg mb-1">ปลูกอะไรดี?</h3>
                                <p className="text-sm text-indigo-200/70">
                                    ช่วงนี้ตลาดต้องการ "มะเขือเทศ" เนื่องจากราคากำลังพุ่งสูง
                                </p>
                            </div>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-none">
                                วิเคราะห์ความเหมาะสม
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Link to Buying Requests */}
                    <Link href="/buyer/requests">
                        <Card className="bg-slate-900 border-slate-800 hover:border-rose-500/50 transition-colors cursor-pointer">
                            <div className="p-4 flex items-center gap-4">
                                <div className="w-10 h-10 bg-rose-500/10 rounded-lg flex items-center justify-center">
                                    <Store className="text-rose-500" size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-white">ประกาศรับซื้อใหม่</h3>
                                    <p className="text-xs text-slate-400">4 รายการในพื้นที่ของคุณ</p>
                                </div>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                    <ArrowRight size={18} />
                                </Button>
                            </div>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}
