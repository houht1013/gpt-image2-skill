---
name: gpt-image2
description: Lightweight GPT Image 2 image generation and editing workflow. Use when Codex needs to configure OpenAI-compatible image API channels, generate or edit images from the command line without Python, print equivalent curl calls, or help users quickly try curated GPT-Image-2 prompt templates.
---

# GPT Image 2

Use the bundled Node.js CLI for lightweight image generation and editing. It has no npm dependencies and supports OpenAI-compatible image endpoints.

## Quick Start

Run commands from this skill folder:

```bash
node scripts/gpt-image2.mjs --help
```

Configure an API channel:

```bash
node scripts/gpt-image2.mjs config set openai --api-key "$OPENAI_API_KEY" --base-url "https://api.openai.com/v1" --model "gpt-image-2"
node scripts/gpt-image2.mjs config use openai
```

Try a prompt template:

```bash
node scripts/gpt-image2.mjs templates list
node scripts/gpt-image2.mjs try encyclopedia-card --var topic="coffee brewing" --output outputs/coffee.png
```

Query supported resolutions:

```bash
node scripts/gpt-image2.mjs sizes list
node scripts/gpt-image2.mjs sizes list --orientation portrait
```

Generate with a direct prompt:

```bash
node scripts/gpt-image2.mjs generate --prompt "A clean product hero image of a ceramic desk lamp" --size 1024x1024 --output outputs/lamp.png
```

Edit an existing image:

```bash
node scripts/gpt-image2.mjs edit --image input.png --prompt "Keep the object unchanged, replace the background with a warm studio setup" --output outputs/edited.png
```

Print a curl command instead of calling the API:

```bash
node scripts/gpt-image2.mjs generate --template city-poster --var city="Chengdu" --curl
```

## Workflow

1. Use `templates list`, `templates search <query>`, and `templates show <id>` before drafting prompts from scratch.
2. Prefer `try <template-id> --var key=value` for quick experimentation.
3. Use `config set <channel>` for provider-specific API keys, base URLs, and model names. The active channel is used by default.
4. Keep secrets in config or environment variables, never in checked-in files.
5. Run `sizes list` before choosing `--size`, especially when switching between square, portrait, and landscape output.
6. Use `--dry-run` to inspect the final payload and `--curl` when the user wants shell-native invocation.
7. If an API call fails once, report the HTTP status and response body. Do not blindly retry without changing prompt, size, channel, or timeout.

## Configuration

Credential precedence:

1. CLI flags: `--api-key`, `--base-url`, `--model`
2. Active channel in the config file
3. Environment variables: `GPT_IMAGE_API_KEY`, `OPENAI_API_KEY`, `API_KEY`; `GPT_IMAGE_BASE_URL`, `OPENAI_BASE_URL`, `BASE_URL`

The config file defaults to `~/.gpt-image2/config.json`. Override it with `GPT_IMAGE2_CONFIG`.

Useful commands:

```bash
node scripts/gpt-image2.mjs config list
node scripts/gpt-image2.mjs config show
node scripts/gpt-image2.mjs config use <channel>
node scripts/gpt-image2.mjs config set <channel> --api-key "..." --base-url "..." --model "..."
```

## Prompt Templates

Templates live in `references/prompts.json`. Keep templates reusable:

- Use `{{variable}}` placeholders for user-specific details.
- Avoid names or likenesses of real private people unless the user explicitly provides appropriate rights and context.
- Prefer complete visual specifications: subject, scene, composition, lighting, style, details, output use.
- Keep new templates as compact patterns rather than copying long community prompts verbatim.

## API Notes

The CLI calls:

- `POST /images/generations` for text-to-image
- `POST /images/edits` for image editing with multipart form data

It saves `b64_json` image data when present and can also download a returned `url` for OpenAI-compatible gateways that use URLs.
