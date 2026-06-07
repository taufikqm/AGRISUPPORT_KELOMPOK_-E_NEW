import { Link, usePage } from '@inertiajs/react';

const menuItems = [
    { name: 'Dashboard',        icon: DashboardIcon,    route: 'dashboard' },
    { name: 'Wilayah Lahan',    icon: WilayahIcon,      route: 'wilayah-lahan.index' },
    { name: 'Cuaca & Prediksi', icon: CuacaIcon,        route: 'cuaca.index' },
    { name: 'Waktu Tanam',      icon: WaktuTanamIcon,   route: 'waktu-tanam.index' },
    { name: 'Peta Risiko',      icon: PetaRisikoIcon,   route: 'peta-risiko.index' },
    { name: 'Input Kondisi',    icon: InputKondisiIcon, route: 'input-kondisi.index' },
    { name: 'Riwayat Lahan',    icon: RiwayatIcon,      route: 'riwayat-lahan.index' },
    { name: 'Insight Historis', icon: InsightIcon,       route: 'insight-historis.index' },
    { name: 'Rekomendasi',      icon: RekomendasiIcon,  route: 'rekomendasi-tindakan.index' },
];

function DashboardIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
        </svg>
    );
}
function WilayahIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
    );
}
function CuacaIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 .75-7.425A4.502 4.502 0 0 0 14.25 9 4.5 4.5 0 0 0 6 12.75 4.49 4.49 0 0 0 2.25 15Z" />
        </svg>
    );
}
function WaktuTanamIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
    );
}
function PetaRisikoIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
        </svg>
    );
}
function InputKondisiIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
    );
}
function RiwayatIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    );
}
function InsightIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
    );
}
function RekomendasiIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
    );
}

export default function AppSidebar({ currentRoute, isOpen, onClose, isCollapsed, onToggleCollapse }) {
    const { auth } = usePage().props;

    return (
        <>
            {/* Backdrop Mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`fixed left-0 top-0 h-screen bg-[#263B36] flex flex-col z-50 transition-all duration-300 ease-in-out transform 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 shadow-xl lg:shadow-none
                ${isCollapsed ? 'w-20' : 'w-60'}`}
            >
                {/* Header: Logo */}
                <div className={`flex items-center border-b border-white/10 ${isCollapsed ? 'justify-center py-3 px-2' : 'justify-between p-4 h-[60px]'}`}>
                    {/* Logo expanded: icon + text side by side */}
                    {!isCollapsed && (
                        <div className="flex items-center gap-2">
                            <img
                                src="/images/logo-icon.png"
                                alt="AgriSupport"
                                className="h-10 w-10 object-contain shrink-0"
                            />
                            <div>
                                <h1 className="font-extrabold text-white text-[17px] tracking-tight leading-none">AgriSupport</h1>
                                <p className="text-[9px] font-semibold text-white/50 tracking-[1px] uppercase mt-0.5">Smart Farming</p>
                            </div>
                        </div>
                    )}
                    {/* Logo collapsed (icon only) */}
                    {isCollapsed && (
                        <img
                            src="/images/logo-icon.png"
                            alt="AgriSupport"
                            className="h-9 w-9 object-contain"
                        />
                    )}

                    {/* Close Button Mobile */}
                    {!isCollapsed && (
                        <button 
                            onClick={onClose}
                            className="p-2 text-white/50 hover:text-white lg:hidden"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Floating Collapse Toggle — ditengah border sidebar */}
                <button 
                    onClick={onToggleCollapse}
                    className="hidden lg:flex items-center justify-center absolute top-[40%] -translate-y-1/2 -right-[18px] w-9 h-9 rounded-full bg-[#263B36] border-2 border-[#F0F5F3] text-white/70 hover:text-white hover:bg-[#2D4A44] shadow-lg transition-all duration-200 z-[60] cursor-pointer"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    )}
                </button>

                {/* Menu */}
                <nav className={`flex-1 space-y-1 overflow-y-auto mt-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
                    {menuItems.map((item) => {
                        let href = item.route ? route(item.route) : '#';

                        const isActive = item.route ? route().current(item.route) : false;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={href}
                                onClick={() => {
                                    if (window.innerWidth < 1024) onClose();
                                }}
                                className={`flex items-center py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 relative group ${
                                    isActive
                                        ? 'bg-white/20 text-white shadow-sm'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                } ${isCollapsed ? 'justify-center' : 'gap-3 px-3'}`}
                            >
                                <Icon className={`w-[19px] h-[19px] shrink-0 ${isActive ? 'text-white' : 'text-white/50'}`} />
                                {!isCollapsed && (
                                    <span>{item.name}</span>
                                )}

                                {/* Tooltip when collapsed */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className={`pb-4 space-y-1 border-t border-white/10 pt-3 ${isCollapsed ? 'px-2' : 'px-3'}`}>
                    <Link
                        href="#"
                        className={`flex items-center py-2.5 rounded-lg text-[13px] font-medium text-white/70 hover:bg-white/10 hover:text-white group relative ${isCollapsed ? 'justify-center' : 'gap-3 px-3'}`}
                    >
                        <svg className="w-[19px] h-[19px] text-white/50 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        {!isCollapsed && (
                            <span>Pengaturan</span>
                        )}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
                                Pengaturan
                            </div>
                        )}
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={`flex items-center py-2.5 rounded-lg text-[13px] font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 w-full group relative ${isCollapsed ? 'justify-center' : 'gap-3 px-3'}`}
                    >
                        <svg className="w-[19px] h-[19px] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                        </svg>
                        {!isCollapsed && (
                            <span>Keluar</span>
                        )}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
                                Keluar
                            </div>
                        )}
                    </Link>
                </div>
            </aside>
        </>
    );
}
