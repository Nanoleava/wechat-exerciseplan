const { callFn } = require('../../utils/request');

Page({
  data: {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    calendarDays: [],
    heatmapData: [],
    selectedDay: null,
    selectedDayInfo: null,
    isLoading: true
  },

  onLoad() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh());
  },

  async loadData() {
    this.setData({ isLoading: true });
    try {
      const res = await callFn('statistics', {
        action: 'getCalendarData',
        year: this.data.currentYear
      }, { silent: true });

      this.setData({ heatmapData: res.dates || [], isLoading: false });
      this.renderCalendar();
    } catch (err) {
      this.setData({ isLoading: false });
      this.renderCalendar();
    }
  },

  renderCalendar() {
    const { currentYear, currentMonth, heatmapData } = this.data;
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const days = [];

    const dateLevelMap = {};
    (heatmapData || []).forEach(item => {
      dateLevelMap[item.date] = item.level;
    });

    const offset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < offset; i++) {
      days.push({ day: '', empty: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        date: dateStr,
        level: dateLevelMap[dateStr] || 0,
        empty: false
      });
    }

    this.setData({ calendarDays: days });
  },

  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 1) {
      this.setData({ currentYear: currentYear - 1, currentMonth: 12 });
    } else {
      this.setData({ currentMonth: currentMonth - 1 });
    }
    if (currentYear !== this.data.currentYear) {
      this.loadData();
    } else {
      this.renderCalendar();
    }
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 12) {
      this.setData({ currentYear: currentYear + 1, currentMonth: 1 });
    } else {
      this.setData({ currentMonth: currentMonth + 1 });
    }
    if (currentYear !== this.data.currentYear) {
      this.loadData();
    } else {
      this.renderCalendar();
    }
  },

  async onDayTap(e) {
    const { date } = e.currentTarget.dataset;
    if (!date) return;
    this.setData({ selectedDay: date, selectedDayInfo: null });

    try {
      const res = await callFn('checkin', { action: 'getByDate', date }, { silent: true, showLoading: false });
      if (res.checkin && res.checkin._id) {
        this.setData({
          selectedDayInfo: {
            planName: res.checkin.planName,
            duration: Math.round((res.checkin.totalDuration || 0) / 60),
            completionRate: res.checkin.completionRate
          }
        });
      }
    } catch (err) {
      // silent
    }
  },

  onHeatmapSelect(e) {
    const { date } = e.detail;
    if (date) {
      // 跳转到对应月份
      const parts = date.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      this.setData({ currentYear: year, currentMonth: month });
      this.renderCalendar();
    }
  }
});
