'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Loader2, RefreshCw, Globe, Store, TrendingUp } from 'lucide-react';
import { parseMarketPricesCSV, ParsedMarketPrice } from '@/lib/csv-parser'; // Ensure this path is correct

interface ScrapeResult {
    source: string;
    success: boolean;
    itemCount: number;
    error?: string;
}

interface ScrapeStatus {
    loading: boolean;
    source: 'simummuang' | 'talaadthai' | 'all' | null;
    results: ScrapeResult[];
    totalSaved: number;
    error?: string;
}

export default function ManagePricesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<ParsedMarketPrice[]>([]);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Scraping state
    const [scrapeStatus, setScrapeStatus] = useState<ScrapeStatus>({
        loading: false,
        source: null,
        results: [],
        totalSaved: 0,
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setStatus({ type: null, message: '' });

            // Preview content
            try {
                const text = await selectedFile.text();
                const parsed = parseMarketPricesCSV(text);
                setPreviewData(parsed.slice(0, 5)); // Show first 5 items
            } catch (err) {
                console.error('Preview error:', err);
                setPreviewData([]);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus({ type: null, message: '' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/admin/upload-csv', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setStatus({ type: 'success', message: 'อัปโหลดไฟล์เรียบร้อยแล้ว ข้อมูลราคาตลาดได้รับการอัปเดต' });
                setFile(null);
                setPreviewData([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                setStatus({ type: 'error', message: result.error || 'เกิดข้อผิดพลาดในการอัปโหลด' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้' });
        } finally {
            setUploading(false);
        }
    };

    const handleScrape = async (source: 'simummuang' | 'talaadthai' | 'all') => {
        setScrapeStatus({
            loading: true,
            source,
            results: [],
            totalSaved: 0,
        });

        try {
            const response = await fetch(`/api/market-prices/scrape?source=${source}`, {
                method: 'POST',
            });

            const data = await response.json();

            if (data.success) {
                setScrapeStatus({
                    loading: false,
                    source,
                    results: data.results || [],
                    totalSaved: data.totalSaved || 0,
                });
            } else {
                setScrapeStatus({
                    loading: false,
                    source,
                    results: [],
                    totalSaved: 0,
                    error: data.error,
                });
            }
        } catch (error) {
            setScrapeStatus({
                loading: false,
                source,
                results: [],
                totalSaved: 0,
                error: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/market"
                        className="p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">จัดการข้อมูลราคาตลาด</h1>
                        <p className="text-slate-400">อัปเดตราคาจากแหล่งข้อมูลออนไลน์หรืออัปโหลดไฟล์ CSV</p>
                    </div>
                </div>

                {/* Online Scraping Section */}
                <Card className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border-emerald-700/50">
                    <CardHeader>
                        <CardTitle className="text-emerald-400 flex items-center gap-2">
                            <Globe size={20} />
                            ดึงราคาจากตลาดออนไลน์
                        </CardTitle>
                        <CardDescription>
                            ดึงข้อมูลราคาล่าสุดจากเว็บไซต์ตลาดกลางโดยอัตโนมัติ
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            {/* Simummuang Button */}
                            <Button
                                onClick={() => handleScrape('simummuang')}
                                disabled={scrapeStatus.loading}
                                className="h-auto py-4 px-6 bg-orange-600 hover:bg-orange-700 text-white flex flex-col items-center gap-2"
                            >
                                {scrapeStatus.loading && scrapeStatus.source === 'simummuang' ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <Store size={24} />
                                )}
                                <span className="font-semibold">ตลาดสี่มุมเมือง</span>
                                <span className="text-xs opacity-80">www.simummuangmarket.com</span>
                            </Button>

                            {/* Talaadthai Button */}
                            <Button
                                onClick={() => handleScrape('talaadthai')}
                                disabled={scrapeStatus.loading}
                                className="h-auto py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center gap-2"
                            >
                                {scrapeStatus.loading && scrapeStatus.source === 'talaadthai' ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <TrendingUp size={24} />
                                )}
                                <span className="font-semibold">ตลาดไท</span>
                                <span className="text-xs opacity-80">www.talaadthai.com</span>
                            </Button>

                            {/* All Button */}
                            <Button
                                onClick={() => handleScrape('all')}
                                disabled={scrapeStatus.loading}
                                className="h-auto py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white flex flex-col items-center gap-2"
                            >
                                {scrapeStatus.loading && scrapeStatus.source === 'all' ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <RefreshCw size={24} />
                                )}
                                <span className="font-semibold">ดึงจากทุกแหล่ง</span>
                                <span className="text-xs opacity-80">อัพเดททั้งหมด</span>
                            </Button>
                        </div>

                        {/* Scrape Results */}
                        {(scrapeStatus.results.length > 0 || scrapeStatus.error) && (
                            <div className={`p-4 rounded-lg ${scrapeStatus.error ? 'bg-rose-900/30 border border-rose-700/50' : 'bg-emerald-900/30 border border-emerald-700/50'}`}>
                                {scrapeStatus.error ? (
                                    <div className="flex items-center gap-2 text-rose-300">
                                        <AlertCircle size={20} />
                                        <span>{scrapeStatus.error}</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-emerald-300">
                                            <CheckCircle size={20} />
                                            <span className="font-semibold">
                                                บันทึกราคาสำเร็จ {scrapeStatus.totalSaved} รายการ
                                            </span>
                                        </div>
                                        {scrapeStatus.results.map((r, i) => (
                                            <div key={i} className="text-sm text-slate-300 ml-7">
                                                • {r.source}: {r.success ? `พบ ${r.itemCount} รายการ` : `ล้มเหลว - ${r.error}`}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <p className="text-xs text-slate-500">
                            หมายเหตุ: ข้อมูลจะถูกจับคู่กับสินค้าในระบบโดยอัตโนมัติ สินค้าที่ไม่พบในระบบจะถูกข้าม
                        </p>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Upload Section */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-emerald-400 flex items-center gap-2">
                                <Upload size={20} />
                                อัปโหลดไฟล์ CSV
                            </CardTitle>
                            <CardDescription>
                                เลือกไฟล์ .csv ที่มีรูปแบบข้อมูลที่ถูกต้อง
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-emerald-500/50 transition-colors bg-slate-950/50">
                                <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                                <div className="space-y-2">
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
                                    >
                                        เลือกไฟล์
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                        className="hidden"
                                    />
                                    <p className="text-sm text-slate-400">
                                        {file ? file.name : 'ยังไม่ได้เลือกไฟล์'}
                                    </p>
                                </div>
                            </div>

                            {status.message && (
                                <div className={`p-4 rounded-lg flex items-start gap-3 ${status.type === 'success' ? 'bg-emerald-900/30 text-emerald-300' : 'bg-rose-900/30 text-rose-300'
                                    }`}>
                                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    <p>{status.message}</p>
                                </div>
                            )}

                            <Button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 h-12"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        กำลังอัปโหลด...
                                    </>
                                ) : (
                                    'ยืนยันการอัปโหลด'
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Preview Section */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-slate-200 flex items-center gap-2">
                                <FileText size={20} />
                                ตัวอย่างข้อมูล (5 รายการแรก)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {previewData.length > 0 ? (
                                <div className="space-y-3">
                                    {previewData.map((item, index) => (
                                        <div key={index} className="p-3 bg-slate-950 rounded border border-slate-800 text-sm">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-emerald-400">{item.name}</span>
                                                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">{item.category}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-2">
                                                <div>
                                                    <span className="block text-slate-500">สี่มุมเมือง</span>
                                                    {item.priceMinSiMum} - {item.priceMaxSiMum}
                                                </div>
                                                <div>
                                                    <span className="block text-slate-500">ตลาดไท</span>
                                                    {item.priceMinThai} - {item.priceMaxThai}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <p className="text-center text-xs text-slate-500 pt-2">
                                        ... และอีก {parsedCount(file)} รายการ
                                    </p>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                                    <p>เลือกไฟล์เพื่อดูตัวอย่างข้อมูล</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Instructions */}
                <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                    <h3 className="text-lg font-semibold text-white mb-3">คำแนะนำ</h3>
                    <ul className="list-disc list-inside text-slate-400 space-y-2 text-sm">
                        <li><strong>ดึงจากตลาดออนไลน์:</strong> กดปุ่มเพื่อดึงข้อมูลราคาล่าสุดจากเว็บไซต์ตลาดกลาง</li>
                        <li><strong>อัปโหลด CSV:</strong> ใช้สำหรับนำเข้าข้อมูลจากไฟล์ที่เตรียมไว้</li>
                        <li>ข้อมูลราคาจะถูกเก็บประวัติไว้โดยอัตโนมัติ สามารถดูกราฟย้อนหลังได้ในหน้าตลาด</li>
                        <li>
                            รูปแบบไฟล์ CSV:
                            <pre className="mt-2 bg-slate-950 p-3 rounded border border-slate-800 overflow-x-auto text-xs text-slate-300 font-mono">
                                หมวดหมู่,รายการสินค้า,หน่วย,ราคาเฉลี่ยตลาดสี่มุมเมือง (บาท),ราคาเฉลี่ยตลาดไท (บาท),แนวโน้มราคา
                            </pre>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

// Helper to count remaining items (just for display logic placeholder)
function parsedCount(file: File | null) {
    // This is just a visual placeholder, actual parsing logic is in handleFileChange
    return '...';
}

