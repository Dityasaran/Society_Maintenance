import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // --- Admin ---
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@society.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@1234';
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Society Admin',
      email: adminEmail,
      passwordHash: adminHash,
      role: 'ADMIN',
      flatNumber: null,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // --- Sample Residents ---
  const resident1 = await prisma.user.upsert({
    where: { email: 'alice@resident.com' },
    update: {},
    create: {
      name: 'Alice Kumar',
      email: 'alice@resident.com',
      passwordHash: await bcrypt.hash('Resident@1234', 12),
      role: 'RESIDENT',
      flatNumber: 'A-101',
    },
  });

  const resident2 = await prisma.user.upsert({
    where: { email: 'bob@resident.com' },
    update: {},
    create: {
      name: 'Bob Sharma',
      email: 'bob@resident.com',
      passwordHash: await bcrypt.hash('Resident@1234', 12),
      role: 'RESIDENT',
      flatNumber: 'B-204',
    },
  });
  console.log(`✅ Residents created: ${resident1.email}, ${resident2.email}`);

  // --- Sample Complaints ---
  const complaint1 = await prisma.complaint.create({
    data: {
      residentId: resident1.id,
      category: 'Plumbing',
      description: 'Leaking pipe in bathroom, water dripping constantly.',
      priority: 'HIGH',
      status: 'OPEN',
    },
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaint1.id,
      oldStatus: null,
      newStatus: 'OPEN',
      note: 'Complaint raised',
      changedBy: resident1.id,
    },
  });

  const complaint2 = await prisma.complaint.create({
    data: {
      residentId: resident1.id,
      category: 'Electrical',
      description: 'Hallway light on 3rd floor not working for 2 days.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
    },
  });

  await prisma.complaintStatusHistory.createMany({
    data: [
      {
        complaintId: complaint2.id,
        oldStatus: null,
        newStatus: 'OPEN',
        note: 'Complaint raised',
        changedBy: resident1.id,
      },
      {
        complaintId: complaint2.id,
        oldStatus: 'OPEN',
        newStatus: 'IN_PROGRESS',
        note: 'Electrician scheduled for tomorrow.',
        changedBy: admin.id,
      },
    ],
  });

  const complaint3 = await prisma.complaint.create({
    data: {
      residentId: resident2.id,
      category: 'Cleaning',
      description: 'Garbage not collected from B-wing for 3 days.',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      resolvedAt: new Date(),
    },
  });

  await prisma.complaintStatusHistory.createMany({
    data: [
      {
        complaintId: complaint3.id,
        oldStatus: null,
        newStatus: 'OPEN',
        note: 'Complaint raised',
        changedBy: resident2.id,
      },
      {
        complaintId: complaint3.id,
        oldStatus: 'OPEN',
        newStatus: 'RESOLVED',
        note: 'Garbage collected. Issue resolved.',
        changedBy: admin.id,
      },
    ],
  });

  console.log(`✅ 3 sample complaints created`);

  // --- Sample Notice ---
  await prisma.notice.create({
    data: {
      title: 'Water Supply Interruption',
      body: 'Water supply will be interrupted on Sunday 26th August from 10am–2pm for maintenance. Please store water in advance.',
      isImportant: true,
      postedBy: admin.id,
    },
  });
  console.log(`✅ Sample notice created`);

  console.log('🌱 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
