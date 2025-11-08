import { injectContentIntoHTML } from "@/lib/content/injector";
import { parseHTML } from "@/lib/content/parser";
import type { ContentSchema } from "@/types/content";

const HTML_URL =
  "https://raw.githubusercontent.com/stefjnl/zincafe-zweeloo/main/index.html";
const CONTENT_URL =
  "https://raw.githubusercontent.com/stefjnl/zincafe-zweeloo/main/contents/content.json";

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`
    );
  }
  return response.text();
}

async function main(): Promise<void> {
  const [html, contentJson] = await Promise.all([
    fetchText(HTML_URL),
    fetchText(CONTENT_URL),
  ]);
  const content = JSON.parse(contentJson) as ContentSchema;

  const injected = injectContentIntoHTML(html, content);
  const originalHighlightCount = (html.match(/cognicms-changed/g) ?? []).length;
  const injectedHighlightCount = (injected.match(/cognicms-changed/g) ?? [])
    .length;

  console.log(`Original highlight count: ${originalHighlightCount}`);
  console.log(`Injected highlight count: ${injectedHighlightCount}`);
  if (injectedHighlightCount > originalHighlightCount) {
    const contexts: string[] = [];
    let searchIndex = 0;
    while (contexts.length < 5) {
      const foundIndex = injected.indexOf("cognicms-changed", searchIndex);
      if (foundIndex === -1) {
        break;
      }
      const start = Math.max(0, foundIndex - 60);
      const end = Math.min(injected.length, foundIndex + 120);
      contexts.push(injected.slice(start, end));
      searchIndex = foundIndex + 1;
    }
    console.log("Sample highlight contexts:");
    contexts.forEach((excerpt, index) => {
      console.log(`Context ${index + 1}:\n${excerpt}\n`);
    });
  }

  const matches = injected === html;
  console.log(`Injected HTML matches original: ${matches}`);

  if (!matches) {
    const highlightClass = "cognicms-changed";
    const $injected = parseHTML(injected);
    const $original = parseHTML(html);
    const changedSummaries: string[] = [];
    $injected(`.${highlightClass}`).each((index, element) => {
      const node = $injected(element);
      const tagName = element.tagName ?? "node";
      const classes =
        node.attr("class")?.split(/\s+/).filter(Boolean).join(" ") ??
        "(no classes)";
      const id = node.attr("id");
      const labelParts = [`${tagName}`];
      if (id) {
        labelParts.push(`#${id}`);
      }
      labelParts.push(`.${classes}`);
      changedSummaries.push(labelParts.join(" "));
    });
    console.log("Changed element summaries:");
    changedSummaries.slice(0, 20).forEach((summary, index) => {
      console.log(`${index + 1}. ${summary}`);
    });
    if (changedSummaries.length > 20) {
      console.log(`...and ${changedSummaries.length - 20} more`);
    }

    const selectorsToInspect = [
      ".bijeenkomsten",
      ".bijeenkomsten .bijeenkomst-card",
      ".praktisch",
      ".praktisch .directions",
      ".contact",
    ];
    selectorsToInspect.forEach((selector) => {
      const injectedHTML = $injected(selector).first().html();
      const originalHTML = $original(selector).first().html();
      const matchesSelector = injectedHTML === originalHTML;
      console.log(
        `Selector ${selector} matches: ${matchesSelector}, ` +
          `injected length=${injectedHTML?.length ?? "n/a"}, original length=${
            originalHTML?.length ?? "n/a"
          }`
      );
      if (!matchesSelector) {
        console.log(`Injected snippet for ${selector}:`);
        console.log(injectedHTML?.slice(0, 300));
        console.log(`Original snippet for ${selector}:`);
        console.log(originalHTML?.slice(0, 300));
      }
    });

    const length = Math.max(injected.length, html.length);
    let diffIndex = -1;
    for (let index = 0; index < length; index += 1) {
      if (injected[index] !== html[index]) {
        diffIndex = index;
        break;
      }
    }
    console.log(`First difference at index: ${diffIndex}`);
    if (diffIndex >= 0) {
      console.log("Original snippet:");
      console.log(html.slice(Math.max(0, diffIndex - 60), diffIndex + 120));
      console.log("Injected snippet:");
      console.log(injected.slice(Math.max(0, diffIndex - 60), diffIndex + 120));
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
