Component({
  properties: {
    percent: { type: Number, value: 0 },
    label: { type: String, value: '' },
    color: { type: String, value: '#07C160' }
  },

  data: {
    canvasId: ''
  },

  lifetimes: {
    attached() {
      this.setData({ canvasId: `ring-${Math.random().toString(36).substr(2, 8)}` });
      // 延迟绘制以等待 canvas 节点挂载
      setTimeout(() => this.drawRing(), 200);
    }
  },

  observers: {
    'percent': function () {
      setTimeout(() => this.drawRing(), 100);
    }
  },

  methods: {
    drawRing() {
      const query = this.createSelectorQuery();
      query.select(`#${this.data.canvasId}`).fields({ node: true, size: true }).exec((res) => {
        if (!res || !res[0] || !res[0].node) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const size = 120 * dpr;
        canvas.width = size;
        canvas.height = size;

        const center = size / 2;
        const radius = center - 8 * dpr;
        const lineWidth = 10 * dpr;
        const pct = Math.min(this.properties.percent, 100) / 100;

        ctx.clearRect(0, 0, size, size);

        // 底环
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#F0F0F0';
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 进度弧
        if (pct > 0) {
          ctx.beginPath();
          ctx.arc(center, center, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * pct);
          ctx.strokeStyle = this.properties.color;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // 中心文字
        ctx.font = `${24 * dpr}px sans-serif`;
        ctx.fillStyle = '#1A1A1A';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round(this.properties.percent)}%`, center, center - 4 * dpr);

        ctx.font = `${10 * dpr}px sans-serif`;
        ctx.fillStyle = '#999999';
        ctx.fillText(this.properties.label, center, center + 18 * dpr);
      });
    }
  }
});
