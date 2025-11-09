export const DAMAGE_KEYS = ["bodywork", "interior", "mechanical"] as const;
export type DamageKey = (typeof DAMAGE_KEYS)[number];

export type DamageScores = Partial<Record<DamageKey, number>>;

export type BuyingRequest = {
  vrm?: string;
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  askingPrice?: number;
  notes?: string;
  damage?: DamageScores;
};

export type MarketComparable = {
  source: string;
  title: string;
  price: number;
  mileage?: number;
  url?: string;
  location?: string;
};

export type MarketQuery = {
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  vrm?: string;
};

export type BuyingResult = {
  status: "Green" | "Amber" | "Red";
  damageAverage: number;
  offerRange: { min: number; max: number };
  comparables: MarketComparable[];
  talkingPoint: string;
  vehicleProfile?: {
    make?: string;
    model?: string;
    colour?: string;
    fuelType?: string;
    transmission?: string;
    registrationDate?: string;
  };
  motTests?: Array<{ completedDate?: string; testResult?: string }>;
};
