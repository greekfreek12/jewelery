# Contractor Growth Platform

A SaaS platform for contractors (plumbers, electricians, HVAC) to manage leads, automate SMS/calls, and collect Google reviews.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system (industrial-utilitarian aesthetic)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Realtime**: Supabase Realtime for inbox updates
- **SMS/Voice**: TextGrid API (Twilio-compatible)
- **Payments**: Stripe (Checkout, Subscriptions)
- **Hosting**: Vercel

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── dashboard/     # Home dashboard
│   │   ├── inbox/         # SMS conversations
│   │   ├── contacts/      # Contact management
│   │   ├── reviews/       # Review requests & campaigns
│   │   └── settings/      # Account settings
│   ├── api/               # API routes (webhooks)
│   └── auth/              # Auth callback
├── components/            # React components
│   ├── layout/           # Sidebar, mobile nav
│   ├── inbox/            # Inbox view, conversation thread
│   ├── contacts/         # Contacts list
│   ├── reviews/          # Reviews dashboard
│   └── settings/         # Settings forms
├── lib/
│   ├── supabase/         # Supabase clients (server, client, middleware)
│   ├── actions/          # Server actions
│   └── utils.ts          # Utility functions
├── hooks/                 # React hooks
└── types/                # TypeScript types
    └── database.ts       # Supabase database types
```

## Database Schema

Main tables:
- `contractors` - Business accounts (linked to auth.users)
- `contacts` - Customer contacts
- `conversations` - SMS threads (one per contact)
- `messages` - Individual SMS messages
- `review_requests` - Review request tracking
- `review_campaigns` - Bulk review blasts
- `analytics_events` - Event logging

See `/supabase/migrations/001_initial_schema.sql` for full schema.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
TEXTGRID_API_KEY=
TEXTGRID_API_SECRET=
```

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
```

## Key Features (V1)

1. **Inbox**: Real-time SMS conversations with push notifications
2. **Call Forwarding**: Forward calls to contractor's cell
3. **Missed Call Auto-Text**: Automatic text when calls are missed
4. **Review System**:
   - Single review requests
   - Rating parsing (1-5)
   - Auto-routing (4-5 → Google link, 1-3 → apology)
   - Drip reminders (Day 3, Day 7)
   - Bulk campaigns (review blasts)
5. **Contacts**: CRM with tags, notes, import
6. **Settings**: Customizable templates, feature toggles

## Design System

- **Primary color**: Slate (#0f172a)
- **Accent color**: Amber (#f59e0b) - "construction orange"
- **Font**: DM Sans
- **Theme**: Industrial-utilitarian, high contrast, mobile-first

CSS classes defined in `globals.css`:
- `.btn-primary`, `.btn-accent`, `.btn-secondary`
- `.card`, `.stat-card`
- `.badge-success`, `.badge-warning`, `.badge-danger`
- `.message-inbound`, `.message-outbound`

## Subscription Model

- $297/month via Stripe
- 14-day free trial
- Feature flags for upsells (AI responses, campaigns)

## Supabase Patterns (IMPORTANT)

### Client Types - Use the Right One

| Client | Location | When to Use |
|--------|----------|-------------|
| `createClient()` | `src/lib/supabase/server.ts` | Server Components with user session (respects RLS) |
| `createServiceClient()` | `src/lib/supabase/server.ts` | Admin pages, bypasses RLS |
| `createApiClient()` | `src/lib/supabase/api-client.ts` | API routes with user session |
| `createApiServiceClient()` | `src/lib/supabase/api-client.ts` | Webhooks, admin APIs (no session, bypasses RLS) |

### RLS (Row Level Security) Rules
- `contractors` table: Users can only see their own row (`auth.uid() = id`)
- Admin override: Use `createServiceClient()` to bypass RLS entirely
- Webhooks have NO user session - always use service client

### Admin Page Pattern
```typescript
// 1. Check auth with regular client
const authClient = await createClient();
const { data: { user } } = await authClient.auth.getUser();
if (!user) redirect("/login");

// 2. Check admin status
const { data: currentUser } = await authClient
  .from("contractors")
  .select("is_admin")
  .eq("id", user.id)
  .single() as { data: { is_admin: boolean } | null };

if (!currentUser?.is_admin) redirect("/dashboard");

// 3. Use service client for actual operations
const supabase = createServiceClient();
const { data } = await supabase.from("contractors").select("*"); // Gets ALL
```

### TypeScript "never" Type Fix
When Supabase returns `never` type, cast the result:
```typescript
const { data } = await supabase
  .from("contractors")
  .select("is_admin")
  .eq("id", id)
  .single() as { data: { is_admin: boolean } | null };
```

### Database Types
- Generated types in `src/types/database.ts`
- Re-run `supabase gen types typescript` after schema changes

## Admin Panel Structure

Admin pages are in `src/app/(admin)/admin/`:
- `/admin` - Dashboard with stats
- `/admin/contractors` - List all contractors
- `/admin/contractors/[id]` - Contractor detail (tabbed: Overview, Settings, Phone, Billing, Activity)

Admin API endpoints in `src/app/api/admin/contractors/[id]/`:
- `route.ts` - GET, PUT, DELETE contractor
- `provision-phone/` - Phone number provisioning
- `extend-trial/` - Extend trial period
- `suspend/` - Suspend/unsuspend account
- `impersonate/` - Generate magic link login
