import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * A demo request as submitted from /book-a-demo.
 *
 * `website` is a honeypot: it is rendered off-screen and hidden from assistive
 * tech, so a human never fills it in. Bots that fill every field get a success
 * response and nothing is written to the sheet.
 */
export const demoRequestSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100, "That name is too long."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email.")
    .email("That email doesn't look right.")
    .max(200),
  phone: z
    .string()
    .trim()
    .min(6, "Please enter a contact number.")
    .max(32, "That number is too long.")
    .regex(/^[0-9+()\-.\s]+$/, "Use digits, spaces, and + ( ) - only."),
  company: z.string().trim().max(120, "That company name is too long.").optional().default(""),
  message: z
    .string()
    .trim()
    .max(2000, "Please keep this under 2000 characters.")
    .optional()
    .default(""),
  website: z.string().max(0).optional().default(""),
});

export type DemoRequest = z.infer<typeof demoRequestSchema>;

export type DemoRequestResult = { ok: true } | { ok: false; error: string };

/**
 * Appends the request to the Google Sheet behind DEMO_WEBHOOK_URL (an Apps
 * Script web app — see docs/google-sheet-setup.md).
 *
 * This runs server-side only, so the webhook URL is never shipped to the
 * browser and the endpoint can't be scraped off the client bundle.
 */
export const submitDemoRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => demoRequestSchema.parse(input))
  .handler(async ({ data }): Promise<DemoRequestResult> => {
    if (data.website) return { ok: true }; // honeypot tripped — drop silently

    const endpoint = process.env["DEMO_WEBHOOK_URL"];
    if (!endpoint) {
      console.error("DEMO_WEBHOOK_URL is not set — the demo request was not recorded.");
      return { ok: false, error: "The form isn't connected yet. Please email us instead." };
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          message: data.message,
          submittedAt: new Date().toISOString(),
        }),
      });

      // Apps Script answers 302 to its own script.googleusercontent.com origin on
      // success; fetch follows that for us, so anything non-2xx here is a real failure.
      if (!response.ok) {
        console.error(`Demo request webhook returned ${response.status}: ${await response.text()}`);
        return { ok: false, error: "We couldn't record that just now. Please try again." };
      }

      return { ok: true };
    } catch (error) {
      console.error("Demo request webhook threw:", error);
      return { ok: false, error: "We couldn't record that just now. Please try again." };
    }
  });
