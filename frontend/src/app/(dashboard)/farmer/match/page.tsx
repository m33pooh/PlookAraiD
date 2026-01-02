'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import {
    Sprout,
    BarChart3,
    AlertTriangle,
    CheckCircle,
    MapPin,
    Leaf,
    Droplets,
    Search
} from 'lucide-react';

interface Farm {
    id: string;
    name: string;
    locationLat: number;
    locationLng: number;
}

interface Product {
    id: number;
    name: string;
    imageUrl: string | null;
    growthDurationDays: number;
}

interface Recommendation {
    product: Product;
    score: number;
    reasons: string[];
    warnings: string[];
}

export default function SmartMatchPage() {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [selectedFarmId, setSelectedFarmId] = useState<string>('');
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoadingFarms, setIsLoadingFarms] = useState(true);
    const [isLoadingMatch, setIsLoadingMatch] = useState(false);

    useEffect(() => {
        fetchFarms();
    }, []);

    const fetchFarms = async () => {
        try {
            const response = await fetch('/api/farms');
            const data = await response.json();
            setFarms(data);
            if (data.length > 0) {
                setSelectedFarmId(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching farms:', error);
        } finally {
            setIsLoadingFarms(false);
        }
    };

    const handleMatch = async () => {
        if (!selectedFarmId) return;

        setIsLoadingMatch(true);
        try {
            const response = await fetch(`/api/smart-match?farmId=${selectedFarmId}`);
            const data = await response.json();
            setRecommendations(data.recommendations || []);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setIsLoadingMatch(false);
        }
    };

    // Trigger match when farm changes (optional, or make it a button)
    useEffect(() => {
        if (selectedFarmId) {
            handleMatch();
        }
    }, [selectedFarmId]);


    if (isLoadingFarms) {
        return <div className="flex items-center justify-center h-96 text-slate-400">Loading farms...</div>;
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 p-8 text-white shadow-xl">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
                        <BarChart3 className="w-8 h-8" />
                        Smart Matching Engine
                    </h1>
                    <p className="text-emerald-50 text-lg opacity-90">
                        AI-driven analysis to help you decide "What to grow?" based on market demand, seasonality, and your farm's conditions.
                    </p>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-10 h-40 w-40 rounded-full bg-yellow-300 opacity-20 blur-2xl"></div>
            </div>

            {/* Farm Selector */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-300 min-w-max">
                    <MapPin size={20} className="text-emerald-400" />
                    <span className="font-medium">Select Farm for Analysis:</span>
                </div>
                <div className="flex-1 w-full sm:w-auto">
                    <select
                        title="Select Farm"
                        value={selectedFarmId}
                        onChange={(e) => setSelectedFarmId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    >
                        {farms.map(farm => (
                            <option key={farm.id} value={farm.id}>{farm.name} ({Number(farm.locationLat).toFixed(4)}, {Number(farm.locationLng).toFixed(4)})</option>
                        ))}
                    </select>
                </div>
                <Button
                    onClick={handleMatch}
                    disabled={isLoadingMatch}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                >
                    {isLoadingMatch ? 'Analyzing...' : 'Refresh Analysis'}
                </Button>
            </div>

            {/* Results Grid */}
            {isLoadingMatch ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-800 rounded-xl border border-slate-700"></div>
                    ))}
                </div>
            ) : recommendations.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed">
                    <Search className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-slate-300">No recommendations found</h3>
                    <p className="text-slate-500 mt-2">Try selecting a different farm or updating your farm details.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((rec, index) => (
                        <Card
                            key={rec.product.id}
                            className={`
                        group overflow-hidden border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/10 
                        ${index === 0 ? 'ring-2 ring-emerald-500 relative' : ''}
                    `}
                            variant="elevated"
                        >
                            {index === 0 && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-20 shadow-lg">
                                    TOP PICK
                                </div>
                            )}

                            {/* Score Header */}
                            <div className="relative h-32 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
                                {rec.product.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={rec.product.imageUrl}
                                        alt={rec.product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                        <Sprout className="text-emerald-600 w-12 h-12 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4 z-20">
                                    <h3 className="text-2xl font-bold text-white drop-shadow-md">{rec.product.name}</h3>
                                    <div className="flex items-center gap-2 text-emerald-200 text-sm">
                                        <Leaf size={14} />
                                        <span>{rec.product.growthDurationDays} days to harvest</span>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="pt-6 space-y-4">
                                {/* Match Score */}
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-medium">Match Score</span>
                                    <div className="flex items-center gap-2">
                                        <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                                            {rec.score}%
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${rec.score}%` }}
                                    ></div>
                                </div>

                                {/* Reasons (Pros) */}
                                <div className="space-y-2">
                                    {rec.reasons.map((reason, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                            <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                            <span>{reason}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Warnings (Cons) */}
                                {rec.warnings.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-slate-700/50">
                                        {rec.warnings.map((warning, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm text-amber-400">
                                                <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                                <span>{warning}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <Button className="w-full mt-4 bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-400 text-slate-300 border border-slate-700 transition-colors">
                                    Create Cultivation Plan
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
