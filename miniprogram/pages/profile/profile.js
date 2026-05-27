const { callFn } = require('../../utils/request');

Page({
  data: {
    user: null,
    settings: {
      reminderEnabled: false,
      reminderTime: '20:00',
      weekDays: [1, 2, 3, 4, 5]
    },
    bodyStats: {
      height: null,
      weight: null,
      targetWeight: null
    }
  },

  onLoad() {
    this.loadProfile();
  },

  onShow() {
    this.loadProfile();
  },

  async loadProfile() {
    try {
      const res = await callFn('user', { action: 'getProfile' }, { silent: true, showLoading: false });
      const user = res.user;
      if (user) {
        const app = getApp();
        app.globalData.user = user;

        this.setData({
          user,
          settings: user.settings || this.data.settings,
          bodyStats: user.bodyStats || this.data.bodyStats
        });
      }
    } catch (err) {
      // silent
    }
  },

  async onReminderToggle(e) {
    const enabled = e.detail.value;
    if (enabled) {
      try {
        await wx.requestSubscribeMessage({
          tmplIds: ['your-template-id']
        });
      } catch (err) {
        this.setData({ 'settings.reminderEnabled': false });
        wx.showToast({ title: '需要授权才能发送提醒', icon: 'none' });
        return;
      }

      try {
        await callFn('notification', {
          action: 'subscribe',
          templateId: 'your-template-id',
          accept: true
        }, { silent: true });
      } catch (err) {
        // silent
      }
    }

    const newSettings = { ...this.data.settings, reminderEnabled: enabled };
    this.setData({ settings: newSettings });

    try {
      await callFn('user', { action: 'updateSettings', settings: newSettings }, { silent: true });
    } catch (err) {
      this.setData({ 'settings.reminderEnabled': !enabled });
    }
  },

  async onTimeChange(e) {
    const time = e.detail.value;
    const newSettings = { ...this.data.settings, reminderTime: time };
    this.setData({ settings: newSettings });
    try {
      await callFn('user', { action: 'updateSettings', settings: newSettings }, { silent: true });
    } catch (err) {
      // silent
    }
  },

  onEditBodyStats() {
    const { bodyStats } = this.data;
    wx.showModal({
      title: '编辑身体数据',
      editable: true,
      placeholderText: '输入身高(cm)',
      success: async (res) => {
        if (res.confirm && res.content) {
          const height = parseFloat(res.content);
          if (isNaN(height)) return;
          try {
            await callFn('user', { action: 'updateBodyStats', height }, { silent: true });
            this.setData({ 'bodyStats.height': height });
            wx.showToast({ title: '已更新', icon: 'success' });
          } catch (err) {
            // handled by request.js
          }
        }
      }
    });
  },

  onEditWeight() {
    wx.showModal({
      title: '编辑体重',
      editable: true,
      placeholderText: '输入体重(kg)',
      success: async (res) => {
        if (res.confirm && res.content) {
          const weight = parseFloat(res.content);
          if (isNaN(weight)) return;
          try {
            await callFn('user', { action: 'updateBodyStats', weight }, { silent: true });
            this.setData({ 'bodyStats.weight': weight });
            wx.showToast({ title: '已更新', icon: 'success' });
          } catch (err) {
            // handled by request.js
          }
        }
      }
    });
  },

  goMyPlans() {
    wx.navigateTo({ url: '/pages/plan-list/plan-list' });
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/history' });
  },

  clearCache() {
    const storage = require('../../utils/storage');
    storage.clearAll();
    wx.showToast({ title: '缓存已清除', icon: 'success' });
  }
});
