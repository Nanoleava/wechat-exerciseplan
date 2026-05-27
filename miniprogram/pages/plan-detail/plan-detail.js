const { callFn } = require('../../utils/request');

Page({
  data: {
    mode: 'view',
    planId: '',
    plan: null,
    exercises: [],
    isLoading: true
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ planId: id });
    }
    this.loadData();
  },

  async loadData() {
    if (!this.data.planId) {
      this.setData({ isLoading: false });
      return;
    }
    this.setData({ isLoading: true });
    try {
      const res = await callFn('plan', { action: 'getPlanById', planId: this.data.planId }, { silent: true });
      const plan = res.plan;
      if (!plan) {
        this.setData({ isLoading: false });
        return;
      }

      // 按 dayIndex 分组
      const grouped = {};
      (plan.exercises || []).forEach(ex => {
        const key = ex.dayIndex != null ? ex.dayIndex : 0;
        if (!grouped[key]) grouped[key] = { dayIndex: key, moves: [] };
        grouped[key].moves.push(ex);
      });

      const exercises = Object.values(grouped).sort((a, b) => a.dayIndex - b.dayIndex);

      this.setData({ plan, exercises, isLoading: false });
    } catch (err) {
      this.setData({ isLoading: false });
    }
  },

  toggleEdit() {
    this.setData({ mode: this.data.mode === 'view' ? 'edit' : 'view' });
  },

  async copyPlan() {
    try {
      const res = await callFn('plan', { action: 'copyFromTemplate', templateId: this.data.planId }, { loadingText: '复制中...' });
      wx.showToast({ title: '已复制到我的计划', icon: 'success' });
      // 跳转到新计划
      setTimeout(() => {
        wx.redirectTo({ url: `/pages/plan-detail/plan-detail?id=${res.newPlanId}` });
      }, 800);
    } catch (err) {
      // handled by request.js
    }
  },

  async startPlan() {
    try {
      await callFn('user', { action: 'updateActivePlan', planId: this.data.planId }, { silent: true });
      wx.showToast({ title: '已设为当前计划', icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 800);
    } catch (err) {
      // handled by request.js
    }
  },

  async deletePlan() {
    const res = await new Promise(r => wx.showModal({ title: '确认删除', content: '删除后不可恢复', success: r }));
    if (!res.confirm) return;
    try {
      await callFn('plan', { action: 'deletePlan', planId: this.data.planId });
      wx.showToast({ title: '已删除', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 800);
    } catch (err) {
      // handled by request.js
    }
  }
});
