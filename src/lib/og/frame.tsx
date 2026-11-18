import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Imagem de prévia (Open Graph) que aparece quando o link é colado no WhatsApp.
// O ImageResponse não lê CSS variables nem Tailwind: cores em hex, layout com flexbox.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const COLORS = {
  background: "#fbf7f1",
  surface: "#f6ece0",
  primary: "#b5461f",
  text: "#2b1c14",
  muted: "#6b5446",
  accent: "#f6e3a7",
};

type Props = {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  chips?: string[];
};

// Fontes Geist do pacote oficial (licença OFL, em assets/fonts/Geist-OFL.txt).
let fonts: Promise<[Buffer, Buffer]> | undefined;
function loadFonts() {
  fonts ??= Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Geist-Bold.ttf")),
  ]);
  return fonts;
}

export async function ogImage({
  eyebrow,
  title,
  highlight,
  subtitle,
  chips = [],
}: Props) {
  const [regular, bold] = await loadFonts();
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: COLORS.background,
        color: COLORS.text,
        fontFamily: "Geist",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -140,
          right: -140,
          width: 460,
          height: 460,
          borderRadius: 9999,
          background: COLORS.accent,
          opacity: 0.8,
        }}
      />
      <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>
        <span>bixo</span>
        <span style={{ color: COLORS.primary, marginLeft: -7, marginRight: -1 }}>.</span>
        <span>net</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {eyebrow ? (
          <div style={{ display: "flex", fontSize: 30, color: COLORS.muted }}>
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 1000,
          }}
        >
          <span style={{ marginRight: 18 }}>{title}</span>
          {highlight ? <span style={{ color: COLORS.primary }}>{highlight}</span> : null}
        </div>
        {subtitle ? (
          <div
            style={{ display: "flex", fontSize: 32, color: COLORS.muted, maxWidth: 980 }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        {chips.map((chip) => (
          <div
            key={chip}
            style={{
              display: "flex",
              padding: "10px 24px",
              borderRadius: 9999,
              background: COLORS.surface,
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            {chip}
          </div>
        ))}
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
