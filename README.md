# 健身每日打卡 · WeChat Mini Program

<p align="center">
  <strong>Daily Fitness Check-in</strong> — A WeChat native mini-program for planning workouts, tracking progress, and building habits.
</p>

<p align="center">
  <a href="#english">English</a> &nbsp;|&nbsp; <a href="#chinese">中文</a>
</p>

---

<h2 id="english">English</h2>

## Overview

A **zero-dependency WeChat native mini-program + Cloud Base** app that helps users:

- Browse and customize workout plan templates (8 presets included)
- Complete daily check-ins with per-exercise set/rep/weight tracking
- Visualize training history with a GitHub-style heatmap and monthly calendar
- Monitor stats: streaks, completion rates, body weight trends, muscle group distribution
- Receive scheduled subscription-message reminders

Built entirely with WXML + WXSS + JS (no third-party UI or chart libraries). Charts are hand-drawn via the Canvas 2D API.

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | WeChat Mini-Program native (WXML + WXSS + JS) | Minimal bundle size, best performance, full API access |
| Backend | WeChat Cloud Base (Cloud Functions) | Zero server ops, built-in DB / functions / storage |
| Database | Cloud Base Document DB (MongoDB-like) | Schema-less, automatic `_openid` user isolation |
| Charts | Canvas 2D API (hand-drawn) | No third-party dependency, full control |

## Features (MVP)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Daily Check-in** | View today's plan, log sets × reps × weight per exercise |
| 2 | **Calendar + Heatmap** | Monthly calendar view + GitHub-style annual heatmap |
| 3 | **Statistics Dashboard** | Streak count, completion rate, weekly/monthly summaries, weight trends, muscle group distribution |
| 4 | **Training Plan Templates** | 8 preset templates; copy, edit, and set as active plan |
| 5 | **Exercise Progress** | Per-exercise historical weight/rep trend charts |
| 6 | **Reminder Notifications** | Scheduled WeChat subscription message reminders |

## Project Structure

```
wechat-exerciseplan/
├── project.config.json              # Miniprogram project config
├── DESIGN.md                        # Full design document (Chinese)
├── GETTING_STARTED.md               # Step-by-step setup guide
│
├── miniprogram/                     # ────── Frontend ──────
│   ├── app.js                       # Entry: cloud init, global state, onLaunch
│   ├── app.json                     # Pages, tabBar, window config
│   ├── app.wxss                     # Global styles, CSS variables
│   ├── env.js                       # Cloud environment ID (gitignored)
│   │
│   ├── pages/
│   │   ├── index/                   # Tab 1 — Today's Training
│   │   ├── calendar/                # Tab 2 — Calendar + Heatmap
│   │   ├── stats/                   # Tab 3 — Statistics Dashboard
│   │   ├── profile/                 # Tab 4 — Profile & Settings
│   │   ├── plan-list/               # Template browser + My Plans
│   │   ├── plan-detail/             # Plan detail / editor
│   │   ├── checkin-form/            # Check-in form (core interaction)
│   │   ├── exercise-detail/         # Exercise detail + history
│   │   └── history/                 # Check-in history list
│   │
│   ├── components/
│   │   ├── heatmap/                 # GitHub-style contribution heatmap
│   │   ├── exercise-card/           # Exercise display card
│   │   ├── plan-card/               # Plan summary card
│   │   ├── streak-badge/            # Streak count badge
│   │   ├── stat-ring/               # Canvas ring progress chart
│   │   └── nav-bar/                 # Custom navigation bar
│   │
│   ├── utils/
│   │   ├── cloud.js                 # wx.cloud init wrapper
│   │   ├── date.js                  # Date helpers, streak calculation
│   │   ├── storage.js               # localStorage with TTL
│   │   ├── constants.js             # Muscle groups, difficulty labels
│   │   └── request.js               # Unified cloud function caller + error handling
│   │
│   └── styles/
│       └── common.wxss              # Global utility classes
│
├── cloudfunctions/                  # ────── Backend ──────
│   ├── user/                        # User login, profile, settings, active plan
│   ├── exercise/                    # Exercise library (45 exercises)
│   ├── plan/                        # Training plan CRUD, template copy
│   ├── checkin/                     # Daily check-in: create, update, query
│   ├── statistics/                  # Aggregation: dashboard, streaks, charts
│   └── notification/                # Subscription messages + cron triggers
│
└── database/                        # ────── Seed Data ──────
    ├── init.js                      # DB initialization (collections + indexes)
    ├── seed-exercises.json          # 45 preset exercises
    └── seed-plans.json              # 8 training plan templates
```

## Database Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User profiles & stats cache | `activePlanId`, `bodyStats`, `settings`, `stats` |
| `exercises` | Exercise library | `name`, `category`, `muscleGroup`, `equipment`, `difficulty` |
| `training_plans` | Plans (templates + user copies) | `exercises[]`, `type`, `difficulty`, `goalType` |
| `checkins` | Daily workout records | `date`, `exercises[]`, `completionRate`, `mood`, `photos` |
| `subscriptions` | Subscription message status | `templateId`, `status` |

## Cloud Function APIs

Each cloud function uses a **router pattern** — a single function handles multiple `action`s:

| Function | Key Actions |
|----------|-------------|
| **user** | `login`, `updateProfile`, `updateBodyStats`, `updateSettings`, `updateActivePlan` |
| **exercise** | `list` (with filters), `getById`, `getCategories` |
| **plan** | `getTemplates`, `getMyPlans`, `getPlanById`, `createPlan`, `updatePlan`, `deletePlan`, `copyFromTemplate` |
| **checkin** | `getTodayPlan`, `createCheckin`, `updateCheckin`, `getByDate`, `getByRange`, `getRecent` |
| **statistics** | `getDashboard`, `getWeeklySummary`, `getMonthlySummary`, `getCalendarData`, `getExerciseStats`, `getBodyStatsTrend` |
| **notification** | `sendReminder` (cron-triggered), `subscribe`, `getSubscriptionStatus` |

## Preset Training Plans (8 templates)

| # | Plan | Weeks | Frequency | Equipment | Level |
|---|------|-------|-----------|-----------|-------|
| 1 | Full-Body Activation | 2 | 3×/week | Bodyweight | Beginner |
| 2 | Muscle Building A | 4 | 4×/week | Dumbbell + Bodyweight | Beginner |
| 3 | Home No-Equipment | 4 | 3×/week | Bodyweight | Beginner |
| 4 | 5×5 Strength | 6 | 3×/week | Barbell | Intermediate |
| 5 | HIIT Fat Burn | 3 | 4×/week | Bodyweight | Intermediate |
| 6 | Yoga Flexibility | 4 | 5×/week | None | Beginner |
| 7 | Core Sculpting | 4 | 3×/week | Bodyweight + Band | Beginner |
| 8 | Dumbbell Upper Body | 4 | 4×/week | Dumbbell | Intermediate |

## Getting Started

For a **step-by-step setup guide** (zero WeChat experience required), read [`GETTING_STARTED.md`](./GETTING_STARTED.md).

### Quick Start

1. Clone this repo
2. Open **WeChat DevTools** → import project → select this directory
3. Fill in your AppID in `project.config.json`
4. Open Cloud Base console → create environment → copy env ID into `miniprogram/env.js`
5. Create 5 DB collections: `users`, `exercises`, `training_plans`, `checkins`, `subscriptions`
6. Import seed data from `database/seed-exercises.json` and `database/seed-plans.json`
7. Right-click each folder under `cloudfunctions/` → **Upload & Deploy**
8. Compile and test

### Production Deployment

- Upload from WeChat DevTools
- Submit for review at the WeChat Mini-Program admin console
- Typical review: 1–7 business days

> **Note:** Subscription message reminders require a registered template ID from the WeChat public platform. The app works fully without it — reminders are optional.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Cloud function organization | 6 domain-routed functions | Fewer cold starts vs. per-action functions |
| User stats | Denormalized in `users.stats` | O(1) homepage reads, periodically recalibrated |
| Date storage | String `"YYYY-MM-DD"` | Timezone-safe, lexicographic = chronological |
| Plan-to-exercise linkage | Reference by ID (not embedded) | Exercise library updates don't pollute existing plans |
| Duplicate check-in prevention | Unique compound index | Database-level guarantee, no race conditions |
| Charts | Canvas 2D hand-drawn | Zero third-party dependencies |
| Message delivery | 3× daily cron + user-level filter | Cloud Base doesn't support per-user timers |

## License

MIT

---

<h2 id="chinese">中文</h2>

## 项目简介

一个**零依赖的微信原生小程序 + 云开发**健身每日打卡应用。帮助用户：

- 浏览和定制训练计划模板（内置 8 套）
- 逐动作填写组数/次数/重量完成每日打卡
- 通过 GitHub 风格热力图和月度日历查看训练记录
- 监控统计数据：连续打卡天数、完成率、体重趋势、肌群分布
- 接收微信订阅消息训练提醒

全部使用 WXML + WXSS + JS 原生开发，无任何第三方 UI 或图表库。图表通过 Canvas 2D API 手绘实现。

### 技术选型

| 层级 | 技术 | 理由 |
|------|------|------|
| 前端 | 微信小程序原生 (WXML + WXSS + JS) | 体积最小、性能最好、API 最全 |
| 后端 | 微信云开发 Cloud Base | 无需服务器运维、自带数据库/云函数/存储 |
| 数据库 | 云开发文档数据库 (类 MongoDB) | Schema-less、自动 `_openid` 数据隔离 |
| 图表 | Canvas 2D API 手绘 | 零第三方依赖、完全可控 |

## MVP 功能范围

| # | 功能 | 说明 |
|---|------|------|
| 1 | **每日打卡** | 查看今日训练计划，逐动作填写组数×次数×重量完成打卡 |
| 2 | **日历 + 热力图** | 月度日历视图 + GitHub 风格年度训练热力图 |
| 3 | **统计仪表盘** | 连续打卡天数、完成率、周/月汇总、体重趋势、肌群分布 |
| 4 | **训练计划模板** | 8 套预设模板，支持复制、编辑、设为当前计划 |
| 5 | **动作进度** | 每个动作的历史重量/次数变化趋势 |
| 6 | **提醒通知** | 微信订阅消息定时提醒训练 |

## 项目结构

```
wechat-exerciseplan/
├── project.config.json              # 小程序项目配置
├── DESIGN.md                        # 详细设计文档
├── GETTING_STARTED.md               # 从零到上线的图文指南
│
├── miniprogram/                     # ────── 前端 ──────
│   ├── app.js                       # 入口：云开发初始化、全局状态、onLaunch
│   ├── app.json                     # 页面注册、tabBar、窗口配置
│   ├── app.wxss                     # 全局样式、CSS 变量
│   ├── env.js                       # 云环境 ID（已 gitignore）
│   │
│   ├── pages/
│   │   ├── index/                   # Tab 1 — 今日训练首页
│   │   ├── calendar/                # Tab 2 — 日历 + 年度热力图
│   │   ├── stats/                   # Tab 3 — 统计仪表盘
│   │   ├── profile/                 # Tab 4 — 个人中心 & 设置
│   │   ├── plan-list/               # 模板浏览 + 我的计划
│   │   ├── plan-detail/             # 计划详情 / 编辑
│   │   ├── checkin-form/            # 打卡表单（核心交互页）
│   │   ├── exercise-detail/         # 动作详情 + 历史记录
│   │   └── history/                 # 打卡历史列表
│   │
│   ├── components/
│   │   ├── heatmap/                 # GitHub 风格贡献热力图
│   │   ├── exercise-card/           # 动作展示卡片
│   │   ├── plan-card/               # 计划摘要卡片
│   │   ├── streak-badge/            # 连续打卡天数徽章
│   │   ├── stat-ring/               # Canvas 环形进度图
│   │   └── nav-bar/                 # 自定义导航栏
│   │
│   ├── utils/
│   │   ├── cloud.js                 # wx.cloud 初始化封装
│   │   ├── date.js                  # 日期格式化、streak 计算
│   │   ├── storage.js               # 本地缓存读写（带 TTL）
│   │   ├── constants.js             # 肌群类别、难度标签等常量
│   │   └── request.js               # 统一云函数调用 + 错误处理 + loading
│   │
│   └── styles/
│       └── common.wxss              # 全局工具类、间距、栅格
│
├── cloudfunctions/                  # ────── 后端云函数 ──────
│   ├── user/                        # 用户登录、资料、设置、活跃计划
│   ├── exercise/                    # 动作库（45 个预设动作）
│   ├── plan/                        # 训练计划 CRUD + 模板复制
│   ├── checkin/                     # 打卡核心：创建、更新、查询
│   ├── statistics/                  # 聚合统计：仪表盘、连续、图表
│   └── notification/                # 订阅消息 + 定时触发器
│
└── database/                        # ────── 种子数据 ──────
    ├── init.js                      # 数据库初始化（创建集合 + 索引）
    ├── seed-exercises.json          # 45 个预设动作
    └── seed-plans.json              # 8 套训练计划模板
```

## 数据库设计

| 集合 | 用途 | 主要字段 |
|------|------|----------|
| `users` | 用户信息 & 统计缓存 | `activePlanId`、`bodyStats`、`settings`、`stats` |
| `exercises` | 动作库 | `name`、`category`、`muscleGroup`、`equipment`、`difficulty` |
| `training_plans` | 训练计划（模板 + 用户副本） | `exercises[]`、`type`、`difficulty`、`goalType` |
| `checkins` | 每日打卡记录 | `date`、`exercises[]`、`completionRate`、`mood`、`photos` |
| `subscriptions` | 订阅消息状态 | `templateId`、`status` |

## 云函数 API

每个云函数采用 **路由模式** —— 一个函数处理多个 `action`：

| 云函数 | 主要接口 |
|--------|----------|
| **user** | `login`、`updateProfile`、`updateBodyStats`、`updateSettings`、`updateActivePlan` |
| **exercise** | `list`（支持筛选）、`getById`、`getCategories` |
| **plan** | `getTemplates`、`getMyPlans`、`getPlanById`、`createPlan`、`updatePlan`、`deletePlan`、`copyFromTemplate` |
| **checkin** | `getTodayPlan`、`createCheckin`、`updateCheckin`、`getByDate`、`getByRange`、`getRecent` |
| **statistics** | `getDashboard`、`getWeeklySummary`、`getMonthlySummary`、`getCalendarData`、`getExerciseStats`、`getBodyStatsTrend` |
| **notification** | `sendReminder`（定时触发）、`subscribe`、`getSubscriptionStatus` |

## 8 套预设训练计划

| # | 计划名称 | 周数 | 频率 | 器械 | 难度 |
|---|----------|------|------|------|------|
| 1 | 新手全身激活 | 2 | 每周 3 练 | 自重 | 初级 |
| 2 | 新手增肌 A | 4 | 每周 4 练 | 哑铃 + 自重 | 初级 |
| 3 | 家庭无器械训练 | 4 | 每周 3 练 | 纯自重 | 初级 |
| 4 | 5×5 力量训练 | 6 | 每周 3 练 | 杠铃 | 中级 |
| 5 | HIIT 燃脂计划 | 3 | 每周 4 练 | 自重 | 中级 |
| 6 | 瑜伽柔韧入门 | 4 | 每周 5 练 | 无器械 | 初级 |
| 7 | 核心雕刻计划 | 4 | 每周 3 练 | 自重 + 弹力带 | 初级 |
| 8 | 哑铃上肢强化 | 4 | 每周 4 练 | 哑铃 | 中级 |

## 快速开始

详细的**图文部署指南**（零微信开发经验可用）请见 [`GETTING_STARTED.md`](./GETTING_STARTED.md)。

### 简要步骤

1. 克隆本仓库
2. 打开**微信开发者工具** → 导入项目 → 选择本目录
3. 在 `project.config.json` 中填入你的 AppID
4. 打开云开发控制台 → 创建环境 → 将环境 ID 填入 `miniprogram/env.js`
5. 创建 5 个数据库集合：`users`、`exercises`、`training_plans`、`checkins`、`subscriptions`
6. 导入种子数据：`database/seed-exercises.json` 和 `database/seed-plans.json`
7. 依次右键 `cloudfunctions/` 下每个子目录 → **上传并部署：云端安装依赖**
8. 编译运行

### 上线发布

- 在微信开发者工具中点击**上传**
- 登录小程序后台 → 版本管理 → 提交审核
- 审核周期通常 1–7 个工作日

> **提示：** 订阅消息提醒需要在微信公众平台申请模板 ID。提醒功能是可选的，不影响其他功能正常使用。

## 核心架构决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 云函数组织 | 6 个域路由函数 | 减少冷启动次数 |
| 用户统计 | `users.stats` 反范式存储 | 首页 O(1) 读取，定期重算校准 |
| 日期存储 | 字符串 `"YYYY-MM-DD"` | 无时区陷阱，词典序 = 日期序 |
| 计划-动作关联 | ID 引用（非嵌入） | 动作库更新不污染已有计划 |
| 重复打卡防护 | 唯一复合索引 | 数据库层面保证，消除竞态 |
| 图表绘制 | Canvas 2D 手绘 | 零第三方依赖 |
| 消息触达 | 每日 3 次定时器 + 用户级过滤 | 云开发不支持单用户定时器 |

## 开源协议

MIT

---

<p align="center">
  <sub>Built with WeChat Mini-Program native + Cloud Base · Zero third-party dependencies</sub>
</p>
