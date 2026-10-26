"use client";

import { useState } from "react";
import { listNewsletters, listSubscribers, recordNewsletter, removeSubscriber } from "@/lib/adminApi";
import type { Subscriber } from "@/lib/data";
import { emailConfigured, emailCustomer } from "@/lib/notify";
import { isEmail } from "@/lib/format";
import { site, siteUrl } from "@/lib/site";
import { useLoad } from "@/lib/useLoad";
import { AdminTitle, ConfigNotice, useAdmin } from "@/components/admin/Flash";

function withFooter(body: string, token: string) {
  return `${body}\n\n—\n${site.name} · ${site.phone}\nUnsubscribe: ${siteUrl(`/newsletter/unsubscribe/?t=${token}`)}`;
}

export default function NewsletterAdmin() {
  const { data: subs, reload: reloadSubs } = useLoad(listSubscribers);
  const { data: history, reload: reloadHistory } = useLoad(listNewsletters);
  const { run, busy, flash } = useAdmin();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [testTo, setTestTo] = useState("");
  const [progress, setProgress] = useState("");

  const list = subs || [];

  async function sendTest() {
    if (!subject || !body) return flash("Subject and message are required.", true);
    if (!isEmail(testTo)) return flash("Enter an email address for the test.", true);
    await run(async () => {
      const r = await emailCustomer(testTo, "", `[TEST] ${subject}`, withFooter(body, "test"));
      if (!r.ok) throw new Error(`Test failed: ${r.error}`);
    }, `Test sent to ${testTo}.`);
  }

  async function sendAll() {
    if (!subject || !body) return flash("Subject and message are required.", true);
    if (!list.length) return flash("No subscribers yet.", true);
    if (!confirm(`Send "${subject}" to ${list.length} subscriber(s)?`)) return;
    let sent = 0;
    let lastError = "";
    await run(async () => {
      for (const [i, s] of list.entries() as IterableIterator<[number, Subscriber]>) {
        setProgress(`Sending ${i + 1} of ${list.length}…`);
        const r = await emailCustomer(s.email, s.name || "", subject, withFooter(body, s.id));
        if (r.ok) sent++;
        else lastError = r.error || "";
      }
      setProgress("");
      await recordNewsletter(subject, body, sent);
      await reloadHistory();
    });
    flash(`Sent to ${sent} of ${list.length} subscriber(s).${lastError ? ` Last error: ${lastError}` : ""}`, sent < list.length);
    if (sent) {
      setSubject("");
      setBody("");
    }
  }

  return (
    <>
      <AdminTitle>Newsletter</AdminTitle>
      <ConfigNotice show={!emailConfigured}>
        Email sending isn&apos;t set up yet. Add your EmailJS keys (see README) before sending.
      </ConfigNotice>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card space-y-4 lg:col-span-2">
          <h2 className="heading text-lg">Write a newsletter</h2>
          <div>
            <label className="label" htmlFor="subject">Subject</label>
            <input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="input" placeholder="e.g. Spring mulch is here, book early!" />
          </div>
          <div>
            <label className="label" htmlFor="body">Message</label>
            <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={12} className="input" placeholder={"Hi neighbors,\n\nWrite your update here."} />
          </div>
          <div className="flex flex-wrap items-end gap-3 rounded-lg bg-cream/60 p-3">
            <div className="flex-1">
              <label className="label" htmlFor="testTo">Send a test to</label>
              <input id="testTo" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} className="input" placeholder="your@email.com" />
            </div>
            <button className="btn-outline" disabled={busy} onClick={sendTest}>Send Test</button>
          </div>
          <button className="btn-primary" disabled={busy || !emailConfigured} onClick={sendAll}>
            {progress || `Send to ${list.length} subscriber${list.length === 1 ? "" : "s"}`}
          </button>
          <p className="text-xs text-muted">
            EmailJS&apos;s free plan sends 200 emails a month (shared with invoice emails and request alerts).
          </p>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="heading text-lg">Subscribers ({list.length})</h2>
            {list.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No subscribers yet. People can sign up in the site footer, on the Newsletter page, or when they book.</p>
            ) : (
              <ul className="mt-3 max-h-80 divide-y divide-cream-200 overflow-y-auto text-sm">
                {list.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                    <span className="truncate">{s.name ? `${s.name} · ` : ""}{s.email}</span>
                    <button
                      className="text-xs text-red-700 hover:underline"
                      onClick={() => run(async () => { await removeSubscriber(s.email); await reloadSubs(); }, "Subscriber removed.")}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card">
            <h2 className="heading text-lg">Sent</h2>
            {!history?.length ? (
              <p className="mt-2 text-sm text-muted">Nothing sent yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {history.map((h) => (
                  <li key={h.id}>
                    <p className="font-semibold text-navy">{h.subject}</p>
                    <p className="text-xs text-muted">{h.sentAt.toLocaleDateString("en-US", { dateStyle: "medium" })} · {h.recipientCount} recipients</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
