const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { action } = event;

  switch (action) {
    case 'list':         return listExercises(event);
    case 'getById':      return getById(event);
    case 'getCategories': return getCategories();
    default: return { code: -1, msg: `Unknown action: ${action}` };
  }
};

async function listExercises(event) {
  const { category, muscleGroup, keyword, page = 1, pageSize = 20 } = event;
  const _ = db.command;
  let query = {};

  if (category) query.category = category;
  if (muscleGroup) query.muscleGroup = muscleGroup;
  if (keyword) {
    query.name = db.RegExp({ regexp: keyword, options: 'i' });
  }

  const total = (await db.collection('exercises').where(query).count()).total;
  const skip = (page - 1) * pageSize;
  const { data } = await db.collection('exercises')
    .where(query)
    .skip(skip)
    .limit(pageSize)
    .get();

  return { exercises: data, total };
}

async function getById(event) {
  const { exerciseId } = event;
  const { data } = await db.collection('exercises').doc(exerciseId).get();
  if (!data || data.length === 0) return { code: -1, msg: '动作不存在' };
  return { exercise: data };
}

async function getCategories() {
  const { data } = await db.collection('exercises').get();
  const categories = [...new Set(data.map(e => e.category))];
  const muscleGroups = [...new Set(data.map(e => e.muscleGroup))];
  return { categories, muscleGroups };
}
