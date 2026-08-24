import { useState, type FormEvent } from "react";
import { Check, Loader2 } from "lucide-react";
import { demoRequestSchema, submitDemoRequest } from "@/lib/demo-request";

type Field = "name" | "email" | "phone" | "company" | "message" | "website";
type Values = Record<Field, string>;
type Status = "idle" | "submitting" | "sent";

const EMPTY: Values = { name: "", email: "", phone: "", company: "", message: "", website: "" };

const labelClass =
  "font-display text-xs tracking-[0.02em] text-muted-foreground uppercase sm:text-[0.72rem]";

// text-base is deliberate: iOS Safari zooms the viewport on focus for any input
// under 16px, which yanks the page around mid-form.
const fieldClass =
  "w-full rounded-lg border border-border bg-background/60 px-4 py-3 font-sans text-base text-foreground transition-colors duration-200 placeholder:text-muted-foreground/55 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

function FieldError({ children }: { children?: string | undefined }) {
  if (!children) return null;
  return <p className="mt-2 font-sans text-sm text-destructive">{children}</p>;
}

function Sent({ onReset }: { onReset: () => void }) {
  return (
    <div className="glass-card p-7 text-center sm:p-10">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-accent/40 bg-accent/10">
        <Check className="h-5 w-5 text-accent" strokeWidth={1.75} />
      </span>
      <h2 className="mt-6 font-display text-2xl tracking-[-0.03em] text-foreground">
        Request received.
      </h2>
      <p className="mx-auto mt-3 max-w-sm font-sans text-base leading-relaxed text-secondary-foreground">
        We'll be in touch within one business day to schedule your walkthrough.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-7 inline-flex min-h-11 items-center font-display text-sm tracking-tight text-accent underline-offset-4 hover:underline"
      >
        Send another request
      </button>
    </div>
  );
}

export function BookDemoForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const set = (field: Field) => (event: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [field]: event.target.value }));
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");

    const parsed = demoRequestSchema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as Field | undefined;
        if (field && !next[field]) next[field] = issue.message;
      }
      setErrors(next);
      return;
    }

    setStatus("submitting");
    try {
      const result = await submitDemoRequest({ data: parsed.data });
      if (result.ok) {
        setStatus("sent");
        setValues(EMPTY);
      } else {
        setStatus("idle");
        setFormError(result.error);
      }
    } catch {
      setStatus("idle");
      setFormError("Something went wrong sending that. Please try again.");
    }
  }

  if (status === "sent") return <Sent onReset={() => setStatus("idle")} />;

  return (
    <form noValidate onSubmit={onSubmit} className="glass-card relative p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={labelClass}>
            Full name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={set("name")}
            placeholder="Your name"
            aria-invalid={!!errors.name}
            className={`mt-2.5 ${fieldClass}`}
          />
          <FieldError>{errors.name}</FieldError>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            className={`mt-2.5 ${fieldClass}`}
          />
          <FieldError>{errors.email}</FieldError>
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Contact number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={set("phone")}
            placeholder="+91 98765 43210"
            aria-invalid={!!errors.phone}
            className={`mt-2.5 ${fieldClass}`}
          />
          <FieldError>{errors.phone}</FieldError>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="company" className={labelClass}>
            Company <span className="normal-case">(optional)</span>
          </label>
          <input
            id="company"
            name="company"
            autoComplete="organization"
            value={values.company}
            onChange={set("company")}
            placeholder="Company name"
            className={`mt-2.5 ${fieldClass}`}
          />
          <FieldError>{errors.company}</FieldError>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className={labelClass}>
            What do you trade? <span className="normal-case">(optional)</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={values.message}
            onChange={set("message")}
            placeholder="Commodity, volume, and the corridors you move on."
            className={`mt-2.5 resize-y ${fieldClass}`}
          />
          <FieldError>{errors.message}</FieldError>
        </div>
      </div>

      {/* honeypot — never shown to a person, so anything here is a bot */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
      >
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={set("website")}
        />
      </div>

      {formError ? (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 font-display text-sm font-medium tracking-tight text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-hover active:bg-accent-pressed disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : null}
        {status === "submitting" ? "Sending" : "Request my demo"}
      </button>

      <p className="mt-4 font-sans text-sm text-muted-foreground">
        We use these details only to arrange your walkthrough. No newsletter, no third parties.
      </p>
    </form>
  );
}
