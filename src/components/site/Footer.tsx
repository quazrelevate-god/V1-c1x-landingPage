import logo from "@/assets/logo.png";

const links = [
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Book a Demo", href: "/book-a-demo" },
  { label: "Privacy", href: "/" },
  { label: "Contact", href: "/book-a-demo" },
];

export function Footer() {
  return (
    <footer className="border-t border-border px-5 py-12 sm:px-6 sm:py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <img src={logo} alt="Corridor One X" className="h-6 w-auto" />
          <p className="mt-5 font-sans text-sm leading-relaxed text-muted-foreground">
            Corridor One X. Next-generation trade infrastructure for global markets.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-8 gap-y-3">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="font-sans text-sm text-secondary-foreground transition-colors hover:text-accent"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto mt-12 w-full max-w-6xl border-t border-border pt-6">
        <p className="font-sans text-xs text-muted-foreground">
          © 2026 Corridor One X. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
