'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/input';
import {
    Cpu,
    Plus,
    Thermometer,
    Droplets,
    Sun,
    Wind,
    CloudRain,
    Activity,
    RefreshCw,
    SignalHigh,
    SignalLow,
    Wifi,
    WifiOff,
    Map,
    List,
    MapPin,
} from 'lucide-react';

// Dynamic import MapView to avoid SSR issues
const MapView = dynamic(
    () => import('@/components/ui/map/map-view'),
    { ssr: false, loading: () => <div className="h-[400px] bg-slate-800 rounded-xl animate-pulse" /> }
);

type SensorType = 'SOIL_MOISTURE' | 'SOIL_PH' | 'TEMPERATURE' | 'HUMIDITY' | 'LIGHT' | 'RAIN' | 'WIND';

interface Farm {
    id: string;
    name: string;
}

interface IotDevice {
    id: string;
    name: string;
    sensorType: SensorType;
    serialNumber: string | null;
    isActive: boolean;
    lastSeenAt: string | null;
    locationLat: string | null;
    locationLng: string | null;
    farm: Farm;
    latestReading: {
        value: string;
        unit: string;
        recordedAt: string;
    } | null;
}

const sensorTypeInfo: Record<SensorType, { label: string; icon: React.ElementType; color: string; unit: string }> = {
    SOIL_MOISTURE: { label: 'ความชื้นในดิน', icon: Droplets, color: 'text-blue-400', unit: '%' },
    SOIL_PH: { label: 'ค่า pH ดิน', icon: Activity, color: 'text-purple-400', unit: 'pH' },
    TEMPERATURE: { label: 'อุณหภูมิ', icon: Thermometer, color: 'text-orange-400', unit: '°C' },
    HUMIDITY: { label: 'ความชื้นอากาศ', icon: Droplets, color: 'text-cyan-400', unit: '%' },
    LIGHT: { label: 'แสงสว่าง', icon: Sun, color: 'text-yellow-400', unit: 'lux' },
    RAIN: { label: 'ปริมาณฝน', icon: CloudRain, color: 'text-indigo-400', unit: 'mm' },
    WIND: { label: 'ความเร็วลม', icon: Wind, color: 'text-teal-400', unit: 'km/h' },
};

const sensorTypeOptions = Object.entries(sensorTypeInfo).map(([key, info]) => ({
    value: key,
    label: info.label,
}));

export default function IotDashboardPage() {
    const [devices, setDevices] = useState<IotDevice[]>([]);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    // Form state
    const [newDevice, setNewDevice] = useState({
        name: '',
        sensorType: '',
        farmId: '',
        serialNumber: '',
    });

    const fetchDevices = async () => {
        try {
            const res = await fetch('/api/iot/devices');
            if (res.ok) {
                const data = await res.json();
                setDevices(data);
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFarms = async () => {
        try {
            const res = await fetch('/api/farms');
            if (res.ok) {
                const data = await res.json();
                setFarms(data);
            }
        } catch (error) {
            console.error('Error fetching farms:', error);
        }
    };

    useEffect(() => {
        fetchDevices();
        fetchFarms();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDevices();
        setRefreshing(false);
    };

    const handleAddDevice = async () => {
        if (!newDevice.name || !newDevice.sensorType || !newDevice.farmId) return;

        try {
            const res = await fetch('/api/iot/devices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDevice),
            });

            if (res.ok) {
                const device = await res.json();
                setDevices((prev) => [device, ...prev]);
                setIsAddDialogOpen(false);
                setNewDevice({ name: '', sensorType: '', farmId: '', serialNumber: '' });
            }
        } catch (error) {
            console.error('Error adding device:', error);
        }
    };

    const isDeviceOnline = (lastSeenAt: string | null) => {
        if (!lastSeenAt) return false;
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return new Date(lastSeenAt).getTime() > fiveMinutesAgo;
    };

    const formatLastSeen = (lastSeenAt: string | null) => {
        if (!lastSeenAt) return 'ไม่เคยเชื่อมต่อ';
        const date = new Date(lastSeenAt);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffMinutes < 1) return 'เมื่อกี้';
        if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} ชั่วโมงที่แล้ว`;
        return date.toLocaleDateString('th-TH');
    };

    // Group devices by sensor type for summary cards
    const devicesByType = devices.reduce((acc, device) => {
        if (!acc[device.sensorType]) acc[device.sensorType] = [];
        acc[device.sensorType].push(device);
        return acc;
    }, {} as Record<SensorType, IotDevice[]>);

    const farmOptions = farms.map((farm) => ({ value: farm.id, label: farm.name }));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Cpu className="text-emerald-500" />
                        IoT Dashboard
                    </h1>
                    <p className="text-slate-400">
                        เชื่อมต่อและดูข้อมูลจากเซ็นเซอร์ IoT ของแปลงเกษตรของคุณ
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="border-slate-700 text-slate-400 hover:text-white"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        รีเฟรช
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => setIsAddDialogOpen(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        เพิ่มอุปกรณ์
                    </Button>
                </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm">มุมมอง:</span>
                <div className="flex border border-slate-700 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-2 flex items-center gap-1.5 text-sm ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <List size={16} />
                        การ์ด
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`px-3 py-2 flex items-center gap-1.5 text-sm ${viewMode === 'map' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <Map size={16} />
                        แผนที่
                    </button>
                </div>
            </div>

            {/* Map View */}
            {viewMode === 'map' && (
                <div className="rounded-2xl overflow-hidden">
                    <MapView
                        markers={devices
                            .filter(d => d.locationLat && d.locationLng)
                            .map(device => {
                                const info = sensorTypeInfo[device.sensorType];
                                const online = isDeviceOnline(device.lastSeenAt);
                                return {
                                    id: device.id,
                                    lat: parseFloat(device.locationLat!),
                                    lng: parseFloat(device.locationLng!),
                                    label: device.name,
                                    popupContent: (
                                        <div className="min-w-[180px]">
                                            <h3 className="font-bold text-slate-900 mb-1">{device.name}</h3>
                                            <p className="text-xs text-slate-600 mb-1">{info.label} - {device.farm.name}</p>
                                            {device.latestReading && (
                                                <p className="text-lg font-semibold text-emerald-600">
                                                    {parseFloat(device.latestReading.value).toFixed(1)} {device.latestReading.unit}
                                                </p>
                                            )}
                                            <span className={`text-xs ${online ? 'text-green-600' : 'text-red-500'}`}>
                                                {online ? 'ออนไลน์' : 'ออฟไลน์'}
                                            </span>
                                        </div>
                                    )
                                };
                            })
                        }
                        height="450px"
                    />
                    {devices.filter(d => d.locationLat && d.locationLng).length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                            <MapPin className="mx-auto mb-2" size={32} />
                            <p>อุปกรณ์ยังไม่มีข้อมูลพิกัด</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Device Modal */}
            <Modal
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                title="เพิ่มอุปกรณ์ IoT ใหม่"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">ชื่ออุปกรณ์</label>
                        <Input
                            placeholder="เช่น เซ็นเซอร์ความชื้น แปลง A"
                            className="bg-slate-800 border-slate-700 text-white"
                            value={newDevice.name}
                            onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                        />
                    </div>
                    <Select
                        label="ประเภทเซ็นเซอร์"
                        options={sensorTypeOptions}
                        placeholder="เลือกประเภท"
                        value={newDevice.sensorType}
                        onChange={(e) => setNewDevice({ ...newDevice, sensorType: e.target.value })}
                    />
                    <Select
                        label="แปลงเกษตร"
                        options={farmOptions}
                        placeholder="เลือกแปลง"
                        value={newDevice.farmId}
                        onChange={(e) => setNewDevice({ ...newDevice, farmId: e.target.value })}
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">หมายเลขซีเรียล (ถ้ามี)</label>
                        <Input
                            placeholder="เช่น SN-12345"
                            className="bg-slate-800 border-slate-700 text-white"
                            value={newDevice.serialNumber}
                            onChange={(e) => setNewDevice({ ...newDevice, serialNumber: e.target.value })}
                        />
                    </div>
                    <Button
                        onClick={handleAddDevice}
                        disabled={!newDevice.name || !newDevice.sensorType || !newDevice.farmId}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                        เพิ่มอุปกรณ์
                    </Button>
                </div>
            </Modal>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Cpu className="text-emerald-500 h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{devices.length}</div>
                                <div className="text-xs text-slate-400">อุปกรณ์ทั้งหมด</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Wifi className="text-green-500 h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {devices.filter((d) => isDeviceOnline(d.lastSeenAt)).length}
                                </div>
                                <div className="text-xs text-slate-400">ออนไลน์</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-500/10 rounded-lg">
                                <WifiOff className="text-rose-500 h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {devices.filter((d) => !isDeviceOnline(d.lastSeenAt)).length}
                                </div>
                                <div className="text-xs text-slate-400">ออฟไลน์</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Activity className="text-blue-500 h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">
                                    {devices.filter((d) => d.latestReading).length}
                                </div>
                                <div className="text-xs text-slate-400">มีข้อมูล</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sensor Type Summary Cards */}
            {Object.keys(devicesByType).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(devicesByType).map(([type, typeDevices]) => {
                        const info = sensorTypeInfo[type as SensorType];
                        const IconComponent = info.icon;
                        const avgValue = typeDevices
                            .filter((d) => d.latestReading)
                            .reduce((sum, d) => sum + parseFloat(d.latestReading?.value || '0'), 0) /
                            (typeDevices.filter((d) => d.latestReading).length || 1);

                        return (
                            <Card key={type} className="bg-slate-900 border-slate-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <IconComponent className={`h-5 w-5 ${info.color}`} />
                                        <span className="text-slate-300">{info.label}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white mb-1">
                                        {avgValue.toFixed(1)} {info.unit}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        ค่าเฉลี่ยจาก {typeDevices.length} อุปกรณ์
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Device List */}
            {viewMode === 'list' && (
                <div>
                    <h2 className="text-xl font-bold text-white mb-4">อุปกรณ์ทั้งหมด</h2>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
                        </div>
                    ) : devices.length === 0 ? (
                        <Card className="bg-slate-900 border-slate-800 border-dashed">
                            <CardContent className="p-12 text-center">
                                <Cpu className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">ยังไม่มีอุปกรณ์ IoT</h3>
                                <p className="text-slate-400 mb-4">
                                    เพิ่มอุปกรณ์เซ็นเซอร์เพื่อติดตามข้อมูลแปลงเกษตรของคุณ
                                </p>
                                <Button
                                    onClick={() => setIsAddDialogOpen(true)}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    เพิ่มอุปกรณ์แรก
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {devices.map((device) => {
                                const info = sensorTypeInfo[device.sensorType];
                                const IconComponent = info.icon;
                                const online = isDeviceOnline(device.lastSeenAt);

                                return (
                                    <Card key={device.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${online ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                                                        <IconComponent className={`h-5 w-5 ${online ? info.color : 'text-slate-500'}`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-white">{device.name}</h3>
                                                        <p className="text-xs text-slate-400">{device.farm.name}</p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={online ? 'border-emerald-500/30 text-emerald-400' : 'border-slate-600 text-slate-400'}
                                                >
                                                    {online ? (
                                                        <><SignalHigh className="h-3 w-3 mr-1" /> ออนไลน์</>
                                                    ) : (
                                                        <><SignalLow className="h-3 w-3 mr-1" /> ออฟไลน์</>
                                                    )}
                                                </Badge>
                                            </div>

                                            <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                                                {device.latestReading ? (
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-white">
                                                            {parseFloat(device.latestReading.value).toFixed(1)} {device.latestReading.unit}
                                                        </div>
                                                        <div className="text-xs text-slate-400">ค่าล่าสุด</div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-slate-500 text-sm">
                                                        ยังไม่มีข้อมูล
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-slate-400">
                                                <span>{info.label}</span>
                                                <span>{formatLastSeen(device.lastSeenAt)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
