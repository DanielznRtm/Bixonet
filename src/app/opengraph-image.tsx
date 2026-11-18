import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og/frame";

export const alt = "bixo.net: ache sua república perto da faculdade";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    eyebrow: "Passou no vestibular?",
    title: "Ache sua rep perto",
    highlight: "da faculdade.",
    subtitle:
      "Repúblicas, kitnets e os contatos de moradia da faculdade, perto do campus.",
    chips: ["Sorocaba (SP)", "Grátis"],
  });
}
