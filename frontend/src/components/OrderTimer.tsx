"use client";

import { useEffect, useState } from "react";

interface OrderTimerProps {
    startTime: string | Date;
    warningThresholdMinutes?: number;
    dangerThresholdMinutes?: number;
    className?: string;
}

export default function OrderTimer({
    startTime,
    warningThresholdMinutes = 15,
    dangerThresholdMinutes = 30,
    className = "",
}: OrderTimerProps) {
    const [elapsed, setElapsed] = useState(0);

    // ... (keep useEffect as is) ...
    useEffect(() => {
        const start = new Date(startTime).getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = Math.floor((now - start) / 1000); // seconds
            setElapsed(diff);
        }, 1000);

        // Initial calculation
        const now = new Date().getTime();
        setElapsed(Math.floor((now - start) / 1000));

        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const getColorClass = () => {
        const minutes = elapsed / 60;
        if (minutes >= dangerThresholdMinutes) return "text-red-600 font-bold animate-pulse";
        if (minutes >= warningThresholdMinutes) return "text-orange-600 font-bold";
        return className || "text-gray-600"; // Use className as default text color if provided, else gray
    };

    // Combine logic: if Danger/Warning use that color, otherwise use className passed from parent
    const finalClass = () => {
        const minutes = elapsed / 60;
        if (minutes >= dangerThresholdMinutes) return "text-red-600 font-bold animate-pulse";
        if (minutes >= warningThresholdMinutes) return "text-orange-600 font-bold";
        return className;
    }

    return (
        <span className={`font-mono text-sm ${finalClass()}`} title="Time elapsed">
            {formatTime(elapsed)}
        </span>
    );
}
