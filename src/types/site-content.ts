import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import type { PageSeo } from "@/types/page-seo";

export type NavLink = {
  label: string;
  href: string;
  type: "route" | "anchor";
  showOnHomepage?: boolean;
};

export type NavigationContent = {
  logoUrl: string;
  homeSectionLinks: NavLink[];
  routeLinks: NavLink[];
};

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export type FooterContent = {
  logoUrl: string;
  description: string;
  columns: FooterColumn[];
  demoTitle: string;
  copyright: string;
};

export type PageHero = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
};

export type ContactPageContent = {
  meta: PageSeo;
  hero: PageHero;
  address: string;
  email: string;
  mapAddress: string;
  formSubmitLabel: string;
  formSuccessMessage: string;
};

export type TeamMember = {
  name: string;
  designation: string;
  imageUrl: string;
};

export type LeadershipPageContent = {
  meta: PageSeo;
  hero: PageHero;
  members: TeamMember[];
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type KnowledgePageContent = {
  meta: PageSeo;
  hero: PageHero;
  introContent?: SerializedEditorState | null;
  faqs: FaqItem[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonLabel: string;
  ctaButtonLink: string;
};

export type BlogPageContent = {
  meta: PageSeo;
  hero: PageHero;
};

export type NewsroomPageContent = {
  meta: PageSeo;
  hero: PageHero;
};
