import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { registerScrollEffect, type ScrollEffect } from "@/lib/scroll-motion";

/**
 * Devices that must not run scroll-driven parallax: touch hardware stutters on
 * it whatever the viewport width.
 */
export const LITE_MOTION_MQ =
  "(max-width: 1023px), (pointer: coarse), (prefers-reduced-motion: reduce)";

/**
 * The hero keys off this instead: the scroll-scrubbed ship runs on phones as
 * well as desktop, so only a stated preference for less motion swaps in the
 * static hero.
 */
export const REDUCED_MOTION_MQ = "(prefers-reduced-motion: reduce)";

export function useInView<T extends HTMLElement = HTMLDivElement>(threshold = 0.25) {
  // A callback ref (rather than an object ref) so the observer re-attaches when
  // a component swaps the observed node — e.g. switching to a mobile layout.
  const [node, setNode] = useState<T | null>(null);
  const [inView, setInView] = useState(false);
  const ref = useCallback((el: T | null) => setNode(el), []);

  useEffect(() => {
    const el = node;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { threshold, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [node, threshold, inView]);

  return { ref, inView };
}

/** Smoothly counts up to `to` once `active` becomes true. */
export function useCountUp(to: number, active: boolean, duration = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, active, duration]);

  return value;
}

/**
 * Drives one element's `--py` from scroll, through the shared motion engine.
 *
 * `measureRef` is read for position; `applyRef` is written (the two differ for
 * ParallaxImage, where the frame is measured but the oversized <img> inside it
 * moves — so the transform never feeds back into the measurement). Only visible
 * elements are measured, and everything switches off together when the engine
 * decides the device can't hold the frame rate.
 */
function useParallax(
  measureRef: RefObject<HTMLElement | null>,
  applyRef: RefObject<HTMLElement | null>,
  speed: number,
  scale = 1,
  mobile: "off" | "half" = "off",
) {
  useEffect(() => {
    const measure = measureRef.current;
    const apply = applyRef.current;
    if (!measure || !apply) return;

    const mobileMq = window.matchMedia("(max-width: 767px)");
    let isMobile = mobileMq.matches;
    let visible = true;
    let offset = 0;
    // Parallax is disabled outright on phones for the "off" variant; the "half"
    // variant (oversized imagery) still drifts, at half the travel.
    const disabled = () => mobile === "off" && isMobile;

    const effect: ScrollEffect = {
      read: () => {
        if (!visible || disabled()) return;
        const r = measure.getBoundingClientRect();
        const center = r.top + r.height / 2 - window.innerHeight / 2;
        let raw = -center * speed * (mobile === "half" && isMobile ? 0.5 : 1);
        if (scale > 1) {
          // Never travel past the oversized image's hidden margin, so no edge shows.
          const limit = Math.max(((scale - 1) / 2) * r.height - 1, 0);
          raw = Math.min(Math.max(raw, -limit), limit);
        }
        offset = raw;
      },
      write: () => {
        apply.style.setProperty("--py", disabled() ? "0px" : `${offset.toFixed(2)}px`);
      },
      reset: () => {
        apply.style.setProperty("--py", "0px");
      },
    };

    // Skip the layout read entirely while the element is nowhere near the fold.
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: "25% 0px 25% 0px" },
    );
    io.observe(measure);

    const onMq = () => {
      isMobile = mobileMq.matches;
      if (disabled()) apply.style.setProperty("--py", "0px");
    };
    mobileMq.addEventListener("change", onMq);

    const unregister = registerScrollEffect(effect);
    return () => {
      unregister();
      io.disconnect();
      mobileMq.removeEventListener("change", onMq);
    };
  }, [measureRef, applyRef, speed, scale, mobile]);
}

/** Scroll progress (0 to 1) of an element travelling through the viewport. */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let visible = true;
    let value = 0;
    let painted = -1;

    const effect: ScrollEffect = {
      read: () => {
        if (!visible) return;
        const r = node.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = r.height + vh * 0.5;
        const p = (vh * 0.85 - r.top) / total;
        value = Math.min(Math.max(p, 0), 1);
      },
      write: () => {
        // Only re-render React when the value has actually moved.
        if (Math.abs(value - painted) < 0.002) return;
        painted = value;
        setProgress(value);
      },
      // No scroll animation: show the flow fully populated rather than empty.
      reset: () => {
        painted = 1;
        setProgress(1);
      },
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: "10% 0px 10% 0px" },
    );
    io.observe(node);

    const unregister = registerScrollEffect(effect);
    return () => {
      unregister();
      io.disconnect();
    };
  }, []);

  return { ref, progress };
}

/** Subtle GPU-light parallax for background glows. Disabled on small screens. */
export function Parallax({
  children,
  speed = 0.15,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useParallax(ref, ref, speed);

  return (
    <div ref={ref} className={className} style={{ transform: "translate3d(0, var(--py, 0px), 0)" }}>
      {children}
    </div>
  );
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView(0.15);

  return (
    <div
      ref={ref}
      data-visible={inView}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${className}`}
    >
      {children}
    </div>
  );
}

/** Fades and rises each word of a headline in sequence on mount. */
export function WordRise({
  text,
  className = "",
  delay = 0,
  step = 70,
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="word-rise"
          style={{ animationDelay: `${delay + i * step}ms` }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
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
    <section id={id} className={`px-5 py-20 sm:px-6 sm:py-24 md:py-32 ${className}`}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

/**
 * Oversized, always-clipped parallax image.
 * The image is scaled well beyond its frame so travel never reveals an edge.
 */
export function ParallaxImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  speed = 0.28,
  scale = 1.45,
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
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  useParallax(frameRef, imgRef, speed, scale, "half");

  return (
    <div ref={frameRef} className={`relative overflow-hidden bg-background ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        width={width}
        height={height}
        className={`absolute inset-0 h-full w-full object-cover will-change-transform ${imgClassName}`}
        style={{
          transform: `translate3d(0, var(--py, 0px), 0) scale(${scale})`,
        }}
      />
      {children}
    </div>
  );
}

/** Absolutely-positioned lime glow layer that drifts at its own scroll speed. */
export function ParallaxGlow({
  speed = 0.45,
  className = "",
  intensity = 20,
}: {
  speed?: number;
  className?: string;
  intensity?: number;
}) {
  // An eased stop list rather than colour -> transparent in one jump: each step
  // in the alpha ramp is small enough that an 8-bit channel can render it
  // without ringing. `glow-dither` lays faint noise over the top for the rest.
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
    <Parallax speed={speed} className={`pointer-events-none absolute inset-0 -z-10 ${className}`}>
      <div
        aria-hidden
        className="glow-dither relative h-full w-full"
        style={{ background: `radial-gradient(50% 40% at 50% 55%, ${glow})` }}
      />
    </Parallax>
  );
}
