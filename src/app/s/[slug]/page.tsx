import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { SiteRenderer, DEFAULT_SITE_CONFIG } from "@/components/sites/SiteRenderer";
import type { Site, SiteConfig } from "@/types/site";

interface PageProps {
  params: { slug: string };
}

export default async function SitePage({ params }: PageProps) {
  const { slug } = params;

  // Handle demo route separately
  if (slug === "demo") {
    const { default: DemoPage } = await import("../demo/page");
    return <DemoPage />;
  }

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
    place_id: siteData.place_id,
    rating: siteData.rating,
    review_count: siteData.review_count,
    config: siteData.config as SiteConfig,
    meta_title: siteData.meta_title,
    meta_description: siteData.meta_description,
  };

  return <SiteRenderer site={site} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = params;

  if (slug === "demo") {
    return {
      title: "Demo Site | Contractor Website",
      description: "Demo contractor website template",
    };
  }

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
