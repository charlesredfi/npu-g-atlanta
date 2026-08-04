import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Events } from "@/components/Events";
import { Hero } from "@/components/Hero";
import { Leadership } from "@/components/Leadership";
import { Merch } from "@/components/Merch";
import { Neighborhoods } from "@/components/Neighborhoods";
import { News } from "@/components/News";
import { Priorities } from "@/components/Priorities";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Priorities />
        <Leadership />
        <About />
        <News />
        <Neighborhoods />
        <Events />
        <Merch />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
