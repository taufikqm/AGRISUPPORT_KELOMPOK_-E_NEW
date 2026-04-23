import { SERVICE_CARDS } from '@/data/landingData';

export default function LayananSection({ featureRef }) {
    return (
        <section ref={featureRef} className="bg-white py-16 md:py-24">
            <div className="max-w-[1280px] mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#0f172b] leading-[1.2] mb-4">
                        Layanan Utama Kami
                    </h2>
                    <p className="text-[16px] md:text-[18px] font-medium leading-[1.55] text-[#45556c] max-w-[768px] mx-auto">
                        Empat pilar fitur utama yang dirancang untuk merespons dinamika lahan dan iklim secara proaktif.
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {SERVICE_CARDS.map((card) => (
                        <div
                            key={card.title}
                            className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                        >
                            {/* Image */}
                            <div className="relative h-[192px] overflow-hidden">
                                <img
                                    src={card.img}
                                    alt={card.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-[rgba(15,23,43,0.1)]" />
                                {/* Icon Badge */}
                                <div className="absolute bottom-[-16px] right-[24px] w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center z-10">
                                    <card.Icon className="w-6 h-6 text-[#009966]" />
                                </div>
                            </div>
                            {/* Content */}
                            <div className="p-6 pt-10">
                                <h3 className="text-[20px] font-bold text-[#0f172b] leading-[1.4] mb-2">
                                    {card.title}
                                </h3>
                                <p className="text-[14px] font-normal leading-[1.6] text-[#45556c]">
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
