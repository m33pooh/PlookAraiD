'use client';

import { useState } from 'react';
import { Crop } from '@/types';
import { CropCard } from '@/components/features/CropCard';
import { CropDetailPanel } from '@/components/features/CropDetailPanel';

interface CropListWithPanelProps {
    crops: (Crop & { matchScore: number })[];
}

export const CropListWithPanel = ({ crops }: CropListWithPanelProps) => {
    const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const handleSelectCrop = (crop: Crop) => {
        setSelectedCrop(crop);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crops.map((crop) => (
                    <CropCard
                        key={crop.id}
                        data={crop}
                        matchScore={crop.matchScore}
                        onSelect={handleSelectCrop}
                    />
                ))}
            </div>

            <CropDetailPanel
                crop={selectedCrop}
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
            />
        </>
    );
};
