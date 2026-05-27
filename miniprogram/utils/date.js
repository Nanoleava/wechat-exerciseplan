/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 获取今天的日期字符串
 */
function today() {
  return formatDate();
}

/**
 * 获取指定日期所在周的起止日期 (周一 ~ 周日)
 */
function getWeekRange(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const dayOfWeek = d.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: formatDate(monday), end: formatDate(sunday) };
}

/**
 * 计算连续打卡天数
 * checkinDates: 已排序的日期字符串数组 (降序)
 */
function calculateStreak(checkinDates) {
  if (!checkinDates || checkinDates.length === 0) return 0;

  const todayStr = today();
  let streak = 0;
  let expectedDate = new Date(todayStr);

  for (const dateStr of checkinDates) {
    const expected = formatDate(expectedDate);
    if (dateStr === expected) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (dateStr < expected) {
      break;
    }
  }

  return streak;
}

/**
 * 计算最长连续打卡天数
 */
function calculateLongestStreak(checkinDates) {
  if (!checkinDates || checkinDates.length === 0) return 0;

  const sorted = [...checkinDates].sort().reverse();
  let longest = 0;
  let current = 1;
  let prev = new Date(sorted[0]);

  for (let i = 1; i < sorted.length; i++) {
    const curr = new Date(sorted[i]);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diffDays === 1) {
      current++;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
    prev = curr;
  }

  return Math.max(longest, current);
}

/**
 * 判断两个日期是否连续 (减一天)
 */
function isConsecutiveDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.round((d1.getTime() - d2.getTime()) / 86400000);
  return diff === 1;
}

module.exports = {
  formatDate,
  today,
  getWeekRange,
  calculateStreak,
  calculateLongestStreak,
  isConsecutiveDay
};
