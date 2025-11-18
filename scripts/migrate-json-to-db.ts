#!/usr/bin/env tsx
/**
 * Data Migration Script: JSON → PostgreSQL
 *
 * Migrates existing JSON data store to PostgreSQL database
 * Usage: tsx scripts/migrate-json-to-db.ts
 */

import { PrismaClient, VehicleStatus, UnitAvailability, LeadChannel, LeadStatus } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

async function loadJsonData() {
  const dataPath = path.join(process.cwd(), "data", "cms-data.json");
  const content = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(content);
}

function mapVehicleStatus(status: string): VehicleStatus {
  const statusMap: Record<string, VehicleStatus> = {
    "In Stock": "IN_STOCK",
    "Reserved": "RESERVED",
    "In Prep": "IN_PREP",
    "Sold": "SOLD",
  };
  return statusMap[status] || "IN_PREP";
}

function mapUnitAvailability(availability: string): UnitAvailability {
  const availMap: Record<string, UnitAvailability> = {
    "Available": "AVAILABLE",
    "Reserved": "RESERVED",
    "Let": "LET",
    "In Prep": "IN_PREP",
    "Coming Soon": "COMING_SOON",
  };
  return availMap[availability] || "AVAILABLE";
}

function mapLeadChannel(channel: string): LeadChannel {
  const channelMap: Record<string, LeadChannel> = {
    "warehouse": "WAREHOUSE",
    "vehicle": "VEHICLE",
    "general": "GENERAL",
  };
  return channelMap[channel] || "GENERAL";
}

async function migrateVehicles(vehicles: any[]) {
  console.log(`\n📦 Migrating ${vehicles.length} vehicles...`);

  for (const vehicle of vehicles) {
    try {
      await prisma.vehicle.create({
        data: {
          id: vehicle.id,
          title: vehicle.title,
          price: vehicle.price,
          listPrice: vehicle.listPrice,
          mileage: vehicle.mileage,
          fuel: vehicle.fuel,
          transmission: vehicle.transmission,
          year: vehicle.year,
          vrm: vehicle.vrm,
          body: vehicle.body,
          colour: vehicle.colour,
          description: vehicle.description,
          status: mapVehicleStatus(vehicle.status),
          features: vehicle.features || [],
          images: vehicle.images || [],
          complianceNotes: vehicle.complianceNotes,
          complianceProofs: vehicle.complianceProofs ? JSON.parse(JSON.stringify(vehicle.complianceProofs)) : null,
          complianceHistory: vehicle.complianceHistory ? JSON.parse(JSON.stringify(vehicle.complianceHistory)) : null,
          publishedAt: vehicle.status === "In Stock" ? new Date() : null,
        },
      });
      console.log(`  ✓ ${vehicle.title}`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate vehicle ${vehicle.title}:`, error);
    }
  }
}

async function migrateWarehouseUnits(sections: any[]) {
  console.log(`\n🏭 Migrating ${sections.length} warehouse units...`);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    try {
      await prisma.warehouseUnit.create({
        data: {
          id: section.id,
          name: section.name,
          sizeSqFt: section.sizeSqFt,
          availability: mapUnitAvailability(section.availability),
          pricePerMonth: section.pricePerMonth,
          features: section.features || [],
          images: [],
          displayOrder: i,
          isActive: true,
        },
      });
      console.log(`  ✓ ${section.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate warehouse unit ${section.name}:`, error);
    }
  }
}

async function migrateServices(services: any[]) {
  console.log(`\n🔧 Migrating ${services.length} services...`);

  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    try {
      await prisma.service.create({
        data: {
          id: service.id,
          name: service.name,
          description: service.description,
          priceFrom: service.priceFrom,
          isActive: true,
          displayOrder: i,
        },
      });
      console.log(`  ✓ ${service.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate service ${service.name}:`, error);
    }
  }
}

async function migrateTestimonials(testimonials: any[]) {
  console.log(`\n💬 Migrating ${testimonials.length} testimonials...`);

  for (let i = 0; i < testimonials.length; i++) {
    const testimonial = testimonials[i];
    try {
      await prisma.testimonial.create({
        data: {
          id: testimonial.id,
          name: testimonial.name,
          quote: testimonial.quote,
          isActive: true,
          displayOrder: i,
        },
      });
      console.log(`  ✓ ${testimonial.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate testimonial:`, error);
    }
  }
}

async function migrateFaqs(faqs: any[]) {
  console.log(`\n❓ Migrating ${faqs.length} FAQs...`);

  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i];
    try {
      await prisma.faq.create({
        data: {
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          isActive: true,
          displayOrder: i,
        },
      });
      console.log(`  ✓ ${faq.question.substring(0, 50)}...`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate FAQ:`, error);
    }
  }
}

async function migrateSiteConfig(data: any) {
  console.log(`\n⚙️  Migrating site configuration...`);

  const configs = [
    { key: "siteInfo", value: data.siteInfo },
    { key: "theme", value: data.theme },
    { key: "warehouse", value: { headline: data.warehouse.headline, subheading: data.warehouse.subheading } },
    { key: "storefront", value: data.storefront },
    { key: "valueProps", value: data.valueProps },
    { key: "compliancePromo", value: data.compliancePromo },
    { key: "contactCta", value: data.contactCta },
  ];

  for (const config of configs) {
    try {
      await prisma.siteConfig.upsert({
        where: { key: config.key },
        update: { value: config.value },
        create: { key: config.key, value: config.value },
      });
      console.log(`  ✓ ${config.key}`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate config ${config.key}:`, error);
    }
  }
}

async function migrateLeads() {
  console.log(`\n📧 Checking for leads data...`);

  try {
    const leadsPath = path.join(process.cwd(), "data", "leads.json");
    const content = await fs.readFile(leadsPath, "utf-8");
    const leads = JSON.parse(content);

    console.log(`\n📧 Migrating ${leads.length} leads...`);

    for (const lead of leads) {
      try {
        await prisma.lead.create({
          data: {
            id: lead.id,
            channel: mapLeadChannel(lead.channel),
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            message: lead.message,
            vehicleId: lead.vehicleId,
            status: "NEW",
            createdAt: new Date(lead.createdAt),
          },
        });
        console.log(`  ✓ Lead from ${lead.name}`);
      } catch (error) {
        console.error(`  ✗ Failed to migrate lead:`, error);
      }
    }
  } catch (error) {
    console.log(`  ℹ️  No leads.json found or unable to read`);
  }
}

async function createDefaultAdminUser() {
  console.log(`\n👤 Creating default admin user...`);

  // Check if any admin users exist
  const existingAdmin = await prisma.adminUser.findFirst();

  if (!existingAdmin) {
    try {
      // Note: In production, you should hash this properly
      // For now, using a placeholder - user should update via admin panel
      const bcrypt = await import("bcrypt");
      const hash = await bcrypt.hash("changeme123", 10);

      await prisma.adminUser.create({
        data: {
          email: "admin@campkinmotors.co.uk",
          passwordHash: hash,
          name: "Phil Campkin",
          role: "SUPER_ADMIN",
          isActive: true,
        },
      });
      console.log(`  ✓ Admin user created (email: admin@campkinmotors.co.uk, password: changeme123)`);
      console.log(`  ⚠️  IMPORTANT: Change the password immediately after first login!`);
    } catch (error) {
      console.error(`  ✗ Failed to create admin user:`, error);
    }
  } else {
    console.log(`  ℹ️  Admin user already exists, skipping...`);
  }
}

async function main() {
  console.log("🚀 Starting data migration from JSON to PostgreSQL...\n");

  try {
    // Load JSON data
    const data = await loadJsonData();
    console.log("✓ Loaded JSON data successfully");

    // Run migrations in order (respecting foreign key dependencies)
    await migrateVehicles(data.vehicles || []);
    await migrateWarehouseUnits(data.warehouse?.sections || []);
    await migrateServices(data.services || []);
    await migrateTestimonials(data.testimonials || []);
    await migrateFaqs(data.faqs || []);
    await migrateSiteConfig(data);
    await migrateLeads();
    await createDefaultAdminUser();

    console.log("\n✅ Migration completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Review migrated data in your database");
    console.log("2. Update API routes to use Prisma instead of file storage");
    console.log("3. Test all features thoroughly");
    console.log("4. Once confirmed working, you can archive the JSON files");

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
