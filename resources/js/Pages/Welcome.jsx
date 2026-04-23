import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';

import { MODULE_CARDS } from '@/data/landingData';
import { SunIcon, ChartIcon, MapIcon, LightBulbIcon } from '@/Components/Landing/LandingIcons';
import LandingNavbar    from '@/Components/Landing/LandingNavbar';
import HeroSection      from '@/Components/Landing/HeroSection';
import AboutSection     from '@/Components/Landing/AboutSection';
import LayananSection   from '@/Components/Landing/LayananSection';
import ModulSection     from '@/Components/Landing/ModulSection';
import TestimoniSection from '@/Components/Landing/TestimoniSection';
import LandingFooter    from '@/Components/Landing/LandingFooter';

// Inject Icon references into SERVICE_CARDS (cannot be stored in plain .js file)
import { SERVICE_CARDS as BASE_SERVICE_CARDS } from '@/data/landingData';
const ICON_MAP = { SunIcon, ChartIcon, MapIcon, LightBulbIcon };

export default function Welcome({ auth, canLogin, canRegister }) {
    const [scrolled, setScrolled]       = useState(false);
    const [moduleTab, setModuleTab]     = useState('semua');

    const aboutRef      = useRef(null);
    const featureRef    = useRef(null);
    const modulRef      = useRef(null);
    const testimoniRef  = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const filteredModules = moduleTab === 'semua'
        ? MODULE_CARDS
        : MODULE_CARDS.filter(c => c.key === moduleTab);

    return (
        <>
            <Head title="AgriSupport - Cerdas Bertani, Tangguh Hadapi Perubahan Iklim" />

            <div className="min-h-screen bg-white font-['Inter',sans-serif] text-[#0f172b] overflow-x-hidden">
                <LandingNavbar
                    auth={auth}
                    canLogin={canLogin}
                    canRegister={canRegister}
                    scrolled={scrolled}
                    scrollTo={scrollTo}
                    aboutRef={aboutRef}
                    featureRef={featureRef}
                    modulRef={modulRef}
                    testimoniRef={testimoniRef}
                />

                <HeroSection
                    auth={auth}
                    canLogin={canLogin}
                    scrollTo={scrollTo}
                    featureRef={featureRef}
                />

                <AboutSection aboutRef={aboutRef} />

                <LayananSection featureRef={featureRef} />

                <ModulSection
                    modulRef={modulRef}
                    moduleTab={moduleTab}
                    setModuleTab={setModuleTab}
                    filteredModules={filteredModules}
                />

                <TestimoniSection testimoniRef={testimoniRef} />

                <LandingFooter />
            </div>
        </>
    );
}
