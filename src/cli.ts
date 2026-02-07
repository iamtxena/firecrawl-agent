#!/usr/bin/env bun
/**
 * Firecrawl Agent CLI
 * Web scraping and crawling using Firecrawl
 */

import { Command } from "commander";
import FirecrawlApp from "@mendable/firecrawl-js";

const program = new Command();

function getClient(): FirecrawlApp {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.error("❌ FIRECRAWL_API_KEY environment variable not set");
    process.exit(1);
  }
  return new FirecrawlApp({ apiKey });
}

interface ScrapeOptions {
  format?: "markdown" | "html" | "text";
  screenshot?: boolean;
  wait?: string;
  output?: "text" | "json";
}

interface CrawlOptions {
  limit?: string;
  depth?: string;
  format?: "markdown" | "html" | "text";
  output?: "text" | "json";
}

function formatScrapeResult(result: any, format: string = "text"): string {
  if (format === "json") {
    return JSON.stringify(result, null, 2);
  }

  const lines: string[] = [];
  lines.push("\n🔥 Scrape Result\n");
  lines.push("─".repeat(60));
  
  if (result.metadata) {
    lines.push(`📄 ${result.metadata.title || "Untitled"}`);
    if (result.metadata.description) {
      lines.push(`📝 ${result.metadata.description}`);
    }
    lines.push(`🔗 ${result.metadata.sourceURL || result.url}`);
    lines.push("");
  }
  
  if (result.markdown) {
    lines.push(result.markdown);
  } else if (result.html) {
    lines.push("[HTML content - use --format markdown for readable output]");
  } else if (result.text) {
    lines.push(result.text);
  }
  
  lines.push("");
  lines.push("─".repeat(60));
  
  return lines.join("\n");
}

function formatCrawlResults(results: any[], format: string = "text"): string {
  if (format === "json") {
    return JSON.stringify(results, null, 2);
  }

  const lines: string[] = [];
  lines.push(`\n🕷️ Crawled ${results.length} pages\n`);
  lines.push("─".repeat(60));

  for (const page of results) {
    lines.push("");
    lines.push(`📄 ${page.metadata?.title || "Untitled"}`);
    lines.push(`🔗 ${page.metadata?.sourceURL || page.url}`);
    
    if (page.markdown) {
      const preview = page.markdown.slice(0, 500).replace(/\n/g, " ");
      lines.push(`📝 ${preview}${page.markdown.length > 500 ? "..." : ""}`);
    }
    
    lines.push("");
    lines.push("─".repeat(60));
  }

  return lines.join("\n");
}

program
  .name("firecrawl")
  .description("Web scraping and crawling using Firecrawl")
  .version("1.0.0");

// Scrape a single page
program
  .command("scrape")
  .description("Scrape a single web page")
  .argument("<url>", "URL to scrape")
  .option("-f, --format <format>", "Output format: markdown, html, text", "markdown")
  .option("-s, --screenshot", "Include screenshot")
  .option("-w, --wait <ms>", "Wait for page to load (ms)")
  .option("-o, --output <type>", "Output type: text, json", "text")
  .action(async (url: string, options: ScrapeOptions) => {
    const app = getClient();
    try {
      console.log(`🔥 Scraping: ${url}...\n`);
      
      const scrapeOptions: any = {
        formats: [options.format || "markdown"],
      };
      
      if (options.screenshot) {
        scrapeOptions.formats.push("screenshot");
      }
      
      if (options.wait) {
        scrapeOptions.waitFor = parseInt(options.wait);
      }
      
      const result = await app.scrapeUrl(url, scrapeOptions);
      
      if (!result.success) {
        console.error("❌ Scrape failed:", result.error);
        process.exit(1);
      }
      
      console.log(formatScrapeResult(result, options.output));
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      process.exit(1);
    }
  });

// Crawl a website
program
  .command("crawl")
  .description("Crawl an entire website")
  .argument("<url>", "Base URL to crawl")
  .option("-l, --limit <number>", "Max pages to crawl", "10")
  .option("-d, --depth <number>", "Max crawl depth")
  .option("-f, --format <format>", "Output format: markdown, html, text", "markdown")
  .option("-o, --output <type>", "Output type: text, json", "text")
  .action(async (url: string, options: CrawlOptions) => {
    const app = getClient();
    try {
      console.log(`🕷️ Crawling: ${url}...\n`);
      console.log(`   Limit: ${options.limit} pages\n`);
      
      const crawlOptions: any = {
        limit: parseInt(options.limit || "10"),
        scrapeOptions: {
          formats: [options.format || "markdown"],
        },
      };
      
      if (options.depth) {
        crawlOptions.maxDepth = parseInt(options.depth);
      }
      
      const result = await app.crawlUrl(url, crawlOptions);
      
      if (!result.success) {
        console.error("❌ Crawl failed:", result.error);
        process.exit(1);
      }
      
      console.log(formatCrawlResults(result.data || [], options.output));
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      process.exit(1);
    }
  });

// Map a website (get all URLs without content)
program
  .command("map")
  .description("Map all URLs on a website")
  .argument("<url>", "Base URL to map")
  .option("-l, --limit <number>", "Max URLs to return", "100")
  .option("-o, --output <type>", "Output type: text, json", "text")
  .action(async (url: string, options: { limit?: string; output?: string }) => {
    const app = getClient();
    try {
      console.log(`🗺️ Mapping: ${url}...\n`);
      
      const result = await app.mapUrl(url, {
        limit: parseInt(options.limit || "100"),
      });
      
      if (!result.success) {
        console.error("❌ Map failed:", result.error);
        process.exit(1);
      }
      
      if (options.output === "json") {
        console.log(JSON.stringify(result.links, null, 2));
      } else {
        console.log(`🔗 Found ${result.links?.length || 0} URLs:\n`);
        for (const link of result.links || []) {
          console.log(`  • ${link}`);
        }
      }
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      process.exit(1);
    }
  });

// Extract structured data
program
  .command("extract")
  .description("Extract structured data from a page using LLM")
  .argument("<url>", "URL to extract from")
  .argument("<prompt>", "Extraction prompt (what to extract)")
  .option("-o, --output <type>", "Output type: text, json", "json")
  .action(async (url: string, prompt: string, options: { output?: string }) => {
    const app = getClient();
    try {
      console.log(`🔬 Extracting from: ${url}...\n`);
      console.log(`   Prompt: ${prompt}\n`);
      
      const result = await app.scrapeUrl(url, {
        formats: ["extract"],
        extract: {
          prompt,
        },
      });
      
      if (!result.success) {
        console.error("❌ Extract failed:", result.error);
        process.exit(1);
      }
      
      if (options.output === "json" || !result.extract) {
        console.log(JSON.stringify(result.extract, null, 2));
      } else {
        console.log(result.extract);
      }
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      process.exit(1);
    }
  });

program.parse();
