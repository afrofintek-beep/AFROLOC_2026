import jsPDF from "jspdf";
import QRCode from "qrcode";

export interface CertificateData {
  code: string;
  titular: string;
  morada: string;
  qgsqCell: string;
  validator: string;
  issued: string;
  ats: number;
  verifyUrl: string;
}

// Brand colors (RGB).
const GOLD: [number, number, number] = [212, 168, 83];
const INK: [number, number, number] = [26, 24, 20];
const MUTED: [number, number, number] = [138, 128, 115];
const GREEN: [number, number, number] = [47, 122, 87];

/**
 * Generates a real, verifiable AFROLOC address certificate as a PDF (A4) with
 * an embedded QR code, then triggers a download. Returns the filename.
 */
export async function generateCertificatePdf(c: CertificateData): Promise<string> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 22;

  const qrDataUrl = await QRCode.toDataURL(c.verifyUrl, {
    margin: 1,
    width: 600,
    color: { dark: "#1A1814", light: "#FFFFFF" },
  });

  // Header band
  doc.setFillColor(...INK);
  doc.rect(0, 0, W, 34, "F");
  doc.setFillColor(...GOLD);
  doc.roundedRect(M, 11, 12, 12, 2.5, 2.5, "F");
  doc.setTextColor(245, 240, 232);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("AFROLOC", M + 17, 19.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(169, 158, 140);
  doc.text("Certificado de Morada Verificável", M + 17, 25.5);

  // Title
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CÓDIGO AFROLOC", M, 52);
  doc.setTextColor(...INK);
  doc.setFont("courier", "bold");
  doc.setFontSize(15);
  doc.text(c.code, M, 62);

  // Verified badge
  doc.setFillColor(235, 241, 237);
  doc.roundedRect(M, 69, 70, 9, 4.5, 4.5, "F");
  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`VERIFICADO  ·  ATS ${c.ats}`, M + 6, 74.8);

  // QR (top-right)
  doc.addImage(qrDataUrl, "PNG", W - M - 44, 44, 44, 44);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Verificar online", W - M - 44, 92);

  // Divider
  doc.setDrawColor(230, 220, 204);
  doc.line(M, 100, W - M, 100);

  // Fields
  const rows: [string, string][] = [
    ["Titular", c.titular],
    ["Morada", c.morada],
    ["Célula QGSQ", c.qgsqCell],
    ["Validado por", c.validator],
    ["Emitido", c.issued],
  ];
  let y = 112;
  rows.forEach(([label, value]) => {
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(label.toUpperCase(), M, y);
    doc.setTextColor(...INK);
    doc.setFont(label === "Célula QGSQ" ? "courier" : "helvetica", "bold");
    doc.setFontSize(12);
    doc.text(value, M, y + 6);
    y += 18;
  });

  // Footer
  doc.setDrawColor(230, 220, 204);
  doc.line(M, 262, W - M, 262);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Documento verificável por QR. Aceite por bancos e serviços públicos.", M, 270);
  doc.text(c.verifyUrl, M, 275);
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.text("AFROFINTEK GmbH", W - M, 275, { align: "right" });

  const filename = `AFROLOC-${c.code}.pdf`;
  doc.save(filename);
  return filename;
}
