import { MODULE_TABS } from '@/data/landingData';

export default function ModulSection({ modulRef, moduleTab, setModuleTab, filteredModules }) {
    return (
        <section ref={modulRef} className="bg-[#0f172b] py-16 md:py-24">
            <div className="max-w-[1280px] mx-auto px-6">
                {/* Section Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-[28px] md:text-[36px] font-extrabold text-white leading-[1.2] mb-4">
                        Modul Aplikasi
                    </h2>
                    <p className="text-[16px] md:text-[18px] font-medium leading-[1.55] text-[#cad5e2] max-w-[768px] mx-auto">
                        Eksplorasi antarmuka digital kami yang bersih, bebas gangguan, dan difokuskan pada fungsionalitas.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-12 md:mb-16">
                    {MODULE_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setModuleTab(tab.key)}
                            className={`px-6 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-200 ${
                                moduleTab === tab.key
                                    ? 'bg-[#00bc7d] text-white shadow-lg shadow-[rgba(0,188,125,0.3)]'
                                    : 'bg-[#1d293d] text-[#cad5e2] hover:bg-[#263548]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Module Cards Grid */}
                <div className={`grid gap-8 ${
                    filteredModules.length === 1 ? 'grid-cols-1 max-w-[400px] mx-auto' :
                    filteredModules.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-[700px] mx-auto' :
                    'grid-cols-1 md:grid-cols-3'
                }`}>
                    {filteredModules.map(card => (
                        <div
                            key={card.key}
                            className="bg-[#1d293d] border border-[#314158] rounded-3xl overflow-hidden shadow-xl hover:border-[#00bc7d]/40 transition-all duration-300 group"
                        >
                            {/* Screenshot */}
                            <div className="relative h-[240px] overflow-hidden">
                                <img
                                    src={card.img}
                                    alt={card.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-[rgba(15,23,43,0.2)]" />
                                {/* Tag */}
                                <div className="absolute top-4 left-4 bg-[rgba(15,23,43,0.8)] px-3 py-1 rounded-xl">
                                    <span className="text-[12px] font-bold text-[#00d492] uppercase tracking-wider">
                                        {card.tag}
                                    </span>
                                </div>
                            </div>
                            {/* Content */}
                            <div className="p-8">
                                <h3 className="text-[24px] font-bold text-white leading-[1.3] mb-3">
                                    {card.title}
                                </h3>
                                <p className="text-[16px] font-normal leading-[1.6] text-[#90a1b9]">
                                    {card.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
