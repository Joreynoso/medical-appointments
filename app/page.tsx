import { auth } from "@clerk/nextjs/server"
import Navbar from "@/components/landing/navbar";
import HeroSection from "@/components/landing/hero-section";
import CardsSection from "@/components/landing/cards-section";
import CtaSection from "@/components/landing/cta-section";
import FaqSection from "@/components/landing/faq-section";
import Footer from "@/components/landing/footer";
import LandingAnimationsWrapper from "@/components/landing/landing-animations-wrapper";

export default async function Home() {
  const { isAuthenticated } = await auth()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar isSignedIn={isAuthenticated ?? false} initials="" />
      <HeroSection />
      <CardsSection />
      <CtaSection />
      <FaqSection />
      <Footer />
      <LandingAnimationsWrapper />
    </div>
  );
}
