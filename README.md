# Stayin Bangalore 🏠

A modern full-stack housing discovery platform for Bangalore — find PGs, apartments, shared flats, and short-term stays with map view, smart filters, real reviews, and flatmate matching.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (credentials + Google OAuth)
- **Maps**: Mapbox GL JS
- **Validation**: Zod

## Features

- 🗺️ **Map + List View** — toggle between map and grid, with user location support
- 🔍 **Smart Filters** — stay type, budget, area, AC, food, gender, furnishing
- 🧭 **Preference Flow** — guided onboarding to find the right listing
- ⭐ **Reviews & Ratings** — verified resident reviews with star ratings
- 💬 **Community Comments** — concerns tagged by type (safety, cleanliness, etc.)
- ❤️ **Save Listings** — bookmark properties for later
- 👥 **Flatmate Finder** — post and browse flatmate requests
- 🛡️ **Admin Dashboard** — manage listings, reports, and users
- 🔐 **Auth** — email/password + Google OAuth

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/ihy-adi/Stayin-Bangalore.git
cd Stayin-Bangalore
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in `.env`:
- `DATABASE_URL` — your PostgreSQL connection string
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32`
- `NEXT_PUBLIC_MAPBOX_TOKEN` — from [Mapbox](https://account.mapbox.com/)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional, from Google Cloud Console

### 3. Set up the database

```bash
npx prisma migrate dev --name init   # runs migrations
npm run db:seed                       # seeds 10 Bangalore listings
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo credentials

| Role  | Email              | Password   |
|-------|--------------------|------------|
| User  | demo@stayin.in     | user1234   |
| Admin | admin@stayin.in    | admin123   |

## Project Structure

```
app/
├── (auth)/          # Login & signup pages
├── api/             # API routes
├── admin/           # Admin dashboard
├── explore/         # Map + list explore page
├── flatmates/       # Flatmate finder
├── listings/[id]/   # Property detail page
├── profile/         # User profile
└── saved/           # Saved listings

components/
├── admin/           # Admin-only components
├── flatmates/       # FlatmateCard
├── layout/          # Navbar, Footer
├── listings/        # ListingCard, ListingFilters
├── map/             # MapView (Mapbox)
├── onboarding/      # PreferenceFlow
├── reviews/         # ReviewSection
└── ui/              # Button, Badge, Input, StarRating

prisma/
├── schema.prisma    # Full data model
└── seed.ts          # 10 realistic Bangalore listings
```

## Seed Data

Includes realistic listings from:
- Koramangala (PG, women-only)
- HSR Layout (modern studio)
- Indiranagar (shared flat)
- Whitefield (budget PG near ITPL)
- Marathahalli (luxury service apartment)
- Electronic City (women-only PG)
- BTM Layout (studio)
- Sarjapur Road (premium PG)
- Bellandur (1BHK near Ecospace)
- Jayanagar (affordable PG)

## Useful Commands

```bash
npm run dev          # Start dev server
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:seed      # Re-seed the database
npm run db:reset     # Reset and re-seed
npx prisma generate  # Re-generate Prisma client after schema changes
```

## Deployment

Deploy on **Vercel** (recommended):
1. Push to GitHub
2. Connect repo on vercel.com
3. Add env vars in Vercel dashboard
4. Use **Supabase** or **Neon** for hosted PostgreSQL

---

Built for Bangaloreans 🌆
