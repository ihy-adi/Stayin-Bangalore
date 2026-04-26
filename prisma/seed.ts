import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const AMENITY_LIST = [
  { name: 'Wi-Fi', category: 'Connectivity' },
  { name: 'AC', category: 'Comfort' },
  { name: 'Laundry', category: 'Utilities' },
  { name: 'Parking', category: 'Facilities' },
  { name: 'Power Backup', category: 'Utilities' },
  { name: 'Security', category: 'Safety' },
  { name: 'Attached Bathroom', category: 'Room' },
  { name: 'Wardrobe', category: 'Room' },
  { name: 'Study Table', category: 'Room' },
  { name: 'Gym', category: 'Facilities' },
  { name: 'Swimming Pool', category: 'Facilities' },
  { name: 'CCTV', category: 'Safety' },
  { name: 'Housekeeping', category: 'Services' },
  { name: 'Water Purifier', category: 'Utilities' },
  { name: 'Microwave', category: 'Kitchen' },
  { name: 'Refrigerator', category: 'Kitchen' },
]

function makeSlug(title: string, i: number) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + `-${i}`
}

const LISTINGS = [
  {
    title: 'Cozy PG in the Heart of Koramangala',
    description:
      'Well-maintained paying guest accommodation steps from top restaurants and cafes in Koramangala 5th Block. Ideal for working professionals and students. High-speed Wi-Fi, daily housekeeping, and home-cooked vegetarian meals included.',
    propertyType: 'PG' as const,
    addressLine1: '45, 5th Block, Koramangala',
    area: 'Koramangala',
    latitude: 12.9347,
    longitude: 77.6245,
    rentAmount: 12000,
    depositAmount: 24000,
    roomType: 'PRIVATE' as const,
    hasAc: true,
    furnishing: 'FULLY_FURNISHED' as const,
    foodIncluded: true,
    genderPreference: 'FEMALE' as const,
    amenities: ['Wi-Fi', 'AC', 'Attached Bathroom', 'Wardrobe', 'Housekeeping', 'Water Purifier'],
    media: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    ],
  },
  {
    title: 'Modern Studio Apartment — HSR Layout',
    description:
      'Bright, fully furnished studio apartment in sector 1, HSR Layout. 5-minute walk to HSR BDA Complex. Perfect for solo professionals. Building has 24/7 security, power backup, and covered parking.',
    propertyType: 'APARTMENT' as const,
    addressLine1: '12, Sector 1, HSR Layout',
    area: 'HSR Layout',
    latitude: 12.9116,
    longitude: 77.6389,
    rentAmount: 18000,
    depositAmount: 54000,
    roomType: 'PRIVATE' as const,
    hasAc: true,
    furnishing: 'FULLY_FURNISHED' as const,
    foodIncluded: false,
    genderPreference: 'ANY' as const,
    amenities: ['Wi-Fi', 'AC', 'Parking', 'Power Backup', 'Security', 'CCTV', 'Refrigerator'],
    media: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    ],
  },
  {
    title: 'Spacious 2BHK for Flatmates — Indiranagar',
    description:
      'Beautiful 2BHK on the 3rd floor of a gated society in Indiranagar 12th Main. One room is vacant — ideal for a working professional. Common living area, modular kitchen, and great connectivity to MG Road metro.',
    propertyType: 'FLAT' as const,
    addressLine1: '78, 12th Main, Indiranagar',
    area: 'Indiranagar',
    latitude: 12.9784,
    longitude: 77.6408,
    rentAmount: 14000,
    depositAmount: 42000,
    roomType: 'PRIVATE' as const,
    hasAc: true,
    furnishing: 'SEMI_FURNISHED' as const,
    foodIncluded: false,
    genderPreference: 'ANY' as const,
    amenities: ['Wi-Fi', 'AC', 'Parking', 'Power Backup', 'Security', 'Wardrobe', 'Study Table'],
    media: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800',
    ],
  },
  {
    title: 'Budget PG near Whitefield IT Park',
    description:
      'Affordable paying guest accommodation, just 2 km from ITPL and EPIP Zone. Shared rooms with clean facilities. Regular shuttle service available. Meals can be opted for separately. Great for freshers joining IT companies.',
    propertyType: 'PG' as const,
    addressLine1: '33, EPIP Zone, Whitefield',
    area: 'Whitefield',
    latitude: 12.9698,
    longitude: 77.7499,
    rentAmount: 7500,
    depositAmount: 15000,
    roomType: 'SHARED' as const,
    hasAc: false,
    furnishing: 'FULLY_FURNISHED' as const,
    foodIncluded: true,
    genderPreference: 'MALE' as const,
    amenities: ['Wi-Fi', 'Laundry', 'Security', 'Water Purifier', 'CCTV'],
    media: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    ],
  },
  {
    title: 'Luxury Service Apartment — Marathahalli',
    description:
      'Hotel-style service apartment for short-term and medium-term stays. Fully serviced with daily housekeeping, linen change, and 24/7 reception. Ideal for business trips, project-based relocations, or while house hunting.',
    propertyType: 'SERVICE_APARTMENT' as const,
    addressLine1: '18, Outer Ring Road, Marathahalli',
    area: 'Marathahalli',
    latitude: 12.9591,
    longitude: 77.7011,
    rentAmount: 25000,
    depositAmount: 25000,
    roomType: 'PRIVATE' as const,
    hasAc: true,
    furnishing: 'FULLY_FURNISHED' as const,
    foodIncluded: true,
    genderPreference: 'ANY' as const,
    amenities: ['Wi-Fi', 'AC', 'Parking', 'Power Backup', 'Security', 'Housekeeping', 'Gym', 'CCTV', 'Microwave', 'Refrigerator'],
    media: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    ],
  },
  {
    title: 'Women-Only PG — Electronic City Phase 1',
    description:
      'Safe, well-managed women-only PG near Electronic City Phase 1 tech park. Warden on premises 24/7. Nutritious home food (veg), AC rooms, and CCTV on all floors. Many residents from Infosys and Wipro.',
    propertyType: 'PG' as const,
    addressLine1: '9, Phase 1, Electronic City',
    area: 'Electronic City',
    latitude: 12.8458,
    longitude: 77.6634,
    rentAmount: 9500,
    depositAmount: 19000,
    roomType: 'SHARED' as const,
    hasAc: true,
    furnishing: 'FULLY_FURNISHED' as const,
    foodIncluded: true,
    genderPreference: 'FEMALE' as const,
    amenities: ['Wi-Fi', 'AC', 'Laundry', 'Security', 'CCTV', 'Water Purifier', 'Housekeeping'],
    media: [
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800',
    ],
  },
  {
    title: 'Trendy Studio in BTM Layout',
    description:
      'Stylish, well-ventilated studio apartment in BTM 2nd Stage. Close to Silk Board and major bus routes. The studio has a compact kitchenette, study nook, and attached bathroom. Great neighbourhood with supermarkets and eateries.',
    propertyType: 'APARTMENT' as const,
    addressLine1: '22, 2nd Stage, BTM Layout',
    area: 'BTM Layout',
    latitude: 12.9166,
    longitude: 77.6101,
    rentAmount: 15000,
    depositAmount: 45000,
    roomType: 'PRIVATE' as const,
    hasAc: false,
    furnishing: 'SEMI_FURNISHED' as const,
    foodIncluded: false,
    genderPreference: 'ANY' as const,
    amenities: ['Wi-Fi', 'Power Backup', 'Security', 'Wardrobe', 'Study Table', 'Refrigerator'],
    media: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800',
    ],
  },
  {
    title: 'Premium PG — Sarjapur Road Tech Corridor',
    description:
      'Upscale PG on Sarjapur Road with private AC rooms, high-speed fiber internet, and 3 meals a day. Shuttle to Ecospace and other tech parks. Pool table, TV room, and outdoor seating area.',
    propertyType: 'PG' as const,
    addressLine1: '67, Sarjapur Main Road',
    area: 'Sarjapur Road',
    latitude: 12.9065,
    longitude: 77.6784,
    rentAmount: 16000,
    depositAmount: 32000,
    roomType: 'PRIVATE' as const,
    hasAc: true,
    furnishing: 'FULLY_FURNISHED' as const,
    foodIncluded: true,
    genderPreference: 'ANY' as const,
    amenities: ['Wi-Fi', 'AC', 'Laundry', 'Gym', 'Security', 'CCTV', 'Housekeeping', 'Water Purifier', 'Parking'],
    media: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    ],
  },
  {
    title: '1BHK in Bellandur — Walk to Ecospace',
    description:
      'Independent 1BHK apartment 500 meters from Ecospace Business Park. Semi-furnished with bed, sofa, and kitchen appliances. Society amenities include gym, swimming pool, and 24/7 security. Long-term preferred.',
    propertyType: 'APARTMENT' as const,
    addressLine1: '14, Bellandur Village Road',
    area: 'Bellandur',
    latitude: 12.9259,
    longitude: 77.6762,
    rentAmount: 22000,
    depositAmount: 66000,
    roomType: 'PRIVATE' as const,
    hasAc: true,
    furnishing: 'SEMI_FURNISHED' as const,
    foodIncluded: false,
    genderPreference: 'ANY' as const,
    amenities: ['Wi-Fi', 'AC', 'Parking', 'Gym', 'Swimming Pool', 'Power Backup', 'Security', 'CCTV'],
    media: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
    ],
  },
  {
    title: 'Affordable Shared PG — Jayanagar 4th Block',
    description:
      'Budget-friendly PG in a peaceful residential lane of Jayanagar 4th Block. Well-connected to South Bangalore IT offices. Shared rooms with clean facilities, home food, and a friendly family atmosphere.',
    propertyType: 'PG' as const,
    addressLine1: '5, 4th Block, Jayanagar',
    area: 'Jayanagar',
    latitude: 12.9268,
    longitude: 77.5840,
    rentAmount: 6500,
    depositAmount: 13000,
    roomType: 'SHARED' as const,
    hasAc: false,
    furnishing: 'FULLY_FURNISHED' as const,
    foodIncluded: true,
    genderPreference: 'MALE' as const,
    amenities: ['Wi-Fi', 'Laundry', 'Security', 'Water Purifier'],
    media: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ],
  },
]

async function main() {
  console.log('Seeding database...')

  // Create amenities
  for (const amenity of AMENITY_LIST) {
    await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: {},
      create: amenity,
    })
  }
  console.log('Amenities created')

  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stayin.in' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@stayin.in',
      passwordHash: adminHash,
      role: 'ADMIN',
      isVerified: true,
    },
  })
  console.log('Admin user created (email: admin@stayin.in, password: admin123)')

  // Create demo user
  const userHash = await bcrypt.hash('user1234', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@stayin.in' },
    update: {},
    create: {
      name: 'Arjun Kumar',
      email: 'demo@stayin.in',
      passwordHash: userHash,
      phone: '+91 98765 00000',
      role: 'SEEKER',
    },
  })
  console.log('Demo user created (email: demo@stayin.in, password: user1234)')

  // Create listings
  for (let idx = 0; idx < LISTINGS.length; idx++) {
    const { amenities, media, ...rest } = LISTINGS[idx]

    const amenityRecords = await Promise.all(
      amenities.map((name) => prisma.amenity.findUnique({ where: { name } }))
    )

    const property = await prisma.property.create({
      data: {
        ...rest,
        slug: makeSlug(rest.title, idx),
        availableFrom: new Date(),
        ownerId: admin.id,
        isVerified: true,
        status: 'ACTIVE',
        media: {
          create: media.map((url, i) => ({
            url,
            caption: `${rest.title} - photo ${i + 1}`,
            isPrimary: i === 0,
            mediaType: 'IMAGE',
          })),
        },
        amenities: {
          create: amenityRecords
            .filter(Boolean)
            .map((a) => ({ amenityId: a!.id })),
        },
      },
    })

    // Add sample reviews (only one per user since there's a unique constraint)
    await prisma.review.create({
      data: {
        rating: 4,
        content: 'Really happy with my stay here. The owner is responsive and the place is exactly as advertised.',
        visitStatus: 'LIVED_THERE',
        wouldRecommend: true,
        propertyId: property.id,
        userId: demoUser.id,
      },
    }).catch(() => {/* skip duplicate */})

    console.log(`Created listing: ${property.title}`)
  }

  // Create a sample flatmate post
  const firstProperty = await prisma.property.findFirst({ orderBy: { createdAt: 'asc' } })
  if (firstProperty) {
    await prisma.flatmatePost.create({
      data: {
        propertyId: firstProperty.id,
        preferredGender: 'ANY',
        budgetShare: 13000,
        moveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        title: 'Looking for a flatmate in Koramangala',
        description: "Hi! I'm a software engineer working at a startup in Koramangala. Looking for a calm, clean flatmate. I work from home 3 days a week. Into cooking and hiking on weekends.",
        contactMethod: 'WhatsApp: +91 98765 11111',
        userId: demoUser.id,
      },
    })
    console.log('Sample flatmate post created')
  }

  console.log('\nSeed complete!')
  console.log('Admin login: admin@stayin.in / admin123')
  console.log('Demo login:  demo@stayin.in  / user1234')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
