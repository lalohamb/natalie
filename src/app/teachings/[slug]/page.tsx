import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { getAdminCourse, getPublishedCourses } from "@/lib/course-content";
import { formatPrice } from "@/lib/format";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getAdminCourse(slug);
  if (!course) return {};
  return {
    title: course.title,
    description: course.summary,
    alternates: { canonical: `/teachings/${slug}` },
    openGraph: { url: `/teachings/${slug}` },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getAdminCourse(slug);
  if (!course || course.status !== "published") notFound();

  const enrollLabel = course.enrollLabel || "Enroll Now";

  return (
    <article aria-labelledby="course-title">
      {/* Hero */}
      <section className="py-section">
        <Container className="grid items-start gap-14 lg:grid-cols-12 lg:gap-8">
          {/* Cover */}
          <div className="mx-auto w-full max-w-sm lg:sticky lg:top-28 lg:col-span-5 lg:max-w-none motion-safe:animate-fade">
            {course.coverUrl ? (
              <div className="relative overflow-hidden rounded shadow-cover aspect-video">
                <Image
                  src={course.coverUrl}
                  alt={course.coverAlt ?? course.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 480px, (min-width: 1024px) 40vw, 90vw"
                  priority
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded bg-sand/40 flex items-center justify-center">
                <span className="font-display text-6xl text-gold/30">NFM</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="lg:col-span-7 lg:col-start-6 motion-safe:animate-rise [animation-delay:80ms]">
            <Eyebrow>Online Course</Eyebrow>

            <h1 id="course-title" className="mt-6 font-display text-display-lg font-medium text-balance">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="mt-3 font-display text-2xl text-stone italic">{course.subtitle}</p>
            )}

            <div className="mt-12 flex flex-col gap-5 text-pretty text-stone">
              {course.description.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="mt-8 border-t border-sand pt-6">
              {course.priceCents !== undefined && (
                <p className="font-display text-2xl text-espresso">
                  <span className="sr-only">Price: </span>
                  {formatPrice(course.priceCents)}
                </p>
              )}
              {course.enrollUrl && (
                <div className="mt-4">
                  <ButtonLink href={course.enrollUrl}>{enrollLabel}</ButtonLink>
                </div>
              )}
              {!course.enrollUrl && (
                <p className="mt-4 font-sans text-sm text-stone">Enrollment details coming soon.</p>
              )}
            </div>
          </div>
        </Container>
      </section>
    </article>
  );
}
