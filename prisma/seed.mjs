// Seeds 15 sample events. Dates are relative to "today" so the data
// always has upcoming + past events no matter when the app is run.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;

/** Date that is `days` from today at hh:mm India time. */
function at(days, hh, mm = 0) {
  const nowIst = new Date(Date.now() + IST_OFFSET_MS);
  const utc = Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate() + days, hh, mm);
  return new Date(utc - IST_OFFSET_MS);
}

const events = [
  { title: "Retro Night Live", category: "Music", city: "Coimbatore", startsAt: at(3, 18, 30), price: 499, imageUrl: img("photo-1470229722913-7c0e2dbbafd3"),
    description: "A night of 80s and 90s hits by The Vinyl Souls. Dance floor open, food stalls outside." },
  { title: "Carnatic Morning Concert", category: "Music", city: "Coimbatore", startsAt: at(9, 7, 0), price: 0, imageUrl: img("photo-1511671782779-c97d3d27a1d4"),
    description: "An open-air morning concert with violin and mridangam at the community hall lawns." },
  { title: "Jazz Night by the Beach", category: "Music", city: "Chennai", startsAt: at(5, 19, 30), price: 799, imageUrl: img("photo-1501386761578-eac5c94b800a"),
    description: "Smooth jazz under the stars at Besant Nagar. Bring a mat, we bring the music." },
  { title: "Indie Unplugged", category: "Music", city: "Bengaluru", startsAt: at(14, 20, 0), price: 350, imageUrl: img("photo-1470229722913-7c0e2dbbafd3"),
    description: "Four local indie bands, acoustic sets only. Limited seating." },
  { title: "Pottery for Beginners", category: "Workshop", city: "Bengaluru", startsAt: at(4, 11, 0), price: 1500, imageUrl: img("photo-1513364776144-60967b0f800f"),
    description: "Learn to centre clay and throw your first bowl. All materials included." },
  { title: "Photography Walk & Edit", category: "Workshop", city: "Mumbai", startsAt: at(7, 7, 30), price: 1200, imageUrl: img("photo-1540575467063-178a50c2df87"),
    description: "A guided street photography walk around Fort followed by a 1-hour editing session." },
  { title: "Coimbatore Food Fair", category: "Food", city: "Coimbatore", startsAt: at(6, 17, 0), price: 100, imageUrl: img("photo-1555939594-58d7cb561ad1"),
    description: "Over 40 stalls of Kongu cuisine, street snacks and desserts. Entry ticket includes one drink." },
  { title: "Night Street Food Trail", category: "Food", city: "Delhi", startsAt: at(10, 19, 0), price: 899, imageUrl: img("photo-1504674900247-0877df9cc836"),
    description: "A guided night walk through Old Delhi's best food lanes. Eight tastings included." },
  { title: "Corporate Cricket League", category: "Sports", city: "Mumbai", startsAt: at(12, 8, 0), price: 150000, imageUrl: img("photo-1574629810360-7efbbe195018"),
    description: "Two-week T10 league for company teams. Price is per team and includes kits, umpires and ground." },
  { title: "Sunday 10K Run", category: "Sports", city: "Bengaluru", startsAt: at(8, 5, 30), price: 750, imageUrl: img("photo-1461896836934-ffe607ba8211"),
    description: "A flat 10K loop around Cubbon Park with timing chips and a finisher medal." },
  { title: "Lego Builders Club", category: "Kids", city: "Delhi", startsAt: at(11, 10, 30), price: 400, imageUrl: img("photo-1587654780291-39c9404d746b"),
    description: "Ages 6-12. Build a city together with our facilitators. Parents can relax at the cafe." },

  // Inactive (hidden from visitors, visible to admin)
  { title: "Chef's Table: Coastal Kitchen", category: "Food", city: "Chennai", startsAt: at(20, 20, 0), price: 2499, isActive: false, imageUrl: img("photo-1414235077428-338989a2e8c0"),
    description: "A seven-course coastal tasting menu cooked live in front of 12 guests. (Sold out - kept inactive.)" },
  { title: "Kids Storytelling Hour", category: "Kids", city: "Coimbatore", startsAt: at(15, 16, 0), price: 0, isActive: false, imageUrl: img("photo-1503454537195-1dcabb73ffb9"),
    description: "Stories, puppets and songs for ages 3-8. (Postponed - kept inactive.)" },
  // Past events
  { title: "Monsoon Music Night", category: "Music", city: "Coimbatore", startsAt: at(-5, 19, 0), price: 299, imageUrl: img("photo-1501386761578-eac5c94b800a"),
    description: "Already happened - should never show up on the public list." },
  { title: "Weekend Football Cup", category: "Sports", city: "Chennai", startsAt: at(-12, 16, 0), price: 2000, imageUrl: img("photo-1574629810360-7efbbe195018"),
    description: "5-a-side tournament. Already happened." },
];

async function main() {
  await prisma.cardDesign.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.event.deleteMany();
  await prisma.event.createMany({ data: events });
  console.log(`Seeded ${events.length} events.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
