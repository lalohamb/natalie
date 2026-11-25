"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function ZelleCopyButton({ recipient }: { recipient: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(recipient);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy Zelle address"}
      className="shrink-0 rounded p-1.5 text-stone transition-colors hover:bg-sand hover:text-espresso"
    >
      {copied
        ? <Check className="size-4 text-green-700" strokeWidth={2} />
        : <Copy className="size-4" strokeWidth={1.75} />
      }
    </button>
  );
}
