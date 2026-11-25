import QRCode from "qrcode";
import { ZelleCopyButton } from "./zelle-copy-button";
import { Eyebrow } from "@/components/ui/eyebrow";

function ZelleLogo() {
  return (
    <svg aria-label="Zelle" role="img" viewBox="0 0 50 20" className="h-4 w-auto opacity-30">
      <path
        fill="currentColor"
        d="M5.8 2h10.4l.8 2.2L4.6 14.6H17v3.4H5.8L5 15.8 17.4 5.4H5.8V2zM20 2h3.6v16H20V2zm6 0h10v3.2h-6.4v3h5.8v3h-5.8v3.6H36V18H26V2zm12 0h10v3.2h-6.4v3h5.8v3h-5.8v3.6H48V18H38V2z"
      />
    </svg>
  );
}

export async function ZelleCard({ recipient }: { recipient: string }) {
  const qrDataUrl = await QRCode.toDataURL(recipient, {
    width: 160,
    margin: 1,
    color: { dark: "#2c1a0e", light: "#faf6ef" },
  });

  return (
    <div className="relative flex h-full flex-col gap-6 border border-sand p-8 sm:p-10">
      <span aria-hidden className="absolute top-0 left-0 h-8 w-8 border-t border-l border-gold" />
      <span aria-hidden className="absolute right-0 bottom-0 h-8 w-8 border-r border-b border-gold" />

      <div>
        <div className="flex items-center justify-between gap-4">
          <Eyebrow rule={false}>Give by Zelle</Eyebrow>
          <ZelleLogo />
        </div>
        <h3 className="mt-4 font-display text-display-sm font-medium">Zelle</h3>
        <p className="mt-5 text-pretty text-stone">
          Scan with your banking app or copy the address below.
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-4">
        {/* QR code */}
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt={`Zelle QR code for ${recipient}`}
            width={160}
            height={160}
            className="rounded border border-sand"
          />
        </div>

        {/* Recipient + copy */}
        <div className="flex items-center justify-between gap-3 rounded border border-sand bg-linen px-4 py-3">
          <span className="font-mono text-sm font-semibold text-espresso break-all">{recipient}</span>
          <ZelleCopyButton recipient={recipient} />
        </div>

        <p className="text-xs text-stone italic text-center">
          Open Zelle in your bank&apos;s app — no separate Zelle account needed.
        </p>
      </div>
    </div>
  );
}
