import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RichText } from "@/components/blog/RichText";
import { NavigationBar } from "@/components/Navigation";
import { formatNewsDate, getMediaUrl } from "@/lib/newsroom";
import { getPayloadClient } from "@/lib/payload";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

async function getNewsBySlug(slug: string) {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "news",
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }],
    },
    depth: 2,
    limit: 1,
  });

  return docs[0] ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);

  if (!item) {
    return { title: "News not found | ZerofAI" };
  }

  return {
    title: `${item.title} | ZerofAI Newsroom`,
    description: item.excerpt ?? undefined,
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);

  if (!item) notFound();

  const imageUrl = getMediaUrl(item.heroImage);

  return (
    <main>
      <NavigationBar />

      <article className="container mx-auto px-6 py-10 lg:px-10 lg:py-14">
        <Link
          href="/newsroom"
          className="inline-flex text-sm font-medium text-primary hover:underline"
        >
          ← Back to newsroom
        </Link>

        <header className="mx-auto mt-6">
          {item.publishedAt && (
            <time className="text-xs uppercase tracking-[0.08em] text-neutral-500">
              {formatNewsDate(item.publishedAt)}
            </time>
          )}
          <h1 className="mt-3 text-[2rem] font-normal leading-[1.15] tracking-[-0.02em] text-neutral-900 md:text-[2.5rem]">
            {item.title}
          </h1>
          {item.excerpt && (
            <p className="mt-4 text-lg leading-relaxed text-neutral-600">{item.excerpt}</p>
          )}
        </header>

        {imageUrl && (
          <div className="relative mx-auto mt-8 aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={imageUrl}
              alt={item.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        )}

        <div className="mx-auto mt-10">
          {item.content && <RichText data={item.content} />}
        </div>
      </article>
    </main>
  );
}
