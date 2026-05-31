import Navbar from "@/components/landing/navbar";
import HeroSection from "@/components/landing/hero-section";
import CardsSection from "@/components/landing/cards-section";
import CtaSection from "@/components/landing/cta-section";
import FaqSection from "@/components/landing/faq-section";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <CardsSection />
      <CtaSection />
      <FaqSection />
      <Footer />
    </div>
  );
}
