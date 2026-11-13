// This script seeds the database with initial demo data (users, events, registrations).
// It is designed to be idempotent: running it multiple times will not create duplicates.
import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

// Number of hashing rounds for bcrypt password generation
const BCRYPT_SALT_ROUNDS = 10;

async function seed() {
  console.log("Starting database seed...");

  // Demo password used across all sample accounts (DEMO ONLY - NOT FOR PRODUCTION)
  const plainPassword = "Password@123";
  const hashedPassword = await bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);

  // 1. Seed Users (1 Admin, 2 Organizers, 5 Students)
  // Using upsert by unique email so existing users are preserved without error
  const admin = await prisma.user.upsert({
    where: { email: "admin@eventflow.test" },
    update: {},
    create: {
      name: "Campus Administrator",
      email: "admin@eventflow.test",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const organizer1 = await prisma.user.upsert({
    where: { email: "organizer1@eventflow.test" },
    update: {},
    create: {
      name: "E-Cell Club Organizer",
      email: "organizer1@eventflow.test",
      password: hashedPassword,
      role: "ORGANIZER",
    },
  });

  const organizer2 = await prisma.user.upsert({
    where: { email: "organizer2@eventflow.test" },
    update: {},
    create: {
      name: "Technical Society Organizer",
      email: "organizer2@eventflow.test",
      password: hashedPassword,
      role: "ORGANIZER",
    },
  });

  const studentEmails = [
    "student1@eventflow.test",
    "student2@eventflow.test",
    "student3@eventflow.test",
    "student4@eventflow.test",
    "student5@eventflow.test",
  ];

  const students = [];
  for (let i = 0; i < studentEmails.length; i += 1) {
    const student = await prisma.user.upsert({
      where: { email: studentEmails[i] },
      update: {},
      create: {
        name: `Student ${i + 1}`,
        email: studentEmails[i],
        password: hashedPassword,
        role: "STUDENT",
      },
    });
    students.push(student);
  }

  // 2. Seed Events (3 Published Upcoming, 1 Completed Past, 1 Draft)
  // Check by unique title with findFirst before creating to prevent duplicates
  const now = new Date();

  const eventTemplates = [
    {
      title: "Campus E-Summit 2026: From Idea to Seed Funding",
      description: "Connect with university alumni founders, angel investors, and venture scouts. Includes a live startup pitching arena with prototype incubation grants.",
      venue: "Sir C.V. Raman Auditorium",
      category: "Entrepreneurship",
      imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      registrationDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      capacity: 50, // Between 3 and 100
      status: "PUBLISHED",
      organizerId: organizer1.id,
    },
    {
      title: "Chancellor Trophy: Inter-Department Sports Tournament",
      description: "Annual intra-university sporting tournament covering Cricket, Football, Basketball, Badminton, and Track & Field events across 8 engineering departments.",
      venue: "University Sports Complex & Turf Ground",
      category: "Sports",
      imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
      startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      endDate: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      capacity: 80, // Between 3 and 100
      status: "PUBLISHED",
      organizerId: organizer1.id,
    },
    {
      title: "Hackathon 2026: 36-Hour National Code Sprint",
      description: "Our annual flagship 36-hour hackathon bringing together student teams to solve real-world problems in generative AI, campus automation, and cybersecurity.",
      venue: "Computing Hub, Block 4",
      category: "Technical",
      imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
      startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      endDate: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(now.getTime() + 19 * 24 * 60 * 60 * 1000),
      capacity: 60, // Between 3 and 100
      status: "PUBLISHED",
      organizerId: organizer2.id,
    },
    {
      title: "Chroma Lens: Annual Campus Photography Contest",
      description: "Theme: Campus Life in Monochrome & Color. Top 30 curated student photographs were printed and exhibited during the annual arts walk.",
      venue: "Exhibition Hall, Fine Arts Wing",
      category: "Competitions",
      imageUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80",
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago (past)
      endDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      registrationDeadline: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      capacity: 40,
      status: "COMPLETED",
      organizerId: organizer2.id,
    },
    {
      title: "National Robotics Championship & Drone Racing",
      description: "Autonomous bot obstacle challenges, combat robowars (15kg & 30kg), and FPV micro-drone racing tracks designed by university robotics teams.",
      venue: "Main Sports Arena & Indoor Stadium",
      category: "Technical",
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
      startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now (draft)
      endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      registrationDeadline: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
      capacity: 50,
      status: "DRAFT",
      organizerId: organizer2.id,
    },
  ];

  const seededEvents = [];
  for (const template of eventTemplates) {
    let event = await prisma.event.findFirst({
      where: { title: template.title },
    });

    if (!event) {
      event = await prisma.event.create({
        data: template,
      });
    }
    seededEvents.push(event);
  }

  const [eSummit, sports, hackathon, pastPhoto] = seededEvents;

  // 3. Seed Registrations (Check compound unique studentId_eventId first)
  const registrationPairs = [
    { studentId: students[0].id, eventId: eSummit.id },
    { studentId: students[1].id, eventId: eSummit.id },
    { studentId: students[2].id, eventId: sports.id },
    { studentId: students[0].id, eventId: pastPhoto.id },
  ];

  let completedRegistration = null;
  for (const pair of registrationPairs) {
    let registration = await prisma.registration.findUnique({
      where: {
        studentId_eventId: {
          studentId: pair.studentId,
          eventId: pair.eventId,
        },
      },
    });

    if (!registration) {
      registration = await prisma.registration.create({
        data: {
          studentId: pair.studentId,
          eventId: pair.eventId,
          status: "REGISTERED",
        },
      });
    }

    if (pair.eventId === pastPhoto.id) {
      completedRegistration = registration;
    }
  }

  // 4. Seed Attendance (1 record for the completed past event)
  if (completedRegistration) {
    const existingAttendance = await prisma.attendance.findUnique({
      where: { registrationId: completedRegistration.id },
    });

    if (!existingAttendance) {
      await prisma.attendance.create({
        data: {
          registrationId: completedRegistration.id,
          checkedInAt: pastPhoto.startDate,
        },
      });
    }
  }

  // 5. Seed Announcement (1 update for upcoming E-Summit)
  const announcementTitle = "Venue Entry Guidelines and Schedule";
  const existingAnnouncement = await prisma.announcement.findFirst({
    where: {
      eventId: eSummit.id,
      title: announcementTitle,
    },
  });

  if (!existingAnnouncement) {
    await prisma.announcement.create({
      data: {
        eventId: eSummit.id,
        creatorId: organizer1.id,
        title: announcementTitle,
        message: "Please arrive 15 minutes before the inauguration. Keep your student ID and digital QR pass ready for swift check-in at the auditorium gates.",
      },
    });
  }

  // 6. Print database summary
  const totalUsers = await prisma.user.count();
  const totalEvents = await prisma.event.count();
  const totalRegistrations = await prisma.registration.count();
  const totalAttendance = await prisma.attendance.count();
  const totalAnnouncements = await prisma.announcement.count();

  console.log("Database seed completed successfully.");
  console.log("Current Database Totals:", {
    users: totalUsers,
    events: totalEvents,
    registrations: totalRegistrations,
    attendance: totalAttendance,
    announcements: totalAnnouncements,
  });
}

try {
  await seed();
} catch (error) {
  console.error("Error running database seed:", error?.message || error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
