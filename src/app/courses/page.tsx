import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/motion/reveal";
import { getPublishedCourses } from "@/lib/course-content";
import { formatPrice } from "@/lib/format";

export const instant = false;

export const metadata: Metadata = {
  title: "The Equipping Academy",
  description: "Develop Your Gifts. Strengthen Your Faith. Fulfill Your Kingdom Assignment. Online courses by Natalie C. Flemons aligned with the ministry’s three core values: Equip · Restore · Activate.",
  alternates: { canonical: "/courses" },
  openGraph: { url: "/courses" },
};

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <>
      {/* Hero */}
      <section className="bg-linen py-16 lg:py-24 border-b border-sand">
        <Container>
          <p className="flex items-center gap-4 font-sans text-eyebrow font-semibold uppercase text-gold-ink">
            <span aria-hidden className="rule-gold" />
            Equip · Restore · Activate
          </p>
          <h1 className="mt-4 font-display text-display-md font-medium text-balance">
            The Equipping Academy
          </h1>
          <p className="mt-4 max-w-prose text-lede text-stone">
            Develop Your Gifts. Strengthen Your Faith. Fulfill Your Kingdom Assignment.
          </p>
          <p className="mt-3 max-w-prose font-sans text-sm text-stone">
            This aligns naturally with the ministry’s three core values: Equip · Restore · Activate.
          </p>
        </Container>
      </section>

      {/* Course grid */}
      <section className="py-section">
        <Container>
          {courses.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-sans text-stone">Academy courses coming soon. Check back shortly.</p>
            </div>
          ) : (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, i) => (
                <Reveal key={course.id} delay={i * 0.06}>
                  <Link href={`/courses/${course.slug}`} className="group flex flex-col rounded border border-sand bg-linen overflow-hidden hover:border-gold/50 transition-colors">
                    {course.coverUrl ? (
                      <div className="relative aspect-video w-full overflow-hidden">
                        <Image
                          src={course.coverUrl}
                          alt={course.coverAlt ?? course.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-sand/40 flex items-center justify-center">
                        <span className="font-display text-4xl text-gold/30">NFM</span>
                      </div>
                    )}
                    <div className="flex flex-col flex-1 p-6">
                      <h2 className="font-display text-xl font-medium text-espresso group-hover:text-gold-ink transition-colors">
                        {course.title}
                      </h2>
                      {course.subtitle && (
                        <p className="mt-1 font-display text-sm text-stone italic">{course.subtitle}</p>
                      )}
                      <p className="mt-3 font-sans text-sm text-stone line-clamp-3">{course.summary}</p>
                      <div className="mt-auto pt-6 flex items-center justify-between">
                        {course.priceCents !== undefined ? (
                          <span className="font-display text-lg text-espresso">{formatPrice(course.priceCents)}</span>
                        ) : (
                          <span className="font-sans text-sm text-stone">See details</span>
                        )}
                        <span className="font-sans text-xs font-semibold text-gold-ink uppercase tracking-wide">
                          Learn more →
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
