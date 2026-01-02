'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
};

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
}: ModalProps) {
    // Close on escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    'relative w-full mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl',
                    'animate-in fade-in-0 zoom-in-95 duration-200',
                    sizeClasses[size]
                )}
            >
                {/* Header */}
                {(title || description) && (
                    <div className="p-6 pb-0">
                        <div className="flex items-start justify-between">
                            <div>
                                {title && (
                                    <h2 className="text-xl font-semibold text-white">
                                        {title}
                                    </h2>
                                )}
                                {description && (
                                    <p className="mt-1 text-sm text-slate-400">
                                        {description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-slate-800 transition"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

// Confirm Modal variant
interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'default';
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
    variant = 'default',
    isLoading = false,
}: ConfirmModalProps) {
    const buttonVariants = {
        danger: 'bg-rose-600 hover:bg-rose-700 text-white',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white',
        default: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-slate-300 mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                    disabled={isLoading}
                >
                    {cancelText}
                </button>
                <button
                    onClick={onConfirm}
                    className={cn(
                        'px-4 py-2 rounded-lg transition',
                        buttonVariants[variant],
                        isLoading && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={isLoading}
                >
                    {isLoading ? 'กำลังดำเนินการ...' : confirmText}
                </button>
            </div>
        </Modal>
    );
}
