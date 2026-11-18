"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteSubscriber } from "../../actions";
import { adminButton } from "../../_components/admin-ui";

export function DeleteSubscriberButton({ id, email }: { id: string; email: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!confirm(`Remove ${email} from MailerLite? This cannot be undone.`)) return;
        startTransition(() => deleteSubscriber(id));
      }}
      className={adminButton.danger}
      aria-label={`Delete ${email}`}
    >
      <Trash2 aria-hidden className="size-4" strokeWidth={1.75} />
    </button>
  );
}
