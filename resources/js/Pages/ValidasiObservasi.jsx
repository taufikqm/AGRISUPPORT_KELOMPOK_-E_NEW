import { Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-xs font-medium text-gray-800 text-right">{value ?? '-'}</span>
        </div>
    );
}

export default function ValidasiObservasi({ observation }) {
    const area       = observation.agricultural_area ?? {};
    const hasWeather = observation.weather_temp !== null;

    const fmtDate = d => d
        ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : '-';

    return (
        <AuthenticatedLayout title="Validasi Observasi" currentRoute="input-kondisi.index">
            <Head title="Validasi Observasi" />

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-5">

                    {/* Status */}
                    <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
                        <p className="text-sm font-semibold text-green-800">Observasi berhasil disimpan</p>
                        <p className="text-xs text-green-600 mt-0.5">
                            {area.name} &middot; {fmtDate(observation.observation_date)}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Catatan Manual */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Catatan Kondisi Lapangan</h3>
                            <InfoRow label="Lahan"             value={area.name} />
                            <InfoRow label="Jenis Tanah"       value={area.soil_type} />
                            <InfoRow label="Siklus Tanam"      value={observation.planting_cycle || '-'} />
                            <InfoRow label="Kelembapan Tanah"  value={observation.soil_moisture} />
                            <InfoRow label="Kondisi Genangan"  value={observation.water_puddle} />
                            <InfoRow label="Kondisi Tanaman"   value={observation.crop_condition} />
                            <InfoRow label="Tanda Hama"        value={observation.pest_indication} />
                            <InfoRow label="Tanda Penyakit"    value={observation.disease_indication} />
                            {observation.notes && (
                                <div className="pt-3 mt-1">
                                    <p className="text-xs text-gray-500 mb-1">Catatan</p>
                                    <p className="text-xs text-gray-700 leading-relaxed">{observation.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Snapshot Cuaca */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Data Cuaca Otomatis</h3>

                            {hasWeather ? (
                                <>
                                    <InfoRow label="Suhu"             value={`${observation.weather_temp} °C`} />
                                    <InfoRow label="Kelembapan Udara" value={`${observation.weather_humidity} %`} />
                                    <InfoRow label="Curah Hujan"      value={`${observation.weather_precip_mm} mm`} />
                                    <InfoRow label="Kecepatan Angin"  value={`${observation.weather_wind_kph} km/h`} />
                                    {observation.weather_soil_moisture !== null && (
                                        <InfoRow
                                            label="Soil Moisture"
                                            value={observation.weather_soil_moisture}
                                        />
                                    )}
                                    <p className="text-[10px] text-gray-400 mt-3 text-right">
                                        Sumber: Open-Meteo &middot; lokasi lahan
                                    </p>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <span className="text-3xl mb-2">📡</span>
                                    <p className="text-xs font-medium text-gray-500">Data cuaca tidak tersedia</p>
                                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                                        Koneksi internet tidak tersedia saat<br />observasi disimpan
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Aksi */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href={route('analisis-risiko.show', observation.id)}
                            className="flex-1 text-center px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            Lanjut ke Analisis Risiko →
                        </Link>
                        <Link
                            href={route('input-kondisi.index')}
                            className="flex-1 text-center px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
                        >
                            ← Catat Observasi Baru
                        </Link>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
