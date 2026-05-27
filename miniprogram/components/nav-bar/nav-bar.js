Component({
  properties: {
    title: { type: String, value: '' },
    showBack: { type: Boolean, value: false },
    bgColor: { type: String, value: '#FFFFFF' }
  },

  data: {
    statusBarHeight: 20,
    navBarHeight: 44
  },

  lifetimes: {
    attached() {
      const info = wx.getSystemInfoSync();
      const menuBtn = wx.getMenuButtonBoundingClientRect();
      this.setData({
        statusBarHeight: info.statusBarHeight,
        navBarHeight: menuBtn.height + (menuBtn.top - info.statusBarHeight) * 2
      });
    }
  },

  methods: {
    onBack() {
      wx.navigateBack();
    }
  }
});
