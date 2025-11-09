export type DvlaVehicle = {
  registrationNumber: string;
  taxStatus?: string;
  taxDueDate?: string;
  motStatus?: string;
  motExpiryDate?: string;
  make?: string;
  model?: string;
  colour?: string;
  fuelType?: string;
  co2Emissions?: number;
  engineCapacity?: number;
  wheelplan?: string;
  registrationDate?: string;
  euroStatus?: string;
};

export type MotTest = {
  completedDate?: string;
  testResult?: string;
  expiryDate?: string;
  odometerValue?: string;
  odometerResultType?: string;
  odometerUnit?: string;
  rfrAndComments?: Array<{
    text: string;
    type?: string;
    dangerous?: boolean;
  }>; 
};

export type VehicleTaxInput = {
  co2?: number | null;
  registrationDate?: string | null;
  fuelType?: string | null;
  listPrice?: number | null;
};

export type RoadTaxEstimate = {
  regime: "modern" | "legacy" | "pre_2001" | "unknown";
  bandCode?: string;
  bandLabel?: string;
  firstYearRate?: number | null;
  annualRate?: number | null;
  expensiveCarSupplement?: number | null;
  totalAnnual?: number | null;
  notes: string[];
};

export type AirQualityResult = {
  scheme: string;
  status: "Compliant" | "Chargeable" | "Unknown";
  notes: string;
  referenceUrl?: string;
};

export type VehicleLookupResult = {
  dvla?: DvlaVehicle;
  motTests?: MotTest[];
  tax?: RoadTaxEstimate;
  ulez?: AirQualityResult;
  caz?: AirQualityResult;
};
