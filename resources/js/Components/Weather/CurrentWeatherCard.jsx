export function getWmoDetails(code) {
    const codes = {
        0:  { text: 'Cerah', emoji: '☀️' },
        1:  { text: 'Sebagian Berawan', emoji: '🌤️' },
        2:  { text: 'Berawan', emoji: '⛅' },
        3:  { text: 'Mendung', emoji: '☁️' },
        45: { text: 'Berkabut', emoji: '🌫️' },
        48: { text: 'Kabut Tebal', emoji: '🌫️' },
        51: { text: 'Gerimis Ringan', emoji: '🌦️' },
        53: { text: 'Gerimis Sedang', emoji: '🌦️' },
        55: { text: 'Gerimis Lebat', emoji: '🌧️' },
        61: { text: 'Hujan Ringan', emoji: '🌧️' },
        63: { text: 'Hujan Sedang', emoji: '🌧️' },
        65: { text: 'Hujan Lebat', emoji: '🌧️' },
        71: { text: 'Salju Ringan', emoji: '🌨️' },
        73: { text: 'Salju Sedang', emoji: '🌨️' },
        75: { text: 'Salju Lebat', emoji: '🌨️' },
        80: { text: 'Hujan Deras Lokal', emoji: '🌧️' },
        81: { text: 'Hujan Deras Lokal', emoji: '🌧️' },
        82: { text: 'Hujan Deras Lokal', emoji: '🌧️' },
        95: { text: 'Badai Petir', emoji: '⛈️' },
        96: { text: 'Badai Petir Ringan', emoji: '⛈️' },
        99: { text: 'Badai Petir Lebat', emoji: '⛈️' },
    };
    return codes[code] || { text: 'Tidak Diketahui', emoji: '🌤️' };
}

export default function CurrentWeatherCard({ current }) {
    const currentWeather = getWmoDetails(current.weather_code);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h2 className="text-[18px] md:text-[20px] font-bold text-gray-800">Cuaca Saat Ini</h2>
                    <p className="text-[11px] md:text-[12px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3 self-center md:self-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] md:text-[11px] font-bold rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Update
                    </span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                <div className="flex items-center gap-4 md:gap-6 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-12 w-full md:w-auto justify-center md:justify-start">
                    <span className="text-6xl md:text-7xl">{currentWeather.emoji}</span>
                    <div>
                        <div className="flex items-start">
                            <span className="text-[48px] md:text-[56px] font-extrabold text-gray-800 leading-none">{Math.round(current.temperature_2m)}</span>
                            <span className="text-[18px] md:text-[20px] font-bold text-gray-400 mt-1 md:mt-2">°C</span>
                        </div>
                        <p className="text-[14px] md:text-[16px] font-semibold text-gray-600 mt-1">{currentWeather.text}</p>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-3 md:gap-4 w-full">
                    <div className="bg-blue-50/80 rounded-xl p-3 md:p-4">
                        <p className="text-[9px] md:text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-1">Kelembapan</p>
                        <p className="text-[18px] md:text-[24px] font-extrabold text-gray-800">
                            {current.relative_humidity_2m}<span className="text-[12px] md:text-[14px] font-semibold text-gray-400 ml-0.5">%</span>
                        </p>
                    </div>
                    <div className="bg-cyan-50/80 rounded-xl p-3 md:p-4">
                        <p className="text-[9px] md:text-[10px] font-bold text-cyan-500 uppercase tracking-wide mb-1">Angin</p>
                        <p className="text-[18px] md:text-[24px] font-extrabold text-gray-800">
                            {current.wind_speed_10m}<span className="text-[12px] md:text-[14px] font-semibold text-gray-400 ml-1">km/h</span>
                        </p>
                    </div>
                    <div className="bg-purple-50/80 rounded-xl p-3 md:p-4">
                        <p className="text-[9px] md:text-[10px] font-bold text-purple-500 uppercase tracking-wide mb-1">Curah Hujan</p>
                        <p className="text-[18px] md:text-[24px] font-extrabold text-gray-800">
                            {current.precipitation}<span className="text-[12px] md:text-[14px] font-semibold text-gray-400 ml-1">mm</span>
                        </p>
                    </div>
                    <div className="bg-emerald-50/80 rounded-xl p-3 md:p-4">
                        <p className="text-[9px] md:text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1">Status</p>
                        <p className="text-[13px] md:text-[16px] font-bold text-gray-800 leading-tight">
                            {current.relative_humidity_2m > 80 ? 'Lembab' : 'Normal'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
