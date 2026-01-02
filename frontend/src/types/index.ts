// User & Authentication Types
export type Role = 'FARMER' | 'BUYER' | 'ADMIN';

export interface User {
    id: string;
    username: string;
    email: string;
    role: Role;
    phoneNumber?: string;
    isVerified: boolean;
    profile?: UserProfile;
}

export interface UserProfile {
    id: string;
    fullName?: string;
    address?: string;
    bio?: string;
    avatarUrl?: string;
}

// Farm Types
export type WaterSource = 'IRRIGATION' | 'GROUNDWATER' | 'RAIN';

export interface Farm {
    id: string;
    name: string;
    location: { lat: number; lng: number };
    areaSize: number; // ไร่
    soilType?: string;
    waterSource: WaterSource;
}

// Product Types
export type ProductCategory = 'CROP' | 'LIVESTOCK' | 'AQUATIC';
export type PriceTrend = 'up' | 'down' | 'stable';
export type DemandLevel = 'high' | 'medium' | 'low';

export interface Product {
    id: number;
    name: string;
    category: ProductCategory;
    growthDurationDays: number;
    suitableMonths?: number[];
    baseCostPerRai?: number;
    imageUrl?: string;
}

export interface MarketPrice {
    id: string;
    productId: number;
    sourceName: string;
    priceMin: number;
    priceMax: number;
    dateRecorded: Date;
}

export interface Crop extends Product {
    marketDemand: DemandLevel;
    currentPrice: {
        min: number;
        max: number;
        unit: string;
        trend: PriceTrend;
    };
    matchScore?: number;
}

// Buy Request Types
export type DemandStatus = 'OPEN' | 'CLOSED' | 'FULFILLED';

export interface BuyRequest {
    id: string;
    buyerId: string;
    productId: number;
    quantityRequired: number;
    priceOffered?: number;
    description?: string;
    expiryDate: Date;
    status: DemandStatus;
    createdAt: Date;
}

// Cultivation Types
export type CultivationStatus = 'PLANNING' | 'GROWING' | 'HARVESTED' | 'SOLD';

export interface Cultivation {
    id: string;
    farmId: string;
    productId: number;
    startDate: Date;
    expectedHarvestDate: Date;
    estimatedYield?: number;
    status: CultivationStatus;
}

// Contract Types
export type ContractStatus = 'DRAFT' | 'SIGNED' | 'COMPLETED' | 'CANCELLED';

export interface Contract {
    id: string;
    cultivationId: string;
    buyRequestId: string;
    farmerId: string;
    buyerId: string;
    agreedPrice: number;
    agreedQuantity: number;
    status: ContractStatus;
    signedAt?: Date;
}

// Search & Filter Types
export interface SearchParams {
    lat?: number;
    lng?: number;
    waterSource?: WaterSource;
    farmSize?: number;
    category?: ProductCategory;
}

export interface RecommendationResult {
    crop: Crop;
    matchScore: number;
    reasons: string[];
}
