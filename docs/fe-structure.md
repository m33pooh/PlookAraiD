🏗️ Plook Arai Dee - Next.js Project Structureเอกสารนี้แสดงโครงสร้างไฟล์และการตั้งค่าที่แนะนำสำหรับโปรเจกต์ "ปลูกอะไรดี" โดยใช้ Next.js 14+ (App Router), TypeScript, และ Tailwind CSS📦 1. Tech Stack & Dependenciesรายการ Library ที่จำเป็นต้องใช้ในโปรเจกต์นี้:# Core
npx create-next-app@latest plook-arai-dee --typescript --tailwind --eslint

# UI Components & Icons
npm install lucide-react clsx tailwind-merge framer-motion

# Charts (สำหรับ Dashboard ราคากลาง)
npm install recharts

# Maps (สำหรับระบุพิกัดแปลงเกษตร)
npm install leaflet react-leaflet
npm install -D @types/leaflet

# State Management & Form
npm install zustand react-hook-form zod

# Authentication (Login เกษตรกร/ผู้ซื้อ)
npm install next-auth
📂 2. Folder Structure (App Router)โครงสร้างโฟลเดอร์ที่ออกแบบมาให้ขยายขนาดได้ง่าย (Scalable):plook-arai-dee/
├── public/                 # รูปภาพ, icons, static assets
├── src/
│   ├── app/                # App Router (Pages & Layouts)
│   │   ├── (auth)/         # Route Group: หน้า Login/Register
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/    # Route Group: ส่วนที่ต้อง Login
│   │   │   ├── farmer/     # Dashboard เกษตรกร
│   │   │   ├── buyer/      # Dashboard ผู้รับซื้อ
│   │   │   └── layout.tsx  # Layout หลัก (Sidebar + Navbar)
│   │   ├── market/         # หน้าดูราคาตลาด (Public)
│   │   ├── search/         # หน้าค้นหา "ปลูกอะไรดี" (Core Feature)
│   │   ├── api/            # API Routes (Backend logic)
│   │   ├── layout.tsx      # Root Layout
│   │   └── page.tsx        # Landing Page
│   │
│   ├── components/         # Reusable UI Components
│   │   ├── ui/             # Basic UI (Button, Input, Card)
│   │   ├── maps/           # Map Components (Leaflet wrappers)
│   │   ├── charts/         # Price Charts
│   │   └── features/       # Business Logic Components
│   │       ├── CropCard.tsx
│   │       ├── MatchingResult.tsx
│   │       └── ContractForm.tsx
│   │
│   ├── lib/                # Utility functions & Configs
│   │   ├── db.ts           # Database connection (Prisma/Drizzle)
│   │   ├── utils.ts        # Helper functions (cn, formatMoney)
│   │   └── auth.ts         # NextAuth configuration
│   │
│   ├── services/           # API fetching logic
│   │   ├── weather.ts      # Fetch Weather API
│   │   └── marketPrice.ts  # Fetch Market Data
│   │
│   ├── types/              # TypeScript Interfaces (ตรงกับ ER Diagram)
│   │   ├── index.ts
│   │   └── database.ts
│   │
│   └── styles/             # Global CSS
💻 3. Code ExamplesA. Type Definitions (src/types/index.ts)สร้าง Type ให้ตรงกับ Database Schema เพื่อความปลอดภัยในการเขียนโค้ดexport type Role = 'farmer' | 'buyer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Crop {
  id: number;
  name: string;
  category: 'crop' | 'livestock' | 'aquatic';
  growthDuration: number; // days
  image: string;
  marketDemand: 'high' | 'medium' | 'low';
  currentPrice: {
    min: number;
    max: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface Farm {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  size: number; // rai
  waterSource: 'irrigation' | 'groundwater' | 'rain';
}
B. Core Page: หน้าผลลัพธ์การค้นหา (src/app/search/page.tsx)ตัวอย่างการใช้ Server Components ดึงข้อมูลและแสดงผล (จำลองการทำงาน)import { SearchFilters } from '@/components/features/SearchFilters';
import { CropCard } from '@/components/features/CropCard';
import { getRecommendedCrops } from '@/services/recommendation';

// Server Component (Async)
export default async function SearchPage({
  searchParams,
}: {
  searchParams: { lat?: string; lng?: string; water?: string; size?: string };
}) {
  // 1. ดึงข้อมูลจาก Query Params
  const { lat, lng, water, size } = searchParams;

  // 2. เรียก Service (Logic การจับคู่พืชที่เหมาะสม)
  // ในอนาคตจะต่อ Database จริงตรงนี้
  const recommendedCrops = await getRecommendedCrops({
    location: { lat: Number(lat), lng: Number(lng) },
    waterSource: water,
    farmSize: Number(size),
  });

  return (
    <div className="container mx-auto p-4 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">ผลการวิเคราะห์พื้นที่</h1>
        <p className="text-slate-500">
          พิกัด: {lat || '-'}, {lng || '-'} • น้ำ: {water || '-'} • ขนาด: {size || '-'} ไร่
        </p>
      </header>

      {/* Filter Section */}
      <section className="mb-8">
        <SearchFilters initialValues={searchParams} />
      </section>

      {/* Results Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendedCrops.map((crop) => (
          <CropCard 
            key={crop.id} 
            data={crop} 
            matchScore={crop.matchScore} // สมมติว่า service คืนค่า matchScore มาด้วย
          />
        ))}
      </section>
      
      {recommendedCrops.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          ไม่พบพืชที่เหมาะสมกับเงื่อนไขนี้
        </div>
      )}
    </div>
  );
}
C. Component: การ์ดแสดงผลพืช (src/components/features/CropCard.tsx)ตัวอย่าง Client Component ที่มีการโต้ตอบ (Interactive)'use client';

import { Crop } from '@/types';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CropCardProps {
  data: Crop;
  matchScore: number;
}

export const CropCard = ({ data, matchScore }: CropCardProps) => {
  const router = useRouter();

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition cursor-pointer relative overflow-hidden group"
      onClick={() => router.push(`/search/${data.id}`)}
    >
      {/* Match Score Badge */}
      <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-bl-lg">
        Match {matchScore}%
      </div>

      <div className="flex gap-4">
        {/* Image Placeholder */}
        <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 relative overflow-hidden">
           {/* ใช้ next/image ในโปรเจกต์จริง */}
           <div className="w-full h-full flex items-center justify-center text-slate-300">
             IMG
           </div>
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-lg">{data.name}</h3>
          
          <div className="flex items-center gap-2 mt-1 mb-3">
             <span className="text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
               {data.growthDuration} วัน
             </span>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-slate-400">ราคาปัจจุบัน</p>
              <div className="flex items-end gap-1">
                <span className="font-bold text-emerald-600 text-lg">
                  {data.currentPrice.max}
                </span>
                <span className="text-xs text-slate-500 mb-1">
                  {data.currentPrice.unit}
                </span>
              </div>
            </div>
            
            {data.currentPrice.trend === 'up' ? (
              <TrendingUp className="text-emerald-500" size={20} />
            ) : (
              <TrendingDown className="text-rose-500" size={20} />
            )}
          </div>
        </div>
      </div>
      
      {/* Hover Action */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
    </div>
  );
};
🚀 ขั้นตอนถัดไปหากคุณพร้อมเริ่มโปรเจกต์:รันคำสั่ง npx create-next-app@latest ตามหัวข้อที่ 1ก๊อปปี้โฟลเดอร์ src/types ไปวางเริ่มสร้างหน้า app/page.tsx โดยใช้ Wireframe ที่เราออกแบบไว้เป็นต้นแบบคุณต้องการให้ผมเขียนโค้ดส่วน Database Connection (เช่น Prisma Schema) เพื่อเชื่อมต่อกับ ER Diagram ที่ออกแบบไว้ก่อนหน้านี้ด้วยไหมครับ?