import dynamic from "next/dynamic";
import { Hero } from "@/components/Hero";
import { Priorities } from "@/components/Priorities";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

// Below-the-fold sections load after the first paint to cut initial JS/parse work.
const Leadership = dynamic(() =>
  import("@/components/Leadership").then((mod) => mod.Leadership),
);
const About = dynamic(() =>
  import("@/components/About").then((mod) => mod.About),
);
const News = dynamic(() =>
  import("@/components/News").then((mod) => mod.News),
);
const Neighborhoods = dynamic(() =>
  import("@/components/Neighborhoods").then((mod) => mod.Neighborhoods),
);
const Events = dynamic(() =>
  import("@/components/Events").then((mod) => mod.Events),
);
const Merch = dynamic(() =>
  import("@/components/Merch").then((mod) => mod.Merch),
);
const Contact = dynamic(() =>
  import("@/components/Contact").then((mod) => mod.Contact),
);

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
