const { CLOUD_ENV_ID } = require('./env');
const { callFn } = require('./utils/request');

App({
  globalData: {
    user: null,
    isCloudReady: false
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }

    wx.cloud.init({
      env: CLOUD_ENV_ID,
      traceUser: true
    });

    this.globalData.isCloudReady = true;

    // 自动登录
    this.login();
  },

  async login() {
    try {
      const res = await callFn('user', { action: 'login' }, { showLoading: false, silent: true });
      if (res && res.user) {
        this.globalData.user = res.user;
      }
    } catch (err) {
      console.error('登录失败:', err);
    }
  }
});
