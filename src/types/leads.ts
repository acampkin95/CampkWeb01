export type LeadChannel = "warehouse" | "vehicle";

export type LeadInput = {
  channel: LeadChannel;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  vehicleId?: string;
};

export type LeadRecord = LeadInput & {
  id: string;
  createdAt: string;
};
