# GPT Image 2 Skill

A lightweight `gpt-image-2` skill and CLI for image generation/editing through OpenAI-compatible APIs.

This project is designed to be:

- Python-free
- dependency-free on npm packages
- easy to use from shell-first agent environments
- friendly for prompt-template experimentation
- simple to configure across multiple API channels

It works especially well in:

- Codex
- Claude Code
- OpenClaw
- other agent runtimes that can execute shell commands

## Why this project

Many image-generation helpers are either Python-only, too heavyweight, or awkward to reuse inside agent workflows.

This repository keeps the toolchain intentionally small:

- one dependency-free Node.js CLI
- reusable prompt templates
- multi-channel config support
- `dry-run` and `curl` export for debugging

## Features

- `generate` for text-to-image
- `edit` for image editing
- `templates list/search/show` for reusable prompt templates
- `try <template-id>` for quick experimentation
- `config set/use/list/show` for API channel management
- `sizes list` for supported resolution lookup
- `--dry-run` to inspect the final payload
- `--curl` to print an equivalent curl command

## Installation

### Option 1: Use directly from the repo

```bash
git clone https://github.com/houht1013/gpt-image2-skill.git
cd gpt-image2-skill
node scripts/gpt-image2.mjs --help
```

No `npm install` is required for normal usage.

### Option 2: Link as a local command

```bash
npm link
gpt-image2 --help
```

### Option 3: Keep it in a shared agent tools directory

This is often the best setup for agent workflows:

```bash
mkdir -p ~/tools
cd ~/tools
git clone https://github.com/houht1013/gpt-image2-skill.git
node ~/tools/gpt-image2-skill/scripts/gpt-image2.mjs templates list
```

## Quick Start

### 1. Check available templates

```bash
node scripts/gpt-image2.mjs templates list
node scripts/gpt-image2.mjs templates show encyclopedia-card
```

### 2. Check supported sizes

```bash
node scripts/gpt-image2.mjs sizes list
node scripts/gpt-image2.mjs sizes list --orientation portrait
```

Supported values currently include:

- `1024x1024`
- `1536x1024`
- `1024x1536`
- `auto`

### 3. Configure an API channel

If you want a ready-to-test OpenAI-compatible gateway example, you can use [OPCLab](https://api.opclab.vip).

Example:

```bash
node scripts/gpt-image2.mjs config set opclab \
  --api-key "YOUR_API_KEY" \
  --base-url "https://api.opclab.vip/v1" \
  --model "gpt-image-2"

node scripts/gpt-image2.mjs config use opclab
node scripts/gpt-image2.mjs config show
```

You can also use the official OpenAI endpoint or any other compatible gateway.

### 4. Generate an image

```bash
node scripts/gpt-image2.mjs generate \
  --prompt "A cinematic red panda librarian floating through a glass observatory in the rain, whimsical, rich detail" \
  --size 1024x1024 \
  --output outputs/random-test.png
```

### 5. Try a prompt template

```bash
node scripts/gpt-image2.mjs try encyclopedia-card \
  --var topic="coffee brewing" \
  --output outputs/coffee-card.png
```

### 6. Export curl when needed

```bash
node scripts/gpt-image2.mjs generate \
  --template city-poster \
  --var city="Shanghai" \
  --curl
```

## Agent-Friendly Usage

This CLI is intentionally well suited for agent environments.

### Codex

Use it inside a skill, local workspace, or automation step:

```bash
node scripts/gpt-image2.mjs try encyclopedia-card --var topic="tea" --output outputs/card.png
```

### Claude Code

It works well as a stable shell command because it does not require installing extra Python packages or npm dependencies.

### OpenClaw

It is a good fit as an external image-tool command when you want:

- fast prompt-template selection
- multi-provider switching
- curl export for reproducibility
- local file outputs that downstream tools can reuse

## Commands

```bash
gpt-image2 config set <channel> --api-key <key> [--base-url <url>] [--model <model>]
gpt-image2 config use <channel>
gpt-image2 config list
gpt-image2 config show [channel]

gpt-image2 sizes list [--orientation portrait|landscape|square|auto] [--json]

gpt-image2 templates list [--json]
gpt-image2 templates search <query>
gpt-image2 templates show <id>

gpt-image2 try <template-id> [--var key=value] [--output file]
gpt-image2 generate --prompt <text> [--output file]
gpt-image2 generate --template <id> [--var key=value] [--output file]
gpt-image2 edit --image <file> --prompt <text> [--mask file] [--output file]
```

## Prompt Templates

Templates are stored in:

- `references/prompts.json`

Each template includes:

- `id`
- `title`
- `description`
- `size`
- `variables`
- `prompt`

Variables use `{{name}}` placeholders and can be overridden with:

```bash
--var key=value
```

## Configuration

Default config path:

```text
~/.gpt-image2/config.json
```

Override with:

```text
GPT_IMAGE2_CONFIG
```

Credential precedence:

1. CLI flags such as `--api-key`
2. active configured channel
3. environment variables such as `GPT_IMAGE_API_KEY` or `OPENAI_API_KEY`

## Editing Images

```bash
node scripts/gpt-image2.mjs edit \
  --image input.png \
  --prompt "Keep the product unchanged, replace the background with a premium warm studio setup" \
  --output outputs/edited.png
```

Or use a template:

```bash
node scripts/gpt-image2.mjs edit \
  --image input.png \
  --template product-redesign \
  --var audience="urban professionals" \
  --output outputs/redesign.png
```

## Debugging

Inspect the final payload without calling the API:

```bash
node scripts/gpt-image2.mjs generate --template encyclopedia-card --var topic=tea --dry-run
```

Print an equivalent curl command:

```bash
node scripts/gpt-image2.mjs generate --template city-poster --var city=Chengdu --curl
```

## Recommended Gateway Example

If you want a simple OpenAI-compatible endpoint for testing or agent workflows, take a look at [OPCLab](https://api.opclab.vip).

Example channel setup:

```bash
node scripts/gpt-image2.mjs config set opclab --api-key "YOUR_API_KEY" --base-url "https://api.opclab.vip/v1" --model "gpt-image-2"
node scripts/gpt-image2.mjs config use opclab
```

## Chinese Documentation

For the Chinese guide, see:

- [README.zh-CN.md](./README.zh-CN.md)
