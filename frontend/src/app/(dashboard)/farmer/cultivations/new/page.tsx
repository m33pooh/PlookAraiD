'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/Select';
import { ArrowLeft, Sprout, Save } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Farm {
    id: string;
    name: string;
    areaSize: number;
}

interface Product {
    id: number;
    name: string;
    growthDurationDays: number;
}

import { Suspense } from 'react';

function NewCultivationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedFarmId = searchParams.get('farmId');

    const [farms, setFarms] = useState<Farm[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        farmId: preselectedFarmId || '',
        productId: '',
        startDate: new Date().toISOString().split('T')[0],
        expectedHarvestDate: '',
        estimatedYield: '',
    });

    useEffect(() => {
        // Fetch farms and products
        Promise.all([
            fetch('/api/farms').then((r) => r.json()),
            fetch('/api/products').then((r) => r.json()),
        ]).then(([farmsData, productsData]) => {
            setFarms(farmsData);
            setProducts(productsData);
        });
    }, []);

    // Auto-calculate expected harvest date based on product
    useEffect(() => {
        if (formData.productId && formData.startDate) {
            const product = products.find((p) => p.id === parseInt(formData.productId));
            if (product) {
                const startDate = new Date(formData.startDate);
                startDate.setDate(startDate.getDate() + product.growthDurationDays);
                setFormData((prev) => ({
                    ...prev,
                    expectedHarvestDate: startDate.toISOString().split('T')[0],
                }));
            }
        }
    }, [formData.productId, formData.startDate, products]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.farmId) {
            newErrors.farmId = 'กรุณาเลือกแปลงเกษตร';
        }

        if (!formData.productId) {
            newErrors.productId = 'กรุณาเลือกพืชที่ปลูก';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'กรุณาระบุวันที่เริ่มปลูก';
        }

        if (!formData.expectedHarvestDate) {
            newErrors.expectedHarvestDate = 'กรุณาระบุวันที่คาดว่าจะเก็บเกี่ยว';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/cultivations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    farmId: formData.farmId,
                    productId: parseInt(formData.productId),
                    startDate: formData.startDate,
                    expectedHarvestDate: formData.expectedHarvestDate,
                    estimatedYield: formData.estimatedYield ? parseFloat(formData.estimatedYield) : null,
                    status: 'PLANNING',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create cultivation');
            }

            router.push('/farmer/cultivations');
        } catch (error) {
            console.error('Error creating cultivation:', error);
            setErrors({ submit: 'เกิดข้อผิดพลาดในการบันทึก' });
        } finally {
            setIsLoading(false);
        }
    };

    const farmOptions = farms.map((f) => ({
        value: f.id,
        label: `${f.name} (${Number(f.areaSize).toFixed(1)} ไร่)`,
    }));

    const productOptions = products.map((p) => ({
        value: p.id.toString(),
        label: `${p.name} (${p.growthDurationDays} วัน)`,
    }));

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/farmer/cultivations">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">เริ่มการเพาะปลูกใหม่</h1>
                    <p className="text-slate-500">บันทึกรอบการปลูกใหม่</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sprout className="text-emerald-600" size={20} />
                            ข้อมูลการเพาะปลูก
                        </CardTitle>
                        <CardDescription>เลือกแปลงเกษตรและพืชที่ต้องการปลูก</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select
                            label="แปลงเกษตร *"
                            options={[{ value: '', label: 'เลือกแปลงเกษตร' }, ...farmOptions]}
                            value={formData.farmId}
                            onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                            error={errors.farmId}
                        />

                        <Select
                            label="พืชที่ปลูก *"
                            options={[{ value: '', label: 'เลือกพืช' }, ...productOptions]}
                            value={formData.productId}
                            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                            error={errors.productId}
                            helperText="ระยะเวลาปลูกจะถูกคำนวณอัตโนมัติ"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>ช่วงเวลา</CardTitle>
                        <CardDescription>กำหนดวันที่เริ่มปลูกและคาดว่าจะเก็บเกี่ยว</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input
                                label="วันที่เริ่มปลูก *"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                error={errors.startDate}
                            />

                            <Input
                                label="วันที่คาดเก็บเกี่ยว *"
                                type="date"
                                value={formData.expectedHarvestDate}
                                onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                                error={errors.expectedHarvestDate}
                                helperText="คำนวณจากระยะเวลาปลูกของพืช"
                            />
                        </div>

                        <Input
                            label="ผลผลิตที่คาดการณ์ (กิโลกรัม)"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="เช่น 1000"
                            value={formData.estimatedYield}
                            onChange={(e) => setFormData({ ...formData, estimatedYield: e.target.value })}
                            helperText="ไม่บังคับ - ใส่ผลผลิตที่คาดว่าจะได้"
                        />
                    </CardContent>
                </Card>

                {errors.submit && (
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-lg text-sm">
                        {errors.submit}
                    </div>
                )}

                <div className="flex gap-3 justify-end">
                    <Link href="/farmer/cultivations">
                        <Button type="button" variant="outline">
                            ยกเลิก
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isLoading} className="gap-2">
                        {isLoading ? (
                            'กำลังบันทึก...'
                        ) : (
                            <>
                                <Save size={18} />
                                บันทึก
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function NewCultivationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewCultivationContent />
        </Suspense>
    );
}
