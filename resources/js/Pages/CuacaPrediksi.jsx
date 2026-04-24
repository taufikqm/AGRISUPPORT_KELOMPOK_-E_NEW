import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CurrentWeatherCard from '@/Components/Weather/CurrentWeatherCard';
import WeatherAlertBanner from '@/Components/Weather/WeatherAlertBanner';
import ForecastCard from '@/Components/Weather/ForecastCard';

export default function CuacaPrediksi({ areas = [] }) {
    const [selectedAreaId, setSelectedAreaId] = useState(areas.length > 0 ? areas[0].id : null);
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const selectedArea = areas.find(a => a.id === selectedAreaId);

    useEffect(() => {
        if (!selectedArea?.latitude || !selectedArea?.longitude) {
            setWeatherData(null);
            return;
        }

        setLoading(true);
        setError(null);
        fetch(`/api/weather?lat=${selectedArea.latitude}&lon=${selectedArea.longitude}`)
            .then(async res => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Data cuaca gagal dimuat (${res.status}): ${text.substring(0, 50)}`);
                }
                return res.json();
            })
            .then(data => setWeatherData(data))
            .catch(err => {
                setError(err.message);
                setWeatherData(null);
            })
            .finally(() => setLoading(false));
    }, [selectedAreaId]);

    const current = weatherData?.current;
    const daily = weatherData?.daily;
    const forecastDays = daily?.time?.slice(0, 5) || [];

    return (
        <AuthenticatedLayout
            title="Pemantauan Cuaca"
            badge={selectedArea?.name || 'Pilih Lahan'}
            currentRoute="cuaca.index"
        >
            <Head title="Pemantauan Cuaca" />

            <div className="max-w-5xl mx-auto p-4 md:p-6 pb-12">

                {/* ST-03: WeatherAlertBanner */}
                <WeatherAlertBanner current={current} />

                {/* Area Selector */}
                <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
                    {areas.map(area => (
                        <button
                            key={area.id}
                            onClick={() => setSelectedAreaId(area.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] md:text-[13px] font-semibold transition-all duration-200 ${
                                selectedAreaId === area.id
                                    ? 'bg-[#2D5A27] text-white shadow-md shadow-[#2D5A27]/20'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#2D5A27]/40 hover:text-[#2D5A27]'
                            }`}
                        >
                            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            {area.name}
                        </button>
                    ))}
                </div>

                {areas.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                        <span className="text-4xl block mb-4">🗺️</span>
                        <h3 className="text-[16px] font-bold text-gray-700 mb-2">Belum ada wilayah lahan</h3>
                        <p className="text-[13px] text-gray-500">Tambahkan wilayah lahan terlebih dahulu di menu "Wilayah Lahan".</p>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <svg className="w-5 h-5 animate-spin text-[#2D5A27]" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span className="text-[13px] font-semibold text-gray-600">Mengambil data cuaca...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <span className="text-lg">❌</span>
                        <p className="text-[13px] font-semibold text-red-700">{error}</p>
                    </div>
                )}

                {!loading && current && (
                    <CurrentWeatherCard current={current} />
                )}

                {/* ST-03: Prakiraan 5 Hari */}
                {!loading && forecastDays.length > 0 && daily && (
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="text-[15px] md:text-[16px] font-bold text-gray-800">Prakiraan 5 Hari</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 overflow-x-auto pb-4">
                            {forecastDays.map((timeStr, idx) => (
                                <ForecastCard key={timeStr} index={idx} daily={daily} isFirst={idx === 0} />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
