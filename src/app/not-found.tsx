import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section aria-labelledby="not-found-heading" className="py-section">
      <Container className="max-w-3xl text-center">
        <Eyebrow className="justify-center">404</Eyebrow>
        <h1 id="not-found-heading" className="mt-6 font-display text-display-lg font-medium">
          This page could not be found
        </h1>
        <p className="mx-auto mt-6 max-w-prose text-lede text-stone">
          The page may have moved as part of our new website. Please continue from the homepage, or email
          info@natalieflemons.com if you need help.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ButtonLink href="/">Return home</ButtonLink>
          <ButtonLink href="/books" variant="secondary">
            Explore the Books
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
