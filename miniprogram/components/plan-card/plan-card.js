const { DIFFICULTY_MAP, GOAL_TYPES } = require('../../utils/constants');

Component({
  properties: {
    plan: { type: Object, value: {} },
    showActions: { type: Boolean, value: true }
  },

  data: {
    difficultyLabel: '',
    goalLabel: '',
    tags: []
  },

  observers: {
    'plan': function (p) {
      if (p) {
        this.setData({
          difficultyLabel: DIFFICULTY_MAP[p.difficulty] || '',
          goalLabel: GOAL_TYPES[p.goalType] || '',
          tags: p.tags || []
        });
      }
    }
  },

  methods: {
    onDetail() {
      this.triggerEvent('detail', { id: this.properties.plan._id });
    },

    onCopy() {
      this.triggerEvent('copy', { id: this.properties.plan._id });
    },

    onActivate() {
      this.triggerEvent('activate', { id: this.properties.plan._id });
    }
  }
});
