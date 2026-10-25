import crypto from 'crypto';
import { imagePools, unsplash } from './imageConfig.js';

// [name, propertyType, stars, pricePerNight (INR)] — every property is a fictional, clearly-labelled demo listing.
const CITIES = [
  ['Delhi', 'India', 28.6139, 77.209, [['Imperial Courtyard Hotel', 'Hotel', 5, 12500], ['Lutyens Garden Suites', 'Boutique', 4, 7200], ['Capital Gate Business Inn', 'Hotel', 3, 3800]]],
  ['Mumbai', 'India', 19.076, 72.8777, [['Marine Crest Grand', 'Hotel', 5, 14500], ['Bandra Loft Residences', 'Apartment', 4, 8200], ['Harbour View Inn', 'Hotel', 3, 4200]]],
  ['Goa', 'India', 15.2993, 74.124, [['Azure Bay Luxury Resort', 'Resort', 5, 8500], ['Palm Shore Beach Villas', 'Villa', 4, 6400], ['Coconut Grove Homestay', 'Homestay', 3, 2900]]],
  ['Jaipur', 'India', 26.9124, 75.7873, [['Pink City Heritage Palace', 'Heritage', 5, 11800], ['Amber Ridge Haveli', 'Heritage', 4, 6200], ['Rajputana Courtyard', 'Hotel', 3, 3400]]],
  ['Udaipur', 'India', 24.5854, 73.7125, [['Lakeview Royal Retreat', 'Heritage', 5, 16500], ['Pichola Sunset Haveli', 'Boutique', 4, 7800], ['Aravali Hills Resort', 'Resort', 4, 6900]]],
  ['Bengaluru', 'India', 12.9716, 77.5946, [['Garden City Tech Hotel', 'Hotel', 4, 6100], ['Cubbon Park Suites', 'Hotel', 5, 9800], ['Indiranagar Urban Stay', 'Boutique', 3, 3900]]],
  ['Hyderabad', 'India', 17.385, 78.4867, [['Nizam Pearl Grand', 'Hotel', 5, 9200], ['Hitech City Executive', 'Hotel', 4, 5600], ['Charminar Heritage Inn', 'Heritage', 3, 3300]]],
  ['Chennai', 'India', 13.0827, 80.2707, [['Marina Breeze Hotel', 'Hotel', 4, 5800], ['Coromandel Coast Resort', 'Resort', 5, 8900], ['Mylapore Courtyard', 'Boutique', 3, 3100]]],
  ['Kolkata', 'India', 22.5726, 88.3639, [['Howrah Bridge Grand', 'Hotel', 5, 8300], ['Park Street Classic', 'Boutique', 4, 5200], ['Victoria Garden Inn', 'Hotel', 3, 2800]]],
  ['Kochi', 'India', 9.9312, 76.2673, [['Backwater Pearl Resort', 'Resort', 5, 9400], ['Fort Kochi Heritage Home', 'Heritage', 4, 5900], ['Marine Drive Residency', 'Hotel', 3, 3600]]],
  ['Manali', 'India', 32.2396, 77.1887, [['Snowline Mountain Lodge', 'Lodge', 4, 5500], ['Beas Valley Resort', 'Resort', 4, 6200], ['Pine Cabin Retreat', 'Cabin', 3, 3200]]],
  ['Shimla', 'India', 31.1048, 77.1734, [['Ridge Heritage Manor', 'Heritage', 4, 6300], ['Deodar Hills Resort', 'Resort', 4, 5700], ['Mall Road Mountain Inn', 'Hotel', 3, 2900]]],
  ['Rishikesh', 'India', 30.0869, 78.2676, [['Ganga Riverside Retreat', 'Resort', 4, 5400], ['Himalayan Yoga Sanctuary', 'Resort', 4, 4800], ['Laxman Jhula Stay', 'Homestay', 3, 2200]]],
  ['Agra', 'India', 27.1767, 78.0081, [['Taj Horizon Grand', 'Hotel', 5, 10800], ['Mughal Garden Residency', 'Hotel', 4, 5800], ['Yamuna View Inn', 'Hotel', 3, 2900]]],
  ['Varanasi', 'India', 25.3176, 82.9739, [['Ghat Side Heritage Haveli', 'Heritage', 4, 5600], ['Ganga Aarti Suites', 'Hotel', 4, 5200], ['Kashi Courtyard Inn', 'Homestay', 3, 2400]]],
  ['Amritsar', 'India', 31.634, 74.8723, [['Punjab Pearl Grand', 'Hotel', 5, 7800], ['Wagah Road Residency', 'Hotel', 3, 3000], ['Lahori Gate Courtyard', 'Heritage', 4, 4900]]],
  ['Dubai', 'UAE', 25.2048, 55.2708, [['Marina Mirage Tower', 'Hotel', 5, 28500], ['Desert Dune Luxury Camp', 'Resort', 5, 22500], ['Creek Side Boutique', 'Boutique', 4, 13500]]],
  ['Abu Dhabi', 'UAE', 24.4539, 54.3773, [['Corniche Pearl Palace', 'Hotel', 5, 24500], ['Saadiyat Shore Resort', 'Resort', 5, 26500], ['Yas Island Business Hotel', 'Hotel', 4, 12500]]],
  ['Bali', 'Indonesia', -8.4095, 115.1889, [['Ubud Rice Terrace Retreat', 'Resort', 5, 15500], ['Seminyak Surf Villas', 'Villa', 4, 11800], ['Uluwatu Cliff Sanctuary', 'Resort', 5, 21500]]],
  ['Singapore', 'Singapore', 1.3521, 103.8198, [['Marina Bay Skyline Suites', 'Hotel', 5, 31500], ['Orchard Garden Hotel', 'Hotel', 4, 19500], ['Clarke Quay Loft', 'Boutique', 3, 8500]]],
  ['Bangkok', 'Thailand', 13.7563, 100.5018, [['Chao Phraya Riverside Hotel', 'Hotel', 5, 14500], ['Sukhumvit Skyline Inn', 'Hotel', 4, 7500], ['Old Town Teak House', 'Boutique', 3, 4900]]],
  ['Phuket', 'Thailand', 7.8804, 98.3923, [['Andaman Cove Resort', 'Resort', 5, 16500], ['Patong Pearl Hotel', 'Hotel', 4, 8500], ['Kata Palm Villas', 'Villa', 4, 12500]]],
  ['Kuala Lumpur', 'Malaysia', 3.139, 101.6869, [['Twin Towers Vista Hotel', 'Hotel', 5, 11500], ['Bukit Bintang Urban Stay', 'Hotel', 4, 6500], ['Heritage Row Boutique', 'Boutique', 3, 4600]]],
  ['London', 'United Kingdom', 51.5074, -0.1278, [['Thames Crown Hotel', 'Hotel', 5, 34500], ['Kensington Garden Suites', 'Boutique', 4, 22500], ['Camden Lock Inn', 'Hotel', 3, 11500]]],
  ['Paris', 'France', 48.8566, 2.3522, [['Seine Lumière Grand', 'Hotel', 5, 36500], ['Montmartre Atelier Hotel', 'Boutique', 4, 21500], ['Left Bank Courtyard', 'Boutique', 3, 13500]]],
  ['Rome', 'Italy', 41.9028, 12.4964, [['Colosseo Terrace Hotel', 'Hotel', 5, 27500], ['Trastevere Palazzo Suites', 'Boutique', 4, 17500], ['Piazza Fontana Inn', 'Hotel', 3, 10500]]],
  ['Barcelona', 'Spain', 41.3874, 2.1686, [['Ramblas Sunrise Hotel', 'Hotel', 4, 16500], ['Barceloneta Beach Suites', 'Hotel', 5, 24500], ['Gothic Quarter Loft', 'Apartment', 3, 11500]]],
  ['New York', 'USA', 40.7128, -74.006, [['Midtown Skyline Grand', 'Hotel', 5, 38500], ['Brooklyn Brownstone Inn', 'Boutique', 4, 21500], ['Hudson Yards Suites', 'Apartment', 4, 26500]]],
  ['Los Angeles', 'USA', 34.0522, -118.2437, [['Sunset Boulevard Hotel', 'Hotel', 5, 31500], ['Santa Monica Pier Resort', 'Resort', 4, 24500], ['Hollywood Hills Villas', 'Villa', 5, 33500]]],
  ['Tokyo', 'Japan', 35.6762, 139.6503, [['Shinjuku Neon Tower Hotel', 'Hotel', 5, 26500], ['Asakusa Ryokan House', 'Heritage', 4, 17500], ['Shibuya Crossing Capsule', 'Boutique', 3, 8500]]],
  ['Kyoto', 'Japan', 35.0116, 135.7681, [['Gion Lantern Ryokan', 'Heritage', 5, 28500], ['Arashiyama Bamboo Retreat', 'Resort', 4, 19500], ['Kamo River Machiya', 'Homestay', 4, 14500]]],
  ['Maldives', 'Maldives', 3.2028, 73.2207, [['Coral Atoll Overwater Resort', 'Resort', 5, 58500], ['Lagoon Pearl Villas', 'Villa', 5, 46500], ['Sandbank Island Retreat', 'Resort', 5, 52500]]],
  ['Santorini', 'Greece', 36.3932, 25.4615, [['Caldera Blue Suites', 'Boutique', 5, 32500], ['Oia Whitewash Villas', 'Villa', 5, 36500], ['Fira Cliffside Hotel', 'Hotel', 4, 19500]]],
  ['Istanbul', 'Türkiye', 41.0082, 28.9784, [['Bosphorus Pearl Hotel', 'Hotel', 5, 17500], ['Sultanahmet Courtyard', 'Heritage', 4, 10500], ['Galata Tower Loft', 'Boutique', 3, 7500]]],
  ['Cape Town', 'South Africa', -33.9249, 18.4241, [['Table Mountain View Lodge', 'Lodge', 5, 18500], ['Waterfront Harbour Hotel', 'Hotel', 4, 13500], ['Camps Bay Beach Villas', 'Villa', 5, 21500]]],
  ['Sydney', 'Australia', -33.8688, 151.2093, [['Harbour Bridge Grand', 'Hotel', 5, 33500], ['Bondi Beach House', 'Villa', 4, 22500], ['The Rocks Heritage Inn', 'Heritage', 3, 14500]]],
];

const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const hash = (s) => parseInt(crypto.createHash('sha1').update(s).digest('hex').slice(0, 8), 16);
const pick = (arr, n, offset) => Array.from({ length: n }, (_, i) => arr[(offset + i) % arr.length]);

/** Deterministic ObjectId-compatible hex so room types keep the same _id on every re-seed. */
export const stableId = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 24);

const TYPE_AMENITIES = {
  Hotel: ['Restaurant', 'Room Service', 'Fitness Center', 'Business Center'],
  Resort: ['Swimming Pool', 'Spa', 'Restaurant', 'Beach Access', 'Kids Club'],
  Villa: ['Private Pool', 'Kitchen', 'Garden', 'Housekeeping'],
  Apartment: ['Kitchen', 'Washing Machine', 'Workspace'],
  Boutique: ['Restaurant', 'Rooftop Lounge', 'Concierge'],
  Heritage: ['Restaurant', 'Cultural Tours', 'Courtyard', 'Spa'],
  Homestay: ['Home-cooked Meals', 'Garden', 'Local Guide'],
  Lodge: ['Restaurant', 'Bonfire', 'Guided Treks', 'Garden'],
  Cabin: ['Bonfire', 'Kitchenette', 'Mountain View', 'Guided Treks'],
};
const BASE_AMENITIES = ['Wi-Fi', 'Air Conditioning', 'Parking'];

const OFFER_DEFS = {
  weekend: { label: 'Weekend Getaway', discountPercent: 12, minNights: 2 },
  luxury: { label: 'Luxury Resort Deal', discountPercent: 15, minNights: 2 },
  family: { label: 'Family Vacation', discountPercent: 18, minNights: 3 },
  honeymoon: { label: 'Honeymoon Package', discountPercent: 20, minNights: 2 },
  longstay: { label: 'Long-stay Discount', discountPercent: 25, minNights: 5 },
};

function buildHotel(city, country, lat, lng, [name, propertyType, starRating, pricePerNight], idx, g) {
  const slug = slugify(`${name} ${city}`);
  const h = hash(slug);
  const amenities = [...new Set([...BASE_AMENITIES, ...TYPE_AMENITIES[propertyType], ...(starRating >= 4 && h % 2 ? ['Swimming Pool'] : []), ...(starRating === 5 ? ['Spa', 'Airport Shuttle'] : [])])];
  const hasPool = amenities.includes('Swimming Pool') || amenities.includes('Private Pool');
  const familyFriendly = ['Resort', 'Villa', 'Apartment', 'Homestay'].includes(propertyType) || (propertyType === 'Hotel' && h % 3 !== 0);
  const petFriendly = ['Villa', 'Cabin', 'Lodge'].includes(propertyType) || h % 7 === 0;
  const breakfastIncluded = starRating >= 4 ? h % 4 !== 0 : h % 2 === 0;
  const freeCancellation = h % 4 !== 0;
  if (breakfastIncluded) amenities.push('Breakfast Included');
  if (petFriendly) amenities.push('Pet Friendly');
  if (familyFriendly) amenities.push('Family Rooms');

  const guestRating = Math.round((3.9 + ((h % 100) / 100) * 0.9 + (starRating - 3) * 0.05) * 10) / 10;
  const reviewCount = 80 + (h % 2400);

  // Images: spread across pools by hash so neighbouring hotels never share the same gallery.
  const primaryPool = propertyType === 'Villa' ? imagePools.villa : hasPool && h % 2 ? imagePools.pool : imagePools.exterior;
  const all = Object.values(imagePools).flat();
  const start = (g * 5 + h) % all.length;
  let images;
  for (let shift = 0; ; shift += 1) {
    images = [...new Set([pick(primaryPool, 1, h + shift)[0], ...Array.from({ length: 6 }, (_, k) => all[(start + shift + k * 7) % all.length])])]
      .slice(0, 5)
      .map((id) => unsplash(id));
    const key = images.join();
    if (!seenGalleries.has(key)) {
      seenGalleries.add(key);
      break;
    }
  }

  const base = pricePerNight;
  const roomTypes = [
    { name: 'Deluxe Room', description: 'Comfortable room with premium amenities and a city or garden view.', capacity: 2, pricePerNight: base, totalRooms: 6 + (h % 6), bedType: 'King Bed', amenities: ['Wi-Fi', 'Air Conditioning', 'Mini Bar'] },
    { name: 'Premier Suite', description: 'Spacious suite with a separate lounge area and curated amenities.', capacity: 3, pricePerNight: Math.round((base * 1.45) / 100) * 100, totalRooms: 3 + (h % 3), bedType: 'King Bed + Sofa Bed', amenities: ['Wi-Fi', 'Air Conditioning', 'Lounge Area', 'Bathtub'] },
    { name: 'Family Room', description: 'Generous room with two beds, ideal for families and small groups.', capacity: 4, pricePerNight: Math.round((base * 1.25) / 100) * 100, totalRooms: 4 + (h % 4), bedType: '2 Queen Beds', amenities: ['Wi-Fi', 'Air Conditioning', 'Extra Bedding'] },
  ].map((r) => ({ ...r, _id: stableId(`${slug}:${r.name}`), images: [] }));

  // Offers are assigned deterministically to roughly a third of the hotels.
  let offerKind = null;
  if (h % 3 === 0) {
    if (propertyType === 'Resort' && starRating === 5) offerKind = 'luxury';
    else if (familyFriendly && h % 2 === 0) offerKind = 'family';
    else if (['Boutique', 'Villa', 'Heritage'].includes(propertyType)) offerKind = 'honeymoon';
    else if (propertyType === 'Apartment' || h % 5 === 0) offerKind = 'longstay';
    else offerKind = 'weekend';
  }

  const tags = [starRating === 5 ? 'Luxury' : starRating === 4 ? 'Premium' : 'Value', propertyType, ...(familyFriendly ? ['Family'] : []), ...(['Boutique', 'Villa', 'Heritage'].includes(propertyType) ? ['Couples'] : [])];

  return {
    name,
    slug,
    description: `${name} is a sample ${propertyType.toLowerCase()} listing in ${city}, ${country}, created for the StayEase demo. It features ${amenities.slice(0, 4).join(', ').toLowerCase()} and a ${starRating}-star standard of service. This is a fictional property used for demonstration, not a real-world hotel.`,
    city,
    country,
    address: `${10 + (h % 90)} Sample Road, ${city}`,
    location: { latitude: Number((lat + ((h % 100) - 50) / 3000).toFixed(5)), longitude: Number((lng + (((h >> 4) % 100) - 50) / 3000).toFixed(5)) },
    starRating,
    guestRating: Math.min(5, guestRating),
    reviewCount,
    pricePerNight: base,
    currency: 'INR',
    images,
    amenities,
    roomTypes,
    propertyType,
    featured: idx === 0 && starRating >= 4,
    tags,
    breakfastIncluded,
    freeCancellation,
    familyFriendly,
    petFriendly,
    cancellationPolicy: freeCancellation
      ? 'Free cancellation up to 48 hours before check-in. Later cancellations are non-refundable.'
      : 'Non-refundable rate. Cancellation is allowed but no refund is issued.',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    offer: offerKind ? { kind: offerKind, ...OFFER_DEFS[offerKind] } : { kind: null },
    isDemo: true,
    isActive: true,
  };
}

const seenGalleries = new Set();
let hotelCounter = 0;
export const hotels = CITIES.flatMap(([city, country, lat, lng, list]) => list.map((entry, i) => buildHotel(city, country, lat, lng, entry, i, hotelCounter++)));

const DEMO_REVIEWS = [
  [5, 'Wonderful stay', 'Spotless rooms, attentive staff and a great location. We would happily book again.'],
  [5, 'Exceeded expectations', 'Everything from check-in to breakfast was smooth. The room was spacious and quiet.'],
  [4, 'Very good value', 'Comfortable beds and friendly service. The restaurant could have more variety, but overall great.'],
  [4, 'Lovely property', 'Beautiful interiors and helpful team. Wi-Fi was fast and the pool area was relaxing.'],
  [3, 'Decent for the price', 'Clean and well located, though the room was smaller than the photos suggested.'],
  [5, 'Perfect getaway', 'Great views, delicious food and warm hospitality. Ideal for a short break with family.'],
];
const REVIEWERS = ['Aarav M.', 'Priya S.', 'Rohan K.', 'Ananya R.', 'Liam T.', 'Sofia G.', 'Kenji N.', 'Meera P.', 'Daniel W.', 'Isha B.'];

/** Three clearly-labelled demo reviews per hotel (flagged isDemo in the database and in the UI). */
export const demoReviews = hotels.flatMap((hotel) => {
  const h = hash(hotel.slug);
  return [0, 1, 2].map((i) => {
    const [rating, title, comment] = DEMO_REVIEWS[(h + i * 2) % DEMO_REVIEWS.length];
    return { hotelSlug: hotel.slug, demoKey: `${hotel.slug}-demo-${i}`, authorName: REVIEWERS[(h + i * 3) % REVIEWERS.length], rating, title, comment };
  });
});
