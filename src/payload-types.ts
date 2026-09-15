import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

export interface Media {
  id: number;
  alt: string;
  caption?: string | null;
  prefix?: string | null;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  heroImage?: number | Media | null;
  content?: SerializedEditorState | null;
  tags?: { tag?: string | null; id?: string | null }[] | null;
  publishedAt?: string | null;
  meta?: {
    title?: string | null;
    description?: string | null;
    image?: number | Media | null;
  } | null;
  _status?: "draft" | "published" | null;
  createdAt: string;
  updatedAt: string;
}

export interface News {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  heroImage?: number | Media | null;
  content?: SerializedEditorState | null;
  publishedAt?: string | null;
  meta?: {
    title?: string | null;
    description?: string | null;
    image?: number | Media | null;
  } | null;
  _status?: "draft" | "published" | null;
  createdAt: string;
  updatedAt: string;
}
