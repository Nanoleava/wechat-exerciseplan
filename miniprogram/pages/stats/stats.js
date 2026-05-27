const { callFn } = require('../../utils/request');

Page({
  data: {
    activeTab: 'weekly',
    dashboard: {},
    weeklySummary: [],
    monthlySummary: {},
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
      const [dashboard] = await Promise.all([
        callFn('statistics', { action: 'getDashboard' }, { silent: true })
      ]);

      this.setData({ dashboard: dashboard || {}, isLoading: false });

      if (this.data.activeTab === 'weekly') {
        this.loadWeeklySummary();
      } else if (this.data.activeTab === 'monthly') {
        this.loadMonthlySummary();
      }

      this.drawCharts();
    } catch (err) {
      this.setData({ isLoading: false });
    }
  },

  async loadWeeklySummary() {
    try {
      const res = await callFn('statistics', { action: 'getWeeklySummary' }, { silent: true, showLoading: false });
      this.setData({ weeklySummary: res.days || [] });
    } catch (err) {
      // silent
    }
  },

  async loadMonthlySummary() {
    try {
      const res = await callFn('statistics', { action: 'getMonthlySummary' }, { silent: true, showLoading: false });
      this.setData({ monthlySummary: res });
    } catch (err) {
      // silent
    }
  },

  onTabChange(e) {
    const { tab } = e.currentTarget.dataset;
    this.setData({ activeTab: tab });
    if (tab === 'weekly') this.loadWeeklySummary();
    else if (tab === 'monthly') this.loadMonthlySummary();
  },

  async drawCharts() {
    try {
      const bodyStats = await callFn('statistics', { action: 'getBodyStatsTrend' }, { silent: true, showLoading: false });
      this.drawWeightChart(bodyStats.entries || []);

      // 肌群分布使用 dashboard 数据（由云函数返回或在客户端聚合）
      this.drawMuscleChart();
    } catch (err) {
      // silent
    }
  },

  drawWeightChart(entries) {
    if (!entries || entries.length < 2) return;

    const query = this.createSelectorQuery();
    query.select('#weightChart').fields({ node: true, size: true }).exec((res) => {
      if (!res || !res[0] || !res[0].node) return;
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;
      const width = res[0].width;
      const height = res[0].height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      const weights = entries.map(e => e.weight).filter(w => w != null);
      if (weights.length < 2) return;

      const minW = Math.min(...weights) - 2;
      const maxW = Math.max(...weights) + 2;
      const pad = { top: 20, right: 20, bottom: 40, left: 50 };
      const plotW = width - pad.left - pad.right;
      const plotH = height - pad.top - pad.bottom;

      ctx.clearRect(0, 0, width, height);

      // Y axis
      ctx.strokeStyle = '#E5E5E5';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (plotH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(width - pad.right, y);
        ctx.stroke();

        const val = maxW - ((maxW - minW) / 4) * i;
        ctx.fillStyle = '#999999';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(1), pad.left - 5, y + 3);
      }

      // Line
      ctx.strokeStyle = '#07C160';
      ctx.lineWidth = 2;
      ctx.beginPath();
      entries.forEach((entry, i) => {
        if (entry.weight == null) return;
        const x = pad.left + (plotW / (Math.max(entries.length - 1, 1))) * i;
        const y = pad.top + plotH - ((entry.weight - minW) / (maxW - minW)) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  },

  drawMuscleChart() {
    // Placeholder: muscle chart would be drawn here in Phase 6
    // Data would come from getExerciseStats aggregation
  }
});
