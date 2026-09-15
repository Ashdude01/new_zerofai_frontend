import * as migration_20260522_183457_initial from "./20260522_183457_initial";
import * as migration_20260527_add_media_prefix from "./20260527_add_media_prefix";
import * as migration_20260610_homepage_global from "./20260610_homepage_global";
import * as migration_20260611_site_content_globals from "./20260611_site_content_globals";
import * as migration_20260612_homepage_cms_fields from "./20260612_homepage_cms_fields";
import * as migration_20260613_homepage_schema_fix from "./20260613_homepage_schema_fix";
import * as migration_20260614_page_seo_meta from "./20260614_page_seo_meta";
import * as migration_20260615_site_footer_schema_fix from "./20260615_site_footer_schema_fix";
import * as migration_20260616_knowledge_page_intro_content from "./20260616_knowledge_page_intro_content";
import * as migration_20260617_blog_page_global from "./20260617_blog_page_global";
import * as migration_20260618_nav_route_show_on_homepage from "./20260618_nav_route_show_on_homepage";
import * as migration_20260710_homepage_hero_mobile_video from "./20260710_homepage_hero_mobile_video";
import * as migration_20260725_homepage_hero_images from "./20260725_homepage_hero_images";
import * as migration_20260915_newsroom from "./20260915_newsroom";

export const migrations = [
  {
    up: migration_20260522_183457_initial.up,
    down: migration_20260522_183457_initial.down,
    name: "20260522_183457_initial",
  },
  {
    up: migration_20260527_add_media_prefix.up,
    down: migration_20260527_add_media_prefix.down,
    name: "20260527_add_media_prefix",
  },
  {
    up: migration_20260610_homepage_global.up,
    down: migration_20260610_homepage_global.down,
    name: "20260610_homepage_global",
  },
  {
    up: migration_20260611_site_content_globals.up,
    down: migration_20260611_site_content_globals.down,
    name: "20260611_site_content_globals",
  },
  {
    up: migration_20260612_homepage_cms_fields.up,
    down: migration_20260612_homepage_cms_fields.down,
    name: "20260612_homepage_cms_fields",
  },
  {
    up: migration_20260613_homepage_schema_fix.up,
    down: migration_20260613_homepage_schema_fix.down,
    name: "20260613_homepage_schema_fix",
  },
  {
    up: migration_20260614_page_seo_meta.up,
    down: migration_20260614_page_seo_meta.down,
    name: "20260614_page_seo_meta",
  },
  {
    up: migration_20260615_site_footer_schema_fix.up,
    down: migration_20260615_site_footer_schema_fix.down,
    name: "20260615_site_footer_schema_fix",
  },
  {
    up: migration_20260616_knowledge_page_intro_content.up,
    down: migration_20260616_knowledge_page_intro_content.down,
    name: "20260616_knowledge_page_intro_content",
  },
  {
    up: migration_20260617_blog_page_global.up,
    down: migration_20260617_blog_page_global.down,
    name: "20260617_blog_page_global",
  },
  {
    up: migration_20260618_nav_route_show_on_homepage.up,
    down: migration_20260618_nav_route_show_on_homepage.down,
    name: "20260618_nav_route_show_on_homepage",
  },
  {
    up: migration_20260710_homepage_hero_mobile_video.up,
    down: migration_20260710_homepage_hero_mobile_video.down,
    name: "20260710_homepage_hero_mobile_video",
  },
  {
    up: migration_20260725_homepage_hero_images.up,
    down: migration_20260725_homepage_hero_images.down,
    name: "20260725_homepage_hero_images",
  },
  {
    up: migration_20260915_newsroom.up,
    down: migration_20260915_newsroom.down,
    name: "20260915_newsroom",
  },
];
