// ===== 肌群映射 =====
const MUSCLE_GROUPS = {
  chest: '胸部',
  back: '背部',
  legs: '腿部',
  shoulders: '肩部',
  arms: '手臂',
  core: '核心',
  fullBody: '全身'
};

const MUSCLE_GROUP_KEYS = Object.keys(MUSCLE_GROUPS);

// ===== 动作类别 =====
const EXERCISE_CATEGORIES = {
  strength: '力量训练',
  cardio: '有氧训练',
  flexibility: '柔韧训练',
  balance: '平衡训练'
};

// ===== 难度等级 =====
const DIFFICULTY_MAP = {
  1: '初级',
  2: '中级',
  3: '高级'
};

// ===== 器械类型 =====
const EQUIPMENT_MAP = {
  bodyweight: '自重',
  dumbbell: '哑铃',
  barbell: '杠铃',
  machine: '器械',
  band: '弹力带',
  kettlebell: '壶铃'
};

// ===== 目标类型 =====
const GOAL_TYPES = {
  weightLoss: '减脂',
  muscleGain: '增肌',
  endurance: '耐力',
  flexibility: '柔韧性',
  general: '综合'
};

// ===== 心情选项 =====
const MOOD_OPTIONS = [
  { value: 5, emoji: '😊', label: '很棒' },
  { value: 4, emoji: '🙂', label: '不错' },
  { value: 3, emoji: '😐', label: '一般' },
  { value: 2, emoji: '😕', label: '较差' },
  { value: 1, emoji: '😫', label: '很累' }
];

// ===== 热力图颜色等级 =====
const HEATMAP_COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

// ===== 星期映射 =====
const WEEKDAY_MAP = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六'
};

module.exports = {
  MUSCLE_GROUPS,
  MUSCLE_GROUP_KEYS,
  EXERCISE_CATEGORIES,
  DIFFICULTY_MAP,
  EQUIPMENT_MAP,
  GOAL_TYPES,
  MOOD_OPTIONS,
  HEATMAP_COLORS,
  WEEKDAY_MAP
};
