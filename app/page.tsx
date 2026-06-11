import { auth } from "@clerk/nextjs/server"
import Navbar from "@/components/landing/navbar";
import HeroSection from "@/components/landing/hero-section";
import CardsSection from "@/components/landing/cards-section";
import CtaSection from "@/components/landing/cta-section";
import FaqSection from "@/components/landing/faq-section";
import StackingCards from "@/components/landing/stacking-cards";
import Footer from "@/components/landing/footer";
import BackToTop from "@/components/landing/back-to-top";
import LandingAnimationsWrapper from "@/components/landing/landing-animations-wrapper";

export default async function Home() {
  const { isAuthenticated } = await auth()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar isSignedIn={isAuthenticated ?? false} initials="" />
      <HeroSection />
      <CardsSection />
      <CtaSection />
      <StackingCards />
      <FaqSection />
      <Footer />
      <BackToTop />
      <LandingAnimationsWrapper />
    </div>
  );
}
