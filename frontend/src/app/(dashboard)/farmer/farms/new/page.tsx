'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/Select';
import { ArrowLeft, MapPin, Save } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import MapPicker to avoid SSR issues
const MapPicker = dynamic(() => import('@/components/features/MapPicker'), {
    ssr: false,
    loading: () => (
        <div className="h-[300px] bg-slate-100 rounded-xl flex items-center justify-center">
            <span className="text-slate-500">กำลังโหลดแผนที่...</span>
        </div>
    ),
});

const waterSourceOptions = [
    { value: 'IRRIGATION', label: 'ชลประทาน' },
    { value: 'GROUNDWATER', label: 'น้ำบาดาล' },
    { value: 'RAIN', label: 'น้ำฝน' },
];

const soilTypeOptions = [
    { value: '', label: 'เลือกประเภทดิน (ไม่บังคับ)' },
    { value: 'ดินร่วน', label: 'ดินร่วน' },
    { value: 'ดินเหนียว', label: 'ดินเหนียว' },
    { value: 'ดินทราย', label: 'ดินทราย' },
    { value: 'ดินร่วนปนทราย', label: 'ดินร่วนปนทราย' },
    { value: 'ดินร่วนเหนียว', label: 'ดินร่วนเหนียว' },
];

// Mock farmer ID (in production, get from session)
const MOCK_FARMER_ID = 'demo-farmer-id';

export default function NewFarmPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        name: '',
        locationLat: 13.7563,
        locationLng: 100.5018,
        areaSize: '',
        soilType: '',
        waterSource: 'IRRIGATION',
    });

    const handleLocationChange = (lat: number, lng: number) => {
        setFormData((prev) => ({
            ...prev,
            locationLat: lat,
            locationLng: lng,
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'กรุณากรอกชื่อแปลงเกษตร';
        }

        if (!formData.areaSize || parseFloat(formData.areaSize) <= 0) {
            newErrors.areaSize = 'กรุณากรอกขนาดพื้นที่ที่ถูกต้อง';
        }

        if (!formData.waterSource) {
            newErrors.waterSource = 'กรุณาเลือกแหล่งน้ำ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/farms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    farmerId: MOCK_FARMER_ID,
                    name: formData.name,
                    locationLat: formData.locationLat,
                    locationLng: formData.locationLng,
                    areaSize: parseFloat(formData.areaSize),
                    soilType: formData.soilType || null,
                    waterSource: formData.waterSource,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create farm');
            }

            router.push('/farmer/farms');
        } catch (error) {
            console.error('Error creating farm:', error);
            setErrors({ submit: 'เกิดข้อผิดพลาดในการสร้างแปลงเกษตร' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/farmer/farms">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">เพิ่มแปลงเกษตรใหม่</h1>
                    <p className="text-slate-500">กรอกข้อมูลเพื่อลงทะเบียนแปลงเกษตรของคุณ</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลทั่วไป</CardTitle>
                        <CardDescription>ข้อมูลพื้นฐานของแปลงเกษตร</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="ชื่อแปลงเกษตร *"
                            placeholder="เช่น แปลงนา 1, ไร่มันสำปะหลัง"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            error={errors.name}
                        />

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input
                                label="ขนาดพื้นที่ (ไร่) *"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="10.5"
                                value={formData.areaSize}
                                onChange={(e) => setFormData({ ...formData, areaSize: e.target.value })}
                                error={errors.areaSize}
                            />

                            <Select
                                label="แหล่งน้ำหลัก *"
                                options={waterSourceOptions}
                                value={formData.waterSource}
                                onChange={(e) => setFormData({ ...formData, waterSource: e.target.value })}
                                error={errors.waterSource}
                            />
                        </div>

                        <Select
                            label="ประเภทดิน"
                            options={soilTypeOptions}
                            value={formData.soilType}
                            onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin size={20} className="text-emerald-600" />
                            ตำแหน่งแปลงเกษตร
                        </CardTitle>
                        <CardDescription>
                            คลิกบนแผนที่เพื่อเลือกตำแหน่ง หรือใช้ปุ่มค้นหา
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MapPicker
                            initialLat={formData.locationLat}
                            initialLng={formData.locationLng}
                            onLocationChange={handleLocationChange}
                            height="350px"
                        />
                    </CardContent>
                </Card>

                {errors.submit && (
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-lg text-sm">
                        {errors.submit}
                    </div>
                )}

                <div className="flex gap-3 justify-end">
                    <Link href="/farmer/farms">
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
                                บันทึกแปลงเกษตร
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
