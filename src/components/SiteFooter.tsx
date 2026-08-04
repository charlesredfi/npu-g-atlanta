import Image from "next/image";
import { navLinks } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-14 md:flex-row md:items-start md:justify-between md:px-8">
        <div className="flex items-start gap-4">
          <Image
            src="/media/npu-g-logo-black.png"
            alt="NPU-G Atlanta"
            width={72}
            height={72}
            className="h-16 w-16 object-contain"
          />
          <div>
            <p className="display text-2xl tracking-[0.08em] text-navy">
              NPU-G Atlanta
            </p>
            <p className="display mt-2 text-xs tracking-[0.18em] text-accent">
              13 Neighborhoods · One Community
            </p>
            <p className="serif mt-4 max-w-sm text-base leading-relaxed text-muted">
              A modern civic home for Neighborhood Planning Unit G: meetings,
              neighborhoods, and participation in Atlanta.
            </p>
          </div>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="display text-xs tracking-[0.14em] text-navy transition-colors hover:text-cta"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
          <p>© {new Date().getFullYear()} NPU-G Atlanta. All rights reserved.</p>
          <p className="flex items-center gap-2 text-sm text-muted">
            <span>Website curated &amp; developed by</span>
            <Image
              src="/media/redfi-diamond-flame.png"
              alt=""
              width={28}
              height={34}
              className="h-7 w-auto object-contain"
            />
            <a
              href="https://redfipro.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#e31c23] underline decoration-[#e31c23]/60 underline-offset-4 transition hover:opacity-80"
            >
              REDFi Production, Inc.
            </a>
          </p>
          <a
            href="#top"
            className="display text-xs tracking-[0.16em] text-navy hover:text-cta"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
