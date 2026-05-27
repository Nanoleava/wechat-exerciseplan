const STORAGE_PREFIX = 'ep_';

/**
 * 设置缓存
 * @param {string} key
 * @param {*} value
 * @param {number} ttl — 过期时间 (秒)，默认 3600
 */
function set(key, value, ttl = 3600) {
  const now = Date.now();
  const data = { value, expireAt: now + ttl * 1000 };
  try {
    wx.setStorageSync(STORAGE_PREFIX + key, data);
  } catch (e) {
    console.error('storage.set error:', e);
  }
}

/**
 * 读取缓存
 * @param {string} key
 * @param {*} defaultValue — 缓存不存在或过期时的默认值
 */
function get(key, defaultValue = null) {
  try {
    const data = wx.getStorageSync(STORAGE_PREFIX + key);
    if (!data) return defaultValue;
    if (data.expireAt && Date.now() > data.expireAt) {
      wx.removeStorageSync(STORAGE_PREFIX + key);
      return defaultValue;
    }
    return data.value;
  } catch (e) {
    console.error('storage.get error:', e);
    return defaultValue;
  }
}

/**
 * 删除缓存
 */
function remove(key) {
  try {
    wx.removeStorageSync(STORAGE_PREFIX + key);
  } catch (e) {
    console.error('storage.remove error:', e);
  }
}

/**
 * 清空所有本应用的缓存
 */
function clearAll() {
  try {
    const info = wx.getStorageInfoSync();
    info.keys.forEach(k => {
      if (k.startsWith(STORAGE_PREFIX)) {
        wx.removeStorageSync(k);
      }
    });
  } catch (e) {
    console.error('storage.clearAll error:', e);
  }
}

module.exports = { set, get, remove, clearAll };
