# GPT Image 2 Skill 中文说明

这是一个轻量版 `gpt-image-2` Skill / CLI，目标是：

- 不依赖 Python
- 不安装第三方 npm 包
- 通过 Node.js 直接调用 OpenAI 兼容图片接口
- 支持提示词模板快速试用
- 支持 `config` 命令管理多个 API 渠道
- 支持查询可用分辨率

核心脚本：

- [scripts/gpt-image2.mjs](D:\workspace\gpt-image2-skill\scripts\gpt-image2.mjs)
- [references/prompts.json](D:\workspace\gpt-image2-skill\references\prompts.json)
- [SKILL.md](D:\workspace\gpt-image2-skill\SKILL.md)

## 运行前提

需要本机有 Node.js 18+，当前项目已在 Node.js 24 环境下验证通过。

## 安装说明

这个项目目前定位为本地轻量 CLI，不依赖 Python，也不依赖第三方 npm 包，因此安装方式非常简单。

### 方式一：直接在仓库目录使用

这是最推荐的方式，尤其适合在 agent 工作区里直接调用。

```bash
git clone <你的仓库地址>
cd gpt-image2-skill
node scripts/gpt-image2.mjs --help
```

因为没有第三方依赖，所以通常不需要执行 `npm install`。

### 方式二：作为本地命令使用

如果你希望把它当成全局命令来调用，可以在项目目录执行：

```bash
npm link
```

之后可直接使用：

```bash
gpt-image2 --help
```

如果你不想修改全局环境，也可以继续使用下面这种最稳妥的方式：

```bash
node scripts/gpt-image2.mjs <command>
```

### 方式三：放入 Agent 常用工具目录

如果你在 Codex、Claude Code、OpenClaw 这类 agent 环境中长期使用，可以把这个项目放在固定工具目录，例如：

```text
~/tools/gpt-image2-skill
```

然后在 agent 提示词、skill、脚本模板或自动化任务中固定调用：

```bash
node ~/tools/gpt-image2-skill/scripts/gpt-image2.mjs templates list
```

这样做的好处是：

- 不依赖当前业务项目的运行环境
- 不需要 Python
- 不会污染业务仓库依赖
- 便于多个 agent/workspace 复用同一套命令

## 5 分钟快速上手

如果你第一次使用，建议按下面顺序操作。

### 第 1 步：确认 CLI 可运行

```bash
node scripts/gpt-image2.mjs --help
```

### 第 2 步：配置一个图片渠道

```bash
node scripts/gpt-image2.mjs config set openai --api-key "你的key" --base-url "https://api.openai.com/v1" --model "gpt-image-2"
node scripts/gpt-image2.mjs config use openai
node scripts/gpt-image2.mjs config show
```

### 第 3 步：看有哪些模板

```bash
node scripts/gpt-image2.mjs templates list
node scripts/gpt-image2.mjs templates show encyclopedia-card
```

### 第 4 步：查可用分辨率

```bash
node scripts/gpt-image2.mjs sizes list
```

### 第 5 步：先 dry-run 再正式生成

```bash
node scripts/gpt-image2.mjs try encyclopedia-card --var topic=咖啡萃取 --dry-run
node scripts/gpt-image2.mjs try encyclopedia-card --var topic=咖啡萃取 --output outputs/coffee-card.png
```

### 第 6 步：需要时导出 curl

```bash
node scripts/gpt-image2.mjs generate --template city-poster --var city=Shanghai --curl
```

如果你只想最快验证链路是否通，最短路径是：

```bash
node scripts/gpt-image2.mjs config set demo --api-key "你的key" --base-url "你的接口地址" --model "gpt-image-2"
node scripts/gpt-image2.mjs config use demo
node scripts/gpt-image2.mjs try city-poster --var city=Hangzhou --output outputs/test.png
```

## 快速开始

查看帮助：

```bash
node scripts/gpt-image2.mjs --help
```

查看模板：

```bash
node scripts/gpt-image2.mjs templates list
node scripts/gpt-image2.mjs templates show encyclopedia-card
node scripts/gpt-image2.mjs templates search poster
```

查询支持的分辨率：

```bash
node scripts/gpt-image2.mjs sizes list
node scripts/gpt-image2.mjs sizes list --orientation portrait
```

当前内置支持：

- `1024x1024`
- `1536x1024`
- `1024x1536`
- `auto`

## 配置 API 渠道

可以把不同供应商或转发网关保存成多个渠道，然后切换使用。

设置一个渠道：

```bash
node scripts/gpt-image2.mjs config set openai --api-key "你的key" --base-url "https://api.openai.com/v1" --model "gpt-image-2"
```

切换当前渠道：

```bash
node scripts/gpt-image2.mjs config use openai
```

查看所有渠道：

```bash
node scripts/gpt-image2.mjs config list
```

查看当前配置：

```bash
node scripts/gpt-image2.mjs config show
```

配置文件默认位置：

```text
~/.gpt-image2/config.json
```

也可以通过环境变量覆盖：

```text
GPT_IMAGE2_CONFIG
```

密钥优先级如下：

1. 命令行参数，如 `--api-key`
2. 当前激活渠道中的配置
3. 环境变量，如 `GPT_IMAGE_API_KEY`、`OPENAI_API_KEY`

## 为什么适合在 Agent 中使用

这个 CLI 很适合被 agent 直接调用，尤其适合以下环境：

- Codex
- Claude Code
- OpenClaw
- 其他支持 shell 命令执行的本地代理框架

原因很直接：

### 1. 无 Python 依赖，环境负担小

很多 agent 工作区只保证 Node.js 或基础 shell 可用，不一定有稳定 Python 运行时。这个 CLI 只依赖 Node.js 原生能力，更适合直接嵌入 agent 工作流。

### 2. 无第三方 npm 包，迁移成本低

不需要安装 axios、commander、form-data 之类的依赖，复制仓库即可运行，特别适合临时工作区、沙箱环境和自动化执行环境。

### 3. 输出清晰，便于 agent 读取

命令输出尽量保持稳定、简洁、可解析，适合 agent 做后续判断。例如：

- `templates list` 适合先扫描可用模板
- `templates show` 适合 agent 再拼变量
- `sizes list` 适合先判断尺寸
- `--dry-run` 适合先检查请求体
- `--curl` 适合切换到 shell-native 方案

### 4. 适合工具链编排

agent 经常需要把多个步骤串起来，这个 CLI 比较适合放到下面这类流程里：

1. 读取用户需求
2. 选择模板
3. 补充变量
4. 查询支持尺寸
5. 生成图片
6. 将输出文件继续交给后续工具处理

### 5. 配置隔离更适合多渠道代理

通过 `config set/use` 可以保存多个渠道，对 agent 很友好：

- 一个渠道走 OpenAI 官方
- 一个渠道走兼容网关
- 一个渠道走测试环境

agent 不需要每次把 key 和 base URL 都写进命令里。

## Agent 使用建议

### 在 Codex 中使用

适合放进 skill、自动化脚本或固定工具目录中，通过：

```bash
node scripts/gpt-image2.mjs try encyclopedia-card --var topic=咖啡萃取 --output outputs/card.png
```

来生成结果文件，再由 Codex 继续读取、展示或二次处理。

### 在 Claude Code 中使用

适合把它当作一个本地稳定命令，让 Claude Code 通过 shell 直接调用。由于没有第三方依赖，通常比临时写 Python 脚本更稳。

### 在 OpenClaw 中使用

适合作为 agent 的外部图片工具命令。尤其在需要：

- 快速试模板
- 多渠道切换
- 输出 curl 复现
- 本地落盘产物

时，会比一次次临时拼 HTTP 请求更省上下文，也更容易复用。

### 推荐的 Agent 调用模式

如果希望 agent 表现更稳定，建议优先按下面顺序调用：

1. `templates list` 或 `templates search`
2. `templates show`
3. `sizes list`
4. `generate` / `try` / `edit`
5. 需要排错时再用 `--dry-run` 或 `--curl`

## 直接生成图片

使用直接提示词生图：

```bash
node scripts/gpt-image2.mjs generate --prompt "A quiet ceramic studio at sunrise, soft light, editorial photography" --size 1024x1024 --output outputs/studio.png
```

使用模板生图：

```bash
node scripts/gpt-image2.mjs generate --template city-poster --var city=Shanghai --var season=autumn --output outputs/city-poster.png
```

快速试模板：

```bash
node scripts/gpt-image2.mjs try encyclopedia-card --var topic=咖啡萃取 --output outputs/coffee-card.png
```

只查看请求体，不真正发送：

```bash
node scripts/gpt-image2.mjs generate --template encyclopedia-card --var topic=茶叶 --dry-run
```

输出等价 curl：

```bash
node scripts/gpt-image2.mjs generate --template city-poster --var city=Chengdu --curl
```

## 编辑图片

对已有图片进行编辑：

```bash
node scripts/gpt-image2.mjs edit --image input.png --prompt "Keep the product unchanged, replace the background with a warm premium studio setup" --output outputs/edited.png
```

配合模板编辑：

```bash
node scripts/gpt-image2.mjs edit --image input.png --template product-redesign --var audience=城市白领 --output outputs/redesign.png
```

如果接口支持蒙版，也可附带：

```bash
node scripts/gpt-image2.mjs edit --image input.png --mask mask.png --prompt "..." --output outputs/masked-edit.png
```

## 模板说明

模板保存在：

- [references/prompts.json](D:\workspace\gpt-image2-skill\references\prompts.json)

每个模板包含：

- `id`：模板唯一标识
- `title`：模板标题
- `description`：模板用途说明
- `size`：推荐分辨率
- `variables`：可替换变量默认值
- `prompt`：模板主体

变量写法为：

```text
{{topic}}
{{city}}
{{season}}
```

传参方式：

```bash
--var key=value
```

例如：

```bash
node scripts/gpt-image2.mjs try city-poster --var city=Hangzhou --var season=spring
```

## 输出文件

如果没有显式传 `--output`，脚本会默认保存到：

```text
outputs/
```

并自动生成带时间戳的文件名。

如果一次返回多张图，脚本会自动追加编号，如：

```text
image-01.png
image-02.png
```

## 常见问题

### 1. 为什么提示 size 不支持？

因为 CLI 会先在本地校验 `--size`。请先运行：

```bash
node scripts/gpt-image2.mjs sizes list
```

再从支持列表中选值。

### 2. 为什么接口报 401 或 403？

通常是：

- API Key 不正确
- 渠道 base URL 不对
- 当前网关不支持 `gpt-image-2`
- 账号或渠道没有图片模型权限

建议先用：

```bash
node scripts/gpt-image2.mjs config show
```

检查当前实际生效的渠道配置。

### 3. 为什么能输出 curl，但不能直接生成？

可能原因：

- 当前环境没有正确配置密钥
- 目标 API 需要特殊 header
- 渠道并非完全兼容 OpenAI 图片接口

这时可以先用 `--dry-run` 看请求体，再用 `--curl` 手动排查。

## 已验证内容

当前项目已验证：

- `templates list`
- `templates show`
- `sizes list`
- `generate --dry-run`
- `edit --dry-run`
- `config set/use/list/show`
- 基于你提供的渠道完成过一次真实生图测试，输出文件位于：
  `outputs/random-test.png`

## 后续可扩展

如果还要继续增强，建议下一步做：

- 增加 `channels test` 命令，快速检查当前渠道是否可用
- 增加交互式模板选择
- 增加更多中文模板分类
- 增加批量生成或批量模板实验能力
