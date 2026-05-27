const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  switch (action) {
    case 'getTodayPlan':    return getTodayPlan(OPENID);
    case 'createCheckin':   return createCheckin(OPENID, event);
    case 'updateCheckin':   return updateCheckin(OPENID, event);
    case 'getByDate':       return getByDate(OPENID, event);
    case 'getByRange':      return getByRange(OPENID, event);
    case 'getRecent':       return getRecent(OPENID, event);
    default: return { code: -1, msg: `Unknown action: ${action}` };
  }
};

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function getTodayPlan(openid) {
  const { data: users } = await db.collection('users').where({ _openid: openid }).get();
  if (users.length === 0 || !users[0].activePlanId) {
    return { plan: null, exercises: [], message: '请先选择训练计划' };
  }

  const user = users[0];
  const { data: plans } = await db.collection('training_plans').doc(user.activePlanId).get();
  if (!plans) return { plan: null, exercises: [], message: '训练计划不存在' };

  const plan = plans;

  // 计算 dayIndex
  const planStartDate = new Date(plan.createdAt);
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - planStartDate.getTime()) / 86400000);
  const totalDays = plan.durationWeeks * 7;
  const dayIndex = daysSinceStart >= 0 ? daysSinceStart % totalDays : 0;

  const todayExercises = (plan.exercises || []).filter(e => e.dayIndex === dayIndex);
  const exerciseIds = todayExercises.map(e => e.exerciseId);

  // 查询动作详情
  let exercisesWithDetail = todayExercises;
  if (exerciseIds.length > 0) {
    const { data: exData } = await db.collection('exercises')
      .where({ _id: db.command.in(exerciseIds) })
      .get();

    const exMap = {};
    exData.forEach(e => { exMap[e._id] = e; });

    exercisesWithDetail = todayExercises.map(item => ({
      ...item,
      exerciseName: exMap[item.exerciseId] ? exMap[item.exerciseId].name : '未知动作',
      muscleGroup: exMap[item.exerciseId] ? exMap[item.exerciseId].muscleGroup : '',
      equipment: exMap[item.exerciseId] ? exMap[item.exerciseId].equipment : '',
      setsCompleted: item.sets,
      repsPerSet: new Array(item.sets || 0).fill(parseInt(item.reps) || 0),
      weightPerSet: new Array(item.sets || 0).fill(0),
      completed: false
    }));
  }

  // 查今日已有打卡
  const todayDate = todayStr();
  const { data: existing } = await db.collection('checkins')
    .where({ _openid: openid, date: todayDate })
    .get();

  const existingCheckin = existing.length > 0 ? existing[0] : null;

  return {
    plan: {
      _id: plan._id,
      name: plan.name,
      week: Math.floor(daysSinceStart / 7) + 1,
      day: dayIndex + 1,
      durationWeeks: plan.durationWeeks
    },
    exercises: exercisesWithDetail,
    existingCheckin
  };
}

async function createCheckin(openid, event) {
  const { checkinData } = event;
  const todayDate = checkinData.date || todayStr();

  // MVP: 不允许补卡
  if (todayDate !== todayStr()) {
    return { code: -1, msg: '仅支持当日打卡' };
  }

  // 查重
  const { data: existing } = await db.collection('checkins')
    .where({ _openid: openid, date: todayDate })
    .get();

  if (existing.length > 0) {
    return { code: -1, msg: '今日已打卡，请勿重复提交' };
  }

  // 计算完成率
  const exercises = checkinData.exercises || [];
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter(e => e.completed).length;
  const completionRate = totalExercises > 0 ? completedExercises / totalExercises : 0;

  // 计算总时长
  const totalDuration = exercises.reduce((sum, e) => sum + (e.durationSeconds || 0), 0);

  const now = new Date();
  const doc = {
    _openid: openid,
    date: todayDate,
    planId: checkinData.planId || '',
    planName: checkinData.planName || '',
    exercises,
    completionRate: parseFloat(completionRate.toFixed(2)),
    totalDuration,
    mood: checkinData.mood || 3,
    notes: checkinData.notes || '',
    photos: checkinData.photos || [],
    createdAt: now,
    updatedAt: now
  };

  const res = await db.collection('checkins').add({ data: doc });

  // 更新用户统计
  const user = await db.collection('users').where({ _openid: openid }).get();
  if (user.data.length > 0) {
    const stats = user.data[0].stats || {};
    const newTotalCheckins = (stats.totalCheckins || 0) + 1;

    // 重算 streak
    const { currentStreak, longestStreak } = await recalculateStreak(openid, todayDate);

    await db.collection('users').where({ _openid: openid }).update({
      data: {
        stats: {
          totalCheckins: newTotalCheckins,
          currentStreak,
          longestStreak: Math.max(longestStreak, stats.longestStreak || 0),
          totalMinutes: (stats.totalMinutes || 0) + Math.round(totalDuration / 60),
          lastCheckinDate: todayDate
        },
        updatedAt: now
      }
    });

    return {
      checkinId: res._id,
      stats: { totalCheckins: newTotalCheckins, currentStreak, longestStreak: Math.max(longestStreak, stats.longestStreak || 0) }
    };
  }

  return { checkinId: res._id };
}

async function updateCheckin(openid, event) {
  const { checkinId, checkinData } = event;
  const checkin = await db.collection('checkins').doc(checkinId).get();

  if (!checkin.data || checkin.data._openid !== openid) {
    return { code: -1, msg: '无权修改此打卡' };
  }

  await db.collection('checkins').doc(checkinId).update({
    data: { ...checkinData, updatedAt: new Date() }
  });
  return { updated: true };
}

async function getByDate(openid, event) {
  const { date } = event;
  const { data } = await db.collection('checkins')
    .where({ _openid: openid, date })
    .get();

  return { checkin: data.length > 0 ? data[0] : null };
}

async function getByRange(openid, event) {
  const { startDate, endDate } = event;
  const { data } = await db.collection('checkins')
    .where({
      _openid: openid,
      date: db.command.gte(startDate).and(db.command.lte(endDate))
    })
    .orderBy('date', 'desc')
    .get();

  return { checkins: data };
}

async function getRecent(openid, event) {
  const { page = 1, pageSize = 20 } = event;
  const skip = (page - 1) * pageSize;

  const { data } = await db.collection('checkins')
    .where({ _openid: openid })
    .orderBy('date', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get();

  return { checkins: data };
}

async function recalculateStreak(openid, todayStr) {
  const { data } = await db.collection('checkins')
    .where({ _openid: openid })
    .orderBy('date', 'desc')
    .get();

  const dates = data.map(d => d.date);
  const uniqueDates = [...new Set(dates)].sort().reverse();

  // current streak
  let currentStreak = 0;
  let expected = new Date(todayStr);
  for (const dateStr of uniqueDates) {
    const expectedStr = formatDate(expected);
    if (dateStr === expectedStr) {
      currentStreak++;
      expected.setDate(expected.getDate() - 1);
    } else if (dateStr < expectedStr) {
      break;
    }
  }

  // longest streak
  let longestStreak = 0;
  let curr = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = Math.round((new Date(uniqueDates[i - 1]).getTime() - new Date(uniqueDates[i]).getTime()) / 86400000);
    if (diff === 1) {
      curr++;
    } else {
      longestStreak = Math.max(longestStreak, curr);
      curr = 1;
    }
  }
  longestStreak = Math.max(longestStreak, curr);

  return { currentStreak, longestStreak };
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
