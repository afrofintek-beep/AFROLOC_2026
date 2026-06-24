import { QRCodeSVG } from "qrcode.react";

/** Real QR code on a light plate, matching the design's rounded white tile. */
export function Qr({
  value,
  size = 54,
  plate = "#F8F5F0",
  fg = "#1A1814",
  pad = 5,
}: {
  value: string;
  size?: number;
  plate?: string;
  fg?: string;
  pad?: number;
}) {
  const inner = size - pad * 2;
  return (
    <div
      style={{
        width: size,
        height: size,
        background: plate,
        borderRadius: 9,
        padding: pad,
        flex: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <QRCodeSVG value={value} size={inner} bgColor={plate} fgColor={fg} level="M" />
    </div>
  );
}
