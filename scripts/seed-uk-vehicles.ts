#!/usr/bin/env tsx
/**
 * UK Vehicle Database Seed Script
 *
 * Populates comprehensive UK market vehicle data:
 * - Makes (manufacturers)
 * - Models (car models by make)
 * - Configurations (trim levels, engines, specs)
 */

import { PrismaClient, FuelType, TransmissionType, DrivetrainType } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================
// UK VEHICLE MAKES
// ============================================

const ukVehicleMakes = [
  // British Makes
  { name: "Aston Martin", slug: "aston-martin", country: "UK", displayOrder: 1 },
  { name: "Bentley", slug: "bentley", country: "UK", displayOrder: 2 },
  { name: "Jaguar", slug: "jaguar", country: "UK", displayOrder: 3 },
  { name: "Land Rover", slug: "land-rover", country: "UK", displayOrder: 4 },
  { name: "Lotus", slug: "lotus", country: "UK", displayOrder: 5 },
  { name: "McLaren", slug: "mclaren", country: "UK", displayOrder: 6 },
  { name: "Mini", slug: "mini", country: "UK", displayOrder: 7 },
  { name: "Morgan", slug: "morgan", country: "UK", displayOrder: 8 },
  { name: "Rolls-Royce", slug: "rolls-royce", country: "UK", displayOrder: 9 },
  { name: "Vauxhall", slug: "vauxhall", country: "UK", displayOrder: 10 },

  // German Makes (popular in UK)
  { name: "Audi", slug: "audi", country: "Germany", displayOrder: 11 },
  { name: "BMW", slug: "bmw", country: "Germany", displayOrder: 12 },
  { name: "Mercedes-Benz", slug: "mercedes-benz", country: "Germany", displayOrder: 13 },
  { name: "Porsche", slug: "porsche", country: "Germany", displayOrder: 14 },
  { name: "Volkswagen", slug: "volkswagen", country: "Germany", displayOrder: 15 },
  { name: "Smart", slug: "smart", country: "Germany", displayOrder: 16 },

  // Japanese Makes (popular in UK)
  { name: "Honda", slug: "honda", country: "Japan", displayOrder: 17 },
  { name: "Lexus", slug: "lexus", country: "Japan", displayOrder: 18 },
  { name: "Mazda", slug: "mazda", country: "Japan", displayOrder: 19 },
  { name: "Mitsubishi", slug: "mitsubishi", country: "Japan", displayOrder: 20 },
  { name: "Nissan", slug: "nissan", country: "Japan", displayOrder: 21 },
  { name: "Subaru", slug: "subaru", country: "Japan", displayOrder: 22 },
  { name: "Suzuki", slug: "suzuki", country: "Japan", displayOrder: 23 },
  { name: "Toyota", slug: "toyota", country: "Japan", displayOrder: 24 },

  // Korean Makes
  { name: "Hyundai", slug: "hyundai", country: "South Korea", displayOrder: 25 },
  { name: "Kia", slug: "kia", country: "South Korea", displayOrder: 26 },

  // French Makes (popular in UK)
  { name: "Citroën", slug: "citroen", country: "France", displayOrder: 27 },
  { name: "DS", slug: "ds", country: "France", displayOrder: 28 },
  { name: "Peugeot", slug: "peugeot", country: "France", displayOrder: 29 },
  { name: "Renault", slug: "renault", country: "France", displayOrder: 30 },

  // Italian Makes
  { name: "Alfa Romeo", slug: "alfa-romeo", country: "Italy", displayOrder: 31 },
  { name: "Fiat", slug: "fiat", country: "Italy", displayOrder: 32 },
  { name: "Ferrari", slug: "ferrari", country: "Italy", displayOrder: 33 },
  { name: "Lamborghini", slug: "lamborghini", country: "Italy", displayOrder: 34 },
  { name: "Maserati", slug: "maserati", country: "Italy", displayOrder: 35 },

  // American Makes
  { name: "Ford", slug: "ford", country: "USA", displayOrder: 36 },
  { name: "Jeep", slug: "jeep", country: "USA", displayOrder: 37 },
  { name: "Tesla", slug: "tesla", country: "USA", displayOrder: 38 },

  // Other European
  { name: "Seat", slug: "seat", country: "Spain", displayOrder: 39 },
  { name: "Skoda", slug: "skoda", country: "Czech Republic", displayOrder: 40 },
  { name: "Volvo", slug: "volvo", country: "Sweden", displayOrder: 41 },

  // Chinese Makes (emerging in UK)
  { name: "BYD", slug: "byd", country: "China", displayOrder: 42 },
  { name: "MG", slug: "mg", country: "China", displayOrder: 43 },
  { name: "Polestar", slug: "polestar", country: "China", displayOrder: 44 },
];

// ============================================
// POPULAR UK MODELS BY MAKE
// ============================================

const ukVehicleModels = [
  // Ford (Top UK seller)
  { make: "ford", name: "Fiesta", bodyType: "Hatchback", segment: "Supermini", yearStart: 1976, yearEnd: 2023 },
  { make: "ford", name: "Focus", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 1998 },
  { make: "ford", name: "Puma", bodyType: "SUV", segment: "Compact SUV", yearStart: 2019 },
  { make: "ford", name: "Kuga", bodyType: "SUV", segment: "Mid-size SUV", yearStart: 2008 },
  { make: "ford", name: "Mustang", bodyType: "Coupe", segment: "Sports Car", yearStart: 1964 },
  { make: "ford", name: "Ranger", bodyType: "Pickup", segment: "Pickup Truck", yearStart: 1983 },

  // Vauxhall (UK brand)
  { make: "vauxhall", name: "Corsa", bodyType: "Hatchback", segment: "Supermini", yearStart: 1982 },
  { make: "vauxhall", name: "Astra", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 1979 },
  { make: "vauxhall", name: "Insignia", bodyType: "Saloon", segment: "Large Family Car", yearStart: 2008 },
  { make: "vauxhall", name: "Mokka", bodyType: "SUV", segment: "Compact SUV", yearStart: 2012 },
  { make: "vauxhall", name: "Grandland", bodyType: "SUV", segment: "Mid-size SUV", yearStart: 2017 },

  // Volkswagen (Very popular in UK)
  { make: "volkswagen", name: "Polo", bodyType: "Hatchback", segment: "Supermini", yearStart: 1975 },
  { make: "volkswagen", name: "Golf", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 1974 },
  { make: "volkswagen", name: "Passat", bodyType: "Saloon", segment: "Large Family Car", yearStart: 1973 },
  { make: "volkswagen", name: "Tiguan", bodyType: "SUV", segment: "Compact SUV", yearStart: 2007 },
  { make: "volkswagen", name: "T-Roc", bodyType: "SUV", segment: "Compact SUV", yearStart: 2017 },
  { make: "volkswagen", name: "ID.3", bodyType: "Hatchback", segment: "Electric", yearStart: 2020 },
  { make: "volkswagen", name: "ID.4", bodyType: "SUV", segment: "Electric SUV", yearStart: 2021 },

  // BMW (Premium UK market)
  { make: "bmw", name: "1 Series", bodyType: "Hatchback", segment: "Premium Compact", yearStart: 2004 },
  { make: "bmw", name: "3 Series", bodyType: "Saloon", segment: "Premium Mid-size", yearStart: 1975 },
  { make: "bmw", name: "5 Series", bodyType: "Saloon", segment: "Executive", yearStart: 1972 },
  { make: "bmw", name: "X1", bodyType: "SUV", segment: "Compact SUV", yearStart: 2009 },
  { make: "bmw", name: "X3", bodyType: "SUV", segment: "Mid-size SUV", yearStart: 2003 },
  { make: "bmw", name: "X5", bodyType: "SUV", segment: "Large SUV", yearStart: 1999 },
  { make: "bmw", name: "i4", bodyType: "Saloon", segment: "Electric", yearStart: 2021 },

  // Mercedes-Benz
  { make: "mercedes-benz", name: "A-Class", bodyType: "Hatchback", segment: "Premium Compact", yearStart: 1997 },
  { make: "mercedes-benz", name: "C-Class", bodyType: "Saloon", segment: "Executive", yearStart: 1993 },
  { make: "mercedes-benz", name: "E-Class", bodyType: "Saloon", segment: "Executive", yearStart: 1993 },
  { make: "mercedes-benz", name: "GLA", bodyType: "SUV", segment: "Compact SUV", yearStart: 2013 },
  { make: "mercedes-benz", name: "GLC", bodyType: "SUV", segment: "Mid-size SUV", yearStart: 2015 },
  { make: "mercedes-benz", name: "EQC", bodyType: "SUV", segment: "Electric SUV", yearStart: 2019 },

  // Audi
  { make: "audi", name: "A1", bodyType: "Hatchback", segment: "Supermini", yearStart: 2010 },
  { make: "audi", name: "A3", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 1996 },
  { make: "audi", name: "A4", bodyType: "Saloon", segment: "Executive", yearStart: 1994 },
  { make: "audi", name: "Q3", bodyType: "SUV", segment: "Compact SUV", yearStart: 2011 },
  { make: "audi", name: "Q5", bodyType: "SUV", segment: "Mid-size SUV", yearStart: 2008 },
  { make: "audi", name: "e-tron", bodyType: "SUV", segment: "Electric SUV", yearStart: 2019 },

  // Toyota (Reliable, popular)
  { make: "toyota", name: "Yaris", bodyType: "Hatchback", segment: "Supermini", yearStart: 1999 },
  { make: "toyota", name: "Corolla", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 1966 },
  { make: "toyota", name: "Camry", bodyType: "Saloon", segment: "Large Family Car", yearStart: 1982 },
  { make: "toyota", name: "RAV4", bodyType: "SUV", segment: "Compact SUV", yearStart: 1994 },
  { make: "toyota", name: "C-HR", bodyType: "SUV", segment: "Compact SUV", yearStart: 2016 },
  { make: "toyota", name: "Prius", bodyType: "Hatchback", segment: "Hybrid", yearStart: 1997 },

  // Honda
  { make: "honda", name: "Jazz", bodyType: "Hatchback", segment: "Supermini", yearStart: 2001 },
  { make: "honda", name: "Civic", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 1972 },
  { make: "honda", name: "CR-V", bodyType: "SUV", segment: "Compact SUV", yearStart: 1995 },
  { make: "honda", name: "HR-V", bodyType: "SUV", segment: "Compact SUV", yearStart: 2015 },

  // Nissan
  { make: "nissan", name: "Micra", bodyType: "Hatchback", segment: "Supermini", yearStart: 1982 },
  { make: "nissan", name: "Juke", bodyType: "SUV", segment: "Compact SUV", yearStart: 2010 },
  { make: "nissan", name: "Qashqai", bodyType: "SUV", segment: "Compact SUV", yearStart: 2006 },
  { make: "nissan", name: "X-Trail", bodyType: "SUV", segment: "Mid-size SUV", yearStart: 2000 },
  { make: "nissan", name: "Leaf", bodyType: "Hatchback", segment: "Electric", yearStart: 2010 },

  // Hyundai
  { make: "hyundai", name: "i10", bodyType: "Hatchback", segment: "City Car", yearStart: 2007 },
  { make: "hyundai", name: "i20", bodyType: "Hatchback", segment: "Supermini", yearStart: 2008 },
  { make: "hyundai", name: "i30", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 2007 },
  { make: "hyundai", name: "Tucson", bodyType: "SUV", segment: "Compact SUV", yearStart: 2004 },
  { make: "hyundai", name: "Kona", bodyType: "SUV", segment: "Compact SUV", yearStart: 2017 },
  { make: "hyundai", name: "Ioniq 5", bodyType: "SUV", segment: "Electric SUV", yearStart: 2021 },

  // Kia
  { make: "kia", name: "Picanto", bodyType: "Hatchback", segment: "City Car", yearStart: 2004 },
  { make: "kia", name: "Rio", bodyType: "Hatchback", segment: "Supermini", yearStart: 2000 },
  { make: "kia", name: "Ceed", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 2006 },
  { make: "kia", name: "Sportage", bodyType: "SUV", segment: "Compact SUV", yearStart: 1993 },
  { make: "kia", name: "Sorento", bodyType: "SUV", segment: "Large SUV", yearStart: 2002 },
  { make: "kia", name: "EV6", bodyType: "SUV", segment: "Electric SUV", yearStart: 2021 },

  // Tesla (Electric)
  { make: "tesla", name: "Model 3", bodyType: "Saloon", segment: "Electric", yearStart: 2017 },
  { make: "tesla", name: "Model Y", bodyType: "SUV", segment: "Electric SUV", yearStart: 2020 },
  { make: "tesla", name: "Model S", bodyType: "Saloon", segment: "Electric Executive", yearStart: 2012 },
  { make: "tesla", name: "Model X", bodyType: "SUV", segment: "Electric SUV", yearStart: 2015 },

  // Peugeot
  { make: "peugeot", name: "108", bodyType: "Hatchback", segment: "City Car", yearStart: 2014, yearEnd: 2022 },
  { make: "peugeot", name: "208", bodyType: "Hatchback", segment: "Supermini", yearStart: 2012 },
  { make: "peugeot", name: "308", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 2007 },
  { make: "peugeot", name: "2008", bodyType: "SUV", segment: "Compact SUV", yearStart: 2013 },
  { make: "peugeot", name: "3008", bodyType: "SUV", segment: "Compact SUV", yearStart: 2008 },
  { make: "peugeot", name: "5008", bodyType: "SUV", segment: "Large SUV", yearStart: 2009 },

  // Renault
  { make: "renault", name: "Clio", bodyType: "Hatchback", segment: "Supermini", yearStart: 1990 },
  { make: "renault", name: "Megane", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 1995 },
  { make: "renault", name: "Captur", bodyType: "SUV", segment: "Compact SUV", yearStart: 2013 },
  { make: "renault", name: "Kadjar", bodyType: "SUV", segment: "Compact SUV", yearStart: 2015 },
  { make: "renault", name: "Zoe", bodyType: "Hatchback", segment: "Electric", yearStart: 2012 },

  // Skoda (VW Group, popular in UK)
  { make: "skoda", name: "Fabia", bodyType: "Hatchback", segment: "Supermini", yearStart: 1999 },
  { make: "skoda", name: "Octavia", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 1996 },
  { make: "skoda", name: "Superb", bodyType: "Saloon", segment: "Executive", yearStart: 2001 },
  { make: "skoda", name: "Karoq", bodyType: "SUV", segment: "Compact SUV", yearStart: 2017 },
  { make: "skoda", name: "Kodiaq", bodyType: "SUV", segment: "Large SUV", yearStart: 2016 },

  // Mini (UK icon)
  { make: "mini", name: "Hatch", bodyType: "Hatchback", segment: "Supermini", yearStart: 2001 },
  { make: "mini", name: "Clubman", bodyType: "Estate", segment: "Small Family Car", yearStart: 2007 },
  { make: "mini", name: "Countryman", bodyType: "SUV", segment: "Compact SUV", yearStart: 2010 },
  { make: "mini", name: "Electric", bodyType: "Hatchback", segment: "Electric", yearStart: 2024 },

  // Land Rover (UK icon)
  { make: "land-rover", name: "Discovery Sport", bodyType: "SUV", segment: "Compact SUV", yearStart: 2014 },
  { make: "land-rover", name: "Discovery", bodyType: "SUV", segment: "Large SUV", yearStart: 1989 },
  { make: "land-rover", name: "Range Rover Evoque", bodyType: "SUV", segment: "Compact SUV", yearStart: 2011 },
  { make: "land-rover", name: "Range Rover Sport", bodyType: "SUV", segment: "Mid-size SUV", yearStart: 2005 },
  { make: "land-rover", name: "Range Rover", bodyType: "SUV", segment: "Luxury SUV", yearStart: 1970 },
  { make: "land-rover", name: "Defender", bodyType: "SUV", segment: "Off-road SUV", yearStart: 1983 },

  // Jaguar (UK premium)
  { make: "jaguar", name: "XE", bodyType: "Saloon", segment: "Executive", yearStart: 2015 },
  { make: "jaguar", name: "XF", bodyType: "Saloon", segment: "Executive", yearStart: 2007 },
  { make: "jaguar", name: "F-Pace", bodyType: "SUV", segment: "Mid-size SUV", yearStart: 2015 },
  { make: "jaguar", name: "E-Pace", bodyType: "SUV", segment: "Compact SUV", yearStart: 2017 },
  { make: "jaguar", name: "I-Pace", bodyType: "SUV", segment: "Electric SUV", yearStart: 2018 },

  // Mazda
  { make: "mazda", name: "2", bodyType: "Hatchback", segment: "Supermini", yearStart: 2002 },
  { make: "mazda", name: "3", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 2003 },
  { make: "mazda", name: "CX-3", bodyType: "SUV", segment: "Compact SUV", yearStart: 2015 },
  { make: "mazda", name: "CX-5", bodyType: "SUV", segment: "Compact SUV", yearStart: 2011 },
  { make: "mazda", name: "MX-5", bodyType: "Convertible", segment: "Sports Car", yearStart: 1989 },

  // Seat
  { make: "seat", name: "Ibiza", bodyType: "Hatchback", segment: "Supermini", yearStart: 1984 },
  { make: "seat", name: "Leon", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 1999 },
  { make: "seat", name: "Arona", bodyType: "SUV", segment: "Compact SUV", yearStart: 2017 },
  { make: "seat", name: "Ateca", bodyType: "SUV", segment: "Compact SUV", yearStart: 2016 },

  // Volvo
  { make: "volvo", name: "V40", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 2012, yearEnd: 2019 },
  { make: "volvo", name: "V60", bodyType: "Estate", segment: "Executive Estate", yearStart: 2010 },
  { make: "volvo", name: "S60", bodyType: "Saloon", segment: "Executive", yearStart: 2000 },
  { make: "volvo", name: "XC40", bodyType: "SUV", segment: "Compact SUV", yearStart: 2017 },
  { make: "volvo", name: "XC60", bodyType: "SUV", segment: "Mid-size SUV", yearStart: 2008 },
  { make: "volvo", name: "XC90", bodyType: "SUV", segment: "Large SUV", yearStart: 2002 },

  // MG (Chinese-owned, UK heritage)
  { make: "mg", name: "3", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 2018 },
  { make: "mg", name: "4", bodyType: "Hatchback", segment: "Small Family Car", yearStart: 2021 },
  { make: "mg", name: "HS", bodyType: "SUV", segment: "Compact SUV", yearStart: 2018 },
  { make: "mg", name: "ZS", bodyType: "SUV", segment: "Compact SUV", yearStart: 2017 },
  { make: "mg", name: "ZS EV", bodyType: "SUV", segment: "Electric SUV", yearStart: 2019 },
];

// ============================================
// COMMON CONFIGURATIONS
// ============================================

const commonConfigurations = [
  // Ford Fiesta configurations
  {
    make: "ford",
    model: "fiesta",
    trim: "Style",
    engineSize: 1.0,
    fuel: "PETROL" as FuelType,
    transmission: "MANUAL" as TransmissionType,
    bhp: 100,
    mpgCombined: 52.3,
    co2Emissions: 122,
    seats: 5,
    yearStart: 2017,
    yearEnd: 2023,
  },
  {
    make: "ford",
    model: "fiesta",
    trim: "ST-Line",
    engineSize: 1.0,
    fuel: "PETROL" as FuelType,
    transmission: "AUTOMATIC" as TransmissionType,
    bhp: 125,
    mpgCombined: 50.4,
    co2Emissions: 127,
    seats: 5,
    yearStart: 2018,
    yearEnd: 2023,
  },

  // VW Golf configurations
  {
    make: "volkswagen",
    model: "golf",
    trim: "Life",
    engineSize: 1.5,
    fuel: "PETROL" as FuelType,
    transmission: "MANUAL" as TransmissionType,
    bhp: 130,
    mpgCombined: 48.7,
    co2Emissions: 132,
    seats: 5,
    yearStart: 2020,
  },
  {
    make: "volkswagen",
    model: "golf",
    trim: "GTI",
    engineSize: 2.0,
    fuel: "PETROL" as FuelType,
    transmission: "AUTOMATIC" as TransmissionType,
    drivetrain: "FWD" as DrivetrainType,
    bhp: 245,
    torque: 370,
    mpgCombined: 38.2,
    co2Emissions: 169,
    seats: 5,
    yearStart: 2020,
  },

  // BMW 3 Series configurations
  {
    make: "bmw",
    model: "3-series",
    trim: "320i Sport",
    engineSize: 2.0,
    fuel: "PETROL" as FuelType,
    transmission: "AUTOMATIC" as TransmissionType,
    drivetrain: "RWD" as DrivetrainType,
    bhp: 184,
    torque: 300,
    acceleration: 7.1,
    mpgCombined: 44.8,
    co2Emissions: 142,
    seats: 5,
    yearStart: 2019,
  },
  {
    make: "bmw",
    model: "3-series",
    trim: "330e M Sport",
    engineSize: 2.0,
    fuel: "PLUG_IN_HYBRID" as FuelType,
    transmission: "AUTOMATIC" as TransmissionType,
    drivetrain: "RWD" as DrivetrainType,
    bhp: 292,
    torque: 420,
    acceleration: 5.9,
    mpgCombined: 176.6,
    co2Emissions: 37,
    seats: 5,
    yearStart: 2019,
  },

  // Tesla Model 3 configurations
  {
    make: "tesla",
    model: "model-3",
    trim: "Long Range AWD",
    engineSize: 0,
    fuel: "ELECTRIC" as FuelType,
    transmission: "AUTOMATIC" as TransmissionType,
    drivetrain: "AWD" as DrivetrainType,
    bhp: 450,
    torque: 493,
    acceleration: 4.4,
    topSpeed: 145,
    mpgCombined: 0,
    co2Emissions: 0,
    seats: 5,
    yearStart: 2021,
  },

  // Toyota Corolla Hybrid
  {
    make: "toyota",
    model: "corolla",
    trim: "Design Hybrid",
    engineSize: 1.8,
    fuel: "HYBRID" as FuelType,
    transmission: "CVT" as TransmissionType,
    bhp: 122,
    mpgCombined: 62.8,
    co2Emissions: 102,
    seats: 5,
    yearStart: 2019,
  },

  // Nissan Qashqai configurations
  {
    make: "nissan",
    model: "qashqai",
    trim: "Acenta Premium",
    engineSize: 1.3,
    fuel: "PETROL" as FuelType,
    transmission: "MANUAL" as TransmissionType,
    bhp: 140,
    mpgCombined: 44.1,
    co2Emissions: 145,
    seats: 5,
    yearStart: 2021,
  },
  {
    make: "nissan",
    model: "qashqai",
    trim: "e-Power Tekna",
    engineSize: 1.5,
    fuel: "HYBRID" as FuelType,
    transmission: "AUTOMATIC" as TransmissionType,
    bhp: 190,
    mpgCombined: 53.3,
    co2Emissions: 120,
    seats: 5,
    yearStart: 2022,
  },
];

// ============================================
// SEED FUNCTIONS
// ============================================

async function seedMakes() {
  console.log("\n🏭 Seeding UK vehicle makes...");

  for (const make of ukVehicleMakes) {
    await prisma.vehicleMake.upsert({
      where: { slug: make.slug },
      update: make,
      create: make,
    });
    console.log(`  ✓ ${make.name} (${make.country})`);
  }

  console.log(`\n✅ Seeded ${ukVehicleMakes.length} makes`);
}

async function seedModels() {
  console.log("\n🚗 Seeding UK vehicle models...");

  for (const modelData of ukVehicleModels) {
    const make = await prisma.vehicleMake.findUnique({
      where: { slug: modelData.make },
    });

    if (!make) {
      console.warn(`  ⚠️  Make not found: ${modelData.make}`);
      continue;
    }

    const slug = modelData.name.toLowerCase().replace(/\s+/g, "-");

    await prisma.vehicleModel.upsert({
      where: {
        makeId_slug: {
          makeId: make.id,
          slug,
        },
      },
      update: {
        name: modelData.name,
        bodyType: modelData.bodyType,
        segment: modelData.segment,
        yearStart: modelData.yearStart,
        yearEnd: modelData.yearEnd,
      },
      create: {
        makeId: make.id,
        name: modelData.name,
        slug,
        bodyType: modelData.bodyType,
        segment: modelData.segment,
        yearStart: modelData.yearStart,
        yearEnd: modelData.yearEnd,
      },
    });

    console.log(`  ✓ ${make.name} ${modelData.name}`);
  }

  console.log(`\n✅ Seeded ${ukVehicleModels.length} models`);
}

async function seedConfigurations() {
  console.log("\n⚙️  Seeding vehicle configurations...");

  for (const config of commonConfigurations) {
    const make = await prisma.vehicleMake.findUnique({
      where: { slug: config.make },
    });

    if (!make) continue;

    const model = await prisma.vehicleModel.findFirst({
      where: {
        makeId: make.id,
        slug: config.model,
      },
    });

    if (!model) {
      console.warn(`  ⚠️  Model not found: ${config.make} ${config.model}`);
      continue;
    }

    // Destructure to remove make and model fields
    const { make: _, model: __, ...configData } = config;

    await prisma.vehicleConfiguration.create({
      data: {
        modelId: model.id,
        ...configData,
      },
    });

    console.log(`  ✓ ${make.name} ${model.name} ${config.trim} ${config.fuel}`);
  }

  console.log(`\n✅ Seeded ${commonConfigurations.length} configurations`);
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log("🚀 Starting UK Vehicle Database Seed...\n");

  try {
    await seedMakes();
    await seedModels();
    await seedConfigurations();

    console.log("\n✅ UK Vehicle Database seeded successfully!");
    console.log("\nDatabase Statistics:");

    const makeCount = await prisma.vehicleMake.count();
    const modelCount = await prisma.vehicleModel.count();
    const configCount = await prisma.vehicleConfiguration.count();

    console.log(`  📊 Makes: ${makeCount}`);
    console.log(`  📊 Models: ${modelCount}`);
    console.log(`  📊 Configurations: ${configCount}`);

    console.log("\n🎯 Next steps:");
    console.log("  1. Run: npm run db:studio");
    console.log("  2. Browse VehicleMake, VehicleModel, VehicleConfiguration tables");
    console.log("  3. Use in your application for vehicle lookups\n");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
