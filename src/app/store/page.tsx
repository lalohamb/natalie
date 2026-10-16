import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button-link";
import { getProducts } from "@/lib/content";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Store",
  description: "Ministry merchandise from Natalie Flemons Ministries — Pray Hoodies and T-Shirts.",
  alternates: { canonical: "/store" },
  openGraph: { url: "/store" },
};

export default function StorePage() {
  const products = getProducts();

  return (
    <>
      <section className="border-b border-sand bg-linen py-16">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Ministry Store"
            title="Spirit · Truth · Strategy"
            lede="Ministry merchandise. Purchases are fulfilled through our store."
            className="motion-safe:animate-rise"
          />
        </Container>
      </section>

      <section aria-label="Products" className="py-section">
        <Container>
          {products.length === 0 ? (
            <Reveal>
              <p className="text-lede text-stone">No products are currently available. Please check back soon.</p>
            </Reveal>
          ) : (
            <div className="grid gap-12 sm:grid-cols-2 lg:gap-16">
              {products.map((product, i) => {
                const availableColors = [...new Set(
                  product.variants.filter((v) => v.available).map((v) => v.color)
                )];
                const availableSizes = [...new Set(
                  product.variants.filter((v) => v.available).map((v) => v.size)
                )];

                return (
                  <Reveal key={product.slug} delay={i * 0.08}>
                    <article aria-labelledby={`product-${product.slug}`}>
                      {/* Product image placeholder — no approved images available yet */}
                      <div className="aspect-square bg-linen border border-sand flex items-center justify-center">
                        <p className="font-sans text-eyebrow text-stone uppercase text-center px-8">
                          Product image<br />coming soon
                        </p>
                      </div>

                      <div className="mt-6">
                        <Eyebrow rule={false}>Ministry Apparel</Eyebrow>
                        <h2
                          id={`product-${product.slug}`}
                          className="mt-3 font-display text-display-sm font-medium"
                        >
                          {product.title}
                        </h2>
                        <p className="mt-2 font-display text-2xl text-espresso">
                          <span className="sr-only">Price: </span>
                          {formatPrice(product.priceCents)}
                        </p>
                        <p className="mt-4 text-pretty text-stone">{product.description}</p>

                        {availableColors.length > 0 && (
                          <p className="mt-4 text-sm text-stone">
                            <span className="font-semibold text-espresso">Colors: </span>
                            {availableColors.join(", ")}
                          </p>
                        )}
                        {availableSizes.length > 0 && (
                          <p className="mt-1 text-sm text-stone">
                            <span className="font-semibold text-espresso">Sizes: </span>
                            {availableSizes.join(", ")}
                          </p>
                        )}

                        <div className="mt-6">
                          {product.purchase.kind === "external" ? (
                            <ButtonLink href={product.purchase.url}>
                              {product.purchase.label}
                            </ButtonLink>
                          ) : (
                            <p className="text-sm text-stone italic">Currently unavailable</p>
                          )}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      {/* ── Disclaimer ── */}
      <div className="border-t border-sand bg-linen py-10">
        <Container>
          <p className="text-sm text-stone">
            ⚠️ Product images are pending. Stock availability reflects our last audit and may have changed.
            Purchases are processed through our external store.
          </p>
        </Container>
      </div>
    </>
  );
}
