import { getWmoDetails } from '@/Components/Weather/CurrentWeatherCard';

export default function ForecastCard({ index, daily, isFirst }) {
    const date = new Date(daily.time[index]);
    const dayName = isFirst ? 'Hari Ini' : date.toLocaleDateString('id-ID', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const weather = getWmoDetails(daily.weather_code[index]);

    return (
        <div className={`bg-white rounded-xl border ${isFirst ? 'border-[#2D5A27] ring-1 ring-[#2D5A27]/20' : 'border-gray-200'} p-3 md:p-4 transition-all hover:shadow-sm`}>
            <div className="text-center">
                <p className={`text-[10px] md:text-[11px] font-bold uppercase tracking-wide ${isFirst ? 'text-[#2D5A27]' : 'text-gray-500'}`}>{dayName}</p>
                <p className="text-[9px] md:text-[10px] text-gray-400 mt-0.5">{dateStr}</p>
                <div className="text-3xl md:text-4xl my-2 md:my-3">
                    <span>{weather.emoji}</span>
                </div>
                <p className="text-[10px] md:text-[11px] font-semibold text-gray-600 mb-2 md:mb-3 min-h-[30px] md:min-h-[32px]">{weather.text}</p>
                <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center justify-between text-[10px] md:text-[11px]">
                        <span className="text-red-500 font-semibold md:hidden">▲</span>
                        <span className="text-red-500 font-semibold hidden md:inline">▲ Maks</span>
                        <span className="font-bold text-gray-800">{Math.round(daily.temperature_2m_max[index])}°C</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] md:text-[11px]">
                        <span className="text-blue-500 font-semibold md:hidden">▼</span>
                        <span className="text-blue-500 font-semibold hidden md:inline">▼ Min</span>
                        <span className="font-bold text-gray-800">{Math.round(daily.temperature_2m_min[index])}°C</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between text-[9px] md:text-[11px]">
                            <span className="text-gray-400">🌧️ {daily.precipitation_probability_max[index]}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
