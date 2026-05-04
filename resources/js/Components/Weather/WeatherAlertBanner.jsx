import { useState } from 'react';
import { usePage } from '@inertiajs/react';

function SingleAlert({ alert, onDismiss }) {
    const isCritical = alert.level === 'critical';

    const style = isCritical
        ? { bg: 'bg-red-50', border: 'border-red-300', title: 'text-red-800', msg: 'text-red-700', icon: '🚨', label: 'Peringatan Kritis' }
        : { bg: 'bg-amber-50', border: 'border-amber-300', title: 'text-amber-800', msg: 'text-amber-700', icon: '⚠️', label: 'Perlu Diwaspadai' };

    return (
        <div className={`p-4 ${style.bg} border ${style.border} rounded-xl flex items-start justify-between gap-3`}>
            <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5 shrink-0">{style.icon}</span>
                <div>
                    <p className={`text-[13px] font-bold ${style.title}`}>
                        {style.label} — {alert.area_name}
                    </p>
                    <p className={`text-[12px] ${style.msg} mt-0.5`}>{alert.message}</p>
                    {alert.action && (
                        <p className={`text-[11px] ${style.msg} mt-1 font-semibold`}>
                            Tindakan: {alert.action}
                        </p>
                    )}
                </div>
            </div>
            <button
                onClick={onDismiss}
                className={`text-[18px] leading-none ${style.title} hover:opacity-60 transition-opacity shrink-0 mt-0.5`}
            >
                ×
            </button>
        </div>
    );
}

export default function WeatherAlertBanner({ current, areaId }) {
    const { weatherAlerts: sharedAlerts = [] } = usePage().props;
    const [dismissedTypes, setDismissedTypes] = useState([]);

    const dismiss = (key) => setDismissedTypes(prev => [...prev, key]);

    // Mode 1: pre-computed alerts — hanya tampil jika areaId cocok dengan lahan yang dipilih
    const activeSharedAlerts = current ? [] : sharedAlerts
        .filter((a) => areaId == null || String(a.area_id) === String(areaId))
        .filter((a) => !dismissedTypes.includes(`${a.area_name}-${a.type}`));

    // Mode 2: real-time current data from CuacaPrediksi API call
    let realtimeAlerts = [];
    if (current) {
        const isCritical = current.precipitation > 10 || current.wind_speed_10m > 60;
        const isWarning  = !isCritical && (current.precipitation > 3 || current.relative_humidity_2m > 85);

        if (isCritical && !dismissedTypes.includes('realtime-critical')) {
            realtimeAlerts.push({
                area_name: '',
                level: 'critical',
                type: 'realtime',
                message: 'Curah hujan ekstrem atau angin kencang terdeteksi. Segera amankan tanaman dan periksa saluran drainase.',
                action: '',
                _key: 'realtime-critical',
            });
        } else if (isWarning && !dismissedTypes.includes('realtime-warning')) {
            realtimeAlerts.push({
                area_name: '',
                level: 'warning',
                type: 'realtime',
                message: 'Terdapat curah hujan di area lahan Anda. Pastikan drainase lahan berfungsi dengan baik.',
                action: '',
                _key: 'realtime-warning',
            });
        }
    }

    const allAlerts = [
        ...activeSharedAlerts.map(a => ({ ...a, _key: `${a.area_name}-${a.type}` })),
        ...realtimeAlerts,
    ];

    if (allAlerts.length === 0) return null;

    return (
        <div className="space-y-2 mb-5">
            {allAlerts.map((alert) => (
                <SingleAlert
                    key={alert._key}
                    alert={alert}
                    onDismiss={() => dismiss(alert._key)}
                />
            ))}
        </div>
    );
}
