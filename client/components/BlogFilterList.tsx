"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { blogCategories, blogPosts } from "@/lib/blog";

export function BlogFilterList() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const visiblePosts =
    selectedCategory === "All"
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  const featured = blogPosts.find((post) => post.featured) || blogPosts[0];
  const rest = visiblePosts.filter((post) => post.slug !== featured.slug);

  return (
    <>
      {/* ── CATEGORY FILTER ── */}
      <nav className="bg-brand-blue-soft" aria-label="Blog categories">
        <div className="shell flex gap-2 py-3 overflow-x-auto no-scrollbar sm:flex-wrap sm:py-4">
          {blogCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] sm:px-4 sm:py-2 sm:text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-brand-blue text-white shadow-blue-sm"
                  : "border border-brand-blue/25 bg-white text-brand-blue hover:bg-brand-blue-wash"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* ── FEATURED POST ── */}
      {selectedCategory === "All" && (
        <section className="section shell" id="featured">
          <p className="eyebrow">Featured post</p>
          <Link
            href={`/blogs/${featured.slug}`}
            className="group grid gap-4 sm:gap-8 overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-blue/12 bg-brand-blue-wash shadow-blue-md transition-all hover:-translate-y-1 hover:shadow-blue-lg lg:grid-cols-[1fr_0.8fr]"
          >
            <div className="overflow-hidden rounded-t-2xl sm:rounded-l-3xl sm:rounded-tr-none">
              <Image
                src={featured.imageUrl}
                alt={featured.title}
                width={800}
                height={480}
                className="h-52 xs:h-60 sm:h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] lg:h-full"
              />
            </div>
            <div className="flex flex-col justify-center p-5 sm:p-8">
              <div>
                <span className="blog-card__tag">{featured.category}</span>
              </div>
              <h2 className="mt-3 mb-3 text-2xl font-black leading-tight text-brand-navy sm:text-3xl lg:text-4xl">
                {featured.title}
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-brand-navy/70">{featured.excerpt}</p>
              <div className="mt-6 sm:mt-8 flex items-center gap-2.5 sm:gap-3">
                <Image src={featured.authorImg} alt={featured.author} width={36} height={36} className="h-8 w-8 sm:h-9 sm:w-9 rounded-full" />
                <span className="text-xs sm:text-sm font-semibold text-brand-navy">{featured.author}</span>
                <span className="text-xs sm:text-sm text-brand-navy/50">· {featured.date} · {featured.readTime}</span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ── ALL POSTS ── */}
      <section className="bg-brand-blue-wash py-12 sm:py-20 lg:py-24" id="all-posts">
        <div className="shell">
          <p className="eyebrow">{selectedCategory === "All" ? "All articles" : selectedCategory}</p>
          <h2 className="mb-8 sm:mb-14">
            More from<br /><em>the team.</em>
          </h2>
          <div className="blog-grid">
            {(selectedCategory === "All" ? rest : visiblePosts).map((post) => (
              <Link
                key={post.slug}
                href={`/blogs/${post.slug}`}
                className="blog-card group"
              >
                <div className="overflow-hidden">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={500}
                    height={280}
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="blog-card__body">
                  <div>
                    <span className="blog-card__tag">{post.category}</span>
                  </div>
                  <h3>{post.title}</h3>
                  <p className="text-sm leading-relaxed text-brand-navy/65">{post.excerpt}</p>
                  <div className="blog-card__meta flex items-center gap-2.5">
                    <Image src={post.authorImg} alt={post.author} width={24} height={24} className="h-6 w-6 rounded-full" />
                    <span>{post.author} · {post.date}</span>
                    <span className="ml-auto">{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {(selectedCategory === "All" ? rest : visiblePosts).length === 0 && (
            <p className="text-brand-navy/70">No other articles are in this category yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
