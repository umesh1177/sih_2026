// Prisma Seed Script for CAPACITY CONNECT - MoES / IMD LMS
import { PrismaClient } from "@prisma/client";
import { initialData } from "../src/data/mockData.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CAPACITY CONNECT PostgreSQL Database via Prisma...");

  // 1. Seed Organizations
  for (const org of initialData.organizations) {
    await prisma.organization.upsert({
      where: { code: org.code },
      update: org,
      create: org
    });
  }
  console.log(`✅ Organizations seeded (${initialData.organizations.length})`);

  // 2. Seed Departments
  for (const dept of initialData.departments) {
    await prisma.department.upsert({
      where: {
        organizationId_code: {
          organizationId: dept.organizationId,
          code: dept.code
        }
      },
      update: dept,
      create: dept
    });
  }
  console.log(`✅ Departments seeded (${initialData.departments.length})`);

  // 3. Seed Users
  for (const user of initialData.users) {
    const { specialization, bio, yearsExperience, interests, skills, qualifications, experienceNotes, ...userFields } = user;
    
    await prisma.user.upsert({
      where: { email: user.email },
      update: userFields,
      create: userFields
    });

    if (user.role === "trainer") {
      await prisma.trainerProfile.upsert({
        where: { userId: user.id },
        update: { specializations: specialization || [], bio: bio || "", yearsExperience: yearsExperience || 0 },
        create: { userId: user.id, specializations: specialization || [], bio: bio || "", yearsExperience: yearsExperience || 0 }
      });
    } else if (user.role === "trainee") {
      await prisma.traineeProfile.upsert({
        where: { userId: user.id },
        update: { interests: interests || [], skills: skills || [], qualifications: qualifications || [], experienceNotes: experienceNotes || "" },
        create: { userId: user.id, interests: interests || [], skills: skills || [], qualifications: qualifications || [], experienceNotes: experienceNotes || "" }
      });
    }
  }
  console.log(`✅ Users & Profiles seeded (${initialData.users.length})`);

  // 4. Seed Competencies
  for (const comp of initialData.competencies) {
    await prisma.competency.upsert({
      where: { code: comp.code },
      update: comp,
      create: comp
    });
  }
  console.log(`✅ Competencies seeded (${initialData.competencies.length})`);

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
