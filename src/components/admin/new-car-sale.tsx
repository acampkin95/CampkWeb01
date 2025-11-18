"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/image-uploader";

interface Make {
  id: string;
  name: string;
  slug: string;
}

interface Model {
  id: string;
  name: string;
  bodyType: string;
  make: Make;
}

interface Configuration {
  id: string;
  trim: string;
  engineSize: number;
  fuel: string;
  transmission: string;
  bhp: number;
  mpgCombined: number;
  co2Emissions: number;
}

export function NewCarSale() {
  // Form state
  const [makeId, setMakeId] = useState("");
  const [modelId, setModelId] = useState("");
  const [configId, setConfigId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [vrm, setVRM] = useState("");
  const [mileage, setMileage] = useState("");
  const [price, setPrice] = useState("");
  const [colour, setColour] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");

  // Data state
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<Configuration | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-fill from VRM
  const [vrmChecking, setVRMChecking] = useState(false);

  // Load makes on mount
  useEffect(() => {
    fetch("/api/vehicles/makes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMakes(data.makes);
        }
      })
      .catch((err) => console.error("Failed to load makes:", err));
  }, []);

  // Load models when make changes
  useEffect(() => {
    if (!makeId) {
      setModels([]);
      setModelId("");
      return;
    }

    fetch(`/api/vehicles/models?makeId=${makeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setModels(data.models);
        }
      })
      .catch((err) => console.error("Failed to load models:", err));
  }, [makeId]);

  // Load configurations when model changes
  useEffect(() => {
    if (!modelId) {
      setConfigurations([]);
      setConfigId("");
      return;
    }

    fetch(`/api/vehicles/configurations?modelId=${modelId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConfigurations(data.configurations);
        }
      })
      .catch((err) => console.error("Failed to load configurations:", err));
  }, [modelId]);

  // Update selected configuration
  useEffect(() => {
    if (configId) {
      const config = configurations.find((c) => c.id === configId);
      setSelectedConfig(config || null);
    } else {
      setSelectedConfig(null);
    }
  }, [configId, configurations]);

  // Auto-fill from VRM
  const handleVRMCheck = async () => {
    if (!vrm || vrm.length < 3) return;

    setVRMChecking(true);
    setError(null);

    try {
      const response = await fetch("/api/vehicles/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vrm }),
      });

      const data = await response.json();

      if (data.success && data.dvla) {
        // Auto-fill fields
        setYear(data.dvla.yearOfManufacture?.toString() || year);
        setColour(data.dvla.colour || colour);

        // Try to match make
        if (data.database?.make) {
          setMakeId(data.database.make.id);

          // Try to match model
          if (data.database?.model) {
            setTimeout(() => setModelId(data.database.model.id), 500);
          }
        }

        // Show audit info
        if (data.audit?.flags && data.audit.flags.some((f: any) => f.severity === "error")) {
          setError("⚠️ Warning: DVLA check found issues with this vehicle");
        }
      }
    } catch (err) {
      console.error("VRM check failed:", err);
    } finally {
      setVRMChecking(false);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleImageUpload = (data: any) => {
    setImages([...images, data.original.url]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get model details for title generation
      const model = models.find((m) => m.id === modelId);
      const make = makes.find((m) => m.id === makeId);

      if (!model || !make) {
        throw new Error("Make and model required");
      }

      const title = `${year} ${make.name} ${model.name}`;

      const vehicleData = {
        title,
        makeId,
        modelId,
        year: parseInt(year),
        vrm: vrm || undefined,
        mileage: parseInt(mileage),
        price: parseInt(price),
        fuel: selectedConfig?.fuel || "PETROL",
        transmission: selectedConfig?.transmission || "MANUAL",
        body: model.bodyType,
        colour,
        description,
        images,
        features,
        status: "IN_PREP",
      };

      // Submit to vehicle creation API
      const response = await fetch("/api/vehicles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create vehicle");
      }

      setSuccess(true);

      // Reset form
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create vehicle listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">New Car Sale</h2>
        <p className="text-sm text-slate-600">
          Add a new vehicle to inventory. Use VRM lookup to auto-fill details.
        </p>
      </div>

      {error && (
        <Alert variant="error">
          <p className="text-sm">{error}</p>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <p className="text-sm font-semibold">✅ Vehicle added successfully!</p>
          <p className="text-sm">Redirecting...</p>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* VRM Quick Lookup */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">Vehicle Registration</h3>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                label="VRM (Optional)"
                placeholder="e.g. AB12 CDE"
                value={vrm}
                onChange={(e) => setVRM(e.target.value.toUpperCase())}
                helperText="Leave blank if not registered yet"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleVRMCheck}
                isLoading={vrmChecking}
                disabled={!vrm || vrmChecking}
                variant="secondary"
                className="mt-6"
              >
                Auto-Fill from DVLA
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Make, Model, Configuration */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">Vehicle Details</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Make *"
              placeholder="Select manufacturer"
              options={makes.map((m) => ({ value: m.id, label: m.name }))}
              value={makeId}
              onChange={setMakeId}
            />

            <Select
              label="Model *"
              placeholder="Select model"
              options={models.map((m) => ({ value: m.id, label: `${m.name} (${m.bodyType})` }))}
              value={modelId}
              onChange={setModelId}
              disabled={!makeId}
            />

            {configurations.length > 0 && (
              <Select
                label="Configuration (Optional)"
                placeholder="Select trim/engine"
                options={configurations.map((c) => ({
                  value: c.id,
                  label: `${c.trim} • ${c.engineSize}L ${c.fuel} ${c.transmission} • ${c.bhp}bhp`,
                }))}
                value={configId}
                onChange={setConfigId}
              />
            )}

            {selectedConfig && (
              <div className="rounded-lg bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-900">Selected Configuration:</p>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div>
                    <span className="text-slate-600">Power:</span> {selectedConfig.bhp}bhp
                  </div>
                  <div>
                    <span className="text-slate-600">MPG:</span> {selectedConfig.mpgCombined}
                  </div>
                  <div>
                    <span className="text-slate-600">CO₂:</span> {selectedConfig.co2Emissions}g/km
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Year *"
                type="number"
                min="1950"
                max={new Date().getFullYear() + 1}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />

              <Input
                label="Colour *"
                placeholder="e.g. Black, Silver, Blue"
                value={colour}
                onChange={(e) => setColour(e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Mileage *"
                type="number"
                placeholder="e.g. 45000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                helperText="In miles"
              />

              <Input
                label="Price *"
                type="number"
                placeholder="e.g. 15995"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                helperText="In GBP (£)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">Description</h3>
          </CardHeader>
          <CardContent>
            <Textarea
              label="Vehicle Description"
              placeholder="Describe the vehicle's condition, history, and selling points..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">Features</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Sat Nav, Leather Seats, Parking Sensors"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                className="flex-1"
              />
              <Button type="button" onClick={handleAddFeature} variant="secondary">
                Add
              </Button>
            </div>

            {features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm"
                  >
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">Images</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploader category="vehicle" onUploadSuccess={handleImageUpload} />

            {images.length > 0 && (
              <div className="grid gap-4 md:grid-cols-4">
                {images.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Vehicle ${index + 1}`}
                      className="h-32 w-full rounded-lg border border-slate-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                      className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" isLoading={loading} disabled={!makeId || !modelId || !year || !mileage || !price}>
            {loading ? "Creating..." : "Create Vehicle Listing"}
          </Button>
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
