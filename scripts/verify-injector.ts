import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { injectContentIntoHTML } from "@/lib/content/injector";
import { parseHTML } from "@/lib/content/parser";
import type { ContentSchema } from "@/types/content";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(currentDir, "../public/sample/index.html");
const original = readFileSync(htmlPath, "utf8");

const $ = parseHTML(original);

const metadata: ContentSchema["metadata"] = {
  title: $("title").first().text(),
  description: $("meta[name='description']").attr("content") ?? "",
  keywords: $("meta[name='keywords']").attr("content") ?? undefined,
  lastModified: "",
};

const content: ContentSchema = {
  metadata,
  sections: [],
  assets: { images: [], links: [] },
};

const result = injectContentIntoHTML(original, content);
const matches = result === original;
console.log(`Matches original: ${matches}`);

if (!matches) {
  const length = Math.max(result.length, original.length);
  let diffIndex = -1;
  for (let index = 0; index < length; index += 1) {
    if (result[index] !== original[index]) {
      diffIndex = index;
      break;
    }
  }

  console.log(`First difference at index: ${diffIndex}`);
  if (diffIndex >= 0) {
    console.log("Original snippet:");
    console.log(original.slice(Math.max(0, diffIndex - 40), diffIndex + 80));
    console.log("Result snippet:");
    console.log(result.slice(Math.max(0, diffIndex - 40), diffIndex + 80));
  }
}
