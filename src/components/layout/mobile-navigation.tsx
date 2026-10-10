"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import type { CallToAction, NavItem, SocialLink } from "@/content/types";
import { SocialIcon } from "@/components/ui/social-icon";

type MobileNavigationProps = {
  items: NavItem[];
  give: CallToAction;
  socials: SocialLink[];
  email: string;
};

/**
 * Full-height menu built on the native <dialog> element, which provides focus
 * containment, Escape-to-close and an inert background without extra code.
 */
export function MobileNavigation({ items, give, socials, email }: MobileNavigationProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="-mr-2 inline-flex size-11 items-center justify-center text-espresso"
      >
        <Menu aria-hidden className="size-6" strokeWidth={1.5} />
        <span className="sr-only">Open menu</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Site menu"
        onClick={(event) => {
          // Clicking the backdrop (the dialog element itself) closes the menu.
          if (event.target === event.currentTarget) close();
        }}
        className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-md bg-espresso p-0 text-ivory backdrop:bg-espresso/50 backdrop:backdrop-blur-sm open:motion-safe:animate-fade"
      >
        <div className="flex min-h-full flex-col px-gutter pt-6 pb-10">
          <div className="flex items-center justify-between">
            <span className="font-sans text-eyebrow font-semibold text-gold-light uppercase">Menu</span>
            <button
              type="button"
              onClick={close}
              className="-mr-2 inline-flex size-11 items-center justify-center text-ivory"
              autoFocus
            >
              <X aria-hidden className="size-6" strokeWidth={1.5} />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <nav aria-label="Main" className="mt-12">
            <ul className="flex flex-col">
              <li>
                <Link
                  href="/"
                  onClick={close}
                  aria-current={pathname === "/" ? "page" : undefined}
                  className="block border-b border-ivory/10 py-4 font-display text-[2rem] leading-tight aria-[current=page]:text-gold-light"
                >
                  Home
                </Link>
              </li>
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                    className="block border-b border-ivory/10 py-4 font-display text-[2rem] leading-tight aria-[current=page]:text-gold-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Link
            href={give.href}
            onClick={close}
            className="mt-10 inline-flex min-h-12 items-center justify-center rounded-sm bg-ember px-7 font-sans text-sm font-semibold tracking-[0.06em] text-ivory uppercase hover:bg-ember-deep"
          >
            {give.label}
          </Link>

          <div className="mt-auto flex flex-col gap-4 pt-12 text-sm text-mist">
            <a href={`mailto:${email}`} className="min-h-11 content-center hover:text-ivory">
              {email}
            </a>
            <ul className="flex gap-2">
              {socials.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="-ml-2.5 inline-flex size-11 items-center justify-center hover:text-ivory"
                  >
                    <SocialIcon platform={social.platform} className="size-5" />
                    <span className="sr-only">{social.label} (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </dialog>
    </div>
  );
}
