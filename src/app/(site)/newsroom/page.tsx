import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { JsonLdScript } from "@/components/JsonLdScript";
import { NavigationBar } from "@/components/Navigation";
import { formatNewsMonthDay, getMediaUrl } from "@/lib/newsroom";
import { toNextMetadata } from "@/lib/page-seo";
import { getPayloadClient } from "@/lib/payload";
import { getNewsroomPageContent } from "@/lib/site-content";
import type { News } from "@/payload-types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getNewsroomPageContent();
  return toNextMetadata(content.meta);
}

export default async function NewsroomPage() {
  const pageContent = await getNewsroomPageContent();
  let items: News[] = [];
  let dbError = false;

  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "news",
      where: { _status: { equals: "published" } },
      sort: "-publishedAt",
      depth: 1,
    });
    items = result.docs as News[];
  } catch {
    dbError = true;
  }

  return (
    <main>
      <JsonLdScript schemaJson={pageContent.meta.schemaJson} />
      <NavigationBar />

      <section className="relative overflow-hidden">
        <Image
          src={pageContent.hero.imageUrl}
          alt={pageContent.hero.title}
          fill
          className=""
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto flex h-full container items-center px-6 py-12 lg:py-20">
          <div className="max-w-xl">
            {pageContent.hero.eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                {pageContent.hero.eyebrow}
              </p>
            ) : null}
            <h1 className="mt-3 text-[2rem] font-normal leading-[1.15] tracking-[-0.02em] text-white md:text-[2.5rem] lg:text-[2.75rem]">
              {pageContent.hero.title}
            </h1>
            {pageContent.hero.subtitle ? (
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white md:text-base">
                {pageContent.hero.subtitle}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8fb] px-6 py-14 lg:px-10 lg:py-20">
        <div className="container mx-auto">
          {dbError ? (
            <div className="mx-auto max-w-2xl rounded-xl border border-amber-200/80 bg-amber-50 px-6 py-12 text-center shadow-sm">
              <h2 className="text-xl font-medium text-neutral-900">Newsroom is being set up</h2>
              <p className="mt-2 text-sm text-neutral-600">Could not connect to the database.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-xl border border-neutral-200/70 bg-white px-6 py-12 text-center shadow-sm">
              <h2 className="text-xl font-medium text-neutral-900">No news found</h2>
            </div>
          ) : (
            <div className="grid gap-x-14 gap-y-12 md:grid-cols-2">
              {items.map((item) => {
                const imageUrl = getMediaUrl(item.heroImage);
                const { month, day } = formatNewsMonthDay(item.publishedAt);

                return (
                  <Link
                    key={item.id}
                    href={`/newsroom/${item.slug}`}
                    className="group flex items-start gap-4 sm:gap-5"
                  >
                    <div className="w-11 shrink-0 text-primary sm:w-12">
                      <p className="text-[13px] font-medium leading-none">{month || "—"}</p>
                      <p className="mt-1 text-[1.75rem] font-semibold leading-none tracking-[-0.03em] sm:text-[2rem]">
                        {day || "—"}
                      </p>
                    </div>

                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.title}
                        width={400}
                        height={225}
                        className="object-cover w-full sm:w-60"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                        ZerofAI
                      </div>
                    )}

                    <div className="min-w-0 flex-1 pt-0.5">
                      <h2 className="text-[1.05rem] font-semibold leading-snug tracking-[-0.02em] text-[#2b2b2b] transition group-hover:text-primary sm:text-[1.125rem]">
                        {item.title}
                      </h2>
                      <div className="mt-4 h-px w-full bg-primary/35" aria-hidden />
                      <span
                        className="mt-3 inline-flex text-primary transition group-hover:translate-x-1"
                        aria-hidden
                      >
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
