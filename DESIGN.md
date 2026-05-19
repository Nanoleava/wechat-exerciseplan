# 微信小程序健身每日打卡计划 — 详细设计文档

## 项目概述

从零构建一个**微信原生小程序 + 云开发**的健身每日打卡应用。帮助用户制定训练计划、记录每日训练、追踪进度、获得提醒。

### 技术选型

| 层级 | 技术 | 理由 |
|------|------|------|
| 前端 | 微信小程序原生 (WXML + WXSS + JS) | 体积最小、性能最好、API 最全 |
| 后端 | 微信云开发 Cloud Base | 无需服务器运维、自带数据库/云函数/存储 |
| 数据库 | 云开发文档数据库 (类 MongoDB) | Schema-less、自动 `_openid` 隔离 |
| 图表 | Canvas 2D API 手绘 | 不引入第三方库，控制包体积 |

### MVP 功能范围

1. **每日打卡** — 查看今日训练计划，逐动作填写组数/次数/重量完成打卡
2. **日历视图** — 月度日历 + GitHub 风格年度热力图
3. **简单统计** — 连续打卡天数、完成率、周/月汇总、体重趋势、肌群分布
4. **训练计划模板** — 8 套预设模板，支持复制、编辑、设为当前计划
5. **进度追踪** — 每个动作的历史重量/次数变化趋势
6. **提醒通知** — 微信订阅消息定时提醒训练

---

## 项目结构

```
D:\nano_personal2\
├── project.config.json              # 微信开发者工具项目配置
├── DESIGN.md                        # 本文档
│
├── miniprogram\                     # ============ 前端 ============
│   ├── app.js                       # 入口: 云开发初始化、全局数据、onLaunch
│   ├── app.json                     # 页面注册、tabBar、窗口配置、权限声明
│   ├── app.wxss                     # 全局样式、CSS 变量、主题色
│   ├── env.js                       # 云环境 ID 常量
│   │
│   ├── pages\
│   │   ├── index\                   # 【Tab 1】今日训练首页
│   │   │   ├── index.js
│   │   │   ├── index.json
│   │   │   ├── index.wxml
│   │   │   └── index.wxss
│   │   │
│   │   ├── calendar\                # 【Tab 2】日历 + 年度热力图
│   │   │   ├── calendar.js
│   │   │   ├── calendar.json
│   │   │   ├── calendar.wxml
│   │   │   └── calendar.wxss
│   │   │
│   │   ├── stats\                   # 【Tab 3】统计仪表盘
│   │   │   ├── stats.js
│   │   │   ├── stats.json
│   │   │   ├── stats.wxml
│   │   │   └── stats.wxss
│   │   │
│   │   ├── profile\                 # 【Tab 4】个人中心
│   │   │   ├── profile.js
│   │   │   ├── profile.json
│   │   │   ├── profile.wxml
│   │   │   └── profile.wxss
│   │   │
│   │   ├── plan-list\               # 训练计划列表 (模板 + 我的计划)
│   │   │   ├── plan-list.js
│   │   │   ├── plan-list.json
│   │   │   ├── plan-list.wxml
│   │   │   └── plan-list.wxss
│   │   │
│   │   ├── plan-detail\             # 计划详情 / 编辑
│   │   │   ├── plan-detail.js
│   │   │   ├── plan-detail.json
│   │   │   ├── plan-detail.wxml
│   │   │   └── plan-detail.wxss
│   │   │
│   │   ├── checkin-form\            # 打卡表单 (核心交互页面)
│   │   │   ├── checkin-form.js
│   │   │   ├── checkin-form.json
│   │   │   ├── checkin-form.wxml
│   │   │   └── checkin-form.wxss
│   │   │
│   │   ├── exercise-detail\         # 动作详情 + 历史记录
│   │   │   ├── exercise-detail.js
│   │   │   ├── exercise-detail.json
│   │   │   ├── exercise-detail.wxml
│   │   │   └── exercise-detail.wxss
│   │   │
│   │   └── history\                 # 打卡历史记录列表
│   │       ├── history.js
│   │       ├── history.json
│   │       ├── history.wxml
│   │       └── history.wxss
│   │
│   ├── components\
│   │   ├── heatmap\                 # GitHub 风格贡献热力图
│   │   │   ├── heatmap.js
│   │   │   ├── heatmap.json
│   │   │   ├── heatmap.wxml
│   │   │   └── heatmap.wxss
│   │   │
│   │   ├── exercise-card\           # 动作展示卡片
│   │   │   ├── exercise-card.js
│   │   │   ├── exercise-card.json
│   │   │   ├── exercise-card.wxml
│   │   │   └── exercise-card.wxss
│   │   │
│   │   ├── plan-card\               # 计划摘要卡片
│   │   │   ├── plan-card.js
│   │   │   ├── plan-card.json
│   │   │   ├── plan-card.wxml
│   │   │   └── plan-card.wxss
│   │   │
│   │   ├── streak-badge\            # 连续打卡天数徽章
│   │   │   ├── streak-badge.js
│   │   │   ├── streak-badge.json
│   │   │   ├── streak-badge.wxml
│   │   │   └── streak-badge.wxss
│   │   │
│   │   ├── stat-ring\               # Canvas 完成率环形进度图
│   │   │   ├── stat-ring.js
│   │   │   ├── stat-ring.json
│   │   │   ├── stat-ring.wxml
│   │   │   └── stat-ring.wxss
│   │   │
│   │   └── nav-bar\                 # 自定义导航栏
│   │       ├── nav-bar.js
│   │       ├── nav-bar.json
│   │       ├── nav-bar.wxml
│   │       └── nav-bar.wxss
│   │
│   ├── utils\
│   │   ├── cloud.js                 # wx.cloud 初始化封装
│   │   ├── date.js                  # 日期格式化、周范围、streak 计算
│   │   ├── storage.js               # 本地缓存读写 (带 TTL)
│   │   ├── constants.js             # 肌群类别、难度标签等常量
│   │   └── request.js               # 统一云函数调用 + 错误处理 + loading
│   │
│   └── styles\
│       └── common.wxss              # 全局工具类、间距、栅格
│
├── cloudfunctions\                  # ============ 后端云函数 ============
│   ├── user\                        # 用户管理
│   │   ├── index.js                 # 主入口 + 路由分发
│   │   ├── package.json
│   │   └── config.json
│   │
│   ├── plan\                        # 训练计划 CRUD
│   │   ├── index.js
│   │   ├── package.json
│   │   └── config.json
│   │
│   ├── checkin\                     # 打卡核心逻辑
│   │   ├── index.js
│   │   ├── package.json
│   │   └── config.json
│   │
│   ├── statistics\                  # 聚合统计
│   │   ├── index.js
│   │   ├── package.json
│   │   └── config.json
│   │
│   ├── notification\                # 订阅消息 + 定时提醒
│   │   ├── index.js
│   │   ├── package.json
│   │   └── config.json              # 包含 cloud timer 触发器
│   │
│   └── exercise\                    # 动作库
│       ├── index.js
│       ├── package.json
│       └── config.json
│
└── database\                        # ============ 数据库脚本 ============
    ├── init.js                      # 数据库初始化 (创建集合 + 索引)
    ├── seed-exercises.json          # 40-50 个预设动作
    └── seed-plans.json              # 8 套训练计划模板
```

### app.json tabBar 配置

```json
{
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#07C160",
    "backgroundColor": "#FFFFFF",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "今日训练",
        "iconPath": "images/tab-home.png",
        "selectedIconPath": "images/tab-home-active.png"
      },
      {
        "pagePath": "pages/calendar/calendar",
        "text": "日历",
        "iconPath": "images/tab-cal.png",
        "selectedIconPath": "images/tab-cal-active.png"
      },
      {
        "pagePath": "pages/stats/stats",
        "text": "统计",
        "iconPath": "images/tab-stats.png",
        "selectedIconPath": "images/tab-stats-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "images/tab-me.png",
        "selectedIconPath": "images/tab-me-active.png"
      }
    ]
  }
}
```

### 子页面路由

非 Tab 页面通过 `wx.navigateTo` 跳转:
- `/pages/plan-list/plan-list`
- `/pages/plan-detail/plan-detail?id=xxx`
- `/pages/checkin-form/checkin-form`
- `/pages/exercise-detail/exercise-detail?id=xxx`
- `/pages/history/history`

---

## 数据库设计

云开发文档数据库，5 个集合。`_openid` 字段由云开发自动管理，标记数据归属。

### 集合 1: `users` — 用户信息

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string (auto) | 文档 ID |
| `_openid` | string (auto) | 微信用户标识 |
| `nickName` | string | 显示名称 |
| `avatarUrl` | string | 头像 URL |
| `gender` | number | 0=未知 1=男 2=女 |
| `bodyStats` | object | `{ height, weight, targetWeight, updatedAt }` |
| `bodyStatsLog` | array | `[{ date, weight, height }]` 身体数据时间序列 |
| `settings` | object | `{ reminderTime: "20:00", reminderEnabled: true, weekDays: [1,2,3,4,5] }` |
| `activePlanId` | string | 当前活跃的训练计划 ID |
| `stats` | object | `{ totalCheckins, currentStreak, longestStreak, totalMinutes, lastCheckinDate }` — 反范式缓存，快速读取 |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**索引**: `_openid` (唯一), `stats.lastCheckinDate` (降序)

### 集合 2: `exercises` — 动作库

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string (auto) | |
| `name` | string | 中文名 |
| `nameEn` | string | 英文名 (可选) |
| `category` | string | `strength` / `cardio` / `flexibility` / `balance` |
| `muscleGroup` | string | `chest` / `back` / `legs` / `shoulders` / `arms` / `core` / `fullBody` |
| `equipment` | string | `bodyweight` / `dumbbell` / `barbell` / `machine` / `band` / `kettlebell` |
| `difficulty` | number | 1=初级 2=中级 3=高级 |
| `description` | string | 动作描述 |
| `steps` | array[string] | 分步说明 |
| `tips` | array[string] | 常见错误与技巧 |
| `muscleImageUrl` | string | 肌群示意图云文件 ID |
| `videoUrl` | string | 演示视频云文件 ID |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**索引**: `category` + `muscleGroup` (复合), `name` (搜索)

### 集合 3: `training_plans` — 训练计划

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string (auto) | |
| `_openid` | string | 所有者 (空字符串 = 系统模板) |
| `name` | string | 计划名称 |
| `description` | string | 概述 |
| `type` | string | `"template"` 或 `"user"` |
| `sourcePlanId` | string | 复制来源模板 ID |
| `difficulty` | number | 1-3 |
| `goalType` | string | `weightLoss` / `muscleGain` / `endurance` / `flexibility` / `general` |
| `durationWeeks` | number | 总周数 |
| `exercises` | array | 动作编排 (见下方子结构) |
| `tags` | array[string] | 如 `["居家", "无器械", "新手友好"]` |
| `isPublished` | boolean | 模板是否公开 |
| `copyCount` | number | 被复制次数 |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**exercises 子文档结构**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `exerciseId` | string | 引用 `exercises._id` |
| `dayIndex` | number | 0-based 偏移 (0=第1天) |
| `order` | number | 当天内的排序 |
| `sets` | number | 目标组数 |
| `reps` | string | 目标次数/时长, 如 `"12"` 或 `"30s"` 或 `"至力竭"` |
| `restSeconds` | number | 组间休息秒数 |
| `notes` | string | 备注 |

**索引**: `_openid` + `type` (复合), `type` + `isPublished` (浏览模板), `tags` (搜索)

### 集合 4: `checkins` — 打卡记录

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string (auto) | |
| `_openid` | string | 用户 |
| `date` | string | `"YYYY-MM-DD"` 训练日期 (本地时间) |
| `planId` | string | 关联计划 |
| `planName` | string | 冗余计划名 (打卡时的快照) |
| `exercises` | array | 动作完成详情 (见下方子结构) |
| `completionRate` | number | 0.0 ~ 1.0 |
| `totalDuration` | number | 总时长 (秒) |
| `mood` | number | 1-5 心情自评 (可选) |
| `notes` | string | 备注 (可选) |
| `photos` | array[string] | 进度照云文件 ID |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**exercises 子文档结构**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `exerciseId` | string | 关联动作 |
| `exerciseName` | string | 冗余动作名 |
| `muscleGroup` | string | 冗余肌群 |
| `completed` | boolean | 是否完成 |
| `setsCompleted` | number | 实际完成组数 |
| `repsPerSet` | array[number] | 每组实际次数, 如 `[12, 10, 8]` |
| `weightPerSet` | array[number] | 每组重量 (kg), 如 `[20, 20, 22.5]` |
| `durationSeconds` | number | 计时类动作时长 |
| `notes` | string | 动作备注 |

**索引**: `_openid` + `date` (唯一复合索引 —— 同日只能打卡一次), `date` (范围查询), `planId`

### 集合 5: `subscriptions` — 订阅消息

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string (auto) | |
| `_openid` | string | |
| `templateId` | string | 微信订阅消息模板 ID |
| `status` | string | `"active"` / `"expired"` / `"cancelled"` |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**索引**: `_openid` + `templateId` (唯一复合)

---

## 云函数 API 设计

每个云函数采用内部路由模式：调用时传 `action` 参数，`index.js` 中 `switch(action)` 分发到对应处理器。每个域（用户、计划、打卡等）只部署一个云函数，减少冷启动次数。

### `user` — 用户管理

```
Action              参数                          返回
------              ------                        ------
login               {}                            { user, isNew }
updateProfile       { nickName, avatarUrl }       { updated }
updateBodyStats     { height, weight }            { updated }
updateSettings      { settings }                  { updated }
updateActivePlan    { planId }                    { updated }
getProfile          {}                            { user }
```

**login 逻辑**: 从 `cloud.getWXContext()` 获取 `OPENID`，查 `users` 集合。不存在则创建新文档（默认设置 + 空统计），返回完整 user 对象。`app.js onLaunch` 调用一次并缓存。

**updateActivePlan 逻辑**: 将 `users.activePlanId` 设为新值，首页 `getTodayPlan` 据此决定展示哪个计划。

---

### `plan` — 训练计划

```
Action              参数                          返回
------              ------                        ------
getTemplates        { page, pageSize, tags? }     { plans[], total }
getMyPlans          { page, pageSize }            { plans[], total }
getPlanById         { planId }                    { plan (含完整的动作详情) }
createPlan          { name, description, ... }    { planId }
updatePlan          { planId, updates }           { updated }
deletePlan          { planId }                    { deleted }
copyFromTemplate    { templateId }                { newPlanId }
reorderExercises    { planId, dayIndex, ... }     { updated }
```

**getPlanById**: 通过 `exercises[].exerciseId` 关联查询 `exercises` 集合，填充动作名、肌群等完整信息后再返回。

**copyFromTemplate**:
1. 校验模板存在且 `type === "template"` 且 `isPublished === true`
2. 在 `training_plans` 中插入新文档：`_openid` 设为当前用户，`type: "user"`，`sourcePlanId` 设为模板 ID
3. 原子更新模板的 `copyCount += 1`
4. 返回新计划 ID

---

### `checkin` — 打卡核心

```
Action              参数                          返回
------              ------                        ------
getTodayPlan        {}                            { plan, exercises[], existingCheckin? }
createCheckin       { checkinData }               { checkinId, stats }
updateCheckin       { checkinId, checkinData }    { updated }
getByDate           { date }                      { checkin }
getByRange          { startDate, endDate }        { checkins[] }
getRecent           { limit }                     { checkins[] }
```

**getTodayPlan**:
1. 读取 `users.activePlanId`，若无则返回空（前端展示"请选择训练计划"）
2. 读取计划，计算 `dayIndex = (today - planStartDate) % (durationWeeks * 7)`
3. 过滤 `plan.exercises` 中 `dayIndex` 匹配的动作
4. 查今日是否已有打卡记录（支持"继续编辑"场景）
5. 返回今日动作列表 + 已有打卡数据

**createCheckin**:
1. 校验 `date` 为今天 (MVP 阶段不允许补卡)
2. 唯一复合索引 `_openid + date` 防止重复打卡
3. 计算 `completionRate = 已完成动作数 / 总动作数`
4. 计算 `totalDuration` (各动作时长之和)
5. 插入 `checkins` 文档
6. 更新 `users.stats`：`totalCheckins += 1`，重新计算 `currentStreak` 和 `longestStreak`，更新 `lastCheckinDate`，累加 `totalMinutes`
7. 返回最新 stats 供前端展示庆祝动画

---

### `statistics` — 聚合统计

```
Action              参数                          返回
------              ------                        ------
getDashboard        {}                            { streak, totalCheckins, totalMinutes, weeklyRate, monthlyRate }
getWeeklySummary    { weekStart? }                { days[7] }
getMonthlySummary   { year, month }               { days[], totalWorkouts, avgCompletionRate }
getCalendarData     { year }                      { dates[]{date, level} }
getExerciseStats    { exerciseId }                { volumeByWeek[], maxWeight[], frequency }
getBodyStatsTrend   {}                            { entries[]{date, weight, height} }
```

**getDashboard**: 读 `users.stats` 获取缓存值 + 实时查询当周/当月 checkins 计算完成率 + 实时重算 streak 确保准确

**getCalendarData**: 查询指定年份所有 checkins → 映射每条为 `{ date, level }` (level 根据 completionRate 分 0-4 档)

**streak 计算逻辑**:
```javascript
// 按日期降序获取所有打卡记录
// current streak: 从今天往回数连续天数
// longest streak: 扫描全部历史找最长连续段
function calculateStreak(checkins) {
  // today → 往前推，日期连续则 +1，遇断则止
  // 扫描所有记录取最大连续段
}
```

---

### `notification` — 通知提醒

```
Action                 参数                          返回
------                 ------                        ------
sendReminder           {} (定时触发器调用)             { sent, failed }
subscribe              { templateId, accept }         { ok }
getSubscriptionStatus  {}                             { subscribed, templateId }
```

**sendReminder (定时触发)**:
1. 云定时触发器在 7:00 / 12:00 / 20:00 各触发一次
2. 查询所有 `settings.reminderEnabled === true` 且当天星期在 `settings.weekDays` 内的用户
3. 过滤掉今日已有打卡的用户
4. 对剩余用户查 `subscriptions` 获取有效订阅
5. 调用 `cloud.openapi.subscribeMessage.send()` 发送模板消息
6. 发送失败（如订阅过期）时标记 `subscriptions.status = "expired"`

**定时触发器配置** (`config.json`):
```json
{
  "triggers": [
    { "name": "morning_reminder", "type": "timer", "config": "0 0 7 * * * *" },
    { "name": "noon_reminder",    "type": "timer", "config": "0 0 12 * * * *" },
    { "name": "evening_reminder", "type": "timer", "config": "0 0 20 * * * *" }
  ]
}
```

> 注: 云开发定时器使用 7 段 cron。用户具体提醒时间由函数内过滤实现，不在定时器层面区分。

**订阅流程** (前端):
1. 用户开启"训练提醒"开关
2. 调用 `wx.requestSubscribeMessage({ tmplIds: [...] })` 弹出微信授权
3. 用户同意后 → 调 `notification.subscribe` 保存订阅记录
4. 调 `user.updateSettings` 保存提醒偏好

> 注: 微信订阅消息为一次性，用户需在每次授权弹窗中勾选"总是保持"才能长期接收。

---

### `exercise` — 动作库

```
Action              参数                          返回
------              ------                        ------
list                { category?, muscleGroup?,    { exercises[], total }
                     keyword?, page, pageSize }
getById             { exerciseId }                { exercise }
getCategories       {}                            { categories[], muscleGroups[] }
```

---

## 页面设计

### Tab 1: `pages/index/index` — 今日训练首页

**数据状态**: `{ user, todayPlan, todayCheckin, streak, isLoading }`

**三种空状态**:
1. 无活跃计划 → 插图 + "选择训练计划" 按钮，跳转 `/pages/plan-list/plan-list`
2. 今日已完成打卡 → "✅ 今日已完成" + 训练摘要卡片 + 撒花动画
3. 加载失败 → 错误提示 + 重试按钮

**页面布局**:
```
┌──────────────────────────────┐
│  今日训练                     │
├──────────────────────────────┤
│  ┌──────────────────────────┐│
│  │ 🔥 连续打卡 15 天         ││  ← streak-badge 组件
│  │ 本月完成率: 83%           ││
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │ 📋 新手增肌A计划           ││
│  │ 第2周 · Day 3 (腿部日)    ││
│  └──────────────────────────┘│
│                              │
│  今日训练                     │
│  ┌──────────────────────────┐│
│  │ ✅ 杠铃深蹲   4×12  60s  ││  ← exercise-card 组件
│  │ ✅ 腿举       3×15  45s  ││
│  │ ⬜ 腿弯举     3×12  45s  ││
│  └──────────────────────────┘│
│                              │
│  [ 开始打卡 ] 或 [ 继续打卡 ] │
└──────────────────────────────┘
```

**打卡按钮逻辑**:
- 无打卡 → "开始打卡" → `wx.navigateTo('/pages/checkin-form/checkin-form')`
- 有未完成打卡 → "继续打卡" → 同上
- 已完成 → 隐藏按钮

---

### Tab 2: `pages/calendar/calendar` — 日历

**数据状态**: `{ currentYear, currentMonth, calendarDays, heatmapData, selectedDay }`

**布局**:
```
┌──────────────────────────────┐
│  日历                         │
├──────────────────────────────┤
│  ◀ 2026年 5月 ▶              │
│                              │
│  一  二  三  四  五  六  日   │
│             1   2  [3]  4    │
│   5   6   7   8   9  10  11  │
│  ...                         │
│                              │
│  5月3日: 新手增肌A · 腿部     │
│  完成率 100% · 45分钟         │
│                              │
├──────────────────────────────┤
│  年度训练热力图 (2026)        │
│  ┌──────────────────────────┐│
│  │ 1月 ...         ... 12月 ││
│  │ ░░▒▒▓▓█ ░░░░ ▒▒▓█       ││  ← heatmap 组件
│  └──────────────────────────┘│
│  □ 0%  □ 25%  □ 50%  □ 75%  │
└──────────────────────────────┘
```

**热力图颜色梯度**:
- Level 0 (`#ebedf0`): 无打卡
- Level 1 (`#9be9a8`): 0-25%
- Level 2 (`#40c463`): 25-50%
- Level 3 (`#30a14e`): 50-75%
- Level 4 (`#216e39`): 75-100%

---

### Tab 3: `pages/stats/stats` — 统计

**数据状态**: `{ dashboard, weeklySummary, monthlySummary, activeTab }`

**三个 Tab**: "本周" / "本月" / "累计"

**布局 (累计)**:
```
┌──────────────────────────────┐
│  统计                         │
├──────────────────────────────┤
│  [本周] [本月] [累计]         │
├──────────────────────────────┤
│  ┌──────┐ ┌──────┐           │
│  │ 🔥15 │ │ 🏆30 │           │  ← stat-ring 组件
│  │ 连续 │ │ 最长 │           │
│  └──────┘ └──────┘           │
│  ┌──────┐ ┌──────┐           │
│  │📊128 │ │⏱5120│           │
│  │总打卡│ │总时长│           │
│  └──────┘ └──────┘           │
│                              │
│  每周完成率                   │
│  [83%] [75%] [90%] [67%]    │
│                              │
│  体重变化 (Canvas 折线图)     │
│  75kg ───╲                   │
│          ╲──────             │
│  72kg           ─── 72.5kg  │
│                              │
│  最常训练肌群 (Canvas 柱状图) │
│  腿部  ████████████ 45次     │
│  胸部  ██████████   38次     │
│  背部  ████████     32次     │
│  核心  ██████       24次     │
└──────────────────────────────┘
```

**图表实现**: 仅用 Canvas 2D API (`wx.createCanvasContext`) 手绘 —— 柱状图 = 矩形填充、折线图 = 线段连接、环形图 = 圆弧描边。

---

### Tab 4: `pages/profile/profile` — 个人中心

**数据状态**: `{ user, settings }`

**布局**:
```
┌──────────────────────────────┐
│  我的                         │
├──────────────────────────────┤
│  ┌──────────────────────────┐│
│  │ [头像] 昵称              ││
│  │        编辑资料  >        ││
│  └──────────────────────────┘│
│                              │
│  身体数据                     │
│  身高: 175cm       [编辑]    │
│  体重: 72.5kg      [编辑]    │
│  目标: 70.0kg      [编辑]    │
│                              │
│  我的训练计划                 │
│  新手增肌A (进行中)  >       │
│  查看全部计划  >              │
│                              │
│  提醒设置                     │
│  训练提醒      [switch]      │
│  提醒时间      20:00          │
│  重复日        周一至周五      │
│                              │
│  其他                         │
│  关于 / 清除缓存              │
└──────────────────────────────┘
```

**提醒开通流程**:
1. 用户拨动 switch → `wx.requestSubscribeMessage({ tmplIds })`
2. 用户同意 → `notification.subscribe` + `user.updateSettings`
3. 用户拒绝 → switch 回弹，toast 提示"需要授权才能发送提醒"

---

### 子页面: `pages/plan-list/plan-list` — 训练计划列表

**两个 Tab**: "推荐模板" / "我的计划"

**模板 Tab**: 调用 `plan.getTemplates`，展示 8 个系统预设模板的计划卡片
**我的计划 Tab**: 调用 `plan.getMyPlans`，每项有"设为当前"按钮

**plan-card 组件** 展示: 名称、周数、难度、目标类型、标签、使用人数

---

### 子页面: `pages/plan-detail/plan-detail` — 计划详情/编辑

**模式**: `view` (查看) / `edit` (编辑)

**view 模式**: 展示计划概述 + 按天分组展示动作列表，每个动作显示组数×次数+休息时间
**edit 模式**: 支持修改每组 sets/reps/restSeconds，支持增删动作，调整 dayIndex 编排

**模板计划**: 有"复制此计划"和"开始此计划"按钮
**用户计划**: 有"编辑"/"删除"/"设为当前"按钮

---

### 子页面: `pages/checkin-form/checkin-form` — 打卡表单 (核心交互)

**展开/折叠式动作列表**:
```
┌──────────────────────────────┐
│  今日打卡                     │
├──────────────────────────────┤
│  ┌─ 1. 杠铃深蹲 ──────────┐  │
│  │ 目标: 4组 × 12次       │  │
│  │ [✓] 已完成             │  │
│  │ 完成组数: [4]          │  │
│  │ 每组次数: [12][10][10][8]│  │
│  │ 每组重量: [60][60][65][65] kg│
│  │ [⏱ 60s] [📝 备注]     │  │
│  └────────────────────────┘  │
│                              │
│  ┌─ 2. 腿举 ──────────────┐  │
│  │ 目标: 3组 × 15次       │  │
│  │ [ ] 已完成 (折叠状态)   │  │
│  └────────────────────────┘  │
│                              │
│  今日感受: 😊 😐 😕  ← 表情选择器
│  备注: [___________]         │
│  照片: [+添加进度照]         │
│                              │
│  [ 完成打卡 ]                │
└──────────────────────────────┘
```

**提交流程**:
1. 前端校验 (至少完成一个动作)
2. `wx.showLoading()`
3. 调用 `checkin.createCheckin`
4. 云函数: 插入打卡文档 → 更新 stats → 返回新 streak
5. 成功后: 庆祝动画 + "连续打卡15天!" Toast + 1.5s 后 `wx.navigateBack()`

---

### 子页面: `pages/exercise-detail/exercise-detail` — 动作详情

- 完整动作信息: 描述、分步说明、常见错误、演示图
- 个人历史: 调用 `statistics.getExerciseStats` 展示该动作的重量递进、总训练量趋势

### 子页面: `pages/history/history` — 打卡历史

- 按周分组的无限滚动列表 (如 "5月12日 - 5月18日")
- 每项: 日期、计划名、完成率徽章、时长
- 点击跳转查看当日打卡详情 (只读模式)

---

## 组件设计

### `components/heatmap/` — 年度热力图

**输入属性**: `year` (Number), `data` (Array<{date, level}>)

**实现要点**:
- 7 行 (周日~周六) × 最多 53 列 (周)
- 找到 1月1日前最近的周日作为起始日期
- 每个格子 14×14 rpx，圆角 2 rpx，间隔 2 rpx
- 点击/长按发射 `select` 事件
- 底部图例: 少 □□□□□ 多

### `components/exercise-card/` — 动作卡片

**输入属性**: `exercise` (Object), `checked` (Boolean), `collapsed` (Boolean)

展示: 动作名、肌群标签、目标组数×次数、完成状态复选框

### `components/plan-card/` — 计划摘要卡

**输入属性**: `plan` (Object), `showActions` (Boolean)

展示: 名称、周数、难度标签、目标类型标签、标签 chips、使用人数

### `components/streak-badge/` — 连续打卡徽章

**输入属性**: `streak` (Number), `longestStreak` (Number)

展示: 火焰 emoji + 天数，有动画效果

### `components/stat-ring/` — 完成率环形图

**输入属性**: `percent` (Number 0-100), `label` (String), `color` (String)

**实现**: Canvas 绘制圆弧 —— `ctx.arc()` 底环 (灰色) + `ctx.arc()` 进度弧 (主题色)，中心显示百分比文字

### `components/nav-bar/` — 自定义导航栏

**输入属性**: `title` (String), `showBack` (Boolean)

处理: 状态栏高度适配 (`wx.getSystemInfoSync().statusBarHeight`)

---

## 种子数据

### 动作库 (40-50 个)

按肌群分类覆盖:
- **胸部**: 杠铃卧推、哑铃卧推、上斜哑铃卧推、绳索飞鸟、俯卧撑、钻石俯卧撑
- **背部**: 引体向上、杠铃划船、哑铃划船、高位下拉、坐姿绳索划船、硬拉
- **腿部**: 杠铃深蹲、哑铃深蹲、腿举、腿弯举、腿屈伸、罗马尼亚硬拉、保加利亚分腿蹲、臀桥
- **肩部**: 哑铃推举、侧平举、前平举、俯身飞鸟、阿诺德推举
- **手臂**: 杠铃弯举、哑铃弯举、锤式弯举、碎颅者、绳索下压、窄距卧推
- **核心**: 平板支撑、卷腹、仰卧举腿、俄罗斯转体、悬吊举腿
- **有氧/全身**: 波比跳、开合跳、高抬腿、登山者、跳绳

每个动作含: 中文名、英文名、类别、肌群、器械、难度、描述、步骤(3-5步)、常见错误(2-3条)

### 训练计划模板 (8 套)

1. **新手全身激活** — 2周 / 每周3练 / 自重 / 初级
2. **新手增肌A** — 4周 / 每周4练 / 哑铃+自重 / 初级 (胸三头→背二头→休息→腿肩→休息→休息)
3. **家庭无器械训练** — 4周 / 每周3练 / 纯自重 / 初级
4. **5×5 力量训练** — 6周 / 每周3练 / 杠铃 / 中级
5. **HIIT 燃脂计划** — 3周 / 每周4练 / 自重 / 中级
6. **瑜伽柔韧入门** — 4周 / 每周5练 / 无器械 / 初级
7. **核心雕刻计划** — 4周 / 每周3练 / 自重+弹力带 / 初级
8. **哑铃上肢强化** — 4周 / 每周4练 / 哑铃 / 中级

每套计划: 按天编排动作，每天 4-6 个动作，含组数、次数、休息时间

---

## 核心架构决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 云函数组织 | 6个域路由函数 | 减少冷启动 (比每个 action 独立函数好) |
| 用户统计 | `users.stats` 反范式 | 首页 O(1) 读取，定期重算校准 |
| 日期存储 | 字符串 `"YYYY-MM-DD"` | 无时区陷阱，词典序 = 日期序 |
| 计划-动作关联 | 引用 ID (非嵌入) | 动作库更新不污染已有计划 |
| 重复打卡防护 | 唯一复合索引 | 数据库层面保证，消除竞态 |
| 图表绘制 | Canvas 2D 手绘 | 零第三方依赖 |
| 消息触达 | 定时器 × 3 + 用户过滤 | 云开发不支持单用户定时器，此为最佳折中 |

---

## 分阶段实施计划

### Phase 0: 项目脚手架

| 步骤 | 产出文件 |
|------|----------|
| 0.1 | `project.config.json` — 配置 appid、cloudfunctionRoot、miniprogramRoot |
| 0.2 | `miniprogram/app.json` — 注册所有页面、配置 tabBar、window |
| 0.3 | `miniprogram/app.js` — `wx.cloud.init()`、globalData、onLaunch |
| 0.4 | `miniprogram/app.wxss` — CSS 变量、reset 样式、主题色 |
| 0.5 | `miniprogram/env.js` — 云环境 ID |
| 0.6 | `miniprogram/utils/cloud.js` — init 封装 + callFunction 快捷方法 |
| 0.7 | `miniprogram/utils/date.js` — formatDate、getWeekRange、isConsecutiveDay |
| 0.8 | `miniprogram/utils/constants.js` — 肌群/类别/难度 中英文映射 |
| 0.9 | `miniprogram/utils/request.js` — 统一 callFunction + error handling + loading |
| 0.10 | `miniprogram/utils/storage.js` — get/set with TTL |
| 0.11 | `miniprogram/styles/common.wxss` — 通用工具类、间距、栅格 |

**验证**: 微信开发者工具打开项目，编译成功，底部 Tab Bar 显示 4 个入口

---

### Phase 1: 用户 + 云基础设施

| 步骤 | 产出 |
|------|------|
| 1.1 | `cloudfunctions/user/index.js` — 实现 login action |
| 1.2 | `cloudfunctions/user/` 补充 — updateProfile, updateBodyStats, updateSettings, getProfile, updateActivePlan |
| 1.3 | `cloudfunctions/user/package.json` + `config.json` |
| 1.4 | 部署 user 云函数到云开发环境 |
| 1.5 | `database/init.js` — 创建 5 个集合 + 对应索引 |
| 1.6 | 执行数据库初始化 (通过云函数或 DevTools 手动运行) |
| 1.7 | `pages/profile/profile.*` — 展示用户信息 + 身体数据编辑 + 设置表单 UI |
| 1.8 | `app.js` onLaunch — 调 user.login，缓存用户数据到 globalData |

**验证**: 用户打开小程序 → 自动登录成功 → Profile 页显示头像昵称 → 可编辑身体数据并保存

---

### Phase 2: 动作库

| 步骤 | 产出 |
|------|------|
| 2.1 | `cloudfunctions/exercise/index.js` — list (分页+筛选), getById, getCategories |
| 2.2 | `cloudfunctions/exercise/package.json` + `config.json` |
| 2.3 | `database/seed-exercises.json` — 40-50 个动作完整数据 |
| 2.4 | `database/init.js` 扩展 — 上传种子动作的脚本 |
| 2.5 | `components/exercise-card/*` — 动作展示卡片组件 |
| 2.6 | `pages/exercise-detail/*` — 动作详情页 (描述/步骤/贴士) |

**验证**: 动作列表可筛选、动作卡片正常渲染、详情页展示完整

---

### Phase 3: 训练计划

| 步骤 | 产出 |
|------|------|
| 3.1 | `cloudfunctions/plan/index.js` — getTemplates, getMyPlans, getPlanById |
| 3.2 | `database/seed-plans.json` — 8 套模板 (引用种子动作 ID) |
| 3.3 | `database/init.js` 扩展 — 上传种子计划 |
| 3.4 | `cloudfunctions/plan/` 补充 — createPlan, updatePlan, deletePlan, copyFromTemplate, reorderExercises |
| 3.5 | `components/plan-card/*` — 计划摘要卡片组件 |
| 3.6 | `pages/plan-list/*` — 模板/我的 双 Tab 列表页 |
| 3.7 | `pages/plan-detail/*` — 计划详情页 (view 模式) |
| 3.8 | `pages/plan-detail/*` — 编辑模式 (修改 sets/reps、增删动作) |
| 3.9 | `pages/profile/*` 补充 — 显示活跃计划、跳转我的计划列表 |

**验证**: 可浏览 8 套模板 → 复制模板 → 编辑副本 → 设为活跃计划 → 删除计划

---

### Phase 4: 打卡核心

| 步骤 | 产出 |
|------|------|
| 4.1 | `cloudfunctions/checkin/index.js` — getTodayPlan, createCheckin, getByDate |
| 4.2 | `cloudfunctions/checkin/` 补充 — updateCheckin, getByRange, getRecent |
| 4.3 | `components/streak-badge/*` — 连续打卡徽章组件 |
| 4.4 | `pages/index/*` — 今日训练首页 + 空状态 (无计划/已完成/错误) |
| 4.5 | `pages/checkin-form/*` — 打卡表单 (动作列表+组数次数组详情+计时器+心情+照片) |
| 4.6 | `pages/history/*` — 历史打卡列表 + 无限滚动 |
| 4.7 | 端到端串联: 选计划 → 首页加载 → 打卡 → 提交 → streak 更新 → 历史可见 |
| 4.8 | 打卡成功庆祝动画 (CSS 动画 / confetti) |

**验证**: 完整打卡流程可跑通，streak 正确累加，历史记录可回溯

---

### Phase 5: 日历 + 热力图

| 步骤 | 产出 |
|------|------|
| 5.1 | `components/heatmap/*` — 7行×53列网格、月份标签、颜色分级、点击事件 |
| 5.2 | `cloudfunctions/statistics/index.js` — getCalendarData, getDashboard |
| 5.3 | `pages/calendar/*` — 月份日历网格 + 选中日期摘要 + 年度热力图 |
| 5.4 | 热力图点击 → 跳转当日打卡详情 (只读 checkin-form) |

**验证**: 日历正确显示月份格子、热力图正确渲染年度数据、点击可查看某天详情

---

### Phase 6: 统计

| 步骤 | 产出 |
|------|------|
| 6.1 | `cloudfunctions/statistics/` 补充 — getWeeklySummary, getMonthlySummary, getExerciseStats, getBodyStatsTrend |
| 6.2 | `components/stat-ring/*` — Canvas 环形进度图 |
| 6.3 | `pages/stats/*` — 三 Tab (本周/本月/累计) + 数值卡片 + 图表区 |
| 6.4 | Canvas 柱状图 — 肌群训练频率 |
| 6.5 | Canvas 折线图 — 体重变化趋势 |
| 6.6 | streak 火焰动画 + 最长 streak 展示 |

**验证**: 统计数据准确、图表正确渲染、切换周/月/累计 Tab 正常

---

### Phase 7: 通知提醒

| 步骤 | 产出 |
|------|------|
| 7.1 | `cloudfunctions/notification/index.js` — subscribe, getSubscriptionStatus, sendReminder |
| 7.2 | `config.json` — 配置 3 个云定时触发器 |
| 7.3 | `pages/profile/*` 补充 — 提醒开关对接 `wx.requestSubscribeMessage` |
| 7.4 | 提醒时间选择器 + 重复日选择器 UI |
| 7.5 | 端到端测试: 开启提醒 → 定时器触发 → 收到服务通知 |

**验证**: 用户可订阅、定时器正常触发、消息成功送达

---

### Phase 8: 打磨上线

| 步骤 | 产出 |
|------|------|
| 8.1 | 骨架屏 — 所有列表页加载时展示 shimmer 动画 |
| 8.2 | 空状态插图 — 无计划、无打卡、无统计数据 三种场景 |
| 8.3 | 错误状态 + 重试按钮 — 所有云函数调用失败时展示 |
| 8.4 | 下拉刷新 — 所有列表页 `onPullDownRefresh` |
| 8.5 | 页面过渡动画 — `app.json` 中 `"style": "v2"` |
| 8.6 | 离线缓存 — request.js 封装: 云函数失败时读本地 storage 兜底 |
| 8.7 | 数据分页 — 确保所有 list 查询使用 cursor 或 page 分页 |
| 8.8 | 真机测试 — iOS + Android 渲染一致性、交互流畅度 |
| 8.9 | 隐私政策页 — 微信审核必需 (`pages/privacy/privacy`) |
| 8.10 | 云函数冷启动优化 — 减少依赖、合理设置内存 |

---

## 关键代码片段

### 云函数路由模式模板

每个云函数的 `index.js` 遵循统一模式:

```javascript
// cloudfunctions/xxx/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  switch (action) {
    case 'actionA': return handleActionA(event, OPENID);
    case 'actionB': return handleActionB(event, OPENID);
    default: return { code: -1, msg: `Unknown action: ${action}` };
  }
};

async function handleActionA(event, openid) { /* ... */ }
async function handleActionB(event, openid) { /* ... */ }
```

### 前端云函数调用封装

```javascript
// miniprogram/utils/request.js
async function callFn(name, data = {}, options = {}) {
  const { showLoading = true, loadingText = '加载中...' } = options;
  if (showLoading) wx.showLoading({ title: loadingText, mask: true });
  try {
    const res = await wx.cloud.callFunction({ name, data });
    if (res.result && res.result.code === -1) {
      throw new Error(res.result.msg);
    }
    return res.result;
  } catch (err) {
    wx.showToast({ title: err.message || '网络错误', icon: 'none' });
    throw err;
  } finally {
    if (showLoading) wx.hideLoading();
  }
}
```

---

## 待确认事项

1. **云环境 ID**: 需在微信云开发控制台创建环境后填入 `env.js`
2. **订阅消息模板 ID**: 需在微信公众平台申请或从公共模板库选用
3. **AppID**: 需在 `project.config.json` 中填入真实 AppID
4. **Tab 图标**: 需准备 8 张图标 (4个常态 + 4个选中态) 放入 `miniprogram/images/`

---

*最后更新: 2026-05-20*
