const { callFn } = require('../../utils/request');

Page({
  data: {
    activeTab: 'templates',
    templates: [],
    myPlans: [],
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: true,
    isLoading: true
  },

  onLoad() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.setData({ page: 1 });
    this.loadData().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.loadMore();
    }
  },

  async loadData() {
    this.setData({ isLoading: true });
    try {
      if (this.data.activeTab === 'templates') {
        const res = await callFn('plan', { action: 'getTemplates', page: 1, pageSize: this.data.pageSize }, { silent: true });
        this.setData({
          templates: res.plans || [],
          total: res.total || 0,
          hasMore: (res.plans || []).length >= this.data.pageSize,
          isLoading: false
        });
      } else {
        const res = await callFn('plan', { action: 'getMyPlans', page: 1, pageSize: this.data.pageSize }, { silent: true });
        this.setData({
          myPlans: res.plans || [],
          total: res.total || 0,
          hasMore: (res.plans || []).length >= this.data.pageSize,
          isLoading: false
        });
      }
    } catch (err) {
      this.setData({ isLoading: false });
    }
  },

  async loadMore() {
    const page = this.data.page + 1;
    try {
      if (this.data.activeTab === 'templates') {
        const res = await callFn('plan', { action: 'getTemplates', page, pageSize: this.data.pageSize }, { silent: true, showLoading: false });
        const templates = [...this.data.templates, ...(res.plans || [])];
        this.setData({
          templates,
          page,
          hasMore: (res.plans || []).length >= this.data.pageSize
        });
      } else {
        const res = await callFn('plan', { action: 'getMyPlans', page, pageSize: this.data.pageSize }, { silent: true, showLoading: false });
        const myPlans = [...this.data.myPlans, ...(res.plans || [])];
        this.setData({
          myPlans,
          page,
          hasMore: (res.plans || []).length >= this.data.pageSize
        });
      }
    } catch (err) {
      // silent
    }
  },

  onTabChange(e) {
    const { tab } = e.currentTarget.dataset;
    this.setData({ activeTab: tab, page: 1 });
    this.loadData();
  },

  goPlanDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/plan-detail/plan-detail?id=${id}` });
  },

  async setActivePlan(e) {
    const { id } = e.currentTarget.dataset;
    try {
      await callFn('user', { action: 'updateActivePlan', planId: id }, { silent: true });
      wx.showToast({ title: '已设为当前计划', icon: 'success' });
    } catch (err) {
      // handled by request.js
    }
  },

  async copyPlan(e) {
    const { id } = e.currentTarget.dataset;
    try {
      await callFn('plan', { action: 'copyFromTemplate', templateId: id }, { loadingText: '复制中...' });
      wx.showToast({ title: '已复制到我的计划', icon: 'success' });
      // 刷新我的计划
      const res = await callFn('plan', { action: 'getMyPlans', page: 1, pageSize: this.data.pageSize }, { silent: true });
      this.setData({ myPlans: res.plans || [] });
    } catch (err) {
      // handled by request.js
    }
  }
});
