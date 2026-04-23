import React from 'react';

export default function LahanCard({ area, isSelected, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                isSelected
                    ? 'border-[#2D5A27] bg-[#2D5A27]/5 shadow-sm ring-1 ring-[#2D5A27]/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
        >
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-[14px] font-bold text-gray-800 truncate">{area.name}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                    Aktif
                </span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-2">
                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span className="truncate">{area.location_name || 'Lokasi tidak diketahui'}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                    {area.area_size} HA
                </span>
                <span className="text-gray-300">|</span>
                <span className="uppercase">{area.soil_type || '-'}</span>
            </div>
        </div>
    );
}
