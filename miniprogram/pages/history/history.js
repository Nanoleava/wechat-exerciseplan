const { callFn } = require('../../utils/request');
const { formatDate } = require('../../utils/date');

Page({
  data: {
    checkins: [],
    groupedCheckins: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    isLoading: true
  },

  onLoad() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
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
      const res = await callFn('checkin', { action: 'getRecent', page: 1, pageSize: this.data.pageSize });
      const checkins = res.checkins || [];
      this.setData({
        checkins,
        groupedCheckins: this.groupByWeek(checkins),
        hasMore: checkins.length >= this.data.pageSize,
        isLoading: false
      });
    } catch (err) {
      this.setData({ isLoading: false });
    }
  },

  async loadMore() {
    const { page, pageSize, checkins } = this.data;
    try {
      const res = await callFn('checkin', { action: 'getRecent', page: page + 1, pageSize });
      const newCheckins = res.checkins || [];
      const all = [...checkins, ...newCheckins];
      this.setData({
        checkins: all,
        groupedCheckins: this.groupByWeek(all),
        page: page + 1,
        hasMore: newCheckins.length >= pageSize
      });
    } catch (err) {
      // silent
    }
  },

  groupByWeek(checkins) {
    const groups = [];
    let currentWeek = '';
    let currentGroup = null;

    checkins.forEach(c => {
      const d = new Date(c.date);
      const weekStart = new Date(d);
      const dayOfWeek = d.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStart.setDate(d.getDate() + mondayOffset);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekLabel = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;

      if (weekLabel !== currentWeek) {
        currentWeek = weekLabel;
        currentGroup = { label: weekLabel, items: [] };
        groups.push(currentGroup);
      }
      currentGroup.items.push(c);
    });

    return groups;
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/checkin-form/checkin-form?id=${id}&readonly=1` });
  }
});
