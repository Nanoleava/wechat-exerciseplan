const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  switch (action) {
    case 'getTemplates':      return getTemplates(event);
    case 'getMyPlans':        return getMyPlans(OPENID, event);
    case 'getPlanById':       return getPlanById(event);
    case 'createPlan':        return createPlan(OPENID, event);
    case 'updatePlan':        return updatePlan(OPENID, event);
    case 'deletePlan':        return deletePlan(OPENID, event);
    case 'copyFromTemplate':  return copyFromTemplate(OPENID, event);
    default: return { code: -1, msg: `Unknown action: ${action}` };
  }
};

async function getTemplates(event) {
  const { page = 1, pageSize = 20, tags } = event;
  let query = { type: 'template', isPublished: true };
  if (tags && tags.length > 0) {
    query.tags = db.command.in(tags);
  }

  const total = (await db.collection('training_plans').where(query).count()).total;
  const skip = (page - 1) * pageSize;
  const { data } = await db.collection('training_plans')
    .where(query)
    .orderBy('copyCount', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get();

  return { plans: data, total };
}

async function getMyPlans(openid, event) {
  const { page = 1, pageSize = 20 } = event;
  const query = { _openid: openid, type: 'user' };

  const total = (await db.collection('training_plans').where(query).count()).total;
  const skip = (page - 1) * pageSize;
  const { data } = await db.collection('training_plans')
    .where(query)
    .orderBy('updatedAt', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get();

  return { plans: data, total };
}

async function getPlanById(event) {
  const { planId } = event;
  const { data } = await db.collection('training_plans').doc(planId).get();
  if (!data) return { code: -1, msg: '计划不存在' };

  const plan = data;

  // 关联查询动作详情
  if (plan.exercises && plan.exercises.length > 0) {
    const exerciseIds = plan.exercises.map(e => e.exerciseId);
    const { data: exercises } = await db.collection('exercises')
      .where({ _id: db.command.in(exerciseIds) })
      .get();

    const exerciseMap = {};
    exercises.forEach(e => { exerciseMap[e._id] = e; });

    plan.exercises = plan.exercises.map(item => ({
      ...item,
      exerciseName: exerciseMap[item.exerciseId] ? exerciseMap[item.exerciseId].name : '未知动作',
      muscleGroup: exerciseMap[item.exerciseId] ? exerciseMap[item.exerciseId].muscleGroup : '',
      category: exerciseMap[item.exerciseId] ? exerciseMap[item.exerciseId].category : ''
    }));
  }

  return { plan };
}

async function createPlan(openid, event) {
  const { name, description, difficulty, goalType, durationWeeks, exercises, tags } = event;
  const now = new Date();

  const plan = {
    _openid: openid,
    name,
    description: description || '',
    type: 'user',
    sourcePlanId: event.sourcePlanId || '',
    difficulty: difficulty || 1,
    goalType: goalType || 'general',
    durationWeeks: durationWeeks || 4,
    exercises: exercises || [],
    tags: tags || [],
    isPublished: false,
    copyCount: 0,
    createdAt: now,
    updatedAt: now
  };

  const res = await db.collection('training_plans').add({ data: plan });
  return { planId: res._id };
}

async function updatePlan(openid, event) {
  const { planId, updates } = event;
  const doc = await db.collection('training_plans').doc(planId).get();
  if (!doc.data || doc.data._openid !== openid) {
    return { code: -1, msg: '无权修改此计划' };
  }

  await db.collection('training_plans').doc(planId).update({
    data: { ...updates, updatedAt: new Date() }
  });
  return { updated: true };
}

async function deletePlan(openid, event) {
  const { planId } = event;
  const doc = await db.collection('training_plans').doc(planId).get();
  if (!doc.data || doc.data._openid !== openid) {
    return { code: -1, msg: '无权删除此计划' };
  }

  await db.collection('training_plans').doc(planId).remove();
  return { deleted: true };
}

async function copyFromTemplate(openid, event) {
  const { templateId } = event;
  const { data } = await db.collection('training_plans').doc(templateId).get();
  if (!data || data.type !== 'template') {
    return { code: -1, msg: '模板不存在' };
  }

  const now = new Date();
  const newPlan = {
    _openid: openid,
    name: `${data.name} (副本)`,
    description: data.description,
    type: 'user',
    sourcePlanId: templateId,
    difficulty: data.difficulty,
    goalType: data.goalType,
    durationWeeks: data.durationWeeks,
    exercises: data.exercises,
    tags: data.tags || [],
    isPublished: false,
    copyCount: 0,
    createdAt: now,
    updatedAt: now
  };

  const res = await db.collection('training_plans').add({ data: newPlan });

  // 原子更新模板的 copyCount
  await db.collection('training_plans').doc(templateId).update({
    data: { copyCount: db.command.inc(1) }
  });

  return { newPlanId: res._id };
}
