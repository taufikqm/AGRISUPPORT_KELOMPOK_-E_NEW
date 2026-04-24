import { useState } from 'react';

export default function WeatherAlertBanner({ current }) {
    const [dismissed, setDismissed] = useState(false);

    if (!current || dismissed) return null;

    const isCritical = current.precipitation > 10 || current.wind_speed_10m > 60;
    const isWarning  = current.precipitation > 3  || current.relative_humidity_2m > 85;

    if (!isCritical && !isWarning) return null;

    const config = isCritical
        ? {
            bg: 'bg-red-50',
            border: 'border-red-300',
            titleColor: 'text-red-800',
            msgColor: 'text-red-700',
            icon: '🚨',
            title: 'Peringatan Kritis',
            message: 'Curah hujan ekstrem terdeteksi. Segera amankan tanaman dan periksa saluran air lahan Anda.',
        }
        : {
            bg: 'bg-amber-50',
            border: 'border-amber-300',
            titleColor: 'text-amber-800',
            msgColor: 'text-amber-700',
            icon: '⚠️',
            title: 'Peringatan Cuaca',
            message: 'Terdapat curah hujan di area lahan Anda. Pastikan drainase lahan berfungsi dengan baik.',
        };

    return (
        <div className={`mb-5 p-4 ${config.bg} border ${config.border} rounded-xl flex items-start justify-between gap-3`}>
            <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{config.icon}</span>
                <div>
                    <p className={`text-[13px] font-bold ${config.titleColor}`}>{config.title}</p>
                    <p className={`text-[12px] ${config.msgColor} mt-0.5`}>{config.message}</p>
                </div>
            </div>
            <button
                onClick={() => setDismissed(true)}
                className={`text-[16px] leading-none ${config.titleColor} hover:opacity-60 transition-opacity shrink-0`}
            >
                ×
            </button>
        </div>
    );
}
