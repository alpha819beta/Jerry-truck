"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSubscriber, unsubscribe } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";

export function Unsubscribe() {
  const token = useSearchParams().get("t") || "";
  const { data: sub, loading } = useLoad(() => (token ? getSubscriber(token) : Promise.resolve(null)), [token]);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  if (loading) return <div className="card text-muted">Loading…</div>;

  return (
    <div className="card">
      {!sub ? (
        <p>This unsubscribe link isn&apos;t valid.</p>
      ) : done || !sub.active ? (
        <p>
          <strong>{sub.email}</strong> has been unsubscribed. Sorry to see you go!
        </p>
      ) : (
        <div className="space-y-4">
          <p>
            Stop sending the newsletter to <strong>{sub.email}</strong>?
          </p>
          <button
            className="btn-dark"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              await unsubscribe(token);
              setDone(true);
            }}
          >
            Unsubscribe
          </button>
        </div>
      )}
    </div>
  );
}
