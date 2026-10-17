"use client";

import { useEffect, useState } from "react";
import { NfMedallion } from "@/components/ui/nf-medallion";

export function MedallionResponsive() {
  const [size, setSize] = useState(72);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = (e: MediaQueryListEvent | MediaQueryList) =>
      setSize(e.matches ? 120 : 72);
    update(mq);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return <NfMedallion size={size} className="shrink-0" />;
}
