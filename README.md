<p align="right">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a>
</p>

# GPT Image 2 CLI

A lightweight `gpt-image-2` command-line tool and Codex skill for image generation/editing through OpenAI-compatible APIs.

Repository:

- [https://github.com/houht1013/gpt-image2-skill](https://github.com/houht1013/gpt-image2-skill)

## What It Does

- Generate images with `gpt-image2 generate`
- Edit images with `gpt-image2 edit`
- Try reusable prompt templates with `gpt-image2 try`
- Manage API channels with `gpt-image2 config`
- List templates with `gpt-image2 templates`
- Query native sizes and ratio guidance with `gpt-image2 sizes`
- Generate up to 8 images per request with `--batch`
- Inspect payloads with `--dry-run`
- Export equivalent shell calls with `--curl`

It is intentionally small:

- No Python dependency
- No third-party npm packages
- Works well in shell-first agent environments
- Suitable for Codex, Claude Code, OpenClaw, and human terminal use

## Install The CLI

Clone the project and link the `gpt-image2` command globally:

```bash
git clone https://github.com/houht1013/gpt-image2-skill.git
cd gpt-image2-skill
npm link
gpt-image2 --help
```

After linking, use `gpt-image2` from any directory:

```bash
gpt-image2 templates list
gpt-image2 sizes list
```

No `npm install` is required for normal usage.

### Verify The Link

```bash
npm bin -g
```

On Windows PowerShell:

```powershell
Get-Command gpt-image2
```

If `gpt-image2` is not recognized, add your global npm bin directory to `PATH`, then restart the terminal.

### Uninstall The Link

```bash
npm unlink -g gpt-image2-skill
```

## Quick Start

### 1. Configure An API Channel

Example with [OPCLab](https://api.opclab.vip), an OpenAI-compatible gateway:

```bash
gpt-image2 config set opclab --api-key "YOUR_API_KEY" --base-url "https://api.opclab.vip/v1" --model "gpt-image-2"
gpt-image2 config use opclab
gpt-image2 config show
```

You can also configure the official OpenAI endpoint:

```bash
gpt-image2 config set openai --api-key "YOUR_OPENAI_API_KEY" --base-url "https://api.openai.com/v1" --model "gpt-image-2"
gpt-image2 config use openai
```

### 2. Browse Prompt Templates

```bash
gpt-image2 templates list
gpt-image2 templates search poster
gpt-image2 templates show encyclopedia-card
```

### 3. Check Supported Sizes

```bash
gpt-image2 sizes list
gpt-image2 sizes list --native-only
gpt-image2 sizes list --common-only
gpt-image2 sizes list --orientation portrait
```

Native GPT Image sizes:

- `1024x1024`
- `1536x1024`
- `1024x1536`
- `auto`

The CLI also lists native-compatible presets such as:

- `avatar-square`
- `product-square`
- `logo-square`
- `cover-landscape`
- `slide-landscape`
- `scene-landscape`
- `ui-landscape`
- `poster-portrait`
- `infographic-portrait`
- `mobile-portrait`
- `fashion-portrait`

These presets are not extra API resolutions. They are named usage presets mapped onto native sizes.

The CLI also shows mainstream target ratios for planning:

- `16:9`
- `9:16`
- `4:3`
- `3:4`
- `4:5`
- `5:4`
- `21:9`

Non-native ratios include crop/pad guidance.

### 4. Generate One Image

```bash
gpt-image2 generate --prompt "A cinematic red panda librarian floating through a glass observatory in the rain, whimsical, rich detail" --size 1024x1024 --output outputs/random-test.png
```

### 5. Generate Multiple Images

```bash
gpt-image2 generate --prompt "Minimalist tea packaging concept, premium, modern East Asian branding" --batch 4 --output outputs/tea-batch.png
```

The CLI saves multiple outputs with numbered filenames:

```text
outputs/tea-batch-01.png
outputs/tea-batch-02.png
outputs/tea-batch-03.png
outputs/tea-batch-04.png
```

Batch aliases:

```bash
--batch <1-8>
--count <1-8>
--n <1-8>
```

The CLI intentionally caps batch generation at 8 images per request to keep agent workflows and local outputs manageable.

### 6. Try A Template

```bash
gpt-image2 try encyclopedia-card --var topic="coffee brewing" --output outputs/coffee-card.png
```

### 7. Edit An Image

```bash
gpt-image2 edit --image input.png --prompt "Keep the product unchanged, replace the background with a premium warm studio setup" --output outputs/edited.png
```

Template-based edit:

```bash
gpt-image2 edit --image input.png --template product-redesign --var audience="urban professionals" --output outputs/redesign.png
```

## For Agents

Use this CLI when an agent needs a compact, repeatable image workflow without writing one-off scripts.

Recommended agent flow:

1. Run `gpt-image2 templates list` or `gpt-image2 templates search`.
2. Run `gpt-image2 templates show <id>` to inspect prompt variables.
3. Run `gpt-image2 sizes list` to choose a native size or target ratio strategy.
4. Run `gpt-image2 generate`, `gpt-image2 try`, or `gpt-image2 edit`.
5. Use `--dry-run` before expensive calls.
6. Use `--curl` when another tool needs a raw shell command.

Agent examples:

```bash
gpt-image2 templates list
gpt-image2 sizes list --native-only
gpt-image2 try encyclopedia-card --var topic="tea brewing" --output outputs/tea-card.png
gpt-image2 generate --prompt "Premium tea packaging concept" --batch 4 --output outputs/tea-batch.png
```

Why it works well for agents:

- Stable command interface
- Clear local file outputs
- No Python runtime requirement
- No npm dependency install step
- Fits Codex, Claude Code, OpenClaw, and shell-first agent runtimes

## For Humans

Use this CLI directly when you want to experiment with prompts, templates, or OpenAI-compatible image gateways from your terminal.

Recommended human flow:

1. Configure a channel with `gpt-image2 config set`.
2. Confirm it with `gpt-image2 config show`.
3. Browse templates with `gpt-image2 templates list`.
4. Try one template with `gpt-image2 try`.
5. Use `gpt-image2 generate` for direct prompts.
6. Use `gpt-image2 edit` when you already have an input image.

Human example:

```bash
gpt-image2 config set opclab --api-key "YOUR_API_KEY" --base-url "https://api.opclab.vip/v1" --model "gpt-image-2"
gpt-image2 config use opclab
gpt-image2 templates list
gpt-image2 try city-poster --var city="Hangzhou" --output outputs/hangzhou-poster.png
gpt-image2 generate --prompt "Minimalist tea brand poster, premium, East Asian editorial style" --size 1024x1536 --output outputs/poster.png
```

## Command Reference

```bash
gpt-image2 config set <channel> --api-key <key> [--base-url <url>] [--model <model>]
gpt-image2 config use <channel>
gpt-image2 config list
gpt-image2 config show [channel]

gpt-image2 sizes list [--orientation portrait|landscape|square|auto] [--json] [--native-only] [--common-only]

gpt-image2 templates list [--json]
gpt-image2 templates search <query>
gpt-image2 templates show <id>

gpt-image2 try <template-id> [--var key=value] [--output file]
gpt-image2 generate --prompt <text> [--output file]
gpt-image2 generate --template <id> [--var key=value] [--output file]
gpt-image2 edit --image <file> --prompt <text> [--mask file] [--output file]
```

Common options:

```bash
--channel <name>
--api-key <key>
--base-url <url>
--model <model>
--size <size>
--batch <1-8>
--dry-run
--curl
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
2. Active configured channel
3. Environment variables such as `GPT_IMAGE_API_KEY` or `OPENAI_API_KEY`

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

## Debugging

Inspect the final payload without calling the API:

```bash
gpt-image2 generate --template encyclopedia-card --var topic=tea --dry-run
```

Print an equivalent curl command:

```bash
gpt-image2 generate --template city-poster --var city=Chengdu --curl
```

## Install As A Codex Skill

If you want Codex to discover this project as a reusable skill, install it from GitHub:

```bash
python "C:\Users\%USERNAME%\.codex\skills\.system\skill-installer\scripts\install-skill-from-github.py" --repo houht1013/gpt-image2-skill --path . --name gpt-image2
```

Installed destination:

```text
~/.codex/skills/gpt-image2
```

Restart Codex after installation.

## Source Usage And Development

The preferred user-facing command is `gpt-image2`. If you do not want to link the CLI globally, you can run the source script directly from the repository:

```bash
git clone https://github.com/houht1013/gpt-image2-skill.git
cd gpt-image2-skill
node scripts/gpt-image2.mjs --help
node scripts/gpt-image2.mjs templates list
```

For active development, `npm link` is useful because changes to `scripts/gpt-image2.mjs` take effect immediately through the global `gpt-image2` command.

## Recommended Gateway Example

If you want a simple OpenAI-compatible endpoint for testing or agent workflows, take a look at [OPCLab](https://api.opclab.vip).

```bash
gpt-image2 config set opclab --api-key "YOUR_API_KEY" --base-url "https://api.opclab.vip/v1" --model "gpt-image-2"
gpt-image2 config use opclab
```

## Chinese Documentation

- [README.zh-CN.md](./README.zh-CN.md)
