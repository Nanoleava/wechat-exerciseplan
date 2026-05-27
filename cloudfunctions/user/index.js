const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  switch (action) {
    case 'login':            return login(OPENID);
    case 'getProfile':       return getProfile(OPENID);
    case 'updateProfile':    return updateProfile(OPENID, event);
    case 'updateBodyStats':  return updateBodyStats(OPENID, event);
    case 'updateSettings':   return updateSettings(OPENID, event);
    case 'updateActivePlan': return updateActivePlan(OPENID, event);
    default: return { code: -1, msg: `Unknown action: ${action}` };
  }
};

async function login(openid) {
  const usersCol = db.collection('users');
  const { data } = await usersCol.where({ _openid: openid }).get();

  if (data.length > 0) {
    return { user: data[0], isNew: false };
  }

  const newUser = {
    _openid: openid,
    nickName: '',
    avatarUrl: '',
    gender: 0,
    bodyStats: { height: null, weight: null, targetWeight: null, updatedAt: new Date() },
    bodyStatsLog: [],
    settings: {
      reminderEnabled: false,
      reminderTime: '20:00',
      weekDays: [1, 2, 3, 4, 5]
    },
    activePlanId: '',
    stats: {
      totalCheckins: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalMinutes: 0,
      lastCheckinDate: ''
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const res = await usersCol.add({ data: newUser });
  return { user: { ...newUser, _id: res._id }, isNew: true };
}

async function getProfile(openid) {
  const { data } = await db.collection('users').where({ _openid: openid }).get();
  if (data.length === 0) return { code: -1, msg: '用户不存在' };
  return { user: data[0] };
}

async function updateProfile(openid, event) {
  const { nickName, avatarUrl } = event;
  await db.collection('users').where({ _openid: openid }).update({
    data: { nickName, avatarUrl, updatedAt: new Date() }
  });
  return { updated: true };
}

async function updateBodyStats(openid, event) {
  const { height, weight, targetWeight } = event;
  const now = new Date();
  const today = formatDate(now);

  const user = await db.collection('users').where({ _openid: openid }).get();
  if (user.data.length === 0) return { code: -1, msg: '用户不存在' };

  const bodyStats = { ...user.data[0].bodyStats, updatedAt: now };
  if (height !== undefined) bodyStats.height = height;
  if (weight !== undefined) bodyStats.weight = weight;
  if (targetWeight !== undefined) bodyStats.targetWeight = targetWeight;

  const updateData = { bodyStats, updatedAt: now };

  if (weight !== undefined || height !== undefined) {
    updateData.bodyStatsLog = db.command.push({
      date: today,
      weight: weight !== undefined ? weight : bodyStats.weight,
      height: height !== undefined ? height : bodyStats.height
    });
  }

  await db.collection('users').where({ _openid: openid }).update({ data: updateData });
  return { updated: true };
}

async function updateSettings(openid, event) {
  const { settings } = event;
  await db.collection('users').where({ _openid: openid }).update({
    data: { settings, updatedAt: new Date() }
  });
  return { updated: true };
}

async function updateActivePlan(openid, event) {
  const { planId } = event;
  await db.collection('users').where({ _openid: openid }).update({
    data: { activePlanId: planId, updatedAt: new Date() }
  });
  return { updated: true };
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
