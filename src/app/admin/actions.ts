"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh, updateTag, revalidatePath } from "next/cache";
import { z } from "zod";
import type { CuratedVideo } from "@/content/types";
import {
  checkAdminPassword,
  clearLoginFailures,
  clientIp,
  endAdminSession,
  isAdminConfigured,
  isLoginThrottled,
  isReadOnly,
  recordLoginFailure,
  requireAdmin,
  startAdminSession,
} from "@/lib/admin-auth";
import {
  UPLOAD_URL_PREFIX,
  VIDEO_CATEGORIES,
  deleteUploadedFile,
  listFiles,
  newVideoId,
  readVideos,
  updateVideos,
  videosUsingUrl,
} from "@/lib/media-store";
import { VIDEOS_CACHE_TAG } from "@/lib/video-content";
import { parseYouTubeId, youTubeWatchUrl } from "@/lib/youtube";
import {
  CALENDAR_CACHE_TAG,
  GoogleReauthRequired,
  listCalendars,
  setCalendar,
  signOut as signOutOfGoogle,
} from "@/lib/google-calendar";
import { deleteSubscriber as mlDeleteSubscriber } from "@/lib/mailerlite";
import { getPrice, listStripeProducts, listStripeProductPrices, type StripeProduct, type StripePrice } from "@/lib/stripe";
import {
  BOOK_CATEGORIES,
  BOOK_STATUSES,
  newBookSlug,
  readBooks,
  updateBooks,
} from "@/lib/book-store";
import { BOOKS_CACHE_TAG } from "@/lib/book-content";

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isAdminConfigured()) {
    return {
      status: "error",
      message: "Admin access isn't configured. Set ADMIN_PASSWORD in the server environment.",
    };
  }

  const ip = clientIp(await headers());
  if (isLoginThrottled(ip)) {
    return { status: "error", message: "Too many attempts. Please wait 15 minutes and try again." };
  }

  if (!checkAdminPassword(String(formData.get("password") ?? ""))) {
    recordLoginFailure(ip);
    return { status: "error", message: "Incorrect password." };
  }

  clearLoginFailures(ip);
  await startAdminSession();
  redirect("/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Videos
// ---------------------------------------------------------------------------

const videoFormSchema = z
  .object({
    title: z.string().trim().min(1, "Please enter a title.").max(160),
    description: z.string().trim().max(2000),
    category: z.enum(VIDEO_CATEGORIES, { error: "Please choose a category." }),
    sourceType: z.enum(["file", "facebook", "youtube"]),
    localSrc: z.string().trim().optional(),
    facebookUrl: z.string().trim().optional(),
    youtubeUrl: z.string().trim().optional(),
    embeddable: z.boolean(),
    posterSrc: z.string().trim().optional(),
    published: z.boolean(),
    featured: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.sourceType === "file" && !data.localSrc) {
      ctx.addIssue({ code: "custom", path: ["localSrc"], message: "Please choose a video file." });
    }
    if (data.sourceType === "facebook") {
      const ok = !!data.facebookUrl && /^https:\/\/(www\.|m\.)?(facebook\.com|fb\.watch)\//.test(data.facebookUrl);
      if (!ok) {
        ctx.addIssue({ code: "custom", path: ["facebookUrl"], message: "Please enter a facebook.com video URL." });
      }
    }
    if (data.sourceType === "youtube" && !parseYouTubeId(data.youtubeUrl ?? "")) {
      ctx.addIssue({
        code: "custom",
        path: ["youtubeUrl"],
        message: "Please enter a link to a single YouTube video (playlists and channels aren't supported).",
      });
    }
  });

function parseVideoForm(formData: FormData) {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" && value.trim() ? value : undefined;
  };
  return videoFormSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: formData.get("category"),
    sourceType: formData.get("sourceType"),
    localSrc: text("localSrc"),
    facebookUrl: text("facebookUrl"),
    youtubeUrl: text("youtubeUrl"),
    embeddable: formData.get("embeddable") === "on",
    posterSrc: text("posterSrc"),
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
  });
}

function fieldErrorsOf(error: z.ZodError): FormState {
  const fieldErrors: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { status: "error", message: "Please correct the errors below.", fieldErrors };
}

/** Only allow sources that exist in the media library, so a typo can't publish a broken player. */
async function assertLibraryUrls(data: { localSrc?: string; posterSrc?: string }): Promise<FormState | null> {
  const files = await listFiles();
  const has = (url: string, kind: "video" | "image") => files.some((f) => f.url === url && f.kind === kind);
  if (data.localSrc && !has(data.localSrc, "video")) {
    return { status: "error", message: "Please correct the errors below.", fieldErrors: { localSrc: "That video file is no longer in the library." } };
  }
  if (data.posterSrc && !has(data.posterSrc, "image")) {
    return { status: "error", message: "Please correct the errors below.", fieldErrors: { posterSrc: "That image is no longer in the library." } };
  }
  return null;
}

function applyForm(target: CuratedVideo, data: z.infer<typeof videoFormSchema>) {
  target.title = data.title;
  target.description = data.description;
  target.category = data.category;
  target.published = data.published;
  target.featured = data.featured;
  // Exactly one source is kept; the others are cleared.
  target.localSrc = data.sourceType === "file" ? data.localSrc : undefined;
  target.posterSrc = data.sourceType === "file" ? data.posterSrc : undefined;
  target.youtubeId = data.sourceType === "youtube" ? parseYouTubeId(data.youtubeUrl!)! : undefined;
  target.facebookUrl = data.sourceType === "facebook" ? data.facebookUrl : undefined;
  target.embeddable = data.sourceType === "facebook" ? data.embeddable : true;
}

type YouTubeCheck =
  | { status: "ok"; title: string; author?: string }
  | { status: "error"; message: string }
  /** YouTube couldn't be reached — don't block saving on a network hiccup. */
  | { status: "unknown" };

/**
 * Confirms a YouTube video exists, is public or unlisted, and allows
 * embedding, using YouTube's keyless oEmbed endpoint.
 */
async function checkYouTube(videoId: string): Promise<YouTubeCheck> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(youTubeWatchUrl(videoId))}`,
      { cache: "no-store", signal: AbortSignal.timeout(5000) },
    );
    if (res.ok) {
      const data = (await res.json()) as { title?: string; author_name?: string };
      return { status: "ok", title: data.title ?? "", author: data.author_name };
    }
    if (res.status === 401 || res.status === 403) {
      return { status: "error", message: "This video's owner has turned off embedding, so it can't play on this site." };
    }
    if (res.status === 400 || res.status === 404) {
      return { status: "error", message: "That video couldn't be found. It may be private or deleted." };
    }
    return { status: "unknown" };
  } catch {
    return { status: "unknown" };
  }
}

/** Looks up a YouTube link for the video form (title auto-fill + early validation). */
export async function lookupYouTube(url: string): Promise<YouTubeCheck & { videoId?: string }> {
  await requireAdmin();
  const videoId = parseYouTubeId(url);
  if (!videoId) return { status: "error", message: "That doesn't look like a link to a single YouTube video." };
  return { ...(await checkYouTube(videoId)), videoId };
}

/** Expires the public video cache and re-renders the current admin page. */
function videosChanged() {
  updateTag(VIDEOS_CACHE_TAG);
  refresh();
}

/** Only one video may be featured on the homepage. */
function enforceSingleFeatured(videos: CuratedVideo[], featuredId: string) {
  for (const v of videos) if (v.id !== featuredId) v.featured = false;
}

export async function saveVideo(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (isReadOnly()) return { status: "error", message: "The admin is read-only in this environment." };

  const parsed = parseVideoForm(formData);
  if (!parsed.success) return fieldErrorsOf(parsed.error);
  const data = parsed.data;
  if (data.sourceType === "file") {
    const invalid = await assertLibraryUrls(data);
    if (invalid) return invalid;
  }
  if (data.sourceType === "youtube") {
    const check = await checkYouTube(parseYouTubeId(data.youtubeUrl!)!);
    if (check.status === "error") {
      return { status: "error", message: "Please correct the errors below.", fieldErrors: { youtubeUrl: check.message } };
    }
  }

  const found = await updateVideos((videos) => {
    let video: CuratedVideo | undefined;
    if (id) {
      video = videos.find((v) => v.id === id);
      if (!video) return false;
    } else {
      video = {
        id: newVideoId(),
        title: "",
        description: "",
        category: data.category,
        embeddable: true,
        featured: false,
        published: false,
        displayOrder: Math.max(0, ...videos.map((v) => v.displayOrder)) + 1,
        createdAt: new Date().toISOString(),
      };
      videos.push(video);
    }
    applyForm(video, data);
    if (video.featured) enforceSingleFeatured(videos, video.id);
    return true;
  });

  if (!found) return { status: "error", message: "This video no longer exists." };
  updateTag(VIDEOS_CACHE_TAG);
  redirect("/admin/videos");
}

export async function deleteVideo(id: string) {
  await requireAdmin();
  if (isReadOnly()) return;
  await updateVideos((videos) => {
    const index = videos.findIndex((v) => v.id === id);
    if (index >= 0) videos.splice(index, 1);
  });
  videosChanged();
}

export async function setVideoPublished(id: string, published: boolean) {
  await requireAdmin();
  if (isReadOnly()) return;
  await updateVideos((videos) => {
    const video = videos.find((v) => v.id === id);
    if (video) video.published = published;
  });
  videosChanged();
}

export async function setVideoFeatured(id: string, featured: boolean) {
  await requireAdmin();
  if (isReadOnly()) return;
  await updateVideos((videos) => {
    const video = videos.find((v) => v.id === id);
    if (!video) return;
    video.featured = featured;
    if (featured) enforceSingleFeatured(videos, id);
  });
  videosChanged();
}

export async function moveVideo(id: string, direction: "up" | "down") {
  await requireAdmin();
  if (isReadOnly()) return;
  await updateVideos((videos) => {
    videos.sort((a, b) => a.displayOrder - b.displayOrder);
    const i = videos.findIndex((v) => v.id === id);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= videos.length) return;
    [videos[i].displayOrder, videos[j].displayOrder] = [videos[j].displayOrder, videos[i].displayOrder];
  });
  videosChanged();
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

export async function deleteFile(name: string): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  if (isReadOnly()) return { ok: false, message: "The admin is read-only in this environment." };
  const url = `${UPLOAD_URL_PREFIX}${name}`;
  const [videos, books] = await Promise.all([readVideos(), readBooks()]);
  const usedBy = [...videosUsingUrl(videos, url), ...books.filter((b) => b.coverUrl === url)];
  if (usedBy.length > 0) {
    return {
      ok: false,
      message: `In use by: ${usedBy.map((item) => `“${item.title}”`).join(", ")}. Change or delete those videos or books first.`,
    };
  }
  const deleted = await deleteUploadedFile(name);
  if (deleted) refresh();
  return deleted ? { ok: true, message: `Deleted ${name}.` } : { ok: false, message: "File not found." };
}

// ---------------------------------------------------------------------------
// Google Calendar
// ---------------------------------------------------------------------------

export async function selectCalendar(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (isReadOnly()) return { status: "error", message: "The admin is read-only in this environment." };
  const calendarId = String(formData.get("calendarId") ?? "");

  let calendars;
  try {
    calendars = await listCalendars();
  } catch (err) {
    if (err instanceof GoogleReauthRequired) return { status: "error", message: err.message };
    console.error("[admin] listing Google calendars failed", err);
    return { status: "error", message: "Couldn't reach Google Calendar. Please try again." };
  }

  // Only accept calendars the connected account can actually read.
  const calendar = calendars.find((c) => c.id === calendarId);
  if (!calendar) return { status: "error", message: "Please choose one of your calendars." };

  await setCalendar(calendar.id, calendar.name);
  updateTag(CALENDAR_CACHE_TAG);
  refresh();
  return { status: "success", message: `The Events page now shows “${calendar.name}”.` };
}

export async function signOutGoogle() {
  await requireAdmin();
  if (isReadOnly()) return;
  await signOutOfGoogle();
  updateTag(CALENDAR_CACHE_TAG);
  refresh();
}

// ---------------------------------------------------------------------------
// Newsletter (MailerLite)
// ---------------------------------------------------------------------------

export async function deleteSubscriber(id: string): Promise<void> {
  await requireAdmin();
  if (isReadOnly()) return;
  await mlDeleteSubscriber(id);
  refresh();
}

// ---------------------------------------------------------------------------
// Books
// ---------------------------------------------------------------------------

const bookFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(160),
  subtitle: z.string().trim().max(200).optional(),
  status: z.enum(BOOK_STATUSES, { error: "Please choose a status." }),
  priceCents: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().int().min(0).optional()),
  summary: z.string().trim().min(1, "Summary is required.").max(500),
  description: z.string().trim().min(1, "Description is required."),
  coverUrl: z.string().trim().optional(),
  coverAlt: z.string().trim().max(300).optional(),
  forewordBy: z.string().trim().max(100).optional(),
  note: z.string().trim().max(500).optional(),
  companionOf: z.string().trim().optional(),
  purchaseKind: z.enum(["none", "external", "stripe-checkout"]),
  purchaseUrl: z.string().trim().optional(),
  purchasePriceId: z.string().trim().optional(),
  purchaseLabel: z.string().trim().max(60).optional(),
  featured: z.boolean(),
  category: z.enum(BOOK_CATEGORIES).optional(),
  stripeProductId: z.string().trim().optional(),
});

/**
 * Compares a book's display price with the Stripe Price that checkout will
 * charge. A blank display price is filled in from Stripe; a different one is
 * rejected. If Stripe can't be asked (no key, network error, a non-USD or
 * customer-chosen amount) the entered value is kept unchanged.
 */
async function checkStripePrice(
  priceId: string,
  entered: number | undefined,
): Promise<{ priceCents: number | undefined; fieldErrors?: Partial<Record<string, string>> }> {
  if (!process.env.STRIPE_SECRET_KEY) return { priceCents: entered };

  let price;
  try {
    price = await getPrice(priceId);
  } catch (err) {
    console.error("[admin] Stripe price lookup failed", err);
    return { priceCents: entered };
  }

  if (!price) {
    return {
      priceCents: entered,
      fieldErrors: { purchasePriceId: "Stripe has no price with this ID. Check it was copied in full and is from the same (live or test) Stripe account." },
    };
  }
  if (!price.active) {
    return { priceCents: entered, fieldErrors: { purchasePriceId: "This Stripe price is archived, so checkout would fail. Use an active price." } };
  }
  if (price.unit_amount === null || price.currency !== "usd") return { priceCents: entered };
  if (entered === undefined) return { priceCents: price.unit_amount };
  if (entered !== price.unit_amount) {
    const dollars = (price.unit_amount / 100).toFixed(2);
    return {
      priceCents: entered,
      fieldErrors: {
        priceCents: "Stripe charges USD " + dollars + " for this price. Enter " + price.unit_amount + ", or leave this blank to use the Stripe amount.",
      },
    };
  }
  return { priceCents: entered };
}

function booksChanged() {
  updateTag(BOOKS_CACHE_TAG);
  revalidatePath("/books", "layout");
  refresh();
}

export async function saveBook(slug: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (isReadOnly()) return { status: "error", message: "The admin is read-only in this environment." };

  const raw = {
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? "") || undefined,
    status: formData.get("status"),
    priceCents: String(formData.get("priceCents") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    description: String(formData.get("description") ?? ""),
    coverUrl: String(formData.get("coverUrl") ?? "") || undefined,
    coverAlt: String(formData.get("coverAlt") ?? "") || undefined,
    forewordBy: String(formData.get("forewordBy") ?? "") || undefined,
    note: String(formData.get("note") ?? "") || undefined,
    companionOf: String(formData.get("companionOf") ?? "") || undefined,
    purchaseKind: formData.get("purchaseKind"),
    purchaseUrl: String(formData.get("purchaseUrl") ?? "") || undefined,
    purchasePriceId: String(formData.get("purchasePriceId") ?? "") || undefined,
    purchaseLabel: String(formData.get("purchaseLabel") ?? "") || undefined,
    featured: formData.get("featured") === "on",
    category: (formData.get("category") as string) || undefined,
    stripeProductId: String(formData.get("stripeProductId") ?? "") || undefined,
  };

  const parsed = bookFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<string, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please correct the errors below.", fieldErrors };
  }

  const d = parsed.data;

  // The amount charged is whatever the Stripe Price says; the price shown on
  // the site must agree with it.
  let priceCents = d.priceCents;
  if (d.purchaseKind === "stripe-checkout" && d.purchasePriceId) {
    const check = await checkStripePrice(d.purchasePriceId, priceCents);
    if (check.fieldErrors) {
      return { status: "error", message: "Please correct the errors below.", fieldErrors: check.fieldErrors };
    }
    priceCents = check.priceCents;
  }

  const purchase =
    d.purchaseKind === "external"
      ? { kind: "external" as const, url: d.purchaseUrl ?? "", label: d.purchaseLabel ?? "Purchase" }
      : d.purchaseKind === "stripe-checkout"
        ? { kind: "stripe-checkout" as const, priceId: d.purchasePriceId ?? "", label: d.purchaseLabel ?? "Purchase" }
        : { kind: "none" as const };

  const found = await updateBooks((books) => {
    if (slug) {
      const book = books.find((b) => b.slug === slug);
      if (!book) return false;
      book.title = d.title;
      book.subtitle = d.subtitle;
      book.status = d.status;
      book.priceCents = priceCents;
      book.summary = d.summary;
      book.description = d.description.split("\n\n").map((p) => p.trim()).filter(Boolean);
      book.coverUrl = d.coverUrl;
      book.coverAlt = d.coverAlt;
      book.forewordBy = d.forewordBy;
      book.note = d.note;
      book.companionOf = d.companionOf;
      book.purchase = purchase;
      book.featured = d.featured;
      book.category = d.category;
      book.stripeProductId = d.stripeProductId;
    } else {
      const newSlug = newBookSlug(d.title);
      books.push({
        slug: newSlug,
        title: d.title,
        subtitle: d.subtitle,
        status: d.status,
        priceCents,
        summary: d.summary,
        description: d.description.split("\n\n").map((p) => p.trim()).filter(Boolean),
        coverUrl: d.coverUrl,
        coverAlt: d.coverAlt,
        forewordBy: d.forewordBy,
        note: d.note,
        companionOf: d.companionOf,
        purchase,
        featured: d.featured,
        category: d.category,
        stripeProductId: d.stripeProductId,
        displayOrder: Math.max(0, ...books.map((b) => b.displayOrder)) + 1,
        createdAt: new Date().toISOString(),
      });
    }
    return true;
  });

  if (!found) return { status: "error", message: "Book not found." };
  booksChanged();
  if (slug) return { status: "success", message: "Book saved." };
  redirect("/admin/books?added=1");
}

export async function deleteBook(slug: string) {
  await requireAdmin();
  if (isReadOnly()) return;
  await updateBooks((books) => {
    const i = books.findIndex((b) => b.slug === slug);
    if (i >= 0) books.splice(i, 1);
  });
  booksChanged();
}

export async function setBookPublished(slug: string, status: "published" | "forthcoming" | "unavailable") {
  await requireAdmin();
  if (isReadOnly()) return;
  await updateBooks((books) => {
    const book = books.find((b) => b.slug === slug);
    if (book) book.status = status;
  });
  booksChanged();
}

/** Fetches active Stripe products and, optionally, prices for one product. */
export async function getStripeProductsForPicker(
  productId?: string,
): Promise<{ products: StripeProduct[]; prices: StripePrice[] }> {
  await requireAdmin();
  if (!process.env.STRIPE_SECRET_KEY) return { products: [], prices: [] };
  const [products, prices] = await Promise.all([
    listStripeProducts(),
    productId ? listStripeProductPrices(productId) : Promise.resolve([]),
  ]);
  return { products, prices };
}
