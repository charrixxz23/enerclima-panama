import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml } from "../lib/html.ts";
test("conservamos las etiquetas como texto al construir encabezados estaticos", () => {
  const value = "<script title=\"x & y\">'dato'</script>";
  const escaped = escapeHtml(value);
  assert.equal(
    escaped,
    "&lt;script title=&quot;x &amp; y&quot;&gt;&#39;dato&#39;&lt;/script&gt;",
  );
  assert.ok(!escaped.includes("<script"));
  assert.equal(escapeHtml("Asociación · Panamá"), "Asociación · Panamá");
});
