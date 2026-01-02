'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamic import of react-leaflet components to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then(mod => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then(mod => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then(mod => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then(mod => mod.Popup),
    { ssr: false }
);

export interface MapMarker {
    id: string;
    lat: number;
    lng: number;
    label?: string;
    popupContent?: React.ReactNode;
    iconColor?: 'default' | 'green' | 'red' | 'blue';
}

interface MapViewProps {
    markers: MapMarker[];
    className?: string;
    height?: string;
    center?: { lat: number; lng: number };
    zoom?: number;
    onMarkerClick?: (marker: MapMarker) => void;
}

// Default center: Thailand
const DEFAULT_CENTER = { lat: 15.8700, lng: 100.9925 };
const DEFAULT_ZOOM = 6;

export default function MapView({
    markers,
    className,
    height = '400px',
    center,
    zoom,
    onMarkerClick,
}: MapViewProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [markerIcon, setMarkerIcon] = useState<L.Icon | null>(null);

    useEffect(() => {
        // Import Leaflet and create icon
        import('leaflet').then((L) => {
            const icon = L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            });
            setMarkerIcon(icon);
            setIsLoading(false);
        });
    }, []);

    // Calculate center from markers if not provided
    const mapCenter = center || (markers.length > 0
        ? {
            lat: markers.reduce((sum, m) => sum + m.lat, 0) / markers.length,
            lng: markers.reduce((sum, m) => sum + m.lng, 0) / markers.length,
        }
        : DEFAULT_CENTER);

    // Calculate zoom based on marker spread if not provided
    const mapZoom = zoom || (markers.length > 0 ? 10 : DEFAULT_ZOOM);

    if (isLoading) {
        return (
            <div
                className={cn(
                    'flex items-center justify-center bg-slate-800 rounded-xl border border-slate-700',
                    className
                )}
                style={{ height }}
            >
                <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
        );
    }

    return (
        <div className={cn('relative rounded-xl overflow-hidden border border-slate-700', className)}>
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
            />
            <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={mapZoom}
                style={{ height, width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={[marker.lat, marker.lng]}
                        icon={markerIcon!}
                        eventHandlers={{
                            click: () => onMarkerClick?.(marker),
                        }}
                    >
                        {marker.popupContent && (
                            <Popup>
                                <div className="text-slate-900">
                                    {marker.popupContent}
                                </div>
                            </Popup>
                        )}
                    </Marker>
                ))}
            </MapContainer>

            {/* Legend / Marker Count */}
            {markers.length > 0 && (
                <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg">
                    {markers.length} ตำแหน่ง
                </div>
            )}
        </div>
    );
}
