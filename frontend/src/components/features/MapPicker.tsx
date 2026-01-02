'use client';

import { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MapPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationChange: (lat: number, lng: number) => void;
    height?: string;
}

export default function MapPicker({
    initialLat = 13.7563,
    initialLng = 100.5018,
    onLocationChange,
    height = '300px',
}: MapPickerProps) {
    const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
    const [isClient, setIsClient] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !mapRef.current || mapInstanceRef.current) return;

        // Dynamic import of Leaflet
        const initMap = async () => {
            const L = await import('leaflet');

            // Fix default marker icon
            delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            // Create map
            const map = L.map(mapRef.current!).setView(position, 13);
            mapInstanceRef.current = map;

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map);

            // Add marker
            const marker = L.marker(position).addTo(map);
            markerRef.current = marker;

            // Click handler
            map.on('click', (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]);
                setPosition([lat, lng]);
                onLocationChange(lat, lng);
            });
        };

        initMap();

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [isClient, position, onLocationChange]);

    // Update marker position when position state changes
    useEffect(() => {
        if (markerRef.current && mapInstanceRef.current) {
            markerRef.current.setLatLng(position);
            mapInstanceRef.current.setView(position, mapInstanceRef.current.getZoom());
        }
    }, [position]);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง');
            return;
        }

        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);
                onLocationChange(latitude, longitude);
                setIsLoading(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('ไม่สามารถระบุตำแหน่งได้');
                setIsLoading(false);
            }
        );
    };

    const searchLocation = async () => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=th`
            );
            const data = await response.json();

            if (data.length > 0) {
                const { lat, lon } = data[0];
                const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
                setPosition(newPos);
                onLocationChange(parseFloat(lat), parseFloat(lon));
            } else {
                alert('ไม่พบตำแหน่งที่ค้นหา');
            }
        } catch (error) {
            console.error('Error searching location:', error);
            alert('เกิดข้อผิดพลาดในการค้นหา');
        }
        setIsLoading(false);
    };

    if (!isClient) {
        return (
            <div
                style={{ height }}
                className="w-full bg-slate-100 rounded-xl flex items-center justify-center"
            >
                <div className="text-slate-500">กำลังโหลดแผนที่...</div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Search & Current Location */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="ค้นหาสถานที่..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
                        className="pl-10"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={searchLocation}
                    disabled={isLoading}
                >
                    ค้นหา
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                    className="gap-2"
                >
                    <Navigation size={16} />
                    <span className="hidden sm:inline">ตำแหน่งปัจจุบัน</span>
                </Button>
            </div>

            {/* Map Container */}
            <div
                ref={mapRef}
                className="rounded-xl overflow-hidden border border-slate-200"
                style={{ height }}
            />

            {/* Coordinates Display */}
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                <MapPin size={16} className="text-emerald-600" />
                <span>
                    พิกัด: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </span>
            </div>
        </div>
    );
}
