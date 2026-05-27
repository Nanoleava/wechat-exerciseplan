const { callFn } = require('../../utils/request');

Page({
  data: {
    user: null,
    todayPlan: null,
    todayCheckin: null,
    streak: 0,
    isLoading: true,
    isEmpty: false,
    isCompleted: false,
    loadError: false
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    if (!this.data.isLoading) {
      this.loadData();
    }
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh());
  },

  async loadData() {
    this.setData({ isLoading: true, loadError: false });
    try {
      const res = await callFn('checkin', { action: 'getTodayPlan' }, { silent: true });

      if (!res.plan) {
        this.setData({ isLoading: false, isEmpty: true });
        return;
      }

      const app = getApp();
      const user = app.globalData.user;
      const streak = user && user.stats ? user.stats.currentStreak || 0 : 0;

      this.setData({
        todayPlan: {
          ...res.plan,
          exercises: res.exercises || []
        },
        todayCheckin: res.existingCheckin,
        streak,
        isLoading: false,
        isEmpty: false,
        isCompleted: res.existingCheckin && res.existingCheckin.completionRate >= 1
      });
    } catch (err) {
      this.setData({ isLoading: false, loadError: true });
    }
  },

  goCheckin() {
    wx.navigateTo({ url: '/pages/checkin-form/checkin-form' });
  },

  goSelectPlan() {
    wx.navigateTo({ url: '/pages/plan-list/plan-list' });
  },

  goExerciseDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/exercise-detail/exercise-detail?id=${id}` });
  }
});
