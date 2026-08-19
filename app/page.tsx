import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Education from "@/components/Education";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Communication from "@/components/Communication";
import Languages from "@/components/Languages";
import GithubStats from "@/components/GithubStats";
import SocialLinks from "@/components/SocialLinks";
import WorkTogether from "@/components/WorkTogether";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppAgent from "@/components/UI/WhatsAppAgent";
import ScrollToTop from "@/components/UI/ScrollToTop";

export default function Home() {
  return (
    <main className="min-h-screen animated-bg">
      <Navbar />
      <Hero />
      <About />
      <Education />
      <Skills />
      <Projects />
      <Communication />
      <Languages />
      <GithubStats />
      <SocialLinks />
      <WorkTogether />
      <Contact />
      <Footer />
      <WhatsAppAgent />
      <ScrollToTop />
    </main>
  );
}
