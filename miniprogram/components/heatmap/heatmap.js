const { HEATMAP_COLORS } = require('../../utils/constants');

Component({
  properties: {
    year: {
      type: Number,
      value: new Date().getFullYear()
    },
    data: {
      type: Array,
      value: []
    }
  },

  data: {
    weeks: [],
    monthLabels: [],
    cellSize: 14,
    cellGap: 2
  },

  observers: {
    'year, data': function (year, checkinData) {
      if (year) this.renderHeatmap(year, checkinData);
    }
  },

  lifetimes: {
    attached() {
      this.renderHeatmap(this.properties.year, this.properties.data);
    }
  },

  methods: {
    renderHeatmap(year, checkinData) {
      const dateMap = {};
      (checkinData || []).forEach(item => {
        dateMap[item.date] = item.level;
      });

      const weeks = [];
      const startDate = new Date(year, 0, 1);
      const startDay = startDate.getDay();
      const offset = startDay === 0 ? -6 : 1 - startDay;
      const gridStart = new Date(startDate);
      gridStart.setDate(startDate.getDate() + offset);

      const totalDays = 371;
      const weekCount = Math.ceil(totalDays / 7);

      for (let w = 0; w < weekCount; w++) {
        const week = [];
        for (let d = 0; d < 7; d++) {
          const date = new Date(gridStart);
          date.setDate(gridStart.getDate() + w * 7 + d);
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          const inYear = date.getFullYear() === year;
          week.push({
            date: dateStr,
            level: inYear ? (dateMap[dateStr] || 0) : -1,
            inYear
          });
        }
        weeks.push(week);
      }

      const monthLabels = [];
      for (let w = 0; w < weeks.length; w++) {
        const firstDate = weeks[w][0].date;
        if (!firstDate) continue;
        const parts = firstDate.split('-');
        const m = parseInt(parts[1]);
        const d = parseInt(parts[2]);
        if (d <= 7 && m !== (monthLabels.length > 0 ? monthLabels[monthLabels.length - 1].month : -1)) {
          monthLabels.push({ weekIndex: w, label: `${m}月` });
        }
      }

      this.setData({ weeks, monthLabels });
    },

    onCellTap(e) {
      const { date } = e.currentTarget.dataset;
      if (date) {
        this.triggerEvent('select', { date });
      }
    }
  }
});
