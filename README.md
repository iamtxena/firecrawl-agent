# Firecrawl Agent 🔥

A CLI tool for web scraping and crawling using [Firecrawl](https://firecrawl.dev). Turn any website into clean markdown, structured data, or screenshots.

## Features

- 📄 **Scrape** - Extract content from any webpage as markdown
- 🕷️ **Crawl** - Crawl entire websites with depth control
- 🗺️ **Map** - Discover all URLs on a website
- 🔬 **Extract** - Use LLM to extract structured data

## Installation

```bash
# Clone the repo
git clone https://github.com/iamtxena/firecrawl-agent.git
cd firecrawl-agent

# Install dependencies
bun install

# Set up your API key
cp .env.example .env
# Edit .env with your FIRECRAWL_API_KEY
```

## Getting an API Key

1. Go to [firecrawl.dev](https://firecrawl.dev)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your `.env` file

## Usage

```bash
# Scrape a single page
bun run dev scrape "https://example.com"

# Scrape as markdown (default)
bun run dev scrape "https://docs.anthropic.com" --format markdown

# Scrape with screenshot
bun run dev scrape "https://example.com" --screenshot

# Crawl a website (max 10 pages)
bun run dev crawl "https://docs.example.com" --limit 10

# Crawl with depth limit
bun run dev crawl "https://example.com" --limit 50 --depth 2

# Map all URLs on a site
bun run dev map "https://example.com" --limit 100

# Extract structured data with LLM
bun run dev extract "https://example.com/pricing" "Extract all pricing plans with features and prices"
```

### Commands

| Command | Description |
|---------|-------------|
| `scrape <url>` | Scrape a single page |
| `crawl <url>` | Crawl entire website |
| `map <url>` | List all URLs on site |
| `extract <url> <prompt>` | Extract structured data |

### Options

| Flag | Description |
|------|-------------|
| `-f, --format <format>` | Output: markdown, html, text |
| `-l, --limit <number>` | Max pages (crawl) or URLs (map) |
| `-d, --depth <number>` | Max crawl depth |
| `-s, --screenshot` | Include screenshot |
| `-w, --wait <ms>` | Wait for page load |
| `-o, --output <type>` | Output: text, json |

## Examples

### Scrape Documentation
```bash
bun run dev scrape "https://docs.anthropic.com/claude/docs" -o json > claude-docs.json
```

### Crawl a Blog
```bash
bun run dev crawl "https://blog.example.com" --limit 20 --format markdown
```

### Map a Website
```bash
bun run dev map "https://example.com" --limit 500 -o json > sitemap.json
```

### Extract Product Info
```bash
bun run dev extract "https://store.example.com/product/123" \
  "Extract product name, price, description, and available sizes"
```

## Pricing

Firecrawl has a free tier with limited credits. For more credits, see [firecrawl.dev/pricing](https://firecrawl.dev/pricing).

## License

MIT
