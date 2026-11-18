import type { MetadataRoute } from "next";

/** Permite "adicionar à tela inicial" no celular, com nome e cores do bixo.net. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "bixo.net: repúblicas perto da faculdade",
    short_name: "bixo.net",
    description: "Ache república, kitnet e os contatos de moradia perto do seu campus.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7f1",
    theme_color: "#b5461f",
    lang: "pt-BR",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
