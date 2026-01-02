'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Gift,
    Plus,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Copy,
    Check,
    Loader2,
    Ticket,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

interface Promotion {
    id: string;
    name: string;
    description?: string;
    type: string;
    discountValue?: number;
    minPurchase?: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    status: string;
    isPublic: boolean;
    usageLimit?: number;
    usageCount: number;
    promoCodes?: PromoCode[];
}

interface PromoCode {
    id: string;
    code: string;
    isActive: boolean;
    usageLimit?: number;
    usageCount: number;
}

const PROMOTION_TYPES = [
    { value: 'PERCENTAGE_DISCOUNT', label: 'ส่วนลด %' },
    { value: 'FIXED_DISCOUNT', label: 'ลดราคาคงที่' },
    { value: 'FREE_SHIPPING', label: 'ฟรีค่าจัดส่ง' },
    { value: 'BUNDLE_DEAL', label: 'แพ็คเกจพิเศษ' },
];

const PROMOTION_STATUSES = [
    { value: 'DRAFT', label: 'ฉบับร่าง', color: 'outline' as const },
    { value: 'ACTIVE', label: 'เปิดใช้งาน', color: 'success' as const },
    { value: 'SCHEDULED', label: 'กำหนดเวลา', color: 'warning' as const },
    { value: 'EXPIRED', label: 'หมดอายุ', color: 'default' as const },
    { value: 'CANCELLED', label: 'ยกเลิก', color: 'danger' as const },
];

export default function PromotionsManagementPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'PERCENTAGE_DISCOUNT',
        discountValue: '',
        minPurchase: '',
        maxDiscount: '',
        startDate: '',
        endDate: '',
        status: 'DRAFT',
        isPublic: true,
        usageLimit: '',
    });

    const fetchPromotions = useCallback(async () => {
        try {
            const response = await fetch('/api/promotions');
            const data = await response.json();
            setPromotions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching promotions:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    const handleOpenModal = (promotion?: Promotion) => {
        if (promotion) {
            setFormData({
                name: promotion.name,
                description: promotion.description || '',
                type: promotion.type,
                discountValue: promotion.discountValue?.toString() || '',
                minPurchase: promotion.minPurchase?.toString() || '',
                maxDiscount: promotion.maxDiscount?.toString() || '',
                startDate: promotion.startDate.split('T')[0],
                endDate: promotion.endDate.split('T')[0],
                status: promotion.status,
                isPublic: promotion.isPublic,
                usageLimit: promotion.usageLimit?.toString() || '',
            });
            setSelectedPromotion(promotion);
        } else {
            setFormData({
                name: '',
                description: '',
                type: 'PERCENTAGE_DISCOUNT',
                discountValue: '',
                minPurchase: '',
                maxDiscount: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                status: 'DRAFT',
                isPublic: true,
                usageLimit: '',
            });
            setSelectedPromotion(null);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                discountValue: formData.discountValue ? parseFloat(formData.discountValue) : null,
                minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
                maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
            };

            const url = selectedPromotion
                ? `/api/promotions/${selectedPromotion.id}`
                : '/api/promotions';

            const response = await fetch(url, {
                method: selectedPromotion ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchPromotions();
            }
        } catch (error) {
            console.error('Error saving promotion:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('คุณต้องการลบโปรโมชั่นนี้ใช่หรือไม่?')) return;

        try {
            await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
            fetchPromotions();
        } catch (error) {
            console.error('Error deleting promotion:', error);
        }
    };

    const handleGenerateCode = async (promotionId: string) => {
        try {
            const response = await fetch('/api/promo-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ promotionId }),
            });

            if (response.ok) {
                fetchPromotions();
                // Refresh selected promotion
                const promoResponse = await fetch(`/api/promotions/${promotionId}`);
                const promoData = await promoResponse.json();
                setSelectedPromotion(promoData);
            }
        } catch (error) {
            console.error('Error generating promo code:', error);
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = PROMOTION_STATUSES.find((s) => s.value === status);
        return statusConfig ? (
            <Badge variant={statusConfig.color}>{statusConfig.label}</Badge>
        ) : null;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Gift className="text-emerald-500" />
                        จัดการโปรโมชั่น
                    </h1>
                    <p className="text-slate-400 mt-1">
                        สร้างและจัดการโปรโมชั่นสำหรับแพลตฟอร์ม
                    </p>
                </div>
                <Button variant="primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    สร้างโปรโมชั่น
                </Button>
            </div>

            {/* Promotions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>รายการโปรโมชั่น ({promotions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-emerald-500" size={32} />
                        </div>
                    ) : promotions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">ชื่อ</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">ประเภท</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">ส่วนลด</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">สถานะ</th>
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">วันหมดอายุ</th>
                                        <th className="text-right py-3 px-4 text-slate-400 font-medium">การใช้งาน</th>
                                        <th className="text-right py-3 px-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {promotions.map((promo) => (
                                        <tr key={promo.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                        <Gift className="text-emerald-500" size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{promo.name}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {promo.isPublic ? (
                                                                <span className="flex items-center gap-1">
                                                                    <Eye size={12} /> สาธารณะ
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-1">
                                                                    <EyeOff size={12} /> ส่วนตัว
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-300">
                                                {PROMOTION_TYPES.find((t) => t.value === promo.type)?.label}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-emerald-400 font-medium">
                                                    {promo.type === 'PERCENTAGE_DISCOUNT'
                                                        ? `${promo.discountValue}%`
                                                        : promo.type === 'FIXED_DISCOUNT'
                                                            ? `฿${promo.discountValue?.toLocaleString()}`
                                                            : '-'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">{getStatusBadge(promo.status)}</td>
                                            <td className="py-4 px-4 text-slate-300">
                                                {new Date(promo.endDate).toLocaleDateString('th-TH')}
                                            </td>
                                            <td className="py-4 px-4 text-right text-slate-300">
                                                {promo.usageCount}
                                                {promo.usageLimit ? ` / ${promo.usageLimit}` : ''}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPromotion(promo);
                                                            setIsCodeModalOpen(true);
                                                        }}
                                                        className="p-2 hover:bg-slate-700 rounded-lg transition"
                                                        title="จัดการโค้ด"
                                                    >
                                                        <Ticket size={18} className="text-slate-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenModal(promo)}
                                                        className="p-2 hover:bg-slate-700 rounded-lg transition"
                                                        title="แก้ไข"
                                                    >
                                                        <Pencil size={18} className="text-slate-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(promo.id)}
                                                        className="p-2 hover:bg-rose-900/30 rounded-lg transition"
                                                        title="ลบ"
                                                    >
                                                        <Trash2 size={18} className="text-rose-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Gift className="mx-auto text-slate-600 mb-4" size={48} />
                            <p className="text-slate-400">ยังไม่มีโปรโมชั่น</p>
                            <Button variant="primary" className="mt-4" onClick={() => handleOpenModal()}>
                                สร้างโปรโมชั่นแรก
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedPromotion ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่นใหม่'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="ชื่อโปรโมชั่น"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Textarea
                        label="รายละเอียด"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="ประเภท"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            options={PROMOTION_TYPES}
                        />
                        <Select
                            label="สถานะ"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            options={PROMOTION_STATUSES}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="ส่วนลด"
                            type="number"
                            value={formData.discountValue}
                            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                            placeholder={formData.type === 'PERCENTAGE_DISCOUNT' ? '%' : '฿'}
                        />
                        <Input
                            label="ยอดขั้นต่ำ"
                            type="number"
                            value={formData.minPurchase}
                            onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                            placeholder="฿"
                        />
                        <Input
                            label="ลดสูงสุด"
                            type="number"
                            value={formData.maxDiscount}
                            onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                            placeholder="฿"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="วันเริ่มต้น"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                        />
                        <Input
                            label="วันสิ้นสุด"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            required
                        />
                    </div>

                    <Input
                        label="จำกัดการใช้งาน"
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                        placeholder="ไม่จำกัด"
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="animate-spin mr-2" size={18} />}
                            {selectedPromotion ? 'บันทึก' : 'สร้าง'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Promo Codes Modal */}
            <Modal
                isOpen={isCodeModalOpen}
                onClose={() => setIsCodeModalOpen(false)}
                title={`รหัสโปรโมชั่น - ${selectedPromotion?.name}`}
            >
                <div className="space-y-4">
                    <Button
                        variant="primary"
                        onClick={() => selectedPromotion && handleGenerateCode(selectedPromotion.id)}
                    >
                        <Plus size={18} />
                        สร้างรหัสใหม่
                    </Button>

                    {selectedPromotion?.promoCodes && selectedPromotion.promoCodes.length > 0 ? (
                        <div className="space-y-2">
                            {selectedPromotion.promoCodes.map((code) => (
                                <div
                                    key={code.id}
                                    className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <code className="text-lg font-mono font-bold text-emerald-400">
                                            {code.code}
                                        </code>
                                        <Badge variant={code.isActive ? 'success' : 'default'}>
                                            {code.isActive ? 'ใช้งานได้' : 'ปิดใช้งาน'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-400">
                                            {code.usageCount}{code.usageLimit ? `/${code.usageLimit}` : ''} ครั้ง
                                        </span>
                                        <button
                                            onClick={() => handleCopyCode(code.code)}
                                            className="p-2 hover:bg-slate-700 rounded-lg transition"
                                        >
                                            {copiedCode === code.code ? (
                                                <Check size={16} className="text-emerald-400" />
                                            ) : (
                                                <Copy size={16} className="text-slate-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-400 py-8">
                            ยังไม่มีรหัสโปรโมชั่น
                        </p>
                    )}
                </div>
            </Modal>
        </div>
    );
}
