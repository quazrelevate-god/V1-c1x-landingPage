import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const links = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Trust", href: "/#trust" },
  { label: "Logistics", href: "/#logistics" },
  { label: "Who It's For", href: "/#who-its-for" },
  { label: "FAQ", href: "/#faq" },
  { label: "About", href: "/about" },
];

const clamp = (v: number) => Math.min(Math.max(v, 0), 1);

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [reveal, setReveal] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px), (prefers-reduced-motion: reduce)");
    setReady(true);

    const onScroll = () => {
      const hero = document.getElementById("top");
      const threshold = hero ? hero.offsetTop + hero.offsetHeight - 72 : 24;
      setScrolled(window.scrollY > threshold);

      // On desktop the nav fades in quickly as the hero scrub begins.
      if (mq.matches || !hero) {
        setReveal(1);
        return;
      }
      const total = hero.offsetHeight - window.innerHeight;
      const prog = clamp(-hero.getBoundingClientRect().top / Math.max(total, 1));
      setReveal(clamp(prog / 0.06));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Before hydration keep the nav visible (SSR-safe); once ready, follow the reveal.
  const opacity = ready ? reveal : 1;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled ? "border-b border-border bg-background/85 backdrop-blur-xl" : "border-b border-transparent"
      }`}
      style={{ opacity, pointerEvents: opacity < 0.05 ? "none" : undefined }}
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:h-18 sm:gap-6 sm:px-6 sm:py-4">
        <a href="/" className="flex items-center" aria-label="Corridor One X home">
          <img src={logo} alt="Corridor One X" className="h-5 w-auto sm:h-6 md:h-7" />
        </a>

        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-sans text-sm text-secondary-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="/book-a-demo"
            className="rounded-md bg-accent px-3 py-2 font-display text-[0.8rem] font-medium tracking-tight text-accent-foreground transition-colors hover:bg-accent-hover active:bg-accent-pressed sm:px-4 sm:text-sm"
          >
            Book a Demo
          </a>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-md border border-border text-foreground lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <ul className="mx-auto flex w-full max-w-6xl flex-col px-6 py-3">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-4 font-sans text-base text-secondary-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
