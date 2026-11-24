import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { brotliDecompressSync } from "node:zlib";

function gsub(buffer) {
  assert.equal(buffer.toString("ascii", 0, 4), "wOF2");
  let cursor = 48,
    offset = 0,
    target;
  const base128 = () => {
    let value = 0;
    for (let i = 0; i < 5; i++) {
      const byte = buffer[cursor++];
      value = value * 128 + (byte & 127);
      if (!(byte & 128)) return value;
    }
    throw new Error("directorio woff2 invalido");
  };
  for (let i = 0; i < buffer.readUInt16BE(12); i++) {
    const flag = buffer[cursor++],
      tag = flag & 63,
      version = flag >> 6;
    const explicit =
      tag === 63 ? buffer.toString("ascii", cursor, (cursor += 4)) : "";
    const original = base128();
    const transformed =
      tag === 10 || tag === 11 ? version !== 3 : version !== 0;
    const length = transformed ? base128() : original;
    if (tag === 28 || explicit === "GSUB") target = [offset, length];
    offset += length;
  }
  assert.ok(target, "encontramos GSUB en el archivo servido");
  const bytes = brotliDecompressSync(
    buffer.subarray(cursor, cursor + buffer.readUInt32BE(20)),
  );
  return bytes.subarray(target[0], target[0] + target[1]);
}
for (const weight of [400, 600])
  test(`verificamos tnum con sustituciones reales en barlow ${weight} autoalojada`, () => {
    const table = gsub(
      readFileSync(
        new URL(
          `../public/fonts/barlow-condensed-${weight}-latin.woff2`,
          import.meta.url,
        ),
      ),
    );
    const list = table.readUInt16BE(6),
      lookupList = table.readUInt16BE(8);
    const features = Array.from(
      { length: table.readUInt16BE(list) },
      (_, i) => list + 2 + i * 6,
    ).filter((p) => table.toString("ascii", p, p + 4) === "tnum");
    assert.ok(features.length > 0, "la etiqueta tnum sobrevive al subconjunto");
    for (const position of features) {
      const feature = list + table.readUInt16BE(position + 4);
      assert.ok(table.readUInt16BE(feature + 2) > 0);
      const index = table.readUInt16BE(feature + 4);
      assert.ok(index < table.readUInt16BE(lookupList));
      const lookup =
        lookupList + table.readUInt16BE(lookupList + 2 + index * 2);
      assert.ok(
        table.readUInt16BE(lookup + 4) > 0,
        "tnum apunta a una sustitucion no vacia",
      );
    }
  });
