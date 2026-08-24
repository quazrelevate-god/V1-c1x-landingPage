import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Loader2, X } from "lucide-react";
import { CountryCodeSelect } from "@/components/site/CountryCodeSelect";
import { countryByIso2, DEFAULT_ISO2, normalizeNationalNumber } from "@/lib/countries";
import { demoRequestSchema, submitDemoRequest } from "@/lib/demo-request";
import { CALLOUTS_DONE, heroProgress } from "@/lib/hero-timing";
import { LAUNCH_AT, WAITLIST_NOTE, WAITLIST_SEEN_KEY, remainingUntil } from "@/lib/launch";

/**
 * The launch countdown, offered once the hero has finished saying its piece.
 *
 * Appears a beat after the deck callouts have been read, not on a timer from
 * page load: someone who has not scrolled has not been told what this is yet,
 * and interrupting them with a form would be asking before explaining.
 */

/** Beat between the hero landing and the prompt arriving. */
const DELAY_MS = 3000;

type Field = "name" | "email" | "phone" | "country" | "website";
type Values = Record<Field, string>;
type Status = "idle" | "submitting" | "sent";

const EMPTY: Values = { name: "", email: "", phone: "", country: DEFAULT_ISO2, website: "" };

const fieldClass =
  // text-base is deliberate: iOS Safari zooms the viewport for any input under
  // 16px, which would yank the page around underneath the dialog.
  "w-full rounded-lg border border-border bg-background/60 px-4 py-3 font-sans text-base text-foreground transition-colors duration-200 placeholder:text-muted-foreground/55 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";
const labelClass =
  "font-display text-xs tracking-[0.02em] text-muted-foreground uppercase sm:text-[0.72rem]";

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-[2rem] leading-none font-medium tracking-[-0.03em] text-accent tabular-nums sm:text-[2.6rem]">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-2 font-display text-[0.6rem] tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  );
}

function Countdown() {
  // Starts at null so the server and the first client render agree; a real
  // duration here would differ between the two and trip hydration.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const r = remainingUntil(LAUNCH_AT, now ?? LAUNCH_AT);
  const live = now !== null && now >= LAUNCH_AT;

  if (live) {
    return (
      <p className="font-display text-2xl tracking-[-0.03em] text-accent">
        Corridor One X is live.
      </p>
    );
  }

  return (
    <div className="flex items-start justify-center gap-5 sm:gap-7">
      <Unit value={r.days} label="Days" />
      <Unit value={r.hours} label="Hrs" />
      <Unit value={r.minutes} label="Min" />
      <Unit value={r.seconds} label="Sec" />
    </div>
  );
}

export function WaitlistPrompt() {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const panelRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(WAITLIST_SEEN_KEY, "1");
    } catch {
      /* private mode — it just shows again next visit */
    }
  }, []);

  // Arm once the hero has been read through.
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(WAITLIST_SEEN_KEY) === "1";
    } catch {
      /* storage blocked — treat as unseen */
    }
    if (seen) return;

    const onScroll = () => {
      const p = heroProgress();
      if (p === null || p < CALLOUTS_DONE || timer.current !== null) return;
      window.removeEventListener("scroll", onScroll);
      timer.current = window.setTimeout(() => setOpen(true), DELAY_MS);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, []);

  // Esc closes, and focus moves into the dialog so a keyboard or screen-reader
  // user is not left behind on the page underneath.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  const dial = countryByIso2(values.country)?.dial ?? "";
  const set = (field: Field) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    const cleaned = { ...values, phone: normalizeNationalNumber(values.phone, dial) };
    if (cleaned.phone !== values.phone) setValues(cleaned);

    // Same schema and same webhook as the demo form, so both land in the sheet's
    // six columns. Company is blank and Message carries the note that tells the
    // two apart.
    const parsed = demoRequestSchema.safeParse({
      ...cleaned,
      company: "",
      message: WAITLIST_NOTE,
    });
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {};
      for (const issue of parsed.error.issues) {
        const f = issue.path[0] as Field | undefined;
        if (f && !next[f]) next[f] = issue.message;
      }
      setErrors(next);
      return;
    }

    setStatus("submitting");
    try {
      const result = await submitDemoRequest({ data: parsed.data });
      if (result.ok) {
        setStatus("sent");
        try {
          localStorage.setItem(WAITLIST_SEEN_KEY, "1");
        } catch {
          /* nothing to do */
        }
      } else {
        setStatus("idle");
        setFormError(result.error);
      }
    } catch {
      setStatus("idle");
      setFormError("Something went wrong sending that. Please try again.");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={dismiss}
        className="absolute inset-0 h-full w-full cursor-default bg-background/80 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl outline-none sm:p-8"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>

        {status === "sent" ? (
          <div className="py-4 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-accent/40 bg-accent/10">
              <Check className="h-5 w-5 text-accent" strokeWidth={1.75} />
            </span>
            <h2 className="mt-6 font-display text-2xl tracking-[-0.03em] text-foreground">
              You're on the list.
            </h2>
            <p className="mx-auto mt-3 max-w-xs font-sans text-sm leading-relaxed text-secondary-foreground">
              We'll be in touch the moment Corridor One X opens.
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="mt-7 inline-flex min-h-11 items-center font-display text-sm tracking-tight text-accent underline-offset-4 hover:underline"
            >
              Back to the site
            </button>
          </div>
        ) : (
          <>
            <p className="font-display text-[0.62rem] tracking-[0.14em] text-muted-foreground uppercase">
              Launching
            </p>
            <h2
              id="waitlist-title"
              className="mt-3 font-display text-xl leading-[1.15] font-medium tracking-[-0.03em] text-foreground sm:text-2xl"
            >
              Verified trade opens in
            </h2>

            <div className="mt-6">
              <Countdown />
            </div>

            {showForm ? (
              <form noValidate onSubmit={onSubmit} className="mt-7 grid gap-4">
                <div>
                  <label htmlFor="wl-name" className={labelClass}>
                    Full name
                  </label>
                  <input
                    id="wl-name"
                    autoComplete="name"
                    value={values.name}
                    onChange={set("name")}
                    placeholder="Your name"
                    aria-invalid={!!errors.name}
                    className={`mt-2 ${fieldClass}`}
                  />
                  {errors.name ? (
                    <p className="mt-2 font-sans text-sm text-destructive">{errors.name}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="wl-phone" className={labelClass}>
                    Contact number
                  </label>
                  <div
                    className={`mt-2 flex items-stretch rounded-lg border bg-background/60 transition-colors duration-200 focus-within:ring-2 focus-within:ring-accent/25 ${
                      errors.phone || errors.country
                        ? "border-destructive"
                        : "border-border focus-within:border-accent"
                    }`}
                  >
                    <CountryCodeSelect
                      value={values.country}
                      onChange={(iso2) => {
                        const next = countryByIso2(iso2)?.dial ?? "";
                        setValues((v) => ({
                          ...v,
                          country: iso2,
                          phone: normalizeNationalNumber(v.phone, next),
                        }));
                      }}
                      invalid={!!(errors.phone || errors.country)}
                    />
                    <span aria-hidden className="my-2.5 w-px shrink-0 bg-border" />
                    <input
                      id="wl-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      value={values.phone}
                      onChange={set("phone")}
                      onBlur={() =>
                        setValues((v) => ({ ...v, phone: normalizeNationalNumber(v.phone, dial) }))
                      }
                      placeholder="98765 43210"
                      aria-invalid={!!errors.phone}
                      className="min-w-0 flex-1 rounded-r-lg bg-transparent px-3.5 py-3 font-sans text-base text-foreground outline-none placeholder:text-muted-foreground/55"
                    />
                  </div>
                  {errors.phone || errors.country ? (
                    <p className="mt-2 font-sans text-sm text-destructive">
                      {errors.phone ?? errors.country}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="wl-email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="wl-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={set("email")}
                    placeholder="you@company.com"
                    aria-invalid={!!errors.email}
                    className={`mt-2 ${fieldClass}`}
                  />
                  {errors.email ? (
                    <p className="mt-2 font-sans text-sm text-destructive">{errors.email}</p>
                  ) : null}
                </div>

                {/* honeypot — off-screen, so anything here is a bot */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
                >
                  <label htmlFor="wl-website">Website</label>
                  <input
                    id="wl-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={values.website}
                    onChange={set("website")}
                  />
                </div>

                {formError ? (
                  <p
                    role="alert"
                    className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive"
                  >
                    {formError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 font-display text-sm font-medium tracking-tight text-accent-foreground transition-all duration-300 hover:bg-accent-hover active:bg-accent-pressed disabled:pointer-events-none disabled:opacity-60"
                >
                  {status === "submitting" ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                  ) : null}
                  {status === "submitting" ? "Adding you" : "Join the Waitlist"}
                </button>
              </form>
            ) : (
              <>
                <p className="mt-6 font-sans text-sm leading-relaxed text-secondary-foreground">
                  Verified counterparties, escrow-secured settlement, and corridor pricing — from
                  day one. Join the waitlist and we'll open your account first.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-6 font-display text-sm font-medium tracking-tight text-accent-foreground transition-all duration-300 hover:bg-accent-hover active:bg-accent-pressed"
                >
                  Join the Waitlist
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Maybe later
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
