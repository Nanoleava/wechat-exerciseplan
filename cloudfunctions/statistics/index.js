const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  switch (action) {
    case 'getDashboard':      return getDashboard(OPENID);
    case 'getWeeklySummary':  return getWeeklySummary(OPENID, event);
    case 'getMonthlySummary': return getMonthlySummary(OPENID, event);
    case 'getCalendarData':   return getCalendarData(OPENID, event);
    case 'getExerciseStats':  return getExerciseStats(OPENID, event);
    case 'getBodyStatsTrend': return getBodyStatsTrend(OPENID);
    default: return { code: -1, msg: `Unknown action: ${action}` };
  }
};

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function getDashboard(openid) {
  const user = await db.collection('users').where({ _openid: openid }).get();
  if (user.data.length === 0) return { code: -1, msg: '用户不存在' };

  const stats = user.data[0].stats || {};
  const today = new Date();
  const thisWeek = getWeekRange(today);
  const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  // 本周完成率
  const { data: weekCheckins } = await db.collection('checkins')
    .where({
      _openid: openid,
      date: db.command.gte(thisWeek.start).and(db.command.lte(thisWeek.end))
    }).get();

  const weeklyRate = weekCheckins.length > 0
    ? Math.round(weekCheckins.reduce((s, c) => s + c.completionRate, 0) / weekCheckins.length * 100)
    : 0;

  // 本月完成率
  const { data: monthCheckins } = await db.collection('checkins')
    .where({
      _openid: openid,
      date: db.command.gte(`${thisMonth}-01`).and(db.command.lte(`${thisMonth}-31`))
    }).get();

  const monthlyRate = monthCheckins.length > 0
    ? Math.round(monthCheckins.reduce((s, c) => s + c.completionRate, 0) / monthCheckins.length * 100)
    : 0;

  return {
    streak: stats.currentStreak || 0,
    totalCheckins: stats.totalCheckins || 0,
    totalMinutes: stats.totalMinutes || 0,
    weeklyRate,
    monthlyRate,
    currentStreak: stats.currentStreak || 0,
    longestStreak: stats.longestStreak || 0
  };
}

async function getWeeklySummary(openid, event) {
  const weekStart = event.weekStart ? new Date(event.weekStart) : getWeekStart();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = formatDate(d);
    const { data } = await db.collection('checkins')
      .where({ _openid: openid, date: dateStr })
      .get();
    days.push({
      date: dateStr,
      weekday: i,
      checkin: data.length > 0 ? data[0] : null,
      completed: data.length > 0
    });
  }

  return { days };
}

async function getMonthlySummary(openid, event) {
  const now = new Date();
  const year = event.year || now.getFullYear();
  const month = event.month || (now.getMonth() + 1);
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  const { data: checkins } = await db.collection('checkins')
    .where({
      _openid: openid,
      date: db.command.gte(`${monthStr}-01`).and(db.command.lte(`${monthStr}-31`))
    })
    .orderBy('date', 'asc')
    .get();

  const totalWorkouts = checkins.length;
  const avgCompletionRate = totalWorkouts > 0
    ? parseFloat((checkins.reduce((s, c) => s + c.completionRate, 0) / totalWorkouts).toFixed(2))
    : 0;

  return { days: checkins, totalWorkouts, avgCompletionRate };
}

async function getCalendarData(openid, event) {
  const year = event.year || new Date().getFullYear();
  const { data: checkins } = await db.collection('checkins')
    .where({
      _openid: openid,
      date: db.command.gte(`${year}-01-01`).and(db.command.lte(`${year}-12-31`))
    })
    .get();

  const dates = checkins.map(c => {
    let level = 0;
    if (c.completionRate >= 1) level = 4;
    else if (c.completionRate >= 0.75) level = 3;
    else if (c.completionRate >= 0.5) level = 2;
    else if (c.completionRate > 0) level = 1;
    return { date: c.date, level };
  });

  return { dates };
}

async function getExerciseStats(openid, event) {
  const { exerciseId } = event;
  const { data: checkins } = await db.collection('checkins')
    .where({ _openid: openid })
    .orderBy('date', 'asc')
    .get();

  let frequency = 0;
  const volumeByWeek = [];
  const maxWeight = [];

  checkins.forEach(c => {
    (c.exercises || []).forEach(ex => {
      if (ex.exerciseId === exerciseId && ex.completed) {
        frequency++;
        const weekLabel = getWeekLabel(new Date(c.date));

        let weekEntry = volumeByWeek.find(w => w.week === weekLabel);
        if (!weekEntry) {
          weekEntry = { week: weekLabel, volume: 0, sets: 0 };
          volumeByWeek.push(weekEntry);
        }
        const totalReps = (ex.repsPerSet || []).reduce((a, b) => a + b, 0);
        const totalWeight = (ex.weightPerSet || []).reduce((a, b) => a + b, 0);
        weekEntry.volume += totalReps * totalWeight;
        weekEntry.sets += ex.setsCompleted || 0;

        const maxW = Math.max(...(ex.weightPerSet || []), 0);
        if (maxW > 0) maxWeight.push({ date: c.date, weight: maxW });
      }
    });
  });

  return {
    frequency,
    volumeByWeek: volumeByWeek.slice(-12),
    maxWeight: maxWeight.slice(-20),
    totalSets: volumeByWeek.reduce((s, w) => s + w.sets, 0),
    maxWeight: maxWeight.length > 0 ? Math.max(...maxWeight.map(m => m.weight)) : 0
  };
}

async function getBodyStatsTrend(openid) {
  const user = await db.collection('users').where({ _openid: openid }).get();
  if (user.data.length === 0) return { entries: [] };

  return { entries: user.data[0].bodyStatsLog || [] };
}

function getWeekRange(d) {
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: formatDate(monday), end: formatDate(sunday) };
}

function getWeekStart(d) {
  const date = d || new Date();
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  return monday;
}

function getWeekLabel(d) {
  const monday = getWeekStart(d);
  return formatDate(monday);
}
