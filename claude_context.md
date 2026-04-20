# Claude Context — Stayin Bangalore

## What this project is
A full-stack housing discovery web app for Bangalore. Users can find PGs, apartments, shared flats, and temporary stays. Built with Next.js 14, Prisma, Supabase, and NextAuth.

## GitHub
https://github.com/ihy-adi/Stayin-Bangalore.git

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (custom brand color: brand-600 red-ish)
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Auth**: NextAuth.js — credentials (email/password) + Google OAuth
- **Maps**: Mapbox GL JS (token needed, currently empty — considering switching to Leaflet)
- **Validation**: Zod on all API routes

## Project Location
`/Users/negia2/Desktop/personal/findmeaplacetostay/`

## Database
- Hosted on **Supabase** (project: stayin-bangalore)
- Connection pooling via pgBouncer (`DATABASE_URL`)
- Direct connection for migrations (`DIRECT_URL`)
- Prisma migrations folder: `prisma/migrations/`

## Demo Credentials
| Role  | Email           | Password  |
|-------|-----------------|-----------|
| User  | demo@stayin.in  | user1234  |
| Admin | admin@stayin.in | admin123  |

## Pages
| Route | Description |
|---|---|
| `/` | Home — hero, area pills, featured listings, flatmate CTA |
| `/explore` | Map + list toggle, sticky filters, sort options |
| `/listings/[id]` | Property detail — gallery, amenities, contact card, reviews |
| `/flatmates` | Browse and post flatmate requests |
| `/login` | Email + Google OAuth login |
| `/signup` | Register new account |
| `/saved` | Bookmarked listings (auth required) |
| `/profile` | User profile page |
| `/admin` | Admin dashboard — stats, listing table |
| `/admin/listings/new` | Create new listing |
| `/admin/listings/[id]/edit` | Edit existing listing |

## API Routes
| Route | Methods | Description |
|---|---|---|
| `/api/listings` | GET, POST | List/filter listings, create new |
| `/api/listings/[id]` | GET, PATCH, DELETE | Single listing CRUD |
| `/api/reviews` | POST | Submit a review |
| `/api/comments` | POST | Submit a community comment |
| `/api/flatmates` | GET, POST | Flatmate posts |
| `/api/saved` | GET, POST, DELETE | Save/unsave listings |
| `/api/auth/register` | POST | Register new user |
| `/api/admin/listings` | GET | Admin: all listings |

## Database Models
- **User** — id, name, email, password, role (USER/ADMIN), phone, bio
- **Property** — full listing with stayType, area, lat/lng, price, deposit, amenities, etc.
- **PropertyImage** — images linked to a property
- **Amenity** — Wi-Fi, AC, Parking, etc. (16 total seeded)
- **PropertyAmenity** — many-to-many join
- **Review** — rating (1-5), body, hasLivedThere, linked to user + property
- **Comment** — community note with optional concernType (SAFETY, CLEANLINESS, etc.)
- **ConcernReport** — abuse/flag reports on listings or comments
- **SavedListing** — user bookmarks (userId + propertyId composite key)
- **FlatmatePost** — flatmate requests with genderPref, budgetShare, moveInDate, bio

## Enums
- `StayType`: PG, APARTMENT, TEMPORARY, SHARED_FLAT
- `RoomType`: PRIVATE, SHARED
- `FurnishedStatus`: FURNISHED, SEMI_FURNISHED, UNFURNISHED
- `GenderPref`: MALE, FEMALE, ANY
- `ConcernType`: CLEANLINESS, SAFETY, FOOD_QUALITY, HIDDEN_CHARGES, MISLEADING_PHOTOS, NOISE, OWNER_BEHAVIOR, OTHER
- `UserRole`: USER, ADMIN

## Seed Data
10 real Bangalore listings across:
Koramangala, HSR Layout, Indiranagar, Whitefield, Marathahalli, Electronic City, BTM Layout, Sarjapur Road, Bellandur, Jayanagar

## Key Components
- `components/listings/ListingCard.tsx` — property card with save toggle
- `components/listings/ListingFilters.tsx` — sticky filter bar with expanded panel
- `components/map/MapView.tsx` — Mapbox map with price markers and popup cards
- `components/onboarding/PreferenceFlow.tsx` — 5-step guided preference modal
- `components/reviews/ReviewSection.tsx` — reviews + community comments with tabs
- `components/flatmates/FlatmateCard.tsx` — flatmate post card
- `components/admin/ListingForm.tsx` — full listing create/edit form
- `components/layout/Navbar.tsx` — sticky nav with user menu dropdown
- `components/layout/Footer.tsx` — footer with area links

## Commands
```bash
npm run dev           # start dev server → localhost:3000
npm run db:seed       # seed 10 Bangalore listings
npm run db:studio     # open Prisma Studio (DB GUI)
npx prisma migrate dev --name <name>  # run new migration
git push              # push to GitHub
```

## Pending / Next Steps
- [ ] Switch map from Mapbox to Leaflet (no token needed, free, open source)
- [ ] Add Google Places API scraper to pull real Bangalore PG data
- [ ] Add image upload (currently using image URLs — consider Cloudinary or Supabase Storage)
- [ ] Add move-in date filter
- [ ] Add distance filter using user's GPS location
- [ ] Deploy to Vercel + connect Supabase
- [ ] Add email notifications (e.g. when someone contacts owner)
- [ ] Admin: review flagged reports UI
- [ ] SEO: add sitemap, og:image, structured data

## Known Issues / Decisions Made
- Map requires `NEXT_PUBLIC_MAPBOX_TOKEN` — currently blank, map shows loading state
- Considering switching to Leaflet (free, no token, scales fine)
- Images are stored as URLs (Unsplash for seed data) — production needs cloud storage
- `tsconfig.seed.json` added separately because zsh strips quotes from JSON in npm scripts
- `.env` uses both `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) for Supabase + Prisma
