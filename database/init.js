/**
 * 数据库初始化脚本
 * 在云开发控制台或通过云函数运行此脚本以创建集合和索引
 *
 * 使用方法:
 * 1. 将此文件上传到云开发 CloudBase 控制台的"数据库" > "脚本管理"
 * 2. 或创建临时云函数调用此脚本
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const COLLECTIONS = [
  {
    name: 'users',
    indexes: [
      { keys: { _openid: 1 }, unique: true },
      { keys: { 'stats.lastCheckinDate': -1 } }
    ]
  },
  {
    name: 'exercises',
    indexes: [
      { keys: { category: 1, muscleGroup: 1 } },
      { keys: { name: 1 } }
    ]
  },
  {
    name: 'training_plans',
    indexes: [
      { keys: { _openid: 1, type: 1 } },
      { keys: { type: 1, isPublished: 1 } },
      { keys: { tags: 1 } }
    ]
  },
  {
    name: 'checkins',
    indexes: [
      { keys: { _openid: 1, date: 1 }, unique: true },
      { keys: { date: 1 } },
      { keys: { planId: 1 } }
    ]
  },
  {
    name: 'subscriptions',
    indexes: [
      { keys: { _openid: 1, templateId: 1 }, unique: true }
    ]
  }
];

async function main() {
  for (const col of COLLECTIONS) {
    try {
      await db.createCollection(col.name);
      console.log(`✓ 集合 ${col.name} 创建成功`);
    } catch (err) {
      if (err.errCode === -502005) {
        console.log(`- 集合 ${col.name} 已存在，跳过创建`);
      } else {
        console.error(`✗ 集合 ${col.name} 创建失败:`, err);
        continue;
      }
    }

    for (const idx of col.indexes) {
      try {
        await db.collection(col.name).createIndex({
          keys: idx.keys,
          unique: idx.unique || false
        });
        console.log(`  ✓ 索引 ${JSON.stringify(idx.keys)} 创建成功`);
      } catch (err) {
        if (err.errCode === -502005) {
          console.log(`  - 索引 ${JSON.stringify(idx.keys)} 已存在`);
        } else {
          console.error(`  ✗ 索引创建失败:`, err);
        }
      }
    }
  }

  console.log('\n数据库初始化完成!');
  return { ok: true };
}

// 云函数调用入口
exports.main = main;

// 支持直接运行
if (require.main === module) {
  main().then(console.log).catch(console.error);
}
