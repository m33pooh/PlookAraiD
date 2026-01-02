'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, ShoppingCart, Save } from 'lucide-react';

interface Product {
    id: number;
    name: string;
}

// Mock buyer ID (in production, get from session)
const MOCK_BUYER_ID = 'demo-buyer-id';

export default function NewBuyRequestPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        productId: '',
        quantityRequired: '',
        priceOffered: '',
        description: '',
        expiryDate: '',
    });

    useEffect(() => {
        fetch('/api/products')
            .then((r) => r.json())
            .then(setProducts);

        // Set default expiry date to 30 days from now
        const defaultExpiry = new Date();
        defaultExpiry.setDate(defaultExpiry.getDate() + 30);
        setFormData((prev) => ({
            ...prev,
            expiryDate: defaultExpiry.toISOString().split('T')[0],
        }));
    }, []);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.productId) {
            newErrors.productId = 'กรุณาเลือกสินค้า';
        }

        if (!formData.quantityRequired || parseFloat(formData.quantityRequired) <= 0) {
            newErrors.quantityRequired = 'กรุณากรอกปริมาณที่ต้องการ';
        }

        if (!formData.expiryDate) {
            newErrors.expiryDate = 'กรุณาระบุวันหมดอายุ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/buy-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buyerId: MOCK_BUYER_ID,
                    productId: parseInt(formData.productId),
                    quantityRequired: parseFloat(formData.quantityRequired),
                    priceOffered: formData.priceOffered ? parseFloat(formData.priceOffered) : null,
                    description: formData.description || null,
                    expiryDate: formData.expiryDate,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create buy request');
            }

            router.push('/buyer/requests');
        } catch (error) {
            console.error('Error creating buy request:', error);
            setErrors({ submit: 'เกิดข้อผิดพลาดในการสร้างประกาศ' });
        } finally {
            setIsLoading(false);
        }
    };

    const productOptions = products.map((p) => ({
        value: p.id.toString(),
        label: p.name,
    }));

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/buyer/requests">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">ประกาศรับซื้อใหม่</h1>
                    <p className="text-slate-500">ระบุรายละเอียดสินค้าที่ต้องการรับซื้อ</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="text-emerald-600" size={20} />
                            ข้อมูลสินค้า
                        </CardTitle>
                        <CardDescription>เลือกสินค้าและระบุปริมาณที่ต้องการ</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select
                            label="สินค้าที่ต้องการ *"
                            options={[{ value: '', label: 'เลือกสินค้า' }, ...productOptions]}
                            value={formData.productId}
                            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                            error={errors.productId}
                        />

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input
                                label="ปริมาณที่ต้องการ (กก.) *"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="เช่น 10000"
                                value={formData.quantityRequired}
                                onChange={(e) => setFormData({ ...formData, quantityRequired: e.target.value })}
                                error={errors.quantityRequired}
                            />

                            <Input
                                label="ราคาที่เสนอ (บาท/กก.)"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="เช่น 15.50"
                                value={formData.priceOffered}
                                onChange={(e) => setFormData({ ...formData, priceOffered: e.target.value })}
                                helperText="ไม่บังคับ - เว้นว่างเพื่อให้เกษตรกรเสนอราคา"
                            />
                        </div>

                        <Input
                            label="วันหมดอายุประกาศ *"
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            error={errors.expiryDate}
                            helperText="ประกาศจะปิดอัตโนมัติหลังวันที่นี้"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>รายละเอียดเพิ่มเติม</CardTitle>
                        <CardDescription>ระบุข้อกำหนดพิเศษหรือข้อมูลที่เกษตรกรควรรู้</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="เช่น ต้องการข้าวเกรด A เท่านั้น, รับสินค้าที่โกดังจังหวัด..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                        />
                    </CardContent>
                </Card>

                {errors.submit && (
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-lg text-sm">
                        {errors.submit}
                    </div>
                )}

                <div className="flex gap-3 justify-end">
                    <Link href="/buyer/requests">
                        <Button type="button" variant="outline">
                            ยกเลิก
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isLoading} className="gap-2">
                        {isLoading ? (
                            'กำลังสร้าง...'
                        ) : (
                            <>
                                <Save size={18} />
                                สร้างประกาศ
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
