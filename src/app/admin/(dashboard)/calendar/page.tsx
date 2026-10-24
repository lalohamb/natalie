import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import {
  GoogleReauthRequired,
  getConnection,
  getPublicCalendar,
  googleConfig,
  listCalendars,
  redirectUriFor,
  type CalendarListItem,
} from "@/lib/google-calendar";
import { AdminPageHeader, StatusPill, adminButton } from "../../_components/admin-ui";
import { CalendarPicker, GoogleSignOutButton } from "./calendar-controls";

export const metadata: Metadata = { title: "Calendar" };

const NOTICES: Record<string, { ok: boolean; message: string }> = {
  connected: { ok: true, message: "Signed in with Google." },
  denied: { ok: false, message: "Google sign-in was cancelled." },
  state: { ok: false, message: "That sign-in link expired or was opened in another tab. Please try again." },
  scope: {
    ok: false,
    message: "Calendar access wasn't granted. When Google asks, tick the box to let this site see your calendars.",
  },
  signin: { ok: false, message: "Google sign-in failed. Please try again." },
  google: { ok: false, message: "Google reported an error during sign-in. Please try again." },
  "not-configured": { ok: false, message: "Google sign-in isn't configured yet — see the setup steps below." },
};

export default async function AdminCalendarPage({ searchParams }: PageProps<"/admin/calendar">) {
  await requireAdmin();
  const params = await searchParams;
  const noticeKey = params.connected ? "connected" : typeof params.error === "string" ? params.error : null;
  const notice = noticeKey ? NOTICES[noticeKey] : null;

  const config = googleConfig();
  const connection = await getConnection();

  let calendars: CalendarListItem[] = [];
  let apiError: string | null = null;
  if (config && connection) {
    try {
      calendars = await listCalendars();
    } catch (err) {
      apiError = err instanceof GoogleReauthRequired ? err.message : "Couldn't reach Google Calendar right now.";
      if (!(err instanceof GoogleReauthRequired)) console.error("[admin/calendar]", err);
    }
  }

  const calendar = connection?.calendarId ? await getPublicCalendar() : null;
  const now = new Date().toISOString().slice(0, 10);
  const upcoming = (calendar?.events ?? []).filter((e) => e.end.slice(0, 10) >= now).slice(0, 5);

  return (
    <>
      <AdminPageHeader
        title="Calendar"
        description="Connect a Google account and choose the calendar shown as a monthly calendar on the Events page."
        actions={
          <Link href="/events" className={adminButton.secondary} target="_blank">
            View Events page ↗
          </Link>
        }
      />

      {notice && (
        <p
          role={notice.ok ? "status" : "alert"}
          className={`mb-6 rounded border px-4 py-3 font-sans text-sm ${
            notice.ok ? "border-green-800/50 bg-green-950/40 text-green-300" : "border-red-800/50 bg-red-950/40 text-red-300"
          }`}
        >
          {notice.message}
        </p>
      )}

      {!config ? (
        <SetupSteps redirectUri={redirectUriFor(await requestOrigin())} />
      ) : !connection ? (
        <section className="rounded border border-ivory/10 bg-ivory/5 p-8 text-center">
          <h2 className="font-display text-2xl font-medium text-ivory">Connect Google Calendar</h2>
          <p className="mx-auto mt-2 max-w-md font-sans text-sm text-mist">
            Sign in with the Google account that owns the ministry’s events calendar. The site only asks for
            read-only access.
          </p>
          <GoogleSignInLink className="mt-6" label="Sign in with Google" />
        </section>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Account */}
          <section className="flex flex-wrap items-center justify-between gap-4 rounded border border-ivory/10 bg-ivory/5 p-5">
            <div>
              <p className="font-sans text-xs font-semibold text-mist uppercase tracking-[0.12em]">Google account</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 font-sans text-sm font-semibold text-ivory">
                {connection.email}
                {apiError ? <StatusPill tone="amber">Needs sign-in</StatusPill> : <StatusPill tone="green">Connected</StatusPill>}
              </p>
              <p className="mt-1 font-sans text-xs text-mist">
                Signed in {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(connection.connectedAt))}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <GoogleSignInLink switchAccount label={apiError ? "Sign in again" : "Switch account"} compact />
              <GoogleSignOutButton email={connection.email} />
            </div>
          </section>

          {apiError && (
            <p role="alert" className="rounded border border-amber-700/40 bg-amber-900/20 px-4 py-3 font-sans text-sm text-amber-300">
              {apiError} Until then, the Events page shows the standard schedule instead of the calendar.
            </p>
          )}

          {/* Calendar choice */}
          {!apiError && (
            <section className="rounded border border-ivory/10 bg-ivory/5 p-5">
              <CalendarPicker calendars={calendars} selectedId={connection.calendarId} />
              <p className="mt-3 font-sans text-xs text-mist">
                Tip: use a dedicated calendar (e.g. “Ministry Events”) so personal appointments never appear publicly.
                Events marked <em>Private</em> in Google Calendar are always hidden.
              </p>
            </section>
          )}

          {/* Preview */}
          {connection.calendarId && !apiError && (
            <section className="rounded border border-ivory/10 bg-ivory/5 p-5">
              <h2 className="font-sans text-sm font-semibold text-ivory">Upcoming on “{connection.calendarName}”</h2>
              {upcoming.length === 0 ? (
                <p className="mt-2 font-sans text-sm text-mist">No upcoming events in the next 12 months.</p>
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
                Changes made in Google Calendar appear on the site within about 5 minutes.
              </p>
            </section>
          )}
        </div>
      )}
    </>
  );
}

function formatWhen(start: string, allDay: boolean, timeZone: string) {
  return allDay
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${start}T00:00:00Z`))
    : new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone }).format(new Date(start));
}

async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function GoogleSignInLink({
  label,
  switchAccount,
  compact,
  className,
}: {
  label: string;
  switchAccount?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    // A plain <a>: this starts a full-page OAuth redirect, so it must not be prefetched.
    <a
      href={`/api/admin/google/connect${switchAccount ? "?switch=1" : ""}`}
      className={`inline-flex min-h-10 items-center justify-center gap-3 rounded-sm bg-white font-sans text-sm font-medium text-[#1f1f1f] shadow-sm transition-colors hover:bg-[#f2f2f2] ${
        compact ? "px-4" : "px-5 py-1"
      } ${className ?? ""}`}
    >
      <GoogleLogo />
      {label}
    </a>
  );
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

function SetupSteps({ redirectUri }: { redirectUri: string }) {
  const steps = [
    <>In the <a className="text-gold-light underline underline-offset-4" href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>, create (or pick) a project and enable the <strong className="text-ivory">Google Calendar API</strong>.</>,
    <>Under <em>APIs &amp; Services → OAuth consent screen</em>, set the app name and support email, add the scope <code className="font-mono text-ivory">…/auth/calendar.readonly</code>, and publish the app (“In production”). While it’s in “Testing”, Google expires the sign-in after 7 days.</>,
    <>Under <em>Credentials</em>, create an <strong className="text-ivory">OAuth client ID</strong> of type <em>Web application</em> and add this Authorized redirect URI:<code className="mt-2 block break-all rounded bg-espresso px-3 py-2 font-mono text-xs text-ivory">{redirectUri}</code></>,
    <>Set <code className="font-mono text-ivory">GOOGLE_CLIENT_ID</code> and <code className="font-mono text-ivory">GOOGLE_CLIENT_SECRET</code> in the server environment and restart the site. Then return here and sign in with Google.</>,
  ];
  return (
    <section className="rounded border border-ivory/10 bg-ivory/5 p-6">
      <h2 className="font-display text-2xl font-medium text-ivory">Set up Google sign-in</h2>
      <ol className="mt-4 flex list-decimal flex-col gap-3 pl-5 font-sans text-sm text-mist marker:text-gold-light">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
