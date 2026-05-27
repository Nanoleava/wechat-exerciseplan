const { callFn } = require('../../utils/request');

Page({
  data: {
    exerciseId: '',
    exercise: null,
    exerciseStats: null,
    isLoading: true
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ exerciseId: id });
    }
    this.loadData();
  },

  async loadData() {
    this.setData({ isLoading: true });
    try {
      const [exercise, stats] = await Promise.all([
        callFn('exercise', { action: 'getById', exerciseId: this.data.exerciseId }),
        callFn('statistics', { action: 'getExerciseStats', exerciseId: this.data.exerciseId })
      ]);
      this.setData({ exercise, exerciseStats: stats, isLoading: false });
    } catch (err) {
      this.setData({ isLoading: false });
    }
  },

  goBack() {
    wx.navigateBack();
  }
});
