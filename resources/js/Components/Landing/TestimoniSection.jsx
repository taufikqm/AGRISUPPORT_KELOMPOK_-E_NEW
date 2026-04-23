import { TESTIMONIALS } from '@/data/landingData';
import { QuoteIcon } from '@/Components/Landing/LandingIcons';

export default function TestimoniSection({ testimoniRef }) {
    return (
        <section ref={testimoniRef} className="bg-[#ecfdf5] py-16 md:py-24">
            <div className="max-w-[1280px] mx-auto px-6">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#0f172b] text-center leading-[1.2] mb-12 md:mb-16">
                    Dipercaya oleh Petani
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {TESTIMONIALS.map(t => (
                        <div
                            key={t.name}
                            className="bg-white rounded-3xl shadow-lg p-8 relative hover:shadow-xl transition-shadow duration-300"
                        >
                            {/* Quote Icon */}
                            <div className="absolute right-8 top-8">
                                <QuoteIcon className="w-16 h-16 text-[#009966]" />
                            </div>

                            {/* Author Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full border-2 border-[#d0fae5] p-0.5 overflow-hidden shrink-0">
                                    <img
                                        src={t.avatar}
                                        alt={t.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-[18px] font-bold text-[#0f172b] leading-[1.5]">
                                        {t.name}
                                    </h4>
                                    <p className="text-[14px] font-semibold text-[#009966] leading-[1.4]">
                                        {t.role}
                                    </p>
                                </div>
                            </div>

                            {/* Quote */}
                            <p className="text-[18px] italic leading-[1.6] text-[#45556c]">
                                {t.quote}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
