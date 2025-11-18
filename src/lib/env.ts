/**
 * Environment variable validation
 * Run this at application startup to ensure all required variables are set
 */

type EnvVar = {
  name: string;
  required: boolean;
  description: string;
};

const ENV_VARS: EnvVar[] = [
  {
    name: "ADMIN_SESSION_SECRET",
    required: true,
    description: "HMAC secret for signing admin session cookies (generate with: openssl rand -hex 32)",
  },
  {
    name: "ADMIN_PASSCODE_HASH",
    required: false,
    description: "SHA-256 hash of admin passcode (preferred over ADMIN_PASSCODE)",
  },
  {
    name: "ADMIN_PASSCODE",
    required: false,
    description: "Plain admin passcode (legacy, use ADMIN_PASSCODE_HASH instead)",
  },
  {
    name: "DVLA_VES_API_KEY",
    required: false,
    description: "DVLA Vehicle Enquiry Service API key (required for vehicle lookups)",
  },
  {
    name: "DVSA_MOT_API_KEY",
    required: false,
    description: "DVSA MOT History API key (required for vehicle lookups)",
  },
];

export function validateEnv() {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];

    if (envVar.required && !value) {
      missing.push(`${envVar.name}: ${envVar.description}`);
    }
  }

  // Special validation: Either ADMIN_PASSCODE_HASH or ADMIN_PASSCODE must be set
  if (!process.env.ADMIN_PASSCODE_HASH && !process.env.ADMIN_PASSCODE) {
    missing.push("ADMIN_PASSCODE_HASH or ADMIN_PASSCODE: One must be set for admin authentication");
  }

  // Warn if using legacy ADMIN_PASSCODE instead of ADMIN_PASSCODE_HASH
  if (process.env.ADMIN_PASSCODE && !process.env.ADMIN_PASSCODE_HASH) {
    warnings.push(
      "ADMIN_PASSCODE is set but ADMIN_PASSCODE_HASH is not. Consider using ADMIN_PASSCODE_HASH for better security."
    );
  }

  // Warn if vehicle lookup keys are missing (they're optional but needed for full functionality)
  if (!process.env.DVLA_VES_API_KEY || !process.env.DVSA_MOT_API_KEY) {
    warnings.push(
      "DVLA_VES_API_KEY or DVSA_MOT_API_KEY is missing. Vehicle lookup functionality will not work."
    );
  }

  if (missing.length > 0) {
    const errorMessage = [
      "❌ Missing required environment variables:",
      ...missing.map((m) => `  - ${m}`),
      "",
      "See .env.example for configuration details.",
    ].join("\n");

    throw new Error(errorMessage);
  }

  if (warnings.length > 0 && process.env.NODE_ENV === "production") {
    console.warn("⚠️  Environment configuration warnings:");
    for (const warning of warnings) {
      console.warn(`  - ${warning}`);
    }
  }
}
