import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ["/dashboard", "/inbox", "/contacts", "/reviews", "/settings"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Check subscription status for protected routes
  if (isProtectedPath && user) {
    const { data: contractor, error: contractorError } = await supabase
      .from("contractors")
      .select("subscription_status, is_admin")
      .eq("id", user.id)
      .single();

    // DEBUG: Log what we're getting
    console.log("[Middleware] User ID:", user.id);
    console.log("[Middleware] Contractor data:", contractor);
    console.log("[Middleware] Contractor error:", contractorError);

    // Admins bypass subscription check
    if (contractor?.is_admin) {
      console.log("[Middleware] Admin detected, bypassing subscription check");
      return supabaseResponse;
    }

    const activeStatuses = ["trialing", "active"];
    const hasActiveSubscription = contractor && activeStatuses.includes(contractor.subscription_status || "");

    console.log("[Middleware] Has active subscription:", hasActiveSubscription);

    // Allow settings page for billing management
    if (!hasActiveSubscription && !request.nextUrl.pathname.startsWith("/settings")) {
      console.log("[Middleware] Redirecting to pricing - no active subscription");
      const url = request.nextUrl.clone();
      url.pathname = "/pricing";
      url.searchParams.set("subscription", "required");
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ["/login", "/signup"];
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPath && user) {
    // Check if user is admin and redirect accordingly
    const { data: userData } = await supabase
      .from("contractors")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = userData?.is_admin ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  // Admin routes - check for admin role
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    // TODO: Check for admin role in user metadata or contractors table
  }

  return supabaseResponse;
}
