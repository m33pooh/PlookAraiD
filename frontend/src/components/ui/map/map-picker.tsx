'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback, useRef } from 'react';
import { MapPin, Loader2, LocateFixed } from 'lucide-react';
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

interface MapPickerProps {
    value?: { lat: number; lng: number } | null;
    onChange?: (location: { lat: number; lng: number }) => void;
    className?: string;
    height?: string;
    defaultCenter?: { lat: number; lng: number };
    defaultZoom?: number;
}

// Default center: Thailand
const DEFAULT_CENTER = { lat: 15.8700, lng: 100.9925 };
const DEFAULT_ZOOM = 6;

function LocationMarker({
    position,
    onLocationChange,
}: {
    position: { lat: number; lng: number } | null;
    onLocationChange: (pos: { lat: number; lng: number }) => void;
}) {
    const [markerIcon, setMarkerIcon] = useState<L.Icon | null>(null);
    const [MapEventsComponent, setMapEventsComponent] = useState<React.FC | null>(null);

    useEffect(() => {
        // Import Leaflet only on client side
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
        });
    }, []);

    useEffect(() => {
        import('react-leaflet').then((mod) => {
            const MapEvents = () => {
                mod.useMapEvents({
                    click(e) {
                        onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
                    },
                });
                return null;
            };
            setMapEventsComponent(() => MapEvents);
        });
    }, [onLocationChange]);

    if (!markerIcon) return null;

    return (
        <>
            {MapEventsComponent && <MapEventsComponent />}
            {position && (
                <Marker position={[position.lat, position.lng]} icon={markerIcon} />
            )}
        </>
    );
}

export default function MapPicker({
    value,
    onChange,
    className,
    height = '300px',
    defaultCenter = DEFAULT_CENTER,
    defaultZoom = DEFAULT_ZOOM,
}: MapPickerProps) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(value || null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocating, setIsLocating] = useState(false);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        // Set loading to false once client-side
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (value) {
            setPosition(value);
        }
    }, [value]);

    const handleLocationChange = useCallback((newPos: { lat: number; lng: number }) => {
        setPosition(newPos);
        onChange?.(newPos);
    }, [onChange]);

    const handleLocateMe = useCallback(() => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newLocation = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                handleLocationChange(newLocation);
                // Center map on new location
                if (mapRef.current) {
                    mapRef.current.setView([newLocation.lat, newLocation.lng], 15);
                }
                setIsLocating(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                setIsLocating(false);
                alert('ไม่สามารถดึงตำแหน่งปัจจุบันได้');
            },
            { enableHighAccuracy: true }
        );
    }, [handleLocationChange]);

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

    const center = position || defaultCenter;

    return (
        <div className={cn('relative rounded-xl overflow-hidden border border-slate-700', className)}>
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
            />
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={position ? 15 : defaultZoom}
                style={{ height, width: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} onLocationChange={handleLocationChange} />
            </MapContainer>

            {/* Locate Me Button */}
            <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                className="absolute bottom-4 right-4 z-[1000] bg-white hover:bg-gray-100 text-gray-700 p-2.5 rounded-lg shadow-lg transition disabled:opacity-50"
                title="ใช้ตำแหน่งปัจจุบัน"
            >
                {isLocating ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : (
                    <LocateFixed size={20} />
                )}
            </button>

            {/* Coordinates Display */}
            {position && (
                <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                    <MapPin size={14} className="text-emerald-400" />
                    <span>
                        {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                    </span>
                </div>
            )}

            {/* Instruction Overlay */}
            {!position && (
                <div className="absolute inset-0 z-[999] pointer-events-none flex items-center justify-center">
                    <div className="bg-slate-900/80 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg">
                        คลิกบนแผนที่เพื่อปักหมุดตำแหน่ง
                    </div>
                </div>
            )}
        </div>
    );
}
