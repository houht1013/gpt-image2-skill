#!/usr/bin/env node
import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const VERSION = "0.1.0";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROMPTS_PATH = path.join(ROOT, "references", "prompts.json");
const DEFAULT_CONFIG_PATH = path.join(os.homedir(), ".gpt-image2", "config.json");
const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-image-2";
const MAX_BATCH_IMAGES = 8;
const DEFAULT_TIMEOUT_MS = 300_000;
const DEFAULT_RETRIES = 1;
const GPT_IMAGE_SIZES = [
  {
    id: "1024x1024",
    label: "square",
    width: 1024,
    height: 1024,
    ratio: "1:1",
    orientation: "square",
    recommendedFor: ["general", "fastest", "product", "avatar"],
  },
  {
    id: "1536x1024",
    label: "landscape",
    width: 1536,
    height: 1024,
    ratio: "3:2",
    orientation: "landscape",
    recommendedFor: ["banner", "cover", "scene", "ui"],
  },
  {
    id: "1024x1536",
    label: "portrait",
    width: 1024,
    height: 1536,
    ratio: "2:3",
    orientation: "portrait",
    recommendedFor: ["poster", "infographic", "portrait", "mobile"],
  },
  {
    id: "auto",
    label: "automatic",
    width: null,
    height: null,
    ratio: "auto",
    orientation: "auto",
    recommendedFor: ["let-model-decide"],
  },
];
const COMMON_TARGET_RATIOS = [
  {
    ratio: "1:1",
    status: "native",
    primarySize: "1024x1024",
    useCases: ["avatar", "square post", "product shot"],
    note: "Officially supported directly by GPT Image.",
  },
  {
    ratio: "3:2",
    status: "native",
    primarySize: "1536x1024",
    useCases: ["cover", "landscape scene", "ui mock"],
    note: "Officially supported landscape ratio.",
  },
  {
    ratio: "2:3",
    status: "native",
    primarySize: "1024x1536",
    useCases: ["poster", "portrait", "infographic"],
    note: "Officially supported portrait ratio.",
  },
  {
    ratio: "16:9",
    status: "adapt",
    primarySize: "1536x1024",
    useCases: ["video thumbnail", "hero banner", "presentation cover"],
    note: "Not native. Generate in 3:2 and crop horizontally.",
  },
  {
    ratio: "9:16",
    status: "adapt",
    primarySize: "1024x1536",
    useCases: ["short video cover", "story", "mobile poster"],
    note: "Not native. Generate in 2:3 and crop vertically.",
  },
  {
    ratio: "4:3",
    status: "adapt",
    primarySize: "1536x1024",
    useCases: ["slides", "older display", "diagram card"],
    note: "Not native. Generate in 3:2 and crop slightly.",
  },
  {
    ratio: "3:4",
    status: "adapt",
    primarySize: "1024x1536",
    useCases: ["editorial card", "booklet cover", "social portrait"],
    note: "Not native. Generate in 2:3 and crop slightly.",
  },
  {
    ratio: "4:5",
    status: "adapt",
    primarySize: "1024x1536",
    useCases: ["feed post", "fashion poster", "ecommerce visual"],
    note: "Not native. Generate in 2:3 and crop top/bottom less aggressively.",
  },
  {
    ratio: "5:4",
    status: "adapt",
    primarySize: "1024x1024",
    useCases: ["gallery card", "product listing", "desktop tile"],
    note: "Not native. Generate square first, then pad or crop lightly.",
  },
  {
    ratio: "21:9",
    status: "adapt",
    primarySize: "1536x1024",
    useCases: ["cinematic banner", "ultrawide header"],
    note: "Not native. Generate in 3:2 and crop to panoramic framing.",
  },
];
const NATIVE_SIZE_ENUMS = [
  {
    id: "square",
    nativeSize: "1024x1024",
    ratio: "1:1",
    orientation: "square",
    useCases: ["general", "balanced composition"],
    note: "Default square output.",
  },
  {
    id: "avatar-square",
    nativeSize: "1024x1024",
    ratio: "1:1",
    orientation: "square",
    useCases: ["avatar", "profile image", "icon-style portrait"],
    note: "Use when the subject should stay centered and tightly framed.",
  },
  {
    id: "product-square",
    nativeSize: "1024x1024",
    ratio: "1:1",
    orientation: "square",
    useCases: ["product card", "ecommerce tile", "catalog image"],
    note: "Best for centered products with safe margins around edges.",
  },
  {
    id: "logo-square",
    nativeSize: "1024x1024",
    ratio: "1:1",
    orientation: "square",
    useCases: ["logo concept", "badge", "sticker"],
    note: "Prefer strong central focus and negative space.",
  },
  {
    id: "cover-landscape",
    nativeSize: "1536x1024",
    ratio: "3:2",
    orientation: "landscape",
    useCases: ["cover", "hero visual", "feature banner"],
    note: "General-purpose landscape preset.",
  },
  {
    id: "slide-landscape",
    nativeSize: "1536x1024",
    ratio: "3:2",
    orientation: "landscape",
    useCases: ["presentation visual", "article cover", "deck section image"],
    note: "Good base for slides or docs that may crop to 16:9 or 4:3 later.",
  },
  {
    id: "scene-landscape",
    nativeSize: "1536x1024",
    ratio: "3:2",
    orientation: "landscape",
    useCases: ["environment", "wide scene", "travel visual"],
    note: "Prefer layered depth and readable left/right composition.",
  },
  {
    id: "ui-landscape",
    nativeSize: "1536x1024",
    ratio: "3:2",
    orientation: "landscape",
    useCases: ["dashboard mock", "interface concept", "game screen"],
    note: "Useful when the design needs more lateral layout space.",
  },
  {
    id: "poster-portrait",
    nativeSize: "1024x1536",
    ratio: "2:3",
    orientation: "portrait",
    useCases: ["poster", "key visual", "art print"],
    note: "General-purpose vertical preset.",
  },
  {
    id: "infographic-portrait",
    nativeSize: "1024x1536",
    ratio: "2:3",
    orientation: "portrait",
    useCases: ["infographic", "knowledge card", "structured educational visual"],
    note: "Leave clear top-to-bottom hierarchy for sections and labels.",
  },
  {
    id: "mobile-portrait",
    nativeSize: "1024x1536",
    ratio: "2:3",
    orientation: "portrait",
    useCases: ["mobile cover", "story base", "vertical social visual"],
    note: "A strong base when you may crop toward 9:16 later.",
  },
  {
    id: "fashion-portrait",
    nativeSize: "1024x1536",
    ratio: "2:3",
    orientation: "portrait",
    useCases: ["fashion editorial", "character portrait", "beauty poster"],
    note: "Best for full-body or mid-shot subjects with vertical styling.",
  },
  {
    id: "auto",
    nativeSize: "auto",
    ratio: "auto",
    orientation: "auto",
    useCases: ["unknown framing", "let-model-decide"],
    note: "Use only when the target layout is not yet decided.",
  },
];

main().catch((error) => {
  exitWithError(error.message || String(error));
});

async function main() {
  const rawArgs = process.argv.slice(2);
  if (rawArgs.length === 0 || hasFlag(rawArgs, "--help") || hasFlag(rawArgs, "-h")) {
    printHelp();
    return;
  }
  if (hasFlag(rawArgs, "--version") || hasFlag(rawArgs, "-v")) {
    console.log(VERSION);
    return;
  }

  const [command, ...rest] = rawArgs;
  if (command === "config") {
    await handleConfig(rest);
    return;
  }
  if (command === "templates") {
    await handleTemplates(rest);
    return;
  }
  if (command === "sizes" || command === "resolutions") {
    await handleSizes(rest);
    return;
  }
  if (command === "try") {
    const [templateId, ...generateArgs] = rest;
    if (!templateId) exitWithError("Usage: try <template-id> [--var key=value] [--output file]");
    await handleGenerate(["--template", templateId, ...generateArgs]);
    return;
  }
  if (command === "generate") {
    await handleGenerate(rest);
    return;
  }
  if (command === "edit") {
    await handleEdit(rest);
    return;
  }
  exitWithError(`Unknown command: ${command}`);
}

async function handleConfig(args) {
  const [subcommand, maybeName, ...rest] = args;
  const flags = parseFlags(rest);
  const config = readConfig();

  if (subcommand === "set") {
    const name = maybeName;
    if (!name) exitWithError("Usage: config set <channel> --api-key ... --base-url ... --model ...");
    config.channels ??= {};
    const existing = config.channels[name] || {};
    config.channels[name] = pruneEmpty({
      ...existing,
      apiKey: flags.apiKey ?? flags.key ?? existing.apiKey,
      baseUrl: flags.baseUrl ?? existing.baseUrl ?? DEFAULT_BASE_URL,
      model: flags.model ?? existing.model ?? DEFAULT_MODEL,
      organization: flags.organization ?? flags.org ?? existing.organization,
      project: flags.project ?? existing.project,
    });
    config.active = config.active || name;
    writeConfig(config);
    console.log(`Saved channel "${name}" to ${configPath()}`);
    return;
  }

  if (subcommand === "use") {
    const name = maybeName;
    if (!name) exitWithError("Usage: config use <channel>");
    if (!config.channels?.[name]) exitWithError(`Channel "${name}" does not exist. Run config set first.`);
    config.active = name;
    writeConfig(config);
    console.log(`Active channel: ${name}`);
    return;
  }

  if (subcommand === "list") {
    const channels = Object.entries(config.channels || {});
    if (channels.length === 0) {
      console.log("No channels configured.");
      return;
    }
    for (const [name, channel] of channels) {
      const marker = name === config.active ? "*" : " ";
      console.log(`${marker} ${name}  ${channel.model || DEFAULT_MODEL}  ${channel.baseUrl || DEFAULT_BASE_URL}`);
    }
    return;
  }

  if (subcommand === "show") {
    const name = maybeName || config.active;
    if (!name || !config.channels?.[name]) {
      console.log(JSON.stringify(redactConfig(config), null, 2));
      return;
    }
    console.log(JSON.stringify(redactConfig({ active: config.active, channels: { [name]: config.channels[name] } }), null, 2));
    return;
  }

  exitWithError("Usage: config <set|use|list|show> ...");
}

async function handleTemplates(args) {
  const [subcommand, ...rest] = args;
  const flags = parseFlags(rest);
  const templates = readTemplates();

  if (!subcommand || subcommand === "list") {
    if (flags.json) {
      console.log(JSON.stringify(templates, null, 2));
      return;
    }
    for (const item of templates) {
      const tags = (item.tags || []).join(",");
      console.log(`${item.id.padEnd(24)} ${String(item.size || "").padEnd(11)} ${item.title}  [${tags}]`);
    }
    return;
  }

  if (subcommand === "search") {
    const query = rest.join(" ").trim().toLowerCase();
    if (!query) exitWithError("Usage: templates search <query>");
    const results = templates.filter((item) => {
      const haystack = [item.id, item.title, item.lang, item.description, ...(item.tags || [])].join(" ").toLowerCase();
      return haystack.includes(query);
    });
    if (flags.json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }
    if (results.length === 0) {
      console.log("No templates matched.");
      return;
    }
    for (const item of results) {
      console.log(`${item.id.padEnd(24)} ${String(item.size || "").padEnd(11)} ${item.title}`);
    }
    return;
  }

  if (subcommand === "show") {
    const id = rest[0];
    if (!id) exitWithError("Usage: templates show <id>");
    const template = findTemplate(id);
    if (flags.json) {
      console.log(JSON.stringify(template, null, 2));
      return;
    }
    console.log(`${template.title} (${template.id})`);
    console.log(`size: ${template.size || "default"}`);
    console.log(`tags: ${(template.tags || []).join(", ")}`);
    if (template.description) console.log(`description: ${template.description}`);
    if (template.variables) {
      console.log("variables:");
      for (const [name, value] of Object.entries(template.variables)) {
        console.log(`  ${name}=${value}`);
      }
    }
    console.log("\nprompt:");
    console.log(template.prompt);
    return;
  }

  exitWithError("Usage: templates <list|search|show> ...");
}

async function handleSizes(args) {
  const [subcommand, ...rest] = args;
  const flags = parseFlags(rest);
  if (subcommand && subcommand !== "list") {
    exitWithError("Usage: sizes list [--orientation portrait|landscape|square|auto] [--json] [--native-only] [--common-only]");
  }

  let sizes = GPT_IMAGE_SIZES;
  if (flags.orientation) {
    const wanted = String(flags.orientation).toLowerCase();
    sizes = sizes.filter((item) => item.orientation === wanted);
    if (sizes.length === 0) {
      exitWithError(`Unknown orientation "${flags.orientation}". Use portrait, landscape, square, or auto.`);
    }
  }

  let commonRatios = COMMON_TARGET_RATIOS;
  let nativeEnums = NATIVE_SIZE_ENUMS;
  if (flags.orientation) {
    commonRatios = commonRatios.filter((item) => orientationFromRatio(item.ratio) === String(flags.orientation).toLowerCase());
    nativeEnums = nativeEnums.filter((item) => item.orientation === String(flags.orientation).toLowerCase());
  }
  if (flags.nativeOnly) {
    commonRatios = [];
  }
  if (flags.commonOnly) {
    sizes = [];
    nativeEnums = [];
  }

  if (flags.json) {
    console.log(JSON.stringify({
      modelFamily: "gpt-image",
      source: "OpenAI Image API docs",
      checkedAt: "2026-04-23",
      nativeSizes: sizes,
      nativeSizeEnums: nativeEnums,
      commonTargetRatios: commonRatios,
    }, null, 2));
    return;
  }

  if (sizes.length > 0) {
    console.log("Official native GPT Image sizes:");
    for (const item of sizes) {
      const dimensions = item.id === "auto" ? "model-selected" : `${item.width}x${item.height}`;
      console.log(`${item.id.padEnd(10)} ${item.ratio.padEnd(6)} ${item.orientation.padEnd(10)} ${dimensions.padEnd(14)} ${item.recommendedFor.join(", ")}`);
    }
  }

  if (nativeEnums.length > 0) {
    if (sizes.length > 0) console.log("");
    console.log("Native-compatible size enums:");
    for (const item of nativeEnums) {
      console.log(`${item.id.padEnd(22)} -> ${item.nativeSize.padEnd(10)} ${item.ratio.padEnd(6)} ${item.note}`);
      console.log(`                        use: ${item.useCases.join(", ")}`);
    }
  }

  if (commonRatios.length > 0) {
    if (sizes.length > 0 || nativeEnums.length > 0) console.log("");
    console.log("Mainstream target ratios:");
    for (const item of commonRatios) {
      console.log(`${item.ratio.padEnd(6)} ${item.status.padEnd(6)} base=${item.primarySize.padEnd(10)} ${item.note}`);
      console.log(`         use: ${item.useCases.join(", ")}`);
    }
    console.log("");
    console.log("Legend: native = directly supported by the API; adapt = generate with the nearest native size, then crop/pad.");
  }
}

async function handleGenerate(args) {
  const flags = parseFlags(args);
  const settings = resolveSettings(flags);
  const prompt = resolvePrompt(flags);
  const payload = buildImagePayload(flags, settings, prompt);
  const requestOptions = resolveRequestOptions(flags);

  if (flags.dryRun) {
    console.log(JSON.stringify({ endpoint: endpoint(settings.baseUrl, "/images/generations"), payload, requestOptions }, null, 2));
    return;
  }
  if (flags.curl) {
    console.log(renderJsonCurl(settings, "/images/generations", payload));
    return;
  }

  const response = await fetchWithRetry(endpoint(settings.baseUrl, "/images/generations"), {
    method: "POST",
    headers: buildHeaders(settings, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  }, requestOptions);
  const json = await parseApiResponse(response);
  await saveImages(json, flags.output || defaultOutputPath("image"));
}

async function handleEdit(args) {
  const flags = parseFlags(args);
  const images = toArray(flags.image).filter(Boolean);
  if (images.length === 0) exitWithError("Usage: edit --image <file> --prompt ... --output <file>");
  for (const image of images) {
    if (!fs.existsSync(image)) exitWithError(`Image file not found: ${image}`);
  }
  if (flags.mask && !fs.existsSync(flags.mask)) exitWithError(`Mask file not found: ${flags.mask}`);

  const settings = resolveSettings(flags);
  const prompt = resolvePrompt(flags);
  const payload = buildImagePayload(flags, settings, prompt, { includePromptOnly: true });
  const requestOptions = resolveRequestOptions(flags);
  const fields = { ...payload };
  const files = images.map((file) => ({ field: "image", file }));
  if (flags.mask) files.push({ field: "mask", file: flags.mask });

  if (flags.dryRun) {
    console.log(JSON.stringify({
      endpoint: endpoint(settings.baseUrl, "/images/edits"),
      fields,
      files: files.map((item) => ({ field: item.field, file: item.file })),
      requestOptions,
    }, null, 2));
    return;
  }
  if (flags.curl) {
    console.log(renderMultipartCurl(settings, "/images/edits", fields, files));
    return;
  }

  const { body, contentType } = buildMultipart(fields, files);
  const response = await fetchWithRetry(endpoint(settings.baseUrl, "/images/edits"), {
    method: "POST",
    headers: buildHeaders(settings, { "Content-Type": contentType }),
    body,
  }, requestOptions);
  const json = await parseApiResponse(response);
  await saveImages(json, flags.output || defaultOutputPath("edited"));
}

function buildImagePayload(flags, settings, prompt, options = {}) {
  validateSize(flags.size);
  const batchCount = resolveBatchCount(flags);
  const payload = pruneEmpty({
    model: settings.model,
    prompt,
    size: flags.size,
    quality: flags.quality,
    background: flags.background,
    moderation: flags.moderation,
    output_format: flags.outputFormat,
    output_compression: flags.outputCompression ? Number(flags.outputCompression) : undefined,
    response_format: flags.responseFormat,
    n: batchCount,
    user: flags.user,
  });
  if (options.includePromptOnly) {
    return payload;
  }
  return payload;
}

function resolvePrompt(flags) {
  if (flags.prompt && flags.template) exitWithError("Use either --prompt or --template, not both.");
  if (flags.prompt) return String(flags.prompt);
  if (flags.template) {
    const template = findTemplate(flags.template);
    return applyTemplate(template, parseVariables(flags.var), { useDefaults: true });
  }
  exitWithError("Provide --prompt <text> or --template <id>.");
}

function resolveSettings(flags) {
  const config = readConfig();
  const channelName = flags.channel || flags.profile || config.active;
  const channel = channelName ? config.channels?.[channelName] || {} : {};
  const apiKey = flags.apiKey || channel.apiKey || envFirst("GPT_IMAGE_API_KEY", "OPENAI_API_KEY", "API_KEY");
  const baseUrl = flags.baseUrl || channel.baseUrl || envFirst("GPT_IMAGE_BASE_URL", "OPENAI_BASE_URL", "BASE_URL") || DEFAULT_BASE_URL;
  const model = flags.model || channel.model || envFirst("GPT_IMAGE_MODEL", "OPENAI_IMAGE_MODEL") || DEFAULT_MODEL;
  const organization = flags.organization || flags.org || channel.organization || envFirst("OPENAI_ORG_ID", "OPENAI_ORGANIZATION");
  const project = flags.project || channel.project || envFirst("OPENAI_PROJECT_ID", "OPENAI_PROJECT");
  if (!apiKey && !flags.curl && !flags.dryRun) {
    exitWithError("Missing API key. Run config set <channel> --api-key ... or set OPENAI_API_KEY.");
  }
  return { apiKey, baseUrl, model, organization, project };
}

function parseVariables(values) {
  const result = {};
  for (const value of toArray(values)) {
    const eq = String(value).indexOf("=");
    if (eq === -1) exitWithError(`Invalid --var "${value}". Use --var key=value.`);
    const key = String(value).slice(0, eq).trim();
    if (!key) exitWithError(`Invalid --var "${value}". Variable name is empty.`);
    result[key] = String(value).slice(eq + 1);
  }
  return result;
}

function applyTemplate(template, variables, options = {}) {
  const defaults = options.useDefaults ? template.variables || {} : {};
  const merged = { ...defaults, ...variables };
  return template.prompt.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, name) => {
    if (Object.prototype.hasOwnProperty.call(merged, name)) return String(merged[name]);
    exitWithError(`Missing variable "${name}" for template "${template.id}". Pass --var ${name}=...`);
  });
}

function findTemplate(id) {
  const templates = readTemplates();
  const template = templates.find((item) => item.id === id);
  if (!template) exitWithError(`Template not found: ${id}. Run templates list.`);
  return template;
}

function readTemplates() {
  try {
    const data = JSON.parse(fs.readFileSync(PROMPTS_PATH, "utf8"));
    if (!Array.isArray(data)) throw new Error("prompts.json must contain an array.");
    return data;
  } catch (error) {
    exitWithError(`Failed to read templates: ${error.message}`);
  }
}

function readConfig() {
  const file = configPath();
  if (!fs.existsSync(file)) return { active: undefined, channels: {} };
  try {
    const config = JSON.parse(fs.readFileSync(file, "utf8"));
    return { channels: {}, ...config };
  } catch (error) {
    exitWithError(`Failed to read config ${file}: ${error.message}`);
  }
}

function writeConfig(config) {
  const file = configPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
}

function configPath() {
  return process.env.GPT_IMAGE2_CONFIG || DEFAULT_CONFIG_PATH;
}

function parseFlags(args) {
  const flags = { _: [] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--") {
      flags._.push(...args.slice(index + 1));
      break;
    }
    if (!arg.startsWith("-")) {
      flags._.push(arg);
      continue;
    }
    const normalized = normalizeFlagName(arg.replace(/^-+/, ""));
    const eq = normalized.indexOf("=");
    if (eq !== -1) {
      addFlag(flags, normalized.slice(0, eq), normalized.slice(eq + 1));
      continue;
    }
    const next = args[index + 1];
    if (!next || next.startsWith("-") || isBooleanFlag(normalized)) {
      addFlag(flags, normalized, true);
      continue;
    }
    addFlag(flags, normalized, next);
    index += 1;
  }
  return flags;
}

function normalizeFlagName(name) {
  return name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function addFlag(flags, key, value) {
  if (Object.prototype.hasOwnProperty.call(flags, key)) {
    flags[key] = [...toArray(flags[key]), value];
  } else {
    flags[key] = value;
  }
}

function isBooleanFlag(name) {
  return new Set(["json", "dryRun", "curl", "help", "version", "nativeOnly", "commonOnly"]).has(name);
}

function hasFlag(args, name) {
  return args.includes(name);
}

function toArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function envFirst(...names) {
  for (const name of names) {
    if (process.env[name]) return process.env[name];
  }
  return undefined;
}

function validateSize(size) {
  if (!size) return;
  const supported = new Set(GPT_IMAGE_SIZES.map((item) => item.id));
  if (!supported.has(String(size))) {
    exitWithError(`Unsupported size "${size}" for GPT Image. Run "gpt-image2 sizes list" to see supported values.`);
  }
}

function resolveBatchCount(flags) {
  const raw = flags.batch ?? flags.count ?? flags.n;
  if (raw === undefined || raw === null || raw === "") return undefined;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > MAX_BATCH_IMAGES) {
    exitWithError(`Batch image count must be an integer between 1 and ${MAX_BATCH_IMAGES}. Use --batch <1-${MAX_BATCH_IMAGES}> or --n <1-${MAX_BATCH_IMAGES}>.`);
  }
  return value;
}

function resolveRequestOptions(flags) {
  const timeoutMs = Number(flags.timeoutMs ?? flags.timeout ?? DEFAULT_TIMEOUT_MS);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) {
    exitWithError("Timeout must be a positive integer in milliseconds. Example: --timeout-ms 300000.");
  }
  const retries = Number(flags.retries ?? DEFAULT_RETRIES);
  if (!Number.isInteger(retries) || retries < 0) {
    exitWithError("Retries must be a non-negative integer. Example: --retries 1.");
  }
  return { timeoutMs, retries };
}

function orientationFromRatio(ratio) {
  if (ratio === "auto") return "auto";
  const [left, right] = String(ratio).split(":").map(Number);
  if (!left || !right) return "square";
  if (left === right) return "square";
  return left > right ? "landscape" : "portrait";
}

function endpoint(baseUrl, apiPath) {
  return `${String(baseUrl).replace(/\/+$/, "")}${apiPath}`;
}

function buildHeaders(settings, extra = {}) {
  const headers = {
    Authorization: `Bearer ${settings.apiKey || "$OPENAI_API_KEY"}`,
    ...extra,
  };
  if (settings.organization) headers["OpenAI-Organization"] = settings.organization;
  if (settings.project) headers["OpenAI-Project"] = settings.project;
  return headers;
}

async function parseApiResponse(response) {
  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!response.ok) {
    exitWithError(`API request failed (${response.status} ${response.statusText}): ${JSON.stringify(json, null, 2)}`);
  }
  return json;
}

async function fetchWithRetry(url, options, retryOptions) {
  const maxAttempts = retryOptions.retries + 1;
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, options, retryOptions.timeoutMs);
      if (response.ok || !shouldRetryStatus(response.status) || attempt === maxAttempts) {
        return response;
      }
      const body = await response.text();
      lastError = new Error(`API request failed (${response.status} ${response.statusText}): ${body || "<empty response>"}`);
      console.error(`Attempt ${attempt}/${maxAttempts} failed with HTTP ${response.status}; retrying once...`);
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      console.error(`Attempt ${attempt}/${maxAttempts} failed: ${error.message}; retrying once...`);
    }
  }
  throw lastError;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError" || String(error.message || "").includes("timed out")) {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function shouldRetryStatus(status) {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

async function saveImages(response, output) {
  const data = response?.data;
  if (!Array.isArray(data) || data.length === 0) {
    console.log(JSON.stringify(response, null, 2));
    exitWithError("API response did not contain data[].");
  }
  const outputPath = path.resolve(output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  for (let index = 0; index < data.length; index += 1) {
    const item = data[index];
    const target = data.length === 1 ? outputPath : suffixOutput(outputPath, index + 1);
    if (item.b64_json) {
      fs.writeFileSync(target, Buffer.from(item.b64_json, "base64"));
      console.log(`Saved ${target}`);
      continue;
    }
    if (item.url) {
      await downloadToFile(item.url, target);
      console.log(`Saved ${target}`);
      continue;
    }
    if (item.revised_prompt) console.error(`revised_prompt: ${item.revised_prompt}`);
    console.log(JSON.stringify(item, null, 2));
    exitWithError("Image item did not contain b64_json or url.");
  }
}

async function downloadToFile(url, target) {
  const response = await fetch(url);
  if (!response.ok) exitWithError(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(target, buffer);
}

function suffixOutput(outputPath, index) {
  const ext = path.extname(outputPath) || ".png";
  const base = outputPath.slice(0, outputPath.length - ext.length);
  return `${base}-${String(index).padStart(2, "0")}${ext}`;
}

function defaultOutputPath(prefix) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(process.cwd(), "outputs", `${prefix}-${stamp}.png`);
}

function buildMultipart(fields, files) {
  const boundary = `----gpt-image2-${crypto.randomBytes(12).toString("hex")}`;
  const chunks = [];
  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === false) continue;
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${escapeMultipart(name)}"\r\n\r\n${String(value)}\r\n`));
  }
  for (const item of files) {
    const filePath = path.resolve(item.file);
    const filename = path.basename(filePath);
    const mime = guessMime(filename);
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${escapeMultipart(item.field)}"; filename="${escapeMultipart(filename)}"\r\nContent-Type: ${mime}\r\n\r\n`));
    chunks.push(fs.readFileSync(filePath));
    chunks.push(Buffer.from("\r\n"));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return {
    body: Buffer.concat(chunks),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

function escapeMultipart(value) {
  return String(value).replace(/"/g, "%22").replace(/\r|\n/g, " ");
}

function guessMime(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/png";
}

function renderJsonCurl(settings, apiPath, payload) {
  const headers = buildHeaders(settings, { "Content-Type": "application/json" });
  const parts = ["curl -sS", "-X POST", shellQuote(endpoint(settings.baseUrl, apiPath))];
  for (const [name, value] of Object.entries(headers)) {
    parts.push("-H", shellQuote(`${name}: ${value}`));
  }
  parts.push("-d", shellQuote(JSON.stringify(payload)));
  return parts.join(" ");
}

function renderMultipartCurl(settings, apiPath, fields, files) {
  const headers = buildHeaders(settings);
  const parts = ["curl -sS", "-X POST", shellQuote(endpoint(settings.baseUrl, apiPath))];
  for (const [name, value] of Object.entries(headers)) {
    parts.push("-H", shellQuote(`${name}: ${value}`));
  }
  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === false) continue;
    parts.push("-F", shellQuote(`${name}=${value}`));
  }
  for (const item of files) {
    parts.push("-F", shellQuote(`${item.field}=@${path.resolve(item.file)}`));
  }
  return parts.join(" ");
}

function shellQuote(value) {
  const text = String(value);
  if (process.platform === "win32") {
    return `"${text.replace(/"/g, '\\"')}"`;
  }
  return `'${text.replace(/'/g, "'\\''")}'`;
}

function pruneEmpty(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== ""));
}

function redactConfig(config) {
  const clone = JSON.parse(JSON.stringify(config || {}));
  for (const channel of Object.values(clone.channels || {})) {
    if (channel.apiKey) channel.apiKey = redactSecret(channel.apiKey);
  }
  return clone;
}

function redactSecret(secret) {
  const text = String(secret);
  if (text.length <= 8) return "********";
  return `${text.slice(0, 4)}...${text.slice(-4)}`;
}

function printHelp() {
  console.log(`gpt-image2 ${VERSION}

Dependency-free Node.js CLI for GPT Image 2 prompt templates and image APIs.

Usage:
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

Common options:
  --channel <name>           Use a configured channel
  --api-key <key>            Override API key
  --base-url <url>           Override API base URL, default ${DEFAULT_BASE_URL}
  --model <model>            Override model, default ${DEFAULT_MODEL}
  --size <size>              Example: 1024x1024, 1024x1536, 1536x1024
  --quality <value>          Pass through API quality value
  --background <value>       Pass through API background value
  --output-format <value>    Example: png, jpeg, webp
  --output-compression <n>   Compression for supported formats
  --response-format <value>  For gateways that support url or b64_json
  --batch <number>           Generate multiple images in one request, max ${MAX_BATCH_IMAGES}
  --count <number>           Alias of --batch
  --n <number>               Raw API-style alias of --batch, max ${MAX_BATCH_IMAGES}
  --timeout-ms <number>      Request timeout in milliseconds, default ${DEFAULT_TIMEOUT_MS}
  --retries <number>         Retry failed/timeout requests, default ${DEFAULT_RETRIES}
  --dry-run                  Print final payload only
  --curl                     Print equivalent curl command only

Sizes output:
  native sizes              Official API-supported sizes only
  native enums              More preset labels mapped onto those native sizes
  mainstream ratios         Common layout targets with crop/pad guidance

Examples:
  gpt-image2 sizes list
  gpt-image2 sizes list --common-only
  gpt-image2 sizes list --native-only
  gpt-image2 sizes list --orientation portrait
  gpt-image2 generate --prompt "Tea packaging concept" --batch 4 --output outputs/tea.png
  gpt-image2 templates list
  gpt-image2 try encyclopedia-card --var topic=咖啡萃取 --output outputs/card.png
  gpt-image2 generate --prompt "A quiet ceramic studio at sunrise" --size 1024x1024
  gpt-image2 edit --image product.png --template product-redesign --var audience=户外玩家
`);
}

function exitWithError(message) {
  console.error(message);
  process.exit(1);
}
