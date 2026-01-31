// Site configuration types for the block-based builder

export interface SiteConfig {
  global: GlobalConfig;
  sections: SectionConfig[];
}

export interface GlobalConfig {
  primary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  template?: "classic" | "nicks";
  // Optional color overrides for nicks template
  header_bar_color?: string;
  header_bar_text_color?: string;
}

export interface SectionConfig {
  id: string;
  type: SectionType;
  enabled: boolean;
  order?: number;
  content?: Record<string, unknown>;
  style?: SectionStyle;
}

export type SectionType =
  | "header"
  | "hero"
  | "trust_badges"
  | "services"
  | "why_choose_us"
  | "about"
  | "reviews"
  | "gallery"
  | "service_area"
  | "contact_form"
  | "cta"
  | "footer";

export interface ContactFormContent {
  headline?: string;
  subheadline?: string;
  button_text?: string;
}

export interface SectionStyle {
  background_color?: string;
  background_image?: string;
  background_overlay?: string;
  text_color?: string;
  padding_top?: string;
  padding_bottom?: string;
  max_width?: string;
}

// Section-specific content types
export interface HeroContent {
  headline?: string;
  subheadline?: string;
  background_image?: string;
  cta_primary_text?: string;
  cta_primary_link?: string;
  cta_secondary_text?: string;
  cta_secondary_link?: string;
  show_rating?: boolean;
  // Nicks template fields
  hero_city?: string;
}

export interface TrustBadgesContent {
  badges?: Array<{
    icon: string;
    text: string;
    subtext?: string;
  }>;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  icon?: string;
  image_url?: string;
  slug?: string;
}

export interface ServicesContent {
  headline?: string;
  subheadline?: string;
  items?: ServiceItem[];
}

export interface AboutContent {
  headline?: string;
  text?: string;
  image_url?: string;
  owner_name?: string;
  years_in_business?: number;
  highlights?: string[];
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  text: string;
  date?: string;
  source?: string;
}

export interface ReviewsContent {
  headline?: string;
  items?: ReviewItem[];
}

export interface GalleryContent {
  headline?: string;
  subheadline?: string;
  images?: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
}

export interface ServiceAreaContent {
  headline?: string;
  subheadline?: string;
  areas?: string[];
  show_map?: boolean;
  center_lat?: number;
  center_lng?: number;
}

export interface CTAContent {
  headline?: string;
  subheadline?: string;
  button_text?: string;
  button_link?: string;
}

export interface HeaderContent {
  nav_links?: Array<{ label: string; href: string }>;
  cta_text?: string;
  logo_url?: string;
  // Nicks template fields
  show_top_bar?: boolean;
  top_bar_text?: string;
  tagline?: string;
}

export interface FooterContent {
  show_hours?: boolean;
  show_contact?: boolean;
  show_social?: boolean;
  social_links?: Record<string, string>;
  copyright_text?: string;
}

// Database row type
export interface Site {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string | null;
  slug: string;
  custom_domain: string | null;
  status: "draft" | "published" | "archived";
  business_name: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  category: string | null;
  place_id: string | null;
  rating: number | null;
  review_count: number | null;
  config: SiteConfig;
  meta_title: string | null;
  meta_description: string | null;
  // Social links and hours
  facebook_url?: string | null;
  instagram_url?: string | null;
  working_hours?: string | null;
  is_24_7?: boolean;
  reviews_link?: string | null;
}

// Props passed to section components
export interface SectionProps<T = Record<string, unknown>> {
  content: T;
  style?: SectionStyle;
  globalConfig: GlobalConfig;
  businessData: {
    business_name: string;
    phone: string | null;
    city: string | null;
    state: string | null;
    rating: number | null;
    review_count: number | null;
  };
}
