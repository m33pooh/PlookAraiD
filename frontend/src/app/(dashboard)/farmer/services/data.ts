export type ServiceProvider = {
    id: string;
    name: string;
    category: 'Harvesting' | 'Spraying' | 'Fertilizing' | 'Ploughing' | 'Labor';
    serviceType: string;
    rate: number;
    unit: string;
    rating: number;
    reviews: number;
    location: string;
    distance: number; // km
    image: string;
    available: boolean;
};

export const serviceProviders: ServiceProvider[] = [
    {
        id: '1',
        name: 'ทีมงานฟ้าใส โดรนซิ่ง',
        category: 'Spraying',
        serviceType: 'พ่นยาโดรน (Drone Spraying)',
        rate: 50,
        unit: 'ไร่',
        rating: 4.8,
        reviews: 124,
        location: 'อ.เมือง จ.เชียงใหม่',
        distance: 5.2,
        image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=300&h=200',
        available: true,
    },
    {
        id: '2',
        name: 'เจ๊ติ๋ม รถเกี่ยว',
        category: 'Harvesting',
        serviceType: 'รถเกี่ยวข้าว (Harvester)',
        rate: 550,
        unit: 'ไร่',
        rating: 4.5,
        reviews: 89,
        location: 'อ.แม่ริม จ.เชียงใหม่',
        distance: 12.0,
        image: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&q=80&w=300&h=200',
        available: true,
    },
    {
        id: '3',
        name: 'ลุงพล รถไถรับจ้าง',
        category: 'Ploughing',
        serviceType: 'ไถดะ/ไถแปร (Ploughing)',
        rate: 250,
        unit: 'ไร่',
        rating: 4.2,
        reviews: 45,
        location: 'อ.หางดง จ.เชียงใหม่',
        distance: 8.5,
        image: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?auto=format&fit=crop&q=80&w=300&h=200',
        available: false, // Busy
    },
    {
        id: '4',
        name: 'ทีมงานวัยรุ่นสร้างตัว',
        category: 'Labor',
        serviceType: 'แรงงานเก็บเกี่ยวทั่วไป',
        rate: 350,
        unit: 'วัน/คน',
        rating: 4.0,
        reviews: 22,
        location: 'อ.สันทราย จ.เชียงใหม่',
        distance: 15.0,
        image: 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=300&h=200',
        available: true,
    },
    {
        id: '5',
        name: 'Smart Farm Solutions',
        category: 'Fertilizing',
        serviceType: 'ใส่ปุ๋ยความแม่นยำสูง',
        rate: 80,
        unit: 'ไร่',
        rating: 4.9,
        reviews: 56,
        location: 'อ.เมือง จ.เชียงใหม่',
        distance: 3.0,
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=300&h=200',
        available: true,
    },
    {
        id: '6',
        name: 'รถเกี่ยวเสี่ยสั่งลุย',
        category: 'Harvesting',
        serviceType: 'รถเกี่ยวข้าว-ข้าวโพด',
        rate: 600,
        unit: 'ไร่',
        rating: 4.7,
        reviews: 210,
        location: 'อ.ดอยสะเก็ด จ.เชียงใหม่',
        distance: 18.2,
        image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=300&h=200',
        available: true,
    }
];
