"use client";

import { FormEvent } from "react";

export function BlogNewsletter() {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="your@email.com"
        required
        className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-base text-white placeholder-white/40 outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
      />
      <button type="submit" className="button button--accent shrink-0">
        Subscribe
      </button>
    </form>
  );
}
