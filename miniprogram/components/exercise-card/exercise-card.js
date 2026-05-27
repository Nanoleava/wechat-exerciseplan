const { MUSCLE_GROUPS, EQUIPMENT_MAP } = require('../../utils/constants');

Component({
  properties: {
    exercise: { type: Object, value: {} },
    checked: { type: Boolean, value: false },
    collapsed: { type: Boolean, value: true }
  },

  data: {
    muscleLabel: '',
    equipmentLabel: ''
  },

  observers: {
    'exercise': function (ex) {
      if (ex) {
        this.setData({
          muscleLabel: MUSCLE_GROUPS[ex.muscleGroup] || ex.muscleGroup || '',
          equipmentLabel: EQUIPMENT_MAP[ex.equipment] || ex.equipment || ''
        });
      }
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { exercise: this.properties.exercise });
    },

    onCheckToggle() {
      this.triggerEvent('check', { exercise: this.properties.exercise, checked: !this.properties.checked });
    }
  }
});
