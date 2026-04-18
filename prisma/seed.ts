import { PrismaClient, StayType, RoomType, FurnishedStatus, GenderPref } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const AMENITY_LIST = [
  { name: 'Wi-Fi', icon: 'wifi' },
  { name: 'AC', icon: 'wind' },
  { name: 'Laundry', icon: 'shirt' },
  { name: 'Parking', icon: 'car' },
  { name: 'Power Backup', icon: 'zap' },
  { name: 'Security', icon: 'shield' },
  { name: 'Attached Bathroom', icon: 'bath' },
  { name: 'Wardrobe', icon: 'package' },
  { name: 'Study Table', icon: 'book' },
  { name: 'Gym', icon: 'dumbbell' },
  { name: 'Swimming Pool', icon: 'droplets' },
  { name: 'CCTV', icon: 'camera' },
  { name: 'Housekeeping', icon: 'sparkles' },
  { name: 'Water Purifier', icon: 'droplet' },
  { name: 'Microwave', icon: 'microwave' },
  { name: 'Refrigerator', icon: 'thermometer' },
]

const BANGALORE_LISTINGS = [
  {
    title: 'Cozy PG in the Heart of Koramangala',
    description:
      'Well-maintained paying guest accommodation steps from top restaurants and cafes in Koramangala 5th Block. Ideal for working professionals and students. High-speed Wi-Fi, daily housekeeping, and home-cooked vegetarian meals included.',
    stayType: StayType.PG,
    address: '45, 5th Block, Koramangala',
    area: 'Koramangala',
    latitude: 12.9347,
    longitude: 77.6245,
    price: 12000,
    deposit: 24000,
    roomType: RoomType.PRIVATE,
    hasAC: true,
    isFurnished: FurnishedStatus.FURNISHED,
    foodIncluded: true,
    genderPreference: GenderPref.FEMALE,
    amenities: ['Wi-Fi', 'AC', 'Attached Bathroom', 'Wardrobe', 'Housekeeping', 'Water Purifier'],
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    ],
    contactName: 'Priya Sharma',
    contactPhone: '+91 98765 43210',
    contactEmail: 'priya@stayin.in',
  },
  {
    title: 'Modern Studio Apartment — HSR Layout',
    description:
      'Bright, fully furnished studio apartment in sector 1, HSR Layout. 5-minute walk to HSR BDA Complex. Perfect for solo professionals. Building has 24/7 security, power backup, and covered parking.',
    stayType: StayType.APARTMENT,
    address: '12, Sector 1, HSR Layout',
    area: 'HSR Layout',
    latitude: 12.9116,
    longitude: 77.6389,
    price: 18000,
    deposit: 54000,
    roomType: RoomType.PRIVATE,
    hasAC: true,
    isFurnished: FurnishedStatus.FURNISHED,
    foodIncluded: false,
    genderPreference: GenderPref.ANY,
    amenities: ['Wi-Fi', 'AC', 'Parking', 'Power Backup', 'Security', 'CCTV', 'Refrigerator'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    ],
    contactName: 'Suresh Reddy',
    contactPhone: '+91 87654 32109',
    contactEmail: 'suresh@hsr.in',
  },
  {
    title: 'Spacious 2BHK for Flatmates — Indiranagar',
    description:
      'Beautiful 2BHK on the 3rd floor of a gated society in Indiranagar 12th Main. One room is vacant — ideal for a working professional. Common living area, modular kitchen, and great connectivity to MG Road metro.',
    stayType: StayType.SHARED_FLAT,
    address: '78, 12th Main, Indiranagar',
    area: 'Indiranagar',
    latitude: 12.9784,
    longitude: 77.6408,
    price: 14000,
    deposit: 42000,
    roomType: RoomType.PRIVATE,
    hasAC: true,
    isFurnished: FurnishedStatus.SEMI_FURNISHED,
    foodIncluded: false,
    genderPreference: GenderPref.ANY,
    amenities: ['Wi-Fi', 'AC', 'Parking', 'Power Backup', 'Security', 'Wardrobe', 'Study Table'],
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800',
    ],
    contactName: 'Ankit Mehta',
    contactPhone: '+91 76543 21098',
    contactEmail: null,
  },
  {
    title: 'Budget PG near Whitefield IT Park',
    description:
      'Affordable paying guest accommodation, just 2 km from ITPL and EPIP Zone. Shared rooms with clean facilities. Regular shuttle service available. Meals can be opted for separately. Great for freshers joining IT companies.',
    stayType: StayType.PG,
    address: '33, EPIP Zone, Whitefield',
    area: 'Whitefield',
    latitude: 12.9698,
    longitude: 77.7499,
    price: 7500,
    deposit: 15000,
    roomType: RoomType.SHARED,
    hasAC: false,
    isFurnished: FurnishedStatus.FURNISHED,
    foodIncluded: true,
    genderPreference: GenderPref.MALE,
    amenities: ['Wi-Fi', 'Laundry', 'Security', 'Water Purifier', 'CCTV'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    ],
    contactName: 'Mohan Kumar',
    contactPhone: '+91 65432 10987',
    contactEmail: 'mohan@pgworld.in',
  },
  {
    title: 'Luxury Service Apartment — Marathahalli',
    description:
      'Hotel-style service apartment for short-term and medium-term stays. Fully serviced with daily housekeeping, linen change, and 24/7 reception. Ideal for business trips, project-based relocations, or while house hunting.',
    stayType: StayType.TEMPORARY,
    address: '18, Outer Ring Road, Marathahalli',
    area: 'Marathahalli',
    latitude: 12.9591,
    longitude: 77.7011,
    price: 25000,
    deposit: 25000,
    roomType: RoomType.PRIVATE,
    hasAC: true,
    isFurnished: FurnishedStatus.FURNISHED,
    foodIncluded: true,
    genderPreference: GenderPref.ANY,
    amenities: ['Wi-Fi', 'AC', 'Parking', 'Power Backup', 'Security', 'Housekeeping', 'Gym', 'CCTV', 'Microwave', 'Refrigerator'],
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    ],
    contactName: 'Lakshmi Stays',
    contactPhone: '+91 54321 09876',
    contactEmail: 'stays@lakshmi.co',
  },
  {
    title: 'Women-Only PG — Electronic City Phase 1',
    description:
      'Safe, well-managed women-only PG near Electronic City Phase 1 tech park. Warden on premises 24/7. Nutritious home food (veg), AC rooms, and CCTV on all floors. Many residents from Infosys and Wipro.',
    stayType: StayType.PG,
    address: '9, Phase 1, Electronic City',
    area: 'Electronic City',
    latitude: 12.8458,
    longitude: 77.6634,
    price: 9500,
    deposit: 19000,
    roomType: RoomType.SHARED,
    hasAC: true,
    isFurnished: FurnishedStatus.FURNISHED,
    foodIncluded: true,
    genderPreference: GenderPref.FEMALE,
    amenities: ['Wi-Fi', 'AC', 'Laundry', 'Security', 'CCTV', 'Water Purifier', 'Housekeeping'],
    images: [
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800',
    ],
    contactName: 'Kavitha Rao',
    contactPhone: '+91 43210 98765',
    contactEmail: 'kavitha@pgsindia.com',
  },
  {
    title: 'Trendy Studio in BTM Layout',
    description:
      'Stylish, well-ventilated studio apartment in BTM 2nd Stage. Close to Silk Board and major bus routes. The studio has a compact kitchenette, study nook, and attached bathroom. Great neighbourhood with supermarkets and eateries.',
    stayType: StayType.APARTMENT,
    address: '22, 2nd Stage, BTM Layout',
    area: 'BTM Layout',
    latitude: 12.9166,
    longitude: 77.6101,
    price: 15000,
    deposit: 45000,
    roomType: RoomType.PRIVATE,
    hasAC: false,
    isFurnished: FurnishedStatus.SEMI_FURNISHED,
    foodIncluded: false,
    genderPreference: GenderPref.ANY,
    amenities: ['Wi-Fi', 'Power Backup', 'Security', 'Wardrobe', 'Study Table', 'Refrigerator'],
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800',
    ],
    contactName: 'Deepa Krishnan',
    contactPhone: '+91 32109 87654',
    contactEmail: null,
  },
  {
    title: 'Premium PG — Sarjapur Road Tech Corridor',
    description:
      'Upscale PG on Sarjapur Road with private AC rooms, high-speed fiber internet, and 3 meals a day. Shuttle to Ecospace and other tech parks. Pool table, TV room, and outdoor seating area.',
    stayType: StayType.PG,
    address: '67, Sarjapur Main Road',
    area: 'Sarjapur Road',
    latitude: 12.9065,
    longitude: 77.6784,
    price: 16000,
    deposit: 32000,
    roomType: RoomType.PRIVATE,
    hasAC: true,
    isFurnished: FurnishedStatus.FURNISHED,
    foodIncluded: true,
    genderPreference: GenderPref.ANY,
    amenities: ['Wi-Fi', 'AC', 'Laundry', 'Gym', 'Security', 'CCTV', 'Housekeeping', 'Water Purifier', 'Parking'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    ],
    contactName: 'Vivek Patel',
    contactPhone: '+91 21098 76543',
    contactEmail: 'vivek@premiumpg.com',
  },
  {
    title: '1BHK in Bellandur — Walk to Ecospace',
    description:
      'Independent 1BHK apartment 500 meters from Ecospace Business Park. Semi-furnished with bed, sofa, and kitchen appliances. Society amenities include gym, swimming pool, and 24/7 security. Long-term preferred.',
    stayType: StayType.APARTMENT,
    address: '14, Bellandur Village Road',
    area: 'Bellandur',
    latitude: 12.9259,
    longitude: 77.6762,
    price: 22000,
    deposit: 66000,
    roomType: RoomType.PRIVATE,
    hasAC: true,
    isFurnished: FurnishedStatus.SEMI_FURNISHED,
    foodIncluded: false,
    genderPreference: GenderPref.ANY,
    amenities: ['Wi-Fi', 'AC', 'Parking', 'Gym', 'Swimming Pool', 'Power Backup', 'Security', 'CCTV'],
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
    ],
    contactName: 'Rajesh Nair',
    contactPhone: '+91 10987 65432',
    contactEmail: 'rajesh.nair@gmail.com',
  },
  {
    title: 'Affordable Shared PG — Jayanagar 4th Block',
    description:
      'Budget-friendly PG in a peaceful residential lane of Jayanagar 4th Block. Well-connected to South Bangalore IT offices. Shared rooms with clean facilities, home food, and a friendly family atmosphere.',
    stayType: StayType.PG,
    address: '5, 4th Block, Jayanagar',
    area: 'Jayanagar',
    latitude: 12.9268,
    longitude: 77.5840,
    price: 6500,
    deposit: 13000,
    roomType: RoomType.SHARED,
    hasAC: false,
    isFurnished: FurnishedStatus.FURNISHED,
    foodIncluded: true,
    genderPreference: GenderPref.MALE,
    amenities: ['Wi-Fi', 'Laundry', 'Security', 'Water Purifier'],
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ],
    contactName: 'Shanthi Devi',
    contactPhone: '+91 09876 54321',
    contactEmail: null,
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Create amenities
  for (const amenity of AMENITY_LIST) {
    await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: {},
      create: amenity,
    })
  }
  console.log('✅ Amenities created')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stayin.in' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@stayin.in',
      password: adminPassword,
      role: 'ADMIN',
      bio: 'Platform administrator',
    },
  })
  console.log('✅ Admin user created (email: admin@stayin.in, password: admin123)')

  // Create demo user
  const userPassword = await bcrypt.hash('user1234', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@stayin.in' },
    update: {},
    create: {
      name: 'Arjun Kumar',
      email: 'demo@stayin.in',
      password: userPassword,
      phone: '+91 98765 00000',
      bio: 'Software engineer exploring Bangalore. Love good coffee and long coding sessions.',
    },
  })
  console.log('✅ Demo user created (email: demo@stayin.in, password: user1234)')

  // Create listings
  for (const data of BANGALORE_LISTINGS) {
    const { amenities, images, ...rest } = data

    const property = await prisma.property.create({
      data: {
        ...rest,
        availableFrom: new Date(),
        createdById: admin.id,
        isVerified: true,
        images: {
          create: images.map((url, i) => ({
            url,
            alt: `${rest.title} - image ${i + 1}`,
            isPrimary: i === 0,
          })),
        },
        amenities: {
          create: await Promise.all(
            amenities.map(async (name) => {
              const amenity = await prisma.amenity.findUnique({ where: { name } })
              return { amenityId: amenity!.id }
            })
          ),
        },
      },
    })

    // Add sample reviews
    const reviewBodies = [
      'Really happy with my stay here. The owner is responsive and the place is exactly as advertised.',
      'Good location and clean rooms. Food is decent. Would recommend to working professionals.',
      'Decent place for the price. Wi-Fi can be spotty sometimes but overall a good experience.',
    ]

    for (let i = 0; i < 2; i++) {
      await prisma.review.create({
        data: {
          rating: 4 + (i % 2),
          body: reviewBodies[i],
          hasLivedThere: true,
          propertyId: property.id,
          userId: demoUser.id,
        },
      })
    }

    console.log(`✅ Created listing: ${property.title}`)
  }

  // Create sample flatmate post
  const firstProperty = await prisma.property.findFirst()
  if (firstProperty) {
    await prisma.flatmatePost.create({
      data: {
        propertyId: firstProperty.id,
        genderPref: GenderPref.ANY,
        budgetShare: 13000,
        moveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        bio: "Hi! I'm a software engineer working at a startup in Koramangala. Looking for a calm, clean flatmate. I work from home 3 days a week. Into cooking and hiking on weekends.",
        contactMethod: 'WhatsApp',
        contactValue: '+91 98765 11111',
        userId: demoUser.id,
      },
    })
    console.log('✅ Sample flatmate post created')
  }

  console.log('\n🎉 Seed complete!')
  console.log('---')
  console.log('Admin login: admin@stayin.in / admin123')
  console.log('Demo login:  demo@stayin.in  / user1234')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
