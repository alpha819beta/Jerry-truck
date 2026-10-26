"use client";

import { useState } from "react";
import { submitReview } from "@/lib/api";
import { str } from "@/lib/format";
import { FieldError, FormMessage, Honeypot, invalid, useSubmit } from "./Field";

export function ReviewForm() {
  const [rating, setRating] = useState(0);
  const { state, pending, onSubmit } = useSubmit(async (form) => {
    const author = str(form, "author");
    const text = str(form, "text");
    const errors: Record<string, string> = {};
    if (!author) errors.author = "Please enter your name.";
    if (text.length < 5) errors.text = "Please write a few words about your experience.";
    if (!rating) errors.rating = "Please choose a star rating.";
    if (Object.keys(errors).length) return invalid(errors);
    await submitReview(author, text.slice(0, 2000), rating);
    return { ok: true, message: "Thank you! Your review will appear once it's approved." };
  });

  if (state?.ok) {
    return (
      <div className="card text-center">
        <p className="heading text-xl">Thank you!</p>
        <p className="mt-2 text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card relative space-y-4" noValidate>
      <Honeypot />
      <h2 className="heading text-xl">Leave a review</h2>
      <div>
        <span className="label">Rating *</span>
        <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              className={`text-3xl leading-none ${n <= rating ? "text-sun" : "text-stone/30"} hover:text-sun`}
            >
              ★
            </button>
          ))}
        </div>
        <FieldError state={state} name="rating" />
      </div>
      <div>
        <label className="label" htmlFor="author">Your name *</label>
        <input id="author" name="author" className="input" maxLength={80} />
        <FieldError state={state} name="author" />
      </div>
      <div>
        <label className="label" htmlFor="text">Your review *</label>
        <textarea id="text" name="text" rows={4} className="input" maxLength={2000} />
        <FieldError state={state} name="text" />
      </div>
      <FormMessage state={state} />
      <button className="btn-dark" disabled={pending}>{pending ? "Sending…" : "Submit Review"}</button>
    </form>
  );
}
