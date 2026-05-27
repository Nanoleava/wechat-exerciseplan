const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  switch (action) {
    case 'subscribe':             return subscribe(OPENID, event);
    case 'getSubscriptionStatus': return getSubscriptionStatus(OPENID);
    case 'sendReminder':          return sendReminder();
    default: return { code: -1, msg: `Unknown action: ${action}` };
  }
};

async function subscribe(openid, event) {
  const { templateId, accept } = event;

  const { data: existing } = await db.collection('subscriptions')
    .where({ _openid: openid, templateId })
    .get();

  if (existing.length > 0) {
    await db.collection('subscriptions').doc(existing[0]._id).update({
      data: { status: accept ? 'active' : 'cancelled', updatedAt: new Date() }
    });
  } else {
    await db.collection('subscriptions').add({
      data: {
        _openid: openid,
        templateId,
        status: accept ? 'active' : 'cancelled',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  return { ok: true };
}

async function getSubscriptionStatus(openid) {
  const { data } = await db.collection('subscriptions')
    .where({ _openid: openid, status: 'active' })
    .get();

  return {
    subscribed: data.length > 0,
    templates: data.map(d => d.templateId)
  };
}

async function sendReminder() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const dayOfWeek = today.getDay();

  // 查所有开启提醒的用户
  const { data: users } = await db.collection('users')
    .where({ 'settings.reminderEnabled': true })
    .get();

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    // 检查是否在重复日范围内
    const weekDays = user.settings.weekDays || [1, 2, 3, 4, 5];
    if (!weekDays.includes(dayOfWeek)) continue;

    // 检查今日是否已打卡
    const { data: todayCheckins } = await db.collection('checkins')
      .where({ _openid: user._openid, date: todayStr })
      .get();

    if (todayCheckins.length > 0) continue;

    // 查有效订阅
    const { data: subs } = await db.collection('subscriptions')
      .where({ _openid: user._openid, status: 'active' })
      .get();

    if (subs.length === 0) continue;

    // 发送订阅消息
    for (const sub of subs) {
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: user._openid,
          templateId: sub.templateId,
          data: {
            thing1: { value: '今日训练' },
            time2: { value: user.settings.reminderTime || '20:00' },
            thing3: { value: '别忘了今天的训练打卡哦！' }
          }
        });
        sent++;
      } catch (err) {
        failed++;
        // 如果模板已失效
        if (err.errCode === 43101) {
          await db.collection('subscriptions').doc(sub._id).update({
            data: { status: 'expired', updatedAt: new Date() }
          });
        }
      }
    }
  }

  return { sent, failed };
}
