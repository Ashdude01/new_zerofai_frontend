import type { Media } from "@/payload-types";
import type {
  BlogPageContent,
  ContactPageContent,
  FaqItem,
  FooterContent,
  KnowledgePageContent,
  LeadershipPageContent,
  NavLink,
  NavigationContent,
  NewsroomPageContent,
  PageHero,
  TeamMember,
} from "@/types/site-content";

import { getMediaUrl } from "@/lib/blog";
import { mapPageSeo } from "@/lib/page-seo";
import {
  blogPageDefaults,
  contactPageDefaults,
  footerDefaults,
  knowledgePageDefaults,
  leadershipPageDefaults,
  navigationDefaults,
  newsroomPageDefaults,
} from "@/lib/site-defaults";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { getPayloadClient } from "@/lib/payload";

function resolveUploadUrl(
  media: number | Media | null | undefined,
  fallback: string,
): string {
  return getMediaUrl(media) ?? fallback;
}

function mapAnchorLink(
  item: Record<string, unknown>,
  fallback?: NavLink,
): NavLink {
  const href = ((item.href as string) || fallback?.href || "").replace(/^#/, "");
  return {
    label: (item.label as string) || fallback?.label || "",
    href,
    type: "anchor",
  };
}

function mapRouteLink(
  item: Record<string, unknown>,
  fallback?: NavLink,
): NavLink {
  const href = (item.href as string) || fallback?.href || "";
  return {
    label: (item.label as string) || fallback?.label || "",
    href: href.startsWith("/") ? href : `/${href}`,
    type: "route",
    showOnHomepage:
      typeof item.showOnHomepage === "boolean"
        ? item.showOnHomepage
        : fallback?.showOnHomepage ?? true,
  };
}

function dedupeNavLinks(links: NavLink[]): NavLink[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = `${link.type}:${link.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mapHero(
  hero: Record<string, unknown> | undefined,
  defaults: PageHero,
): PageHero {
  const data = hero ?? {};
  return {
    eyebrow: (data.eyebrow as string) || defaults.eyebrow,
    title: (data.title as string) || defaults.title,
    subtitle: (data.subtitle as string) || defaults.subtitle,
    imageUrl: resolveUploadUrl(
      data.image as number | Media | null | undefined,
      (data.imageUrl as string) || defaults.imageUrl,
    ),
  };
}

function mapNavigationFromCms(data: Record<string, unknown>): NavigationContent {
  return {
    logoUrl: resolveUploadUrl(
      data.logo as number | Media | null | undefined,
      (data.logoUrl as string) || navigationDefaults.logoUrl,
    ),
    homeSectionLinks: dedupeNavLinks(
      Array.isArray(data.homeSectionLinks) && data.homeSectionLinks.length > 0
        ? data.homeSectionLinks
            .map((item, index) =>
              mapAnchorLink(
                item as Record<string, unknown>,
                navigationDefaults.homeSectionLinks[index],
              ),
            )
            .filter((link) => link.href && !link.href.startsWith("/"))
        : navigationDefaults.homeSectionLinks,
    ),
    routeLinks: dedupeNavLinks(
      Array.isArray(data.routeLinks) && data.routeLinks.length > 0
        ? data.routeLinks.map((item, index) =>
            mapRouteLink(item as Record<string, unknown>, navigationDefaults.routeLinks[index]),
          )
        : navigationDefaults.routeLinks,
    ),
  };
}

function mapFooterFromCms(data: Record<string, unknown>): FooterContent {
  return {
    logoUrl: resolveUploadUrl(
      data.logo as number | Media | null | undefined,
      (data.logoUrl as string) || footerDefaults.logoUrl,
    ),
    description: (data.description as string) || footerDefaults.description,
    columns:
      Array.isArray(data.columns) && data.columns.length > 0
        ? data.columns.map((col, colIndex) => {
            const column = col as {
              title?: string;
              links?: { label?: string; href?: string }[];
            };
            const fallbackCol = footerDefaults.columns[colIndex];
            return {
              title: column.title || fallbackCol?.title || "",
              links:
                Array.isArray(column.links) && column.links.length > 0
                  ? column.links.map((link, linkIndex) => ({
                      label:
                        link.label || fallbackCol?.links[linkIndex]?.label || "",
                      href: link.href || fallbackCol?.links[linkIndex]?.href || "#",
                    }))
                  : fallbackCol?.links ?? [],
            };
          })
        : footerDefaults.columns,
    demoTitle: (data.demoTitle as string) || footerDefaults.demoTitle,
    copyright: (data.copyright as string) || footerDefaults.copyright,
  };
}

function mapContactPageFromCms(data: Record<string, unknown>): ContactPageContent {
  const hero = (data.hero ?? {}) as Record<string, unknown>;
  const meta = (data.meta ?? {}) as Record<string, unknown>;
  return {
    meta: mapPageSeo(meta, contactPageDefaults.meta),
    hero: mapHero(hero, contactPageDefaults.hero),
    address: (data.address as string) || contactPageDefaults.address,
    email: (data.email as string) || contactPageDefaults.email,
    mapAddress: (data.mapAddress as string) || contactPageDefaults.mapAddress,
    formSubmitLabel:
      (data.formSubmitLabel as string) || contactPageDefaults.formSubmitLabel,
    formSuccessMessage:
      (data.formSuccessMessage as string) || contactPageDefaults.formSuccessMessage,
  };
}

function mapTeamMember(
  item: Record<string, unknown>,
  fallback?: TeamMember,
): TeamMember {
  return {
    name: (item.name as string) || fallback?.name || "",
    designation: (item.designation as string) || fallback?.designation || "",
    imageUrl: resolveUploadUrl(
      item.image as number | Media | null | undefined,
      (item.imageUrl as string) || fallback?.imageUrl || "",
    ),
  };
}

function mapLeadershipPageFromCms(data: Record<string, unknown>): LeadershipPageContent {
  const hero = (data.hero ?? {}) as Record<string, unknown>;
  const meta = (data.meta ?? {}) as Record<string, unknown>;
  return {
    meta: mapPageSeo(meta, leadershipPageDefaults.meta),
    hero: mapHero(hero, leadershipPageDefaults.hero),
    members:
      Array.isArray(data.members) && data.members.length > 0
        ? data.members.map((item, index) =>
            mapTeamMember(
              item as Record<string, unknown>,
              leadershipPageDefaults.members[index],
            ),
          )
        : leadershipPageDefaults.members,
  };
}

function mapFaqItem(item: Record<string, unknown>, fallback?: FaqItem): FaqItem {
  return {
    id: (item.id as string) || fallback?.id || "",
    question: (item.question as string) || fallback?.question || "",
    answer: (item.answer as string) || fallback?.answer || "",
  };
}

function mapKnowledgePageFromCms(data: Record<string, unknown>): KnowledgePageContent {
  const hero = (data.hero ?? {}) as Record<string, unknown>;
  const meta = (data.meta ?? {}) as Record<string, unknown>;
  return {
    meta: mapPageSeo(meta, knowledgePageDefaults.meta),
    hero: mapHero(hero, knowledgePageDefaults.hero),
    faqs:
      Array.isArray(data.faqs) && data.faqs.length > 0
        ? data.faqs.map((item, index) =>
            mapFaqItem(item as Record<string, unknown>, knowledgePageDefaults.faqs[index]),
          )
        : knowledgePageDefaults.faqs,
    ctaTitle: (data.ctaTitle as string) || knowledgePageDefaults.ctaTitle,
    ctaDescription:
      (data.ctaDescription as string) || knowledgePageDefaults.ctaDescription,
    ctaButtonLabel:
      (data.ctaButtonLabel as string) || knowledgePageDefaults.ctaButtonLabel,
    ctaButtonLink:
      (data.ctaButtonLink as string) || knowledgePageDefaults.ctaButtonLink,
    introContent: (data.introContent as KnowledgePageContent["introContent"]) ?? null,
  };
}

function mapBlogPageFromCms(data: Record<string, unknown>): BlogPageContent {
  const hero = (data.hero ?? {}) as Record<string, unknown>;
  const meta = (data.meta ?? {}) as Record<string, unknown>;
  return {
    meta: mapPageSeo(meta, blogPageDefaults.meta),
    hero: mapHero(hero, blogPageDefaults.hero),
  };
}

function mapNewsroomPageFromCms(data: Record<string, unknown>): NewsroomPageContent {
  const hero = (data.hero ?? {}) as Record<string, unknown>;
  const meta = (data.meta ?? {}) as Record<string, unknown>;
  return {
    meta: mapPageSeo(meta, newsroomPageDefaults.meta),
    hero: mapHero(hero, newsroomPageDefaults.hero),
  };
}

/**
 * Each CMS global is cached across requests for 60s (unstable_cache) and
 * deduped within a single request (React cache()). This removes the Postgres
 * round trip from the critical path while leaving the routes dynamic — marking
 * them ISR instead sends `next dev` into a rebuild-and-reload loop.
 *
 * To make a CMS edit appear immediately, call revalidateTag("<tag>") from the
 * matching Payload afterChange hook.
 */
const fetchNavigationContent = unstable_cache(
  async (): Promise<NavigationContent> => {
    try {
      const payload = await getPayloadClient();
      const data = await payload.findGlobal({ slug: "site-navigation", depth: 2 });
      return mapNavigationFromCms(data as Record<string, unknown>);
    } catch {
      return navigationDefaults;
    }
  },
  ["site-navigation-global"],
  { revalidate: 60, tags: ["navigation"] },
);

export const getNavigationContent = cache(async (): Promise<NavigationContent> => fetchNavigationContent());

const fetchFooterContent = unstable_cache(
  async (): Promise<FooterContent> => {
    try {
      const payload = await getPayloadClient();
      const data = await payload.findGlobal({ slug: "site-footer", depth: 2 });
      return mapFooterFromCms(data as Record<string, unknown>);
    } catch {
      return footerDefaults;
    }
  },
  ["site-footer-global"],
  { revalidate: 60, tags: ["footer"] },
);

export const getFooterContent = cache(async (): Promise<FooterContent> => fetchFooterContent());

const fetchContactPageContent = unstable_cache(
  async (): Promise<ContactPageContent> => {
    try {
      const payload = await getPayloadClient();
      const data = await payload.findGlobal({ slug: "contact-page", depth: 2 });
      return mapContactPageFromCms(data as Record<string, unknown>);
    } catch {
      return contactPageDefaults;
    }
  },
  ["contact-page-global"],
  { revalidate: 60, tags: ["contact-page"] },
);

export const getContactPageContent = cache(async (): Promise<ContactPageContent> => fetchContactPageContent());

const fetchLeadershipPageContent = unstable_cache(
  async (): Promise<LeadershipPageContent> => {
    try {
      const payload = await getPayloadClient();
      const data = await payload.findGlobal({ slug: "leadership-page", depth: 2 });
      return mapLeadershipPageFromCms(data as Record<string, unknown>);
    } catch {
      return leadershipPageDefaults;
    }
  },
  ["leadership-page-global"],
  { revalidate: 60, tags: ["leadership-page"] },
);

export const getLeadershipPageContent = cache(async (): Promise<LeadershipPageContent> => fetchLeadershipPageContent());

const fetchKnowledgePageContent = unstable_cache(
  async (): Promise<KnowledgePageContent> => {
    try {
      const payload = await getPayloadClient();
      const data = await payload.findGlobal({ slug: "knowledge-page", depth: 2 });
      return mapKnowledgePageFromCms(data as Record<string, unknown>);
    } catch {
      return knowledgePageDefaults;
    }
  },
  ["knowledge-page-global"],
  { revalidate: 60, tags: ["knowledge-page"] },
);

export const getKnowledgePageContent = cache(async (): Promise<KnowledgePageContent> => fetchKnowledgePageContent());

const fetchBlogPageContent = unstable_cache(
  async (): Promise<BlogPageContent> => {
    try {
      const payload = await getPayloadClient();
      const data = await payload.findGlobal({ slug: "blog-page", depth: 2 });
      return mapBlogPageFromCms(data as Record<string, unknown>);
    } catch {
      return blogPageDefaults;
    }
  },
  ["blog-page-global"],
  { revalidate: 60, tags: ["blog-page"] },
);

export const getBlogPageContent = cache(async (): Promise<BlogPageContent> => fetchBlogPageContent());

const fetchNewsroomPageContent = unstable_cache(
  async (): Promise<NewsroomPageContent> => {
    try {
      const payload = await getPayloadClient();
      const data = await payload.findGlobal({ slug: "newsroom-page", depth: 2 });
      return mapNewsroomPageFromCms(data as Record<string, unknown>);
    } catch {
      return newsroomPageDefaults;
    }
  },
  ["newsroom-page-global"],
  { revalidate: 60, tags: ["newsroom-page"] },
);

export const getNewsroomPageContent = cache(
  async (): Promise<NewsroomPageContent> => fetchNewsroomPageContent(),
);

export function buildMapEmbedUrl(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}
