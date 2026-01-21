import React from 'react';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import PlatformSection from '@/components/landing/PlatformSection';
import DifferentiatorSection from '@/components/landing/DifferentiatorSection';
import IndividualsSection from '@/components/landing/IndividualsSection';
import EnterprisesSection from '@/components/landing/EnterprisesSection';
import SecuritySection from '@/components/landing/SecuritySection';
import ValueAddSection from '@/components/landing/ValueAddSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-x-hidden">
      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.015] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      <Header />
      <main>
        <HeroSection />
        <PlatformSection />
        <DifferentiatorSection />
        <IndividualsSection />
        <EnterprisesSection />
        <SecuritySection />
        <ValueAddSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}