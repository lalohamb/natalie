import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getConnection, getPublicCalendar, googleConfig } from "@/lib/google-calendar";
import { AdminPageHeader, StatusPill, adminButton } from "../../_components/admin-ui";

export const metadata: Metadata = { title: "Calendar" };
export const instant = false;

export default async function AdminCalendarPage() {
  await requireAdmin();

  const icalUrl = process.env.GOOGLE_CALENDAR_ICAL_URL;
  const oauthConfig = googleConfig();
  const oauthConnection = oauthConfig ? await getConnection() : null;
  const calendar = await getPublicCalendar();
  const now = new Date().toISOString().slice(0, 10);
  const upcoming = (calendar?.events ?? []).filter((e) => e.end.slice(0, 10) >= now).slice(0, 5);

  const source = oauthConnection?.calendarId ? "oauth" : icalUrl ? "ical" : "none";

  return (
    <>
      <AdminPageHeader
        title="Calendar"
        description="Manage the events calendar shown on the public Events page."
        actions={
          <div className="flex gap-2">
            <a
              href="https://calendar.google.com/calendar/r"
              target="_blank"
              rel="noopener noreferrer"
              className={adminButton.secondary}
            >
              Open Google Calendar ↗
            </a>
            <Link href="/events" className={adminButton.secondary} target="_blank">
              View Events page ↗
            </Link>
          </div>
        }
      />

      <div className="flex flex-col gap-6">

        {/* ── Connection status ── */}
        <section className="rounded border border-ivory/10 bg-ivory/5 p-5">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-mist">Connection</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {source === "ical" && (
              <>
                <StatusPill tone="green">iCal feed active</StatusPill>
                <span className="break-all font-sans text-sm text-ivory">{icalUrl}</span>
              </>
            )}
            {source === "oauth" && (
              <>
                <StatusPill tone="green">Google OAuth active</StatusPill>
                <span className="font-sans text-sm text-ivory">{oauthConnection?.email}</span>
                {oauthConnection?.calendarName && (
                  <span className="font-sans text-xs text-mist">Calendar: {oauthConnection.calendarName}</span>
                )}
              </>
            )}
            {source === "none" && (
              <StatusPill tone="amber">Not connected</StatusPill>
            )}
          </div>
          {source === "none" && (
            <p className="mt-3 font-sans text-sm text-mist">
              No calendar is connected. Follow Option A below to get started.
            </p>
          )}
        </section>

        {/* ── Upcoming events preview ── */}
        {source !== "none" && (
          <section className="rounded border border-ivory/10 bg-ivory/5 p-5">
            <h2 className="font-sans text-sm font-semibold text-ivory">Upcoming events</h2>
            {upcoming.length === 0 ? (
              <p className="mt-2 font-sans text-sm text-mist">
                No upcoming events found. Make sure events are added to the connected calendar and it is set to public.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col divide-y divide-ivory/10" role="list">
                {upcoming.map((event) => (
                  <li key={event.id} className="flex flex-wrap items-baseline gap-x-4 py-2 font-sans text-sm">
                    <span className="w-44 shrink-0 text-xs text-mist tabular-nums">
                      {formatWhen(event.start, event.allDay, calendar!.timeZone)}
                    </span>
                    <span className="text-ivory">{event.title}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 font-sans text-xs text-mist">
              {source === "ical"
                ? "The feed refreshes every 5 minutes. Changes in Google Calendar appear on the site shortly after."
                : "Changes made in Google Calendar appear on the site within about 5 minutes."}
            </p>
          </section>
        )}

        {/* ── Option A: iCal ── */}
        <section className="rounded border border-ivory/10 bg-ivory/5 p-5">
          <h2 className="font-sans text-sm font-semibold text-ivory">
            Option A — Public iCal feed
            <span className="ml-2 font-sans text-xs font-normal text-mist">(recommended · no Google Cloud setup needed)</span>
          </h2>
          <ol className="mt-4 flex list-decimal flex-col gap-3 pl-5 font-sans text-sm text-mist marker:text-gold-light">
            <li>
              In Google Calendar, click the three dots next to your calendar →{" "}
              <strong className="text-ivory">Settings and sharing</strong>.
            </li>
            <li>
              Under <em>Access permissions for events</em>, tick{" "}
              <strong className="text-ivory">Make available to public</strong> → See all event details.
            </li>
            <li>
              Scroll to <em>Integrate calendar</em> and copy the{" "}
              <strong className="text-ivory">Public address in iCal format</strong> URL.
            </li>
            <li>
              Add it to your server <code className="font-mono text-ivory">.env.local</code> and restart:
              <code className="mt-2 block break-all rounded bg-espresso px-3 py-2 font-mono text-xs text-ivory">
                GOOGLE_CALENDAR_ICAL_URL=https://calendar.google.com/calendar/ical/...
              </code>
            </li>
          </ol>
          {icalUrl ? (
            <p className="mt-4 rounded border border-green-800/50 bg-green-950/40 px-3 py-2 font-sans text-xs text-green-300">
              ✓ GOOGLE_CALENDAR_ICAL_URL is set.
            </p>
          ) : (
            <p className="mt-4 rounded border border-amber-700/40 bg-amber-900/20 px-3 py-2 font-sans text-xs text-amber-300">
              GOOGLE_CALENDAR_ICAL_URL is not set in the environment.
            </p>
          )}
        </section>

        {/* ── Option B: OAuth ── */}
        <section className="rounded border border-ivory/10 bg-ivory/5 p-5">
          <h2 className="font-sans text-sm font-semibold text-ivory">
            Option B — Google OAuth
            <span className="ml-2 font-sans text-xs font-normal text-mist">(requires Google Cloud project)</span>
          </h2>
          <ol className="mt-4 flex list-decimal flex-col gap-3 pl-5 font-sans text-sm text-mist marker:text-gold-light">
            <li>
              In the{" "}
              <a
                className="text-gold-light underline underline-offset-4"
                href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Cloud Console
              </a>
              , enable the <strong className="text-ivory">Google Calendar API</strong>.
            </li>
            <li>
              Create an OAuth 2.0 client ID (Web application) and add{" "}
              <code className="font-mono text-ivory">/api/admin/google/callback</code> as an authorized redirect URI.
            </li>
            <li>
              Set <code className="font-mono text-ivory">GOOGLE_CLIENT_ID</code> and{" "}
              <code className="font-mono text-ivory">GOOGLE_CLIENT_SECRET</code> in your environment, restart, then sign in below.
            </li>
          </ol>
          <div className="mt-4">
            {oauthConfig ? (
              oauthConnection ? (
                <p className="rounded border border-green-800/50 bg-green-950/40 px-3 py-2 font-sans text-xs text-green-300">
                  ✓ Connected as {oauthConnection.email}.
                </p>
              ) : (
                <a
                  href="/api/admin/google/connect"
                  className="inline-flex min-h-10 items-center justify-center gap-3 rounded-sm bg-white px-5 font-sans text-sm font-medium text-[#1f1f1f] shadow-sm transition-colors hover:bg-[#f2f2f2]"
                >
                  <GoogleLogo /> Sign in with Google
                </a>
              )
            ) : (
              <p className="font-sans text-xs text-mist">
                GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set in environment.
              </p>
            )}
          </div>
        </section>

      </div>
    </>
  );
}

function formatWhen(start: string, allDay: boolean, timeZone: string) {
  return allDay
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${start}T00:00:00Z`))
    : new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone }).format(new Date(start));
}

function GoogleLogo() {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="size-[18px]">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
