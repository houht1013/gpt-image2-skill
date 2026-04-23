<p align="right">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a>
</p>

# GPT Image 2 CLI 中文说明

这是一个轻量版 `gpt-image-2` 命令行工具和 Codex skill，用于通过 OpenAI 兼容图片接口生成和编辑图片。

项目地址：

- [https://github.com/houht1013/gpt-image2-skill](https://github.com/houht1013/gpt-image2-skill)

## 它能做什么

- 用 `gpt-image2 generate` 文生图
- 用 `gpt-image2 edit` 编辑图片
- 用 `gpt-image2 try` 快速试提示词模板
- 用 `gpt-image2 config` 管理 API 渠道
- 用 `gpt-image2 templates` 查看和搜索模板
- 用 `gpt-image2 sizes` 查询原生尺寸和比例建议
- 用 `--batch` 单次批量生成最多 8 张图
- 超时或瞬时失败时默认自动重试 1 次
- 用 `--dry-run` 检查请求体
- 用 `--curl` 输出等价 curl 命令

设计目标：

- 不依赖 Python
- 不安装第三方 npm 包
- 适合 shell-first 的 Agent 环境
- 适合 Codex、Claude Code、OpenClaw 和人类终端用户

## 安装 CLI

克隆项目，并把 `gpt-image2` 链接为全局命令：

```bash
git clone https://github.com/houht1013/gpt-image2-skill.git
cd gpt-image2-skill
npm link
gpt-image2 --help
```

链接成功后，可以在任意目录使用：

```bash
gpt-image2 templates list
gpt-image2 sizes list
```

正常使用不需要执行 `npm install`。

### 验证全局命令

```bash
npm bin -g
```

Windows PowerShell：

```powershell
Get-Command gpt-image2
```

如果提示找不到 `gpt-image2`，通常是 npm 全局 bin 目录没有加入 `PATH`。加入后重启终端即可。

### 取消全局链接

```bash
npm unlink -g gpt-image2-skill
```

## 快速上手

### 1. 配置 API 渠道

使用 [OPCLab](https://api.opclab.vip) 这类 OpenAI 兼容网关：

```bash
gpt-image2 config set opclab --api-key "你的key" --base-url "https://api.opclab.vip/v1" --model "gpt-image-2"
gpt-image2 config use opclab
gpt-image2 config show
```

也可以配置 OpenAI 官方接口：

```bash
gpt-image2 config set openai --api-key "你的OpenAI key" --base-url "https://api.openai.com/v1" --model "gpt-image-2"
gpt-image2 config use openai
```

### 2. 查看提示词模板

```bash
gpt-image2 templates list
gpt-image2 templates search poster
gpt-image2 templates show encyclopedia-card
```

### 3. 查询支持尺寸

```bash
gpt-image2 sizes list
gpt-image2 sizes list --native-only
gpt-image2 sizes list --common-only
gpt-image2 sizes list --orientation portrait
```

GPT Image 原生尺寸：

- `1024x1024`
- `1536x1024`
- `1024x1536`
- `auto`

CLI 还会列出原生兼容 preset，例如：

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

这些不是新的 API 分辨率，而是映射到原生尺寸的场景预设。

CLI 也会列出常见目标比例：

- `16:9`
- `9:16`
- `4:3`
- `3:4`
- `4:5`
- `5:4`
- `21:9`

非原生比例会附带裁切或留白建议。

### 4. 生成一张图

```bash
gpt-image2 generate --prompt "A cinematic red panda librarian floating through a glass observatory in the rain, whimsical, rich detail" --size 1024x1024 --output outputs/random-test.png
```

### 5. 批量生成多张图

```bash
gpt-image2 generate --prompt "新中式茶叶包装设计，极简，高级感" --batch 4 --output outputs/tea-batch.png
```

多图会自动编号保存：

```text
outputs/tea-batch-01.png
outputs/tea-batch-02.png
outputs/tea-batch-03.png
outputs/tea-batch-04.png
```

批量参数别名：

```bash
--batch <1-8>
--count <1-8>
--n <1-8>
```

CLI 会把单次批量生成限制在最多 8 张，避免 Agent 工作流和本地输出过重。

### 6. 使用模板快速生成

```bash
gpt-image2 try encyclopedia-card --var topic=咖啡萃取 --output outputs/coffee-card.png
```

### 7. 编辑图片

```bash
gpt-image2 edit --image input.png --prompt "Keep the product unchanged, replace the background with a premium warm studio setup" --output outputs/edited.png
```

使用模板编辑：

```bash
gpt-image2 edit --image input.png --template product-redesign --var audience=城市白领 --output outputs/redesign.png
```

## 生图测试用例

可以用下面这些 case 快速验证 API 渠道是否可用，也可以对比不同网关的生成质量。

美妆模特电商图：

```bash
gpt-image2 generate --prompt "Photorealistic ecommerce beauty campaign image: an adult professional beauty model holding a premium serum bottle, clean luxury skincare set, soft studio lighting, glossy skin but natural texture, warm beige background, product label area intentionally blank, high-end Tmall/JD style product hero composition, commercial photography, realistic hands, no watermark, no logo" --size 1024x1536 --output outputs/beauty-ecommerce-model.png
```

游戏直播实拍图：

```bash
gpt-image2 generate --prompt "Photorealistic live gaming stream room snapshot: an adult streamer at a desk playing a colorful action game on a large monitor, RGB keyboard and mouse, webcam light, microphone arm, chat overlay visible on a side screen but text unreadable, energetic real-life livestream atmosphere, candid handheld photography feel, realistic room clutter, cinematic monitor glow, no brand logos, no watermark" --size 1536x1024 --output outputs/game-livestream-realistic.png
```

产品包装批量图：

```bash
gpt-image2 generate --prompt "Minimalist premium tea packaging concept, modern East Asian branding, clean product photography, soft shadows, elegant paper texture, refined typography area left blank, ecommerce-ready hero visual" --size 1024x1024 --batch 4 --output outputs/tea-packaging.png
```

百科信息图：

```bash
gpt-image2 try encyclopedia-card --var topic=咖啡萃取 --output outputs/coffee-encyclopedia-card.png
```

## 给 Agent 用

当 Agent 需要稳定、可复用的图片工作流，而不是每次临时写脚本时，适合调用这个 CLI。

推荐流程：

1. 执行 `gpt-image2 templates list` 或 `gpt-image2 templates search`。
2. 执行 `gpt-image2 templates show <id>` 查看变量。
3. 执行 `gpt-image2 sizes list` 选择原生尺寸或比例策略。
4. 执行 `gpt-image2 generate`、`gpt-image2 try` 或 `gpt-image2 edit`。
5. 重要调用前先用 `--dry-run`。
6. 下游需要 shell 命令时用 `--curl`。

Agent 示例：

```bash
gpt-image2 templates list
gpt-image2 sizes list --native-only
gpt-image2 try encyclopedia-card --var topic=茶叶冲泡 --output outputs/tea-card.png
gpt-image2 generate --prompt "高端茶叶包装设计，东方极简风格" --batch 4 --output outputs/tea-batch.png
```

适合 Agent 的原因：

- 命令接口稳定
- 本地输出文件明确
- 不要求 Python 运行时
- 不需要安装 npm 依赖
- 适合 Codex、Claude Code、OpenClaw 这类 shell-first agent 环境

## 给人类用

如果是人直接使用，可以把它当成一个轻量图片命令行工具，用来试模板、改提示词、切换渠道、快速出图。

推荐流程：

1. 用 `gpt-image2 config set` 配置渠道。
2. 用 `gpt-image2 config show` 检查配置。
3. 用 `gpt-image2 templates list` 浏览模板。
4. 用 `gpt-image2 try` 快速试模板。
5. 用 `gpt-image2 generate` 自由生图。
6. 有输入图时用 `gpt-image2 edit`。

人类使用示例：

```bash
gpt-image2 config set opclab --api-key "你的key" --base-url "https://api.opclab.vip/v1" --model "gpt-image-2"
gpt-image2 config use opclab
gpt-image2 templates list
gpt-image2 try city-poster --var city=Hangzhou --output outputs/hangzhou-poster.png
gpt-image2 generate --prompt "新中式茶品牌海报，高级感，极简留白" --size 1024x1536 --output outputs/poster.png
```

## 命令参考

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

常用参数：

```bash
--channel <name>
--api-key <key>
--base-url <url>
--model <model>
--size <size>
--batch <1-8>
--timeout-ms <毫秒数>
--retries <次数>
--dry-run
--curl
```

超时与重试默认值：

```bash
--timeout-ms 300000
--retries 1
```

也就是说，单次请求最长等待 300 秒；如果超时或遇到瞬时请求失败，会自动重试 1 次。

## 配置文件

默认配置文件：

```text
~/.gpt-image2/config.json
```

可以用环境变量覆盖：

```text
GPT_IMAGE2_CONFIG
```

密钥优先级：

1. 命令行参数，例如 `--api-key`
2. 当前激活渠道配置
3. 环境变量，例如 `GPT_IMAGE_API_KEY` 或 `OPENAI_API_KEY`

## 提示词模板

模板文件：

- `references/prompts.json`

如果想参考更多社区提示词案例，可以看这个开源项目：

- [EvoLinkAI/awesome-gpt-image-2-prompts](https://github.com/EvoLinkAI/awesome-gpt-image-2-prompts)

每个模板包含：

- `id`
- `title`
- `description`
- `size`
- `variables`
- `prompt`

变量写法是 `{{name}}`，通过下面的方式覆盖：

```bash
--var key=value
```

## 调试

只查看请求体，不真正调用 API：

```bash
gpt-image2 generate --template encyclopedia-card --var topic=茶叶 --dry-run
```

输出等价 curl：

```bash
gpt-image2 generate --template city-poster --var city=Chengdu --curl
```

## 安装为 Codex Skill

如果希望 Codex 自动发现这个项目作为 skill，可以从 GitHub 安装：

```bash
python "C:\Users\houht\.codex\skills\.system\skill-installer\scripts\install-skill-from-github.py" --repo houht1013/gpt-image2-skill --path . --name gpt-image2
```

默认安装目录：

```text
~/.codex/skills/gpt-image2
```

安装完成后重启 Codex。

## 源码使用和开发

推荐对外使用 `gpt-image2` 命令。如果不想链接全局命令，也可以在仓库目录中直接运行源码脚本：

```bash
git clone https://github.com/houht1013/gpt-image2-skill.git
cd gpt-image2-skill
node scripts/gpt-image2.mjs --help
node scripts/gpt-image2.mjs templates list
```

如果你正在开发这个仓库，`npm link` 很适合调试，因为修改 `scripts/gpt-image2.mjs` 后，全局 `gpt-image2` 命令会立即使用最新代码。

## 推荐网关示例

如果你需要一个 OpenAI 兼容接口用于测试或 Agent 工作流，可以参考 [OPCLab](https://api.opclab.vip)。

```bash
gpt-image2 config set opclab --api-key "你的key" --base-url "https://api.opclab.vip/v1" --model "gpt-image-2"
gpt-image2 config use opclab
```
