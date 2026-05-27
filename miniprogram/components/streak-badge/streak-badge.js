Component({
  properties: {
    streak: { type: Number, value: 0 },
    longestStreak: { type: Number, value: 0 }
  },

  data: {
    animated: false
  },

  observers: {
    'streak': function (val) {
      if (val > 0) {
        this.setData({ animated: true });
        setTimeout(() => this.setData({ animated: false }), 600);
      }
    }
  }
});
