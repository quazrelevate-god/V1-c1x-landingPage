/**
 * Launch date for the countdown, and the note the waitlist writes to the sheet.
 */

/**
 * When the countdown reaches zero, and when the site goes live.
 *
 * One constant for both. It drives the launch page's counter, the moment the
 * launch page hands over to the landing page, and the waitlist prompt on the
 * landing page itself — because two "launch dates" in one codebase drift, and
 * the launch page counting to one instant while the waitlist counts to another
 * is exactly the kind of thing nobody notices until it is live.
 *
 * Written with an explicit +05:30 offset rather than a bare date so it means the
 * same instant wherever the visitor is: a bare "2026-08-29" would be parsed as
 * UTC and land at 05:30 IST, and a local-time string would fire at a different
 * moment for every timezone.
 *
 * Change this one line when the date is fixed.
 */
export const LAUNCH_AT = Date.parse("2026-09-04T18:00:00+05:30");

/**
 * Written into the sheet's Message column so waitlist rows are distinguishable
 * from demo requests, which share the same six columns and the same webhook.
 */
export const WAITLIST_NOTE = "Joining the waitlist";

/** Remembers that this visitor has already seen the prompt. */
export const WAITLIST_SEEN_KEY = "c1x:waitlist-seen";

export type Remaining = { days: number; hours: number; minutes: number; seconds: number };

/** Time left until `LAUNCH_AT`, floored at zero once the date has passed. */
export function remainingUntil(target: number, now: number): Remaining {
  const ms = Math.max(0, target - now);
  const total = Math.floor(ms / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
