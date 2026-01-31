import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { SiteRenderer, DEFAULT_SITE_CONFIG } from "@/components/sites/SiteRenderer";
import type { Site, SiteConfig } from "@/types/site";

interface PageProps {
  params: { slug: string };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SitePage({ params }: PageProps) {
  const { slug } = params;

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    notFound();
  }

  // Cast the data to our Site type
  const siteData = data as any;
  const site: Site = {
    id: siteData.id,
    created_at: siteData.created_at,
    updated_at: siteData.updated_at,
    lead_id: siteData.lead_id,
    slug: siteData.slug,
    custom_domain: siteData.custom_domain,
    status: siteData.status,
    business_name: siteData.business_name,
    phone: siteData.phone,
    city: siteData.city,
    state: siteData.state,
    category: siteData.category,
    place_id: siteData.place_id,
    rating: siteData.rating,
    review_count: siteData.review_count,
    config: siteData.config as SiteConfig,
    meta_title: siteData.meta_title,
    meta_description: siteData.meta_description,
    // Social/hours fields
    facebook_url: siteData.facebook_url,
    instagram_url: siteData.instagram_url,
    working_hours: siteData.working_hours,
    is_24_7: siteData.is_24_7,
    reviews_link: siteData.reviews_link,
  };

  return <SiteRenderer site={site} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = params;

  const supabase = createServiceClient();

  const { data } = await supabase
    .from("sites")
    .select("business_name, meta_title, meta_description, city, state")
    .eq("slug", slug)
    .single();

  if (!data) {
    return { title: "Not Found" };
  }

  const siteData = data as { business_name: string; meta_title: string | null; meta_description: string | null; city: string; state: string };

  return {
    title: siteData.meta_title ?? `${siteData.business_name} | ${siteData.city}, ${siteData.state}`,
    description: siteData.meta_description ?? `Professional plumbing services in ${siteData.city}, ${siteData.state}`,
  };
}
