import { useState, useRef, ReactNode } from "react";

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: ReactNode;
    className?: string;
}

export function PullToRefresh({ onRefresh, children, className = "" }: PullToRefreshProps) {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const isPulling = useRef(false);

    const THRESHOLD = 80;
    const MAX_PULL = 120;

    const handleTouchStart = (e: React.TouchEvent) => {
        const scrollTop = containerRef.current?.scrollTop || 0;
        if (scrollTop === 0 && !isRefreshing) {
            startY.current = e.touches[0].clientY;
            isPulling.current = true;
        } else {
            isPulling.current = false;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isPulling.current || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        if (diff > 0) {
            // Prevent default scroll behavior if pulling down at top
            if (e.cancelable && diff < THRESHOLD) {
                // Optional: e.preventDefault() if standard scroll needs to be blocked, 
                // but often better to let it be natural unless strictly necessary.
            }

            // Add resistance
            const newDistance = Math.min(diff * 0.5, MAX_PULL);
            setPullDistance(newDistance);
        } else {
            setPullDistance(0);
        }
    };

    const handleTouchEnd = async () => {
        if (!isPulling.current || isRefreshing) return;
        isPulling.current = false;

        if (pullDistance > THRESHOLD) {
            setIsRefreshing(true);
            setPullDistance(THRESHOLD); // Snap to threshold
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                setPullDistance(0);
            }
        } else {
            setPullDistance(0); // Snap back
        }
    };

    return (
        <div
            ref={containerRef}
            className={`relative overflow-y-auto overscroll-contain ${className}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Refresh Indicator */}
            <div
                className="absolute left-0 right-0 flex justify-center items-center pointer-events-none transition-transform duration-200 ease-out z-10"
                style={{
                    top: -40, // Start hidden above
                    transform: `translateY(${pullDistance}px)`,
                    opacity: pullDistance > 0 ? 1 : 0
                }}
            >
                <div className="bg-white rounded-full p-2 shadow-md border border-slate-100">
                    {isRefreshing ? (
                        <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-indigo-600 transition-transform duration-200"
                            style={{ transform: `rotate(${pullDistance > THRESHOLD ? 180 : 0}deg)` }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                        </svg>
                    )}
                </div>
            </div>

            {children}
        </div>
    );
}
