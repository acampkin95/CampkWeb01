"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface VehicleCheckResult {
  success: boolean;
  vrm?: string;
  vin?: string;
  dvla?: any;
  mot?: any;
  database?: {
    make: any;
    model: any;
  };
  valuation?: {
    trade: number;
    retail: number;
    confidence: string;
  };
  audit?: {
    flags: Array<{ severity: string; message: string }>;
    recommendations: string[];
    checkedAt: string;
  };
}

export function CarChecker() {
  const [vrm, setVRM] = useState("");
  const [vin, setVIN] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VehicleCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!vrm && !vin) {
      setError("Please enter a VRM or VIN");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/vehicles/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vrm, vin }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Check failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVRM("");
    setVIN("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Car Checker</h2>
        <p className="text-sm text-slate-600">
          Sanity check potential purchases or part-exchanges. Verify VRM/VIN, check DVLA/MOT records, and get estimated valuations.
        </p>
      </div>

      {error && (
        <Alert variant="error">
          <p className="text-sm font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </Alert>
      )}

      {/* Input Form */}
      {!result && (
        <Card>
          <CardContent className="space-y-4">
            <Input
              label="Vehicle Registration (VRM)"
              placeholder="e.g. AB12 CDE"
              value={vrm}
              onChange={(e) => setVRM(e.target.value.toUpperCase())}
              helperText="UK registration number"
            />

            <div className="text-center text-sm text-slate-400">OR</div>

            <Input
              label="VIN (Vehicle Identification Number)"
              placeholder="e.g. WVWZZZ1JZXW123456"
              value={vin}
              onChange={(e) => setVIN(e.target.value.toUpperCase())}
              helperText="17-character VIN"
            />

            <Button onClick={handleCheck} isLoading={loading} className="w-full">
              {loading ? "Checking..." : "Check Vehicle"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Audit Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">Audit Summary</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.audit?.recommendations.map((rec, i) => {
                const variant = rec.includes("❌")
                  ? "error"
                  : rec.includes("⚠️")
                    ? "warning"
                    : rec.includes("✅")
                      ? "success"
                      : "info";

                return (
                  <Alert key={i} variant={variant}>
                    <p className="text-sm font-semibold">{rec}</p>
                  </Alert>
                );
              })}

              {result.audit?.flags && result.audit.flags.length > 0 && (
                <div className="space-y-2 rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Issues Found
                  </p>
                  {result.audit.flags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span
                        className={
                          flag.severity === "error"
                            ? "text-red-600"
                            : flag.severity === "warning"
                              ? "text-amber-600"
                              : "text-blue-600"
                        }
                      >
                        {flag.severity === "error" ? "❌" : flag.severity === "warning" ? "⚠️" : "ℹ️"}
                      </span>
                      <span className="text-slate-700">{flag.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* DVLA Data */}
          {result.dvla && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">DVLA Records</h3>
                <p className="text-sm text-slate-600">VRM: {result.vrm}</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Make & Model</p>
                    <p className="font-semibold text-slate-900">
                      {result.dvla.make} {result.dvla.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Year</p>
                    <p className="font-semibold text-slate-900">{result.dvla.yearOfManufacture}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Fuel Type</p>
                    <p className="font-semibold text-slate-900">{result.dvla.fuelType}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Colour</p>
                    <p className="font-semibold text-slate-900">{result.dvla.colour}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Engine Size</p>
                    <p className="font-semibold text-slate-900">{result.dvla.engineCapacity}cc</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">CO₂ Emissions</p>
                    <p className="font-semibold text-slate-900">{result.dvla.co2Emissions} g/km</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Tax Status</p>
                    <p
                      className={`font-semibold ${
                        result.dvla.taxStatus === "Taxed" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {result.dvla.taxStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">MOT Status</p>
                    <p
                      className={`font-semibold ${
                        result.dvla.motStatus === "Valid" ? "text-green-600" : "text-amber-600"
                      }`}
                    >
                      {result.dvla.motStatus}
                    </p>
                  </div>
                  {result.dvla.motExpiryDate && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">MOT Expiry</p>
                      <p className="font-semibold text-slate-900">
                        {new Date(result.dvla.motExpiryDate).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  )}
                  {result.dvla.taxDueDate && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Tax Due</p>
                      <p className="font-semibold text-slate-900">
                        {new Date(result.dvla.taxDueDate).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* MOT History */}
          {result.mot && result.mot[0] && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">MOT History</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.mot[0].motTests?.slice(0, 5).map((test: any, i: number) => (
                    <div key={i} className="rounded-lg border border-slate-200 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-semibold text-slate-900">
                          {new Date(test.completedDate).toLocaleDateString("en-GB")}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            test.testResult === "PASSED"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {test.testResult}
                        </span>
                      </div>
                      <div className="grid gap-2 text-sm md:grid-cols-2">
                        <div>
                          <span className="text-slate-600">Mileage:</span>{" "}
                          <span className="font-semibold">{test.odometerValue?.toLocaleString()} miles</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Expiry:</span>{" "}
                          <span className="font-semibold">
                            {new Date(test.expiryDate).toLocaleDateString("en-GB")}
                          </span>
                        </div>
                      </div>
                      {test.rfrAndComments && test.rfrAndComments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {test.rfrAndComments.slice(0, 3).map((comment: any, j: number) => (
                            <p key={j} className="text-xs text-slate-600">
                              • {comment.text}
                            </p>
                          ))}
                          {test.rfrAndComments.length > 3 && (
                            <p className="text-xs text-slate-400">
                              +{test.rfrAndComments.length - 3} more
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Valuation */}
          {result.valuation && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Estimated Valuation</h3>
                <p className="text-sm text-slate-600">
                  Confidence: <span className="font-semibold">{result.valuation.confidence}</span>
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-sm text-blue-600">Trade-In Value</p>
                    <p className="text-2xl font-bold text-blue-900">
                      £{result.valuation.trade.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-600">What you might pay</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="text-sm text-green-600">Retail Value</p>
                    <p className="text-2xl font-bold text-green-900">
                      £{result.valuation.retail.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">What you might sell for</p>
                  </div>
                </div>
                <Alert variant="info" className="mt-4">
                  <p className="text-xs">
                    ⓘ This is a rough estimate. For accurate valuations, use Glass's Guide or CAP HPI.
                  </p>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Database Match */}
          {result.database?.make && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Database Match</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-slate-600">Make:</span>{" "}
                    <span className="font-semibold text-slate-900">{result.database.make.name}</span>
                  </div>
                  {result.database.model && (
                    <div>
                      <span className="text-sm text-slate-600">Model:</span>{" "}
                      <span className="font-semibold text-slate-900">{result.database.model.name}</span>
                    </div>
                  )}
                  {result.database.model?.configurations && result.database.model.configurations.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-slate-900">Matching Configurations:</p>
                      <div className="mt-2 space-y-1">
                        {result.database.model.configurations.map((config: any) => (
                          <div key={config.id} className="rounded-lg bg-slate-50 p-2 text-sm">
                            {config.trim} • {config.engineSize}L {config.fuel} {config.transmission} • {config.bhp}bhp
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Check Another Vehicle
            </Button>
            <Button
              onClick={() => window.print()}
              variant="secondary"
              className="flex-1"
            >
              Print Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
