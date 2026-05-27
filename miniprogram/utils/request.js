const { callFunction } = require('./cloud');

/**
 * 统一云函数调用封装
 * @param {string} name — 云函数名称
 * @param {object} data — 传递给云函数的 data (含 action)
 * @param {object} options
 *   showLoading: boolean (默认 true)
 *   loadingText: string (默认 '加载中...')
 *   silent: boolean (默认 false, 为 true 时不弹出错误 toast)
 */
async function callFn(name, data = {}, options = {}) {
  const { showLoading = true, loadingText = '加载中...', silent = false } = options;

  if (showLoading) {
    wx.showLoading({ title: loadingText, mask: true });
  }

  try {
    const res = await callFunction(name, data);
    if (res.result && res.result.code === -1) {
      throw new Error(res.result.msg || '请求失败');
    }
    return res.result;
  } catch (err) {
    if (!silent) {
      wx.showToast({ title: err.message || '网络错误', icon: 'none', duration: 2000 });
    }
    throw err;
  } finally {
    if (showLoading) {
      wx.hideLoading();
    }
  }
}

module.exports = { callFn };
