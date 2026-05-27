const { CLOUD_ENV_ID } = require('../env');

function init() {
  if (!wx.cloud) return;
  wx.cloud.init({
    env: CLOUD_ENV_ID,
    traceUser: true
  });
}

function getDB() {
  return wx.cloud.database();
}

function getCollection(name) {
  return getDB().collection(name);
}

function callFunction(name, data = {}) {
  return wx.cloud.callFunction({ name, data });
}

module.exports = { init, getDB, getCollection, callFunction };
