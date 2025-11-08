import { readFileSync } from "node:fs";
import { load } from "cheerio";

const htmlPath = new URL("../public/sample/index.html", import.meta.url);
const original = readFileSync(htmlPath, "utf8");
const $ = load(original);
const serialized = $.html();
const normalizedOriginal = original.replace(/\r\n/g, "\n");

const equal = serialized === normalizedOriginal;
console.log(`Serialized equals original: ${equal}`);

if (!equal) {
  let diffStart = -1;
  const length = Math.max(serialized.length, normalizedOriginal.length);
  for (let index = 0; index < length; index += 1) {
    if (serialized[index] !== normalizedOriginal[index]) {
      diffStart = index;
      break;
    }
  }

  console.log(`First difference at index ${diffStart}`);
  if (diffStart >= 0) {
    console.log(
      `Original char: ${JSON.stringify(
        normalizedOriginal[diffStart]
      )} (code ${normalizedOriginal.charCodeAt(diffStart)})`
    );
    console.log(
      `Serialized char: ${JSON.stringify(
        serialized[diffStart]
      )} (code ${serialized.charCodeAt(diffStart)})`
    );
  }
  console.log("Original snippet:");
  console.log(
    normalizedOriginal.slice(Math.max(0, diffStart - 40), diffStart + 80)
  );
  console.log("Serialized snippet:");
  console.log(serialized.slice(Math.max(0, diffStart - 40), diffStart + 80));
  console.log("--- Start original ---\n", normalizedOriginal.slice(0, 200));
  console.log("--- Start serialized ---\n", serialized.slice(0, 200));
}
