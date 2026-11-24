import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const file = (path) =>
  readFileSync(new URL(`../public/${path}`, import.meta.url));
const raw = file("data/dashboard.json");
const data = JSON.parse(raw);
const manifest = JSON.parse(file("data/temporal-profiles.json"));
test("derivamos cada perfil y su tabla completa del JSON conservado", () => {
  assert.equal(
    manifest.sourceSha256,
    createHash("sha256").update(raw).digest("hex"),
  );
  const shapes = new Set();
  for (const profile of Object.values(manifest.profiles)) {
    const rows = data.temperaturaRegional.filter(
      (row) =>
        (!profile.from || row.datetime >= profile.from) &&
        (!profile.until || row.datetime <= profile.until),
    );
    assert.equal(profile.n, rows.length);
    assert.equal(profile.min, Math.min(...rows.map((row) => row[profile.key])));
    assert.equal(profile.max, Math.max(...rows.map((row) => row[profile.key])));
    const html = file(profile.table).toString();
    assert.equal((html.match(/<tr>/g) || []).length, rows.length + 1);
    assert.ok(!html.includes("<script"));
    for (const row of rows)
      assert.ok(html.includes(`data-exact="${row[profile.key]}"`));
    const stroke = file(profile.stroke);
    shapes.add(createHash("sha256").update(stroke).digest("hex"));
    for (const asset of [profile.stroke, profile.maskTop, profile.maskBottom])
      assert.ok(file(asset).length <= 250000);
    assert.ok(file(profile.maskTop).toString().includes("clipPath"));
  }
  assert.equal(shapes.size, 8);
});
