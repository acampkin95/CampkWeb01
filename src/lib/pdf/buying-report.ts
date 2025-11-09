import PDFDocument from "pdfkit";
import type { BuyingRequest, BuyingResult } from "@/types/buying";
import { DAMAGE_KEYS } from "@/types/buying";

export async function generateBuyingReport(request: BuyingRequest, result: BuyingResult) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 42 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text("Campkin Buying Sanity Check");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#555").text(`Generated: ${new Date().toLocaleString("en-GB")}`);

    doc.moveDown(1);
    doc.fillColor("black").fontSize(14).text("Vehicle summary", { underline: true });
    const lines = [
      request.vrm ? `VRM: ${request.vrm}` : null,
      request.make ? `Make: ${request.make}` : null,
      request.model ? `Model: ${request.model}` : null,
      request.year ? `Year: ${request.year}` : null,
      request.mileage ? `Mileage: ${Number(request.mileage).toLocaleString()} miles` : null,
      request.askingPrice ? `Asking price: £${Number(request.askingPrice).toLocaleString()}` : null,
    ].filter(Boolean) as string[];
    lines.forEach((line) => doc.fontSize(12).text(line));

    doc.moveDown(1);
    doc.fontSize(14).text("Status", { underline: true });
    doc.fontSize(12).text(`Traffic light: ${result.status}`);
    doc.text(`Damage index: ${result.damageAverage.toFixed(1)} / 5`);
    doc.text(`Recommended offer: £${result.offerRange.min.toLocaleString()} – £${result.offerRange.max.toLocaleString()}`);

    doc.moveDown(0.5);
    doc.fontSize(12).text("Damage scores:");
    DAMAGE_KEYS.forEach((key) => {
      const value = request.damage?.[key];
      doc.text(`• ${key}: ${value ?? 1}`);
    });

    doc.moveDown(1);
    doc.fontSize(12).text(result.talkingPoint, { width: 500 });

    if (result.comparables.length > 0) {
      doc.moveDown(1);
      doc.fontSize(14).text("Comparables", { underline: true });
      result.comparables.slice(0, 5).forEach((comp) => {
        doc.fontSize(12).text(`${comp.source} · ${comp.title}`);
        doc.fontSize(11).fillColor("#444").text(`£${comp.price.toLocaleString()}${comp.mileage ? ` · ${comp.mileage.toLocaleString()} miles` : ""}`);
        if (comp.location) {
          doc.text(comp.location);
        }
        if (comp.url) {
          doc.fillColor("#1d4ed8").text(comp.url, { link: comp.url });
        }
        doc.fillColor("black").moveDown(0.4);
      });
    }

    doc.end();
  });
}
