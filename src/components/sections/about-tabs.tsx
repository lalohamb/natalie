"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Tab = { id: string; label: string; paragraphs: readonly string[] };

type AboutTabsProps = {
  tabs: readonly Tab[];
};

export function AboutTabs({ tabs }: AboutTabsProps) {
  const [active, setActive] = useState(tabs[0].id);
  const [panelHeight, setPanelHeight] = useState<number | undefined>(undefined);
  const measureRef = useRef<HTMLDivElement>(null);

  // After first paint measure all hidden panels and lock to the tallest
  useEffect(() => {
    if (!measureRef.current) return;
    const panels = measureRef.current.querySelectorAll<HTMLDivElement>("[data-measure]");
    let max = 0;
    panels.forEach((el) => {
      if (el.offsetHeight > max) max = el.offsetHeight;
    });
    if (max > 0) setPanelHeight(max);
  }, []);

  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="About Natalie sections"
        className="flex flex-wrap gap-x-1 gap-y-1 border-b border-sand"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActive(tab.id)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3 py-2.5 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.1em] transition-colors duration-200",
              active === tab.id
                ? "border-espresso text-espresso"
                : "border-transparent text-stone hover:text-espresso",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visible panel — height locked to tallest */}
      <div
        id={`tabpanel-${current.id}`}
        role="tabpanel"
        aria-label={current.label}
        className="mt-5 overflow-y-auto text-pretty text-stone"
        style={panelHeight ? { height: panelHeight } : undefined}
      >
        <div className="flex flex-col gap-4">
          {current.paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "text-base leading-relaxed" : "text-sm leading-relaxed"}>
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* Off-screen measurement container — renders all panels invisibly */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute"
      >
        {tabs.map((tab) => (
          <div key={tab.id} data-measure className="flex flex-col gap-4 text-base leading-relaxed" style={{ width: "593px" }}>
            {tab.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "text-base leading-relaxed" : "text-sm leading-relaxed"}>
                {p}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
