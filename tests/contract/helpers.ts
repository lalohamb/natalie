import fs from "node:fs";
import path from "node:path";

/*
 * Shared helpers for contract tests.
 *
 * `fetch` is replaced for the duration of each test, so nothing here can reach
 * a real provider. Any call to a URL the test did not script fails the test.
 */

export type Fixture = { _source: string; status: number; body: unknown };

export function fixture(relativePath: string): Fixture {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "fixtures", relativePath), "utf8")) as Fixture;
}

export function fixtureText(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), "fixtures", relativePath), "utf8");
}

export type RecordedCall = { url: string; method: string; headers: Record<string, string>; body: string | undefined };

/**
 * Replaces global fetch with a scripted queue of responses and records every
 * request. Returns the recorded calls and a restore function.
 */
export function stubFetch(responses: Fixture[]) {
  const original = globalThis.fetch;
  const calls: RecordedCall[] = [];
  const queue = [...responses];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const next = queue.shift();
    const url = String(input);
    if (!next) throw new Error(`Unexpected fetch to ${url} — no scripted response left`);
    calls.push({
      url,
      method: init?.method ?? "GET",
      headers: Object.fromEntries(new Headers(init?.headers).entries()),
      body: typeof init?.body === "string" ? init.body : undefined,
    });
    return new Response(JSON.stringify(next.body), {
      status: next.status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  return {
    calls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

/** Sets env vars for one test and returns a function that puts the old values back. */
export function withEnv(values: Record<string, string | undefined>) {
  const previous: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(values)) {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return () => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  };
}

/** Silences expected `console.error` output from an adapter's failure path. */
export function muteConsoleError() {
  const original = console.error;
  console.error = () => {};
  return () => {
    console.error = original;
  };
}
