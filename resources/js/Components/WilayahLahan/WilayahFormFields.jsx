import React from 'react';

export default function WilayahFormFields({ data, setData, errors }) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Nama Lahan</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="cth: Lahan Sawah Blok A"
                        className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]/40 placeholder:text-gray-400 font-medium text-gray-800"
                    />
                    {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Luas Lahan (Hektar)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={data.area_size}
                        onChange={(e) => setData('area_size', e.target.value)}
                        placeholder="cth: 2.5"
                        className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]/40 placeholder:text-gray-400 font-medium text-gray-800"
                    />
                    {errors.area_size && <p className="text-[11px] text-red-500 mt-1">{errors.area_size}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Tipe Tanah</label>
                    <select
                        value={data.soil_type}
                        onChange={(e) => setData('soil_type', e.target.value)}
                        className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]/40 text-gray-700 font-medium"
                    >
                        <option value="">Pilih tipe tanah...</option>
                        <option value="Latosol">Latosol</option>
                        <option value="Andosol">Andosol</option>
                        <option value="Aluvial">Aluvial</option>
                        <option value="Regosol">Regosol</option>
                        <option value="Grumusol">Grumusol</option>
                        <option value="Podsolik">Podsolik</option>
                    </select>
                    {errors.soil_type && <p className="text-[11px] text-red-500 mt-1">{errors.soil_type}</p>}
                </div>
                <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Catatan</label>
                    <input
                        type="text"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="cth: Lahan produktif, irigasi stabil"
                        className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]/40 placeholder:text-gray-400 font-medium text-gray-800"
                    />
                    {errors.notes && <p className="text-[11px] text-red-500 mt-1">{errors.notes}</p>}
                </div>
            </div>
        </>
    );
}
