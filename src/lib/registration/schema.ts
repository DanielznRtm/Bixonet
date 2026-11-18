import { z } from "zod";
import { AMENITY_LABEL } from "@/lib/republic/amenities";
import { normalizeInstagram, normalizeWhatsapp } from "./phone";

export const MAX_PHOTOS = 8;
export const AMENITY_KEYS = Object.keys(AMENITY_LABEL) as [string, ...string[]];

/** Número inteiro opcional vindo de <input type="number"> (vazio vira null). */
const optionalInt = (min: number, max: number, label: string) =>
  z.preprocess(
    (v) =>
      v === "" || v === null || v === undefined || Number.isNaN(v) ? null : Number(v),
    z
      .number({ error: `${label}: use só números` })
      .int(`${label}: use um número inteiro`)
      .min(min, `${label}: mínimo ${min}`)
      .max(max, `${label}: máximo ${max}`)
      .nullable(),
  );

// ---------------------------------------------------------------------------
// Etapas do formulário (cada uma valida sozinha antes de avançar)
// ---------------------------------------------------------------------------

export const basicsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Dê um nome para a república.")
      .max(80, "Nome muito longo (até 80 caracteres)."),
    kind: z.enum(["male", "female", "mixed"], { error: "Escolha o tipo da república." }),
    totalResidents: optionalInt(1, 50, "Moradores"),
    openSpots: z.preprocess(
      (v) => (v === "" || v === undefined ? 0 : Number(v)),
      z.number().int().min(0, "Vagas: mínimo 0").max(30, "Vagas: máximo 30"),
    ),
    priceMin: optionalInt(0, 10_000, "Preço mínimo"),
    priceMax: optionalInt(0, 10_000, "Preço máximo"),
  })
  .refine((d) => d.priceMax === null || d.priceMin === null || d.priceMax >= d.priceMin, {
    message: "O preço máximo precisa ser maior ou igual ao mínimo.",
    path: ["priceMax"],
  });

export const locationSchema = z.object({
  citySlug: z.string().min(1, "Escolha a cidade."),
  neighborhood: z
    .string()
    .trim()
    .min(2, "Informe o bairro.")
    .max(80, "Nome do bairro muito longo."),
  // Caixa em volta do estado de SP; o banco ainda arredonda para ~100 m.
  lat: z.number({ error: "Marque o ponto no mapa." }).min(-25.4).max(-19.7),
  lng: z.number({ error: "Marque o ponto no mapa." }).min(-53.2).max(-44.1),
  institutionIds: z.array(z.uuid()).max(6, "Escolha até 6 faculdades."),
});

export const houseSchema = z.object({
  description: z
    .string()
    .trim()
    .min(30, "Conte um pouco mais sobre a casa (pelo menos 30 caracteres).")
    .max(2000, "Descrição muito longa (até 2000 caracteres)."),
  houseRules: z.string().trim().max(2000, "Regras muito longas (até 2000 caracteres)."),
  amenities: z.array(z.enum(AMENITY_KEYS)),
});

export const photosSchema = z.object({
  photos: z.array(z.url()).max(MAX_PHOTOS, `Até ${MAX_PHOTOS} fotos.`),
});

export const contactSchema = z.object({
  contactName: z
    .string()
    .trim()
    .min(2, "Informe um nome para contato.")
    .max(80, "Nome muito longo."),
  whatsapp: z
    .string()
    .refine(
      (v) => normalizeWhatsapp(v) !== null,
      "WhatsApp inválido. Ex.: (15) 99123-4567",
    ),
  instagram: z
    .string()
    .refine(
      (v) => v.trim() === "" || normalizeInstagram(v) !== null,
      "Instagram inválido.",
    ),
  consentResident: z.literal(true, {
    error: "Confirme que você mora na república ou tem autorização dos moradores.",
  }),
  consentPublic: z.literal(true, {
    error: "É preciso autorizar a exibição para publicar a república.",
  }),
});

export const STEPS = [
  { id: "basico", title: "Básico", schema: basicsSchema },
  { id: "local", title: "Onde fica", schema: locationSchema },
  { id: "casa", title: "A casa", schema: houseSchema },
  { id: "fotos", title: "Fotos", schema: photosSchema },
  { id: "contato", title: "Contato", schema: contactSchema },
] as const;

export const registrationSchema = basicsSchema
  .and(locationSchema)
  .and(houseSchema)
  .and(photosSchema)
  .and(contactSchema);

export type RegistrationInput = z.input<typeof registrationSchema>;
export type RegistrationData = z.output<typeof registrationSchema>;

/** Campos de cada etapa (para o react-hook-form validar só a etapa atual). */
export const STEP_FIELDS: (keyof RegistrationInput)[][] = [
  ["name", "kind", "totalResidents", "openSpots", "priceMin", "priceMax"],
  ["citySlug", "neighborhood", "lat", "lng", "institutionIds"],
  ["description", "houseRules", "amenities"],
  ["photos"],
  ["contactName", "whatsapp", "instagram", "consentResident", "consentPublic"],
];

export const EMPTY_REGISTRATION: RegistrationInput = {
  name: "",
  kind: undefined as unknown as "mixed",
  totalResidents: null,
  openSpots: 0,
  priceMin: null,
  priceMax: null,
  citySlug: "sorocaba",
  neighborhood: "",
  lat: undefined as unknown as number,
  lng: undefined as unknown as number,
  institutionIds: [],
  description: "",
  houseRules: "",
  amenities: [],
  photos: [],
  contactName: "",
  whatsapp: "",
  instagram: "",
  consentResident: false as unknown as true,
  consentPublic: false as unknown as true,
};
