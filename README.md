<div align="center">

<img src="src/assets/site/logo.png" alt="Marble Homes" width="120" />

# Marble Homes

**Excellence in every aspect.**

Marble Homes 官方网站 · 悉尼建筑设计、施工与项目管理

[![CI](https://github.com/Marblehomes/marblehomes-site/actions/workflows/ci.yml/badge.svg)](https://github.com/Marblehomes/marblehomes-site/actions/workflows/ci.yml)
![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)
![Node](https://img.shields.io/badge/Node-22-5FA04E?logo=nodedotjs&logoColor=white)

### 🌐 [marblehomes.com.au](https://marblehomes.com.au)

</div>

---

## 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [部署是怎么工作的](#部署是怎么工作的)
- [目录结构](#目录结构)
- [常见修改](#常见修改)
- [贡献流程](#贡献流程)
- [常见问题](#常见问题)

## 项目简介

这是 Marble Homes 的品牌官网。页面全部是静态文件，唯一的后端是联系表单接口 `/api/contact`，运行在同一个 Cloudflare Worker 里。

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `/` | 品牌介绍、精选项目、服务、流程、选择我们的理由 |
| 关于 | `/about/` | 公司与团队介绍 |
| 项目列表 | `/projects/` | 全部项目，可按 House / Duplex / Apartment 筛选 |
| 项目详情 | `/projects/<slug>/` | 根据 `src/content/projects/` 自动生成，含介绍和图集 |
| 联系我们 | `/contact/` | 联系方式与询价表单，提交后发邮件到 info@ |
| 隐私政策 | `/privacy/` | 个人信息收集与使用说明 |

## 技术栈

| 用途 | 选型 |
| --- | --- |
| 框架 | [Astro](https://astro.build)（静态输出） |
| 动效 | [GSAP](https://gsap.com) + ScrollTrigger、[Lenis](https://lenis.darkroom.engineering) 平滑滚动 |
| 字体 | Bricolage Grotesque、Inter（`@fontsource-variable`，自托管） |
| 图片 | `astro:assets` + sharp，构建时自动压缩并生成多尺寸 |
| 托管 | Cloudflare Workers（静态资源 + `/api/*` 接口） |
| 联系表单 | Cloudflare Turnstile 防垃圾 + [Resend](https://resend.com) 发信 |
| CI | GitHub Actions |

## 快速开始

需要 **Node.js 22**（见 `.nvmrc`）。

```bash
npm ci          # 安装依赖
npm run dev     # 本地开发 → http://localhost:4321
npm run check   # 类型检查
npm run build   # 生产构建，输出到 dist/
npm run preview # 本地预览构建结果（不含表单接口）
npx wrangler dev --port 8787  # 预览构建结果 + 表单接口（先 npm run build）
```

## 部署是怎么工作的

> **一句话：合并到 `main` 分支就会自动上线，不需要手动操作服务器。**

```mermaid
flowchart LR
    A[本地修改代码] --> B[推送分支 / 发 PR]
    B --> C{GitHub Actions CI<br/>类型检查 + 构建}
    C -- 失败 --> A
    C -- 通过 --> D[合并到 main]
    D --> E[Cloudflare Workers Builds<br/>npm ci → npm run build]
    E --> F[npx wrangler deploy]
    F --> G[🌐 marblehomes.com.au]
```

- **GitHub Actions**（`.github/workflows/ci.yml`）只负责检查：每个 PR 和每次推送到 `main` 都会跑类型检查和构建。它**不负责**部署。
- **Cloudflare Workers Builds** 负责部署：Cloudflare 监听这个仓库的 `main` 分支，有新提交就自动构建，大约 1 到 2 分钟后上线。
- 部署配置在 `wrangler.jsonc`：`dist/` 作为静态资源发布，未知路径返回 `404.html`；只有 `/api/*` 会执行 `worker/index.ts`。
- 其他分支推送后，Cloudflare 会生成预览地址，可以在 Cloudflare 控制台的 **Workers & Pages → marblehomes-site → Deployments** 里找到。
- 回滚：在同一个 Deployments 页面，找到之前的版本，点 **Rollback**。

### 联系表单

```mermaid
flowchart LR
    A[访客提交表单] --> B[POST /api/contact]
    B --> C{校验字段<br/>Turnstile 人机验证}
    C -- 不通过 --> D[返回错误，页面提示电话和邮箱]
    C -- 通过 --> E[Resend 发信]
    E --> F[📬 info@marblehomes.com.au]
```

- 发件人是 `website@marblehomes.com.au`，Reply-To 是客户邮箱，在 Outlook 里直接点回复即可。
- 收件人和发件人配置在 `wrangler.jsonc` 的 `vars`。
- 两个密钥 `RESEND_API_KEY`、`TURNSTILE_SECRET_KEY` 只保存在 Cloudflare 控制台：**Workers & Pages → marblehomes-site → Settings → Variables and Secrets**。**不要写进代码。**
- Turnstile 的公开 site key 在 `src/data/site.ts` 的 `turnstileSiteKey`。
- 本地调试接口：在项目根目录建 `.dev.vars`（已被 git 忽略），写入 Cloudflare 提供的测试密钥：

  ```bash
  TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
  RESEND_API_KEY=re_xxx
  ```

- 表单日志：Cloudflare 控制台 **marblehomes-site → Observability**。

### 域名与 DNS

- 域名注册在 GoDaddy，DNS 托管在 Cloudflare。
- `marblehomes.com.au` 绑定为 Worker 的自定义域名。
- `www.marblehomes.com.au` 由 Cloudflare 跳转规则 301 到主域名。
- ⚠️ **DNS 里的 MX、TXT、SRV 和邮件相关 CNAME 记录服务于公司 Microsoft 365 邮箱，不要删除，也不要开启代理（橙色云朵）。**

## 目录结构

```text
marblehomes-site/
├── public/                 # 原样复制到 dist/ 的文件
│   ├── _redirects          # 旧 WordPress 网址的 301 跳转
│   └── favicon.png
├── scripts/
│   └── make-logo.mjs       # 由原始 logo 生成浅色/深色变体
├── src/
│   ├── assets/
│   │   └── site/           # 站点通用图片与 logo
│   ├── content/projects/   # 每个项目一个文件夹：index.md + 照片
│   ├── components/         # Header、Footer、ProjectCard
│   ├── data/
│   │   ├── site.ts         # 公司信息、导航、服务、流程等文案
│   │   └── projects.ts     # 读取项目、生成标题与排序
│   ├── layouts/Base.astro  # 页面骨架
│   ├── pages/              # 路由（文件即页面）
│   ├── scripts/main.ts     # 全站动效与交互
│   └── styles/global.css   # 设计变量与全局样式
├── worker/index.ts         # 联系表单接口 /api/contact
├── astro.config.mjs
└── wrangler.jsonc          # Cloudflare 部署配置
```

## 常见修改

<details>
<summary><b>修改电话、邮箱、地址或页面文案</b></summary>

编辑 `src/data/site.ts`。所有页面都从这里读取，改一处全站生效。

</details>

<details>
<summary><b>新增一个项目</b></summary>

**方法一：用导入脚本（macOS）**

1. 准备一个文件夹，命名为「地名 + 类型 [+ 编号]」，例如 `North Ryde House`、`Eastwood Duplex 2`。类型只能是 House、Duplex、Apartment。
2. 文件夹里放一份介绍文档（`.doc` 或 `.docx`）和这个项目的照片。照片多大都可以。
3. 运行：

   ```bash
   npm run import-projects -- "~/Desktop/North Ryde House"
   # 也可以传入一个包含多个项目文件夹的目录
   ```

   脚本会把照片压缩到长边 2400 像素以内并去掉 EXIF 和 GPS 信息，生成 `src/content/projects/north-ryde-house/`。已存在的项目会跳过，加 `--force` 才会覆盖。

**方法二：手动**

在 `src/content/projects/` 新建文件夹（例如 `north-ryde-house/`），放入照片和 `index.md`：

```md
---
type: House          # House | Duplex | Apartment
number: 2            # 可选，显示为 "House 2 — North Ryde"
location: "North Ryde"
order: 160           # 越小越靠前，前 6 个上首页
cover: ./01.jpg      # 封面
gallery:             # 图集顺序
  - ./01.jpg
  - ./02.jpg
---

第一段介绍。

第二段介绍。
```

详情页 `/projects/north-ryde-house/` 会自动生成。如果封面是竖图，详情页顶部会自动改用左右分栏。

</details>

<details>
<summary><b>修改颜色或字体</b></summary>

设计变量在 `src/styles/global.css` 顶部的 `:root` 里，例如 `--taupe`、`--cream`、`--gold`。

</details>

<details>
<summary><b>添加网址跳转</b></summary>

在 `public/_redirects` 里加一行：`旧路径  新路径  301`。带斜杠和不带斜杠的写法建议都加上。

</details>

<details>
<summary><b>更换 logo</b></summary>

替换 `src/assets/site/logo.png` 后运行 `npm run logo`，会重新生成 `logo-light.png`、`mark-light.png`、`mark-dark.png` 和 `public/favicon.png`。

</details>

## 贡献流程

1. 从 `main` 新建分支：`git checkout -b feat/简短描述`。
2. 本地确认 `npm run check` 和 `npm run build` 都通过。
3. 推送并发起 Pull Request，等待 CI 变绿。
4. 在 Cloudflare 的预览地址上检查效果。
5. Review 通过后合并到 `main`，网站自动更新。

> 使用 AI 编程工具修改代码前，请让它先阅读 [`AGENTS.md`](AGENTS.md)。

## 常见问题

<details>
<summary><b>Cloudflare 构建卡在 Installing 不动？</b></summary>

`package-lock.json` 里的依赖地址必须是公共源 `https://registry.npmjs.org/`。如果你本机配置了公司内部 npm 源，安装新依赖时会写进内部地址，Cloudflare 访问不到。项目里的 `.npmrc` 已经指定公共源，CI 也会检查这一点。

</details>

<details>
<summary><b>本地页面动画不生效、控制台报 504 Outdated Optimize Dep？</b></summary>

删除 `node_modules/.vite` 后重启 `npm run dev`。

</details>

<details>
<summary><b>本地 wrangler dev 提交表单返回 502？</b></summary>

公司办公网络会拦截 `api.resend.com`，本地无法真正发信，线上不受影响。用手机热点或在 Cloudflare 预览地址上测试。

</details>

<details>
<summary><b>合并后网站没有更新？</b></summary>

到 Cloudflare 控制台 **Workers & Pages → marblehomes-site → Deployments** 查看构建日志。浏览器可能有缓存，可以用无痕窗口确认。

</details>

---

<div align="center">
<sub>© Marble Homes · Burwood NSW 2134 · <a href="https://marblehomes.com.au">marblehomes.com.au</a></sub>
</div>
