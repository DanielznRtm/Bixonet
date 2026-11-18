import { describe, expect, it } from "vitest";
import { parseCsv, parseListingsCsv } from "./csv";

const HEADER =
  "titulo,preco,quartos,mobiliado,link,latitude,longitude,fonte,cidade,ativo,exemplo";

describe("parseCsv", () => {
  it("lida com aspas, vírgula dentro de aspas e BOM", () => {
    expect(parseCsv('﻿a,b\n"x, y","diz ""oi"""\n')).toEqual([
      ["a", "b"],
      ["x, y", 'diz "oi"'],
    ]);
  });

  it("aceita ponto e vírgula (CSV do Excel em português)", () => {
    expect(parseCsv("a;b\n1;2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("parseListingsCsv", () => {
  it("converte uma linha válida", () => {
    const csv = `${HEADER}\nKitnet perto da Unesp,"R$ 1.200",1,sim,https://exemplo.com.br/a,-23.4775,-47.4185,OLX,,,`;
    const { rows, errors } = parseListingsCsv(csv);
    expect(errors).toEqual([]);
    expect(rows[0]).toEqual({
      line: 2,
      data: {
        titulo: "Kitnet perto da Unesp",
        preco: 1200,
        quartos: 1,
        mobiliado: true,
        link: "https://exemplo.com.br/a",
        latitude: -23.4775,
        longitude: -47.4185,
        fonte: "OLX",
        cidade: "sorocaba",
        ativo: true,
        exemplo: false,
      },
    });
  });

  it("aponta erros com o número da linha", () => {
    const csv = [
      HEADER,
      "Ok,900,1,não,https://exemplo.com.br/ok,-23.5,-47.4,,,,",
      "Sem https,900,1,sim,http://exemplo.com.br/x,-23.5,-47.4,,,,",
      "Lat trocada,900,1,sim,https://exemplo.com.br/y,-47.4,-23.5,,,,",
      "Mobília?,900,1,talvez,https://exemplo.com.br/z,-23.5,-47.4,,,,",
      "Repetido,900,1,sim,https://exemplo.com.br/ok,-23.5,-47.4,,,,",
    ].join("\n");
    const { rows, errors } = parseListingsCsv(csv);
    expect(rows).toHaveLength(1);
    expect(errors.map((e) => e.line)).toEqual([3, 4, 4, 5, 6]);
    expect(errors.find((e) => e.line === 3)?.message).toContain("https://");
    expect(errors.find((e) => e.line === 6)?.message).toContain("linha 2");
  });

  it("recusa planilha sem as colunas obrigatórias", () => {
    const { errors } = parseListingsCsv("titulo,preco\nA,100");
    expect(errors[0]?.message).toContain("link");
  });
});
