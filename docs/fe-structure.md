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