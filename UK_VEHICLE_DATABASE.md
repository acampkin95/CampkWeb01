# UK Vehicle Database

Comprehensive database of UK market vehicle makes, models, and configurations.

## 🎯 Overview

This database contains:
- **44 Vehicle Makes** (manufacturers) - British, German, Japanese, Korean, French, Italian, American, Chinese
- **100+ Vehicle Models** - Most popular cars sold in the UK market
- **Common Configurations** - Trim levels, engines, specs for popular variants

### Coverage

**British Makes**: Aston Martin, Bentley, Jaguar, Land Rover, Lotus, McLaren, Mini, Morgan, Rolls-Royce, Vauxhall

**German Makes**: Audi, BMW, Mercedes-Benz, Porsche, Volkswagen, Smart

**Japanese Makes**: Honda, Lexus, Mazda, Mitsubishi, Nissan, Subaru, Suzuki, Toyota

**Korean Makes**: Hyundai, Kia

**French Makes**: Citroën, DS, Peugeot, Renault

**Italian Makes**: Alfa Romeo, Fiat, Ferrari, Lamborghini, Maserati

**American Makes**: Ford, Jeep, Tesla

**Other**: BYD, MG, Polestar, Seat, Skoda, Volvo

---

## 📊 Database Schema

### VehicleMake
Manufacturers/brands of vehicles.

```typescript
{
  id: string              // Unique identifier
  name: string            // Ford, BMW, Toyota, etc.
  slug: string            // ford, bmw, toyota (URL-friendly)
  country: string         // Country of origin (UK, Germany, Japan, etc.)
  logoUrl?: string        // Brand logo image
  description?: string    // About the manufacturer
  isActive: boolean       // Currently selling in UK
  displayOrder: number    // For sorting/listing
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Examples**:
- Ford (USA)
- Volkswagen (Germany)
- Toyota (Japan)
- Vauxhall (UK)

### VehicleModel
Specific car models by make.

```typescript
{
  id: string              // Unique identifier
  makeId: string          // Foreign key to VehicleMake
  name: string            // Fiesta, Golf, Corolla, etc.
  slug: string            // fiesta, golf, corolla
  bodyType: string        // Hatchback, Saloon, SUV, Estate, etc.
  segment: string         // Supermini, Small Family Car, Executive, etc.
  yearStart: number       // First year available (e.g., 1998)
  yearEnd?: number        // Last year (null if still produced)
  isActive: boolean       // Currently on sale
  imageUrl?: string       // Model image
  description?: string    // About the model
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Body Types**:
- Hatchback
- Saloon
- Estate
- SUV
- Coupe
- Convertible
- MPV
- Pickup

**Market Segments**:
- City Car (e.g., Hyundai i10)
- Supermini (e.g., Ford Fiesta)
- Small Family Car (e.g., VW Golf)
- Large Family Car (e.g., Ford Mondeo)
- Executive (e.g., BMW 3 Series)
- Compact SUV (e.g., Nissan Qashqai)
- Large SUV (e.g., Land Rover Discovery)
- Sports Car (e.g., Mazda MX-5)

### VehicleConfiguration
Specific variants with detailed specifications.

```typescript
{
  id: string
  modelId: string         // Foreign key to VehicleModel

  // Identification
  trim: string            // Base, SE, SEL, Sport, GTI, etc.
  engineCode?: string     // Manufacturer engine code

  // Engine & Drivetrain
  engineSize: number      // Litres (1.0, 1.5, 2.0, etc.)
  fuel: FuelType          // PETROL, DIESEL, HYBRID, ELECTRIC, etc.
  transmission: TransmissionType  // MANUAL, AUTOMATIC, etc.
  drivetrain: DrivetrainType      // FWD, RWD, AWD, FOUR_WD

  // Performance
  bhp?: number            // Brake horsepower
  torque?: number         // Nm
  acceleration?: number   // 0-60 mph time (seconds)
  topSpeed?: number       // mph

  // Efficiency
  mpgCombined?: number    // Miles per gallon (WLTP)
  co2Emissions?: number   // g/km
  fuelTankSize?: number   // Litres

  // Dimensions (all in mm)
  length?: number
  width?: number
  height?: number
  wheelbase?: number
  bootCapacity?: number   // Litres

  // Weight & Capacity
  kerbWeight?: number     // kg
  maxWeight?: number      // kg (GVW)
  towingCapacity?: number // kg
  seats?: number          // Number of seats

  // UK-Specific
  taxBand?: string        // A, B, C, D, etc. (VED bands)
  insuranceGroup?: string // 1-50 (ABI insurance groups)

  // Availability
  yearStart: number
  yearEnd?: number
  isActive: boolean

  createdAt: DateTime
  updatedAt: DateTime
}
```

**Fuel Types**:
- `PETROL` - Traditional petrol engine
- `DIESEL` - Traditional diesel engine
- `HYBRID` - Self-charging hybrid (HEV)
- `PLUG_IN_HYBRID` - Plug-in hybrid (PHEV)
- `ELECTRIC` - Battery electric vehicle (BEV)
- `MILD_HYBRID` - Mild hybrid (MHEV)
- `LPG` - Liquefied petroleum gas
- `CNG` - Compressed natural gas

**Transmission Types**:
- `MANUAL` - Manual gearbox
- `AUTOMATIC` - Traditional automatic
- `SEMI_AUTOMATIC` - Semi-automatic (e.g., clutchless manual)
- `CVT` - Continuously variable transmission
- `DCT` - Dual-clutch transmission

**Drivetrain Types**:
- `FWD` - Front-wheel drive
- `RWD` - Rear-wheel drive
- `AWD` - All-wheel drive (permanent or on-demand)
- `FOUR_WD` - Four-wheel drive (selectable)

---

## 🚀 Usage

### Seed the Database

```bash
# Seed vehicle makes, models, and configurations
npm run db:seed:vehicles

# Or seed everything (CMS data + vehicles)
npm run db:seed:all
```

**Output**:
```
🚀 Starting UK Vehicle Database Seed...

🏭 Seeding UK vehicle makes...
  ✓ Ford (USA)
  ✓ Vauxhall (UK)
  ✓ Volkswagen (Germany)
  ...
✅ Seeded 44 makes

🚗 Seeding UK vehicle models...
  ✓ Ford Fiesta
  ✓ Ford Focus
  ✓ VW Golf
  ...
✅ Seeded 100+ models

⚙️  Seeding vehicle configurations...
  ✓ Ford Fiesta Style PETROL
  ✓ VW Golf GTI PETROL
  ...
✅ Seeded configurations

✅ UK Vehicle Database seeded successfully!

Database Statistics:
  📊 Makes: 44
  📊 Models: 100+
  📊 Configurations: 10+
```

### Query Examples

#### Get All Makes

```typescript
import { prisma } from '@/lib/prisma';

const makes = await prisma.vehicleMake.findMany({
  where: { isActive: true },
  orderBy: { displayOrder: 'asc' },
});

// Returns: Ford, Vauxhall, BMW, etc.
```

#### Get Models by Make

```typescript
const fordModels = await prisma.vehicleModel.findMany({
  where: {
    make: {
      slug: 'ford',
    },
    isActive: true,
  },
  orderBy: { name: 'asc' },
  include: {
    make: true,
  },
});

// Returns: Fiesta, Focus, Puma, Kuga, Mustang, Ranger
```

#### Get Configurations for Model

```typescript
const golfConfigs = await prisma.vehicleConfiguration.findMany({
  where: {
    model: {
      slug: 'golf',
      make: {
        slug: 'volkswagen',
      },
    },
    isActive: true,
  },
  include: {
    model: {
      include: {
        make: true,
      },
    },
  },
});

// Returns: Golf Life 1.5 PETROL MANUAL, Golf GTI 2.0 PETROL AUTO, etc.
```

#### Search by Fuel Type

```typescript
const electricCars = await prisma.vehicleConfiguration.findMany({
  where: {
    fuel: 'ELECTRIC',
    isActive: true,
  },
  include: {
    model: {
      include: {
        make: true,
      },
    },
  },
  take: 20,
});

// Returns: Tesla Model 3, Nissan Leaf, MG ZS EV, etc.
```

#### Filter by Body Type and Segment

```typescript
const compactSUVs = await prisma.vehicleModel.findMany({
  where: {
    bodyType: 'SUV',
    segment: 'Compact SUV',
    isActive: true,
  },
  include: {
    make: true,
    configurations: {
      where: {
        fuel: {
          in: ['HYBRID', 'PLUG_IN_HYBRID', 'ELECTRIC'],
        },
      },
    },
  },
});

// Returns: Nissan Qashqai, VW Tiguan, Peugeot 3008, etc. with eco configs
```

#### Get Popular Models (Most Common)

```typescript
// Based on UK sales data 2023
const topSellers = await prisma.vehicleModel.findMany({
  where: {
    make: {
      slug: {
        in: ['ford', 'vauxhall', 'volkswagen', 'nissan', 'toyota'],
      },
    },
    name: {
      in: ['Fiesta', 'Corsa', 'Golf', 'Qashqai', 'Puma'],
    },
  },
  include: {
    make: true,
    configurations: true,
  },
});
```

---

## 🔍 API Endpoints (Example)

### GET /api/vehicles/makes

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const makes = await prisma.vehicleMake.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      country: true,
      _count: {
        select: {
          models: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  return NextResponse.json({ makes });
}
```

**Response**:
```json
{
  "makes": [
    {
      "id": "cm123...",
      "name": "Ford",
      "slug": "ford",
      "country": "USA",
      "_count": { "models": 6 }
    },
    ...
  ]
}
```

### GET /api/vehicles/models?make=ford

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const makeSlug = searchParams.get('make');

  const models = await prisma.vehicleModel.findMany({
    where: {
      make: { slug: makeSlug },
      isActive: true,
    },
    include: {
      make: true,
      _count: {
        select: {
          configurations: true,
        },
      },
    },
  });

  return NextResponse.json({ models });
}
```

### GET /api/vehicles/search

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const bodyType = searchParams.get('bodyType');
  const fuel = searchParams.get('fuel');

  const models = await prisma.vehicleModel.findMany({
    where: {
      AND: [
        query ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { make: { name: { contains: query, mode: 'insensitive' } } },
          ],
        } : {},
        bodyType ? { bodyType } : {},
      ],
      isActive: true,
    },
    include: {
      make: true,
      configurations: {
        where: fuel ? { fuel: fuel as any } : {},
        take: 5,
      },
    },
    take: 20,
  });

  return NextResponse.json({ models });
}
```

---

## 📈 Statistics

### UK Market Coverage

| Category | Count | Examples |
|----------|-------|----------|
| **Makes** | 44 | Ford, VW, Toyota, BMW, Tesla |
| **Models** | 100+ | Fiesta, Golf, Corolla, 3 Series |
| **Body Types** | 8 | Hatchback, SUV, Saloon, Estate |
| **Fuel Types** | 8 | Petrol, Diesel, Hybrid, Electric |
| **Segments** | 15+ | Supermini, Family, Executive, SUV |

### Popular Models Included

**Top 20 Best-Selling UK Cars (2023)**:
1. ✅ Ford Puma
2. ✅ Nissan Qashqai
3. ✅ Vauxhall Corsa
4. ✅ VW Golf
5. ✅ Tesla Model Y
6. ✅ Mini Hatch
7. ✅ Kia Sportage
8. ✅ Hyundai Tucson
9. ✅ Audi A3
10. ✅ BMW 3 Series
11. ✅ Nissan Juke
12. ✅ Ford Kuga
13. ✅ MG HS
14. ✅ VW Polo
15. ✅ Mercedes A-Class
16. ✅ Toyota Corolla
17. ✅ Peugeot 3008
18. ✅ VW T-Roc
19. ✅ Hyundai Kona
20. ✅ Land Rover Discovery Sport

**All included in the database!**

---

## 🎨 UI Components (Example)

### Make Selector

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Select } from '@/components/ui/select';

export function MakeSelector({ onChange }: { onChange: (makeId: string) => void }) {
  const [makes, setMakes] = useState([]);

  useEffect(() => {
    fetch('/api/vehicles/makes')
      .then(res => res.json())
      .then(data => setMakes(data.makes));
  }, []);

  return (
    <Select
      label="Select Make"
      options={makes.map(make => ({
        value: make.id,
        label: `${make.name} (${make._count.models} models)`,
      }))}
      onChange={onChange}
    />
  );
}
```

### Model Search

```tsx
export function ModelSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (q: string) => {
    const res = await fetch(`/api/vehicles/search?q=${q}`);
    const data = await res.json();
    setResults(data.models);
  };

  return (
    <div>
      <Input
        label="Search vehicles"
        placeholder="e.g. Golf, BMW, SUV"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          handleSearch(e.target.value);
        }}
      />

      {results.map(model => (
        <div key={model.id}>
          {model.make.name} {model.name} - {model.bodyType}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔄 Extending the Database

### Add More Makes

Edit `scripts/seed-uk-vehicles.ts`:

```typescript
const ukVehicleMakes = [
  // ... existing makes
  { name: "Dacia", slug: "dacia", country: "Romania", displayOrder: 45 },
  { name: "Cupra", slug: "cupra", country: "Spain", displayOrder: 46 },
];
```

### Add More Models

```typescript
const ukVehicleModels = [
  // ... existing models
  { make: "dacia", name: "Sandero", bodyType: "Hatchback", segment: "Supermini", yearStart: 2008 },
  { make: "cupra", name: "Formentor", bodyType: "SUV", segment: "Compact SUV", yearStart: 2020 },
];
```

### Add Configurations

```typescript
const commonConfigurations = [
  // ... existing configs
  {
    make: "dacia",
    model: "sandero",
    trim: "Essential",
    engineSize: 1.0,
    fuel: "PETROL",
    transmission: "MANUAL",
    bhp: 90,
    mpgCombined: 48.7,
    co2Emissions: 132,
    seats: 5,
    yearStart: 2021,
  },
];
```

Then run: `npm run db:seed:vehicles`

---

## 📚 Data Sources

This database is compiled from:
- UK DVLA vehicle registration data
- Manufacturer official specifications
- UK market sales statistics (SMMT)
- Parkers Car Guides
- Auto Trader UK listings
- What Car? specifications

**Accuracy**: Specifications are typical for UK market vehicles. Always verify critical details (tax, insurance, emissions) with official sources for specific VIN/registration.

---

## 🆘 Troubleshooting

### "Make not found" during seed

**Cause**: Model references a make slug that doesn't exist.
**Fix**: Check spelling in `ukVehicleModels` array matches `ukVehicleMakes` slugs exactly.

### Duplicate key errors

**Cause**: Running seed twice without cleaning.
**Fix**: The script uses `upsert` so it should handle duplicates. If issues persist:

```bash
npm run db:reset  # Nuclear option: drops all data and reseeds
```

### Missing configurations

**Solution**: The seed includes sample configurations. To expand:
1. Add more entries to `commonConfigurations` array
2. Run `npm run db:seed:vehicles` again
3. Or add via Prisma Studio manually

---

## ✅ Next Steps

1. **Browse the data**: `npm run db:studio` → VehicleMake/VehicleModel/VehicleConfiguration tables

2. **Create API endpoints**: Add routes in `src/app/api/vehicles/`

3. **Build UI components**: Make/Model selectors, search, filters

4. **Integrate with inventory**: Link your `Vehicle` table to `VehicleModel` via `modelId`

5. **Add DVLA lookup**: Use VRM to populate make/model automatically

6. **Expand configurations**: Add more trims and engine variants

---

## 📊 Database Size

- **Makes**: ~1KB per make × 44 = ~44KB
- **Models**: ~2KB per model × 100 = ~200KB
- **Configurations**: ~5KB per config × 100 = ~500KB

**Total**: ~750KB of vehicle data (expandable to 10MB+ with full UK catalog)

**Performance**: All queries indexed on commonly searched fields (slug, makeId, fuel, bodyType).

---

**Last Updated**: November 2024
**UK Market Data**: 2024 model year
**Source**: Official manufacturer specs + SMMT sales data
