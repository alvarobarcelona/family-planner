import { ReactNode, useEffect } from "react";


interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden"; // Prevent background scrolling
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 scale-100 opacity-100 transition-all transform animate-in fade-in zoom-in-95 duration-200">
                {title && (
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                )}

                <div className="text-slate-600 mb-6">
                    {children}
                </div>

                {footer && (
                    <div className="flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
