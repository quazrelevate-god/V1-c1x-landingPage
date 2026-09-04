import { useRef, type ReactNode, type RefObject } from "react";

// Motion has been stripped from the landing page. These primitives keep the
// same API so section components don't need to change, but they render
// everything in its final, static state — no scroll observers, no parallax,
// no reveal transitions, no count-ups, no word-rise.

export const LITE_MOTION_MQ =
  "(max-width: 1023px), (pointer: coarse), (prefers-reduced-motion: reduce)";
export const REDUCED_MOTION_MQ = "(prefers-reduced-motion: reduce)";

export function useInView<T extends HTMLElement = HTMLDivElement>(_threshold = 0.25) {
  const ref = (_el: T | null) => {};
  return { ref, inView: true };
}

export function useCountUp(to: number, _active: boolean, _duration = 1600) {
  return to;
}

export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  return { ref, progress: 1 };
}

export function Parallax({
  children,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div data-visible={true} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

export function WordRise({
  text,
  className = "",
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
}) {
  return <span className={className}>{text}</span>;
}

export function Eyebrow({
  children,
  tone = "dark",
}: {
  children: ReactNode;
  tone?: "dark" | "light";
}) {
  return (
    <p
      className={`font-display text-[0.72rem] uppercase tracking-[0.02em] ${
        tone === "dark" ? "text-muted-foreground" : "text-ink/50"
      }`}
    >
      {children}
    </p>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} data-nav-tone="dark" className={`px-5 py-20 sm:px-6 sm:py-24 md:py-32 ${className}`}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

export function ParallaxImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  children,
  loading = "lazy",
  width,
  height,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  speed?: number;
  scale?: number;
  children?: ReactNode;
  loading?: "lazy" | "eager";
  width?: number;
  height?: number;
}) {
  const _unused: RefObject<HTMLDivElement | null> = useRef(null);
  void _unused;
  return (
    <div className={`relative overflow-hidden bg-background ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        width={width}
        height={height}
        className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
      />
      {children}
    </div>
  );
}

export function ParallaxGlow({
  className = "",
  intensity = 20,
}: {
  speed?: number;
  className?: string;
  intensity?: number;
}) {
  const stop = (share: number, at: number) =>
    `color-mix(in oklab, var(--accent) ${(intensity * share).toFixed(2)}%, transparent) ${at}%`;
  const glow = [
    stop(1, 0),
    stop(0.86, 18),
    stop(0.62, 34),
    stop(0.38, 48),
    stop(0.19, 60),
    stop(0.07, 72),
    "transparent 86%",
  ].join(", ");

  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 ${className}`}>
      <div
        aria-hidden
        className="glow-dither relative h-full w-full"
        style={{ background: `radial-gradient(50% 40% at 50% 55%, ${glow})` }}
      />
    </div>
  );
}
