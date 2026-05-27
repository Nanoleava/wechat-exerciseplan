const { callFn } = require('../../utils/request');
const { MOOD_OPTIONS } = require('../../utils/constants');

Page({
  data: {
    planId: '',
    planName: '',
    exercises: [],
    mood: 3,
    notes: '',
    photos: [],
    totalExercises: 0,
    completedCount: 0,
    isSubmitting: false,
    isReadonly: false,
    loading: true,
    moodOptions: MOOD_OPTIONS
  },

  onLoad(options) {
    if (options.id && options.readonly === '1') {
      this.setData({ isReadonly: true });
      this.loadExistingCheckin(options.id);
    } else {
      this.loadTodayPlan();
    }
  },

  async loadTodayPlan() {
    this.setData({ loading: true });
    try {
      const res = await callFn('checkin', { action: 'getTodayPlan' }, { silent: true });

      if (!res.plan) {
        wx.showToast({ title: res.message || '请先选择训练计划', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
        return;
      }

      const exercises = (res.exercises || []).map(ex => ({
        ...ex,
        exerciseId: ex.exerciseId || ex._id,
        completed: false,
        setsCompleted: ex.sets || 0,
        repsPerSet: new Array(ex.sets || 0).fill(parseInt(ex.reps) || 0),
        weightPerSet: new Array(ex.sets || 0).fill(0),
        durationSeconds: 0,
        notes: ''
      }));

      this.setData({
        planId: res.plan._id,
        planName: res.plan.name,
        exercises,
        totalExercises: exercises.length,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  async loadExistingCheckin(checkinId) {
    this.setData({ loading: true });
    try {
      const res = await callFn('checkin', { action: 'getByDate', date: '' }, { silent: true });
      // Load by checkinId via getRecent
      const recent = await callFn('checkin', { action: 'getRecent', page: 1, pageSize: 50 }, { silent: true });
      const checkin = (recent.checkins || []).find(c => c._id === checkinId);

      if (checkin) {
        const exercises = (checkin.exercises || []).map(ex => ({
          ...ex,
          exerciseId: ex.exerciseId || ex._id,
          completed: ex.completed || false,
          setsCompleted: ex.setsCompleted || 0,
          repsPerSet: ex.repsPerSet || [],
          weightPerSet: ex.weightPerSet || [],
          durationSeconds: ex.durationSeconds || 0,
          notes: ex.notes || ''
        }));

        const completedCount = exercises.filter(e => e.completed).length;

        this.setData({
          planName: checkin.planName,
          exercises,
          totalExercises: exercises.length,
          completedCount,
          mood: checkin.mood || 3,
          notes: checkin.notes || '',
          photos: checkin.photos || [],
          loading: false
        });
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: '打卡记录不存在', icon: 'none' });
      }
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  toggleExercise(e) {
    if (this.data.isReadonly) return;
    const { index } = e.currentTarget.dataset;
    const key = `exercises[${index}].completed`;
    this.setData({ [key]: !this.data.exercises[index].completed });
    this.updateProgress();
  },

  onSetsChange(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`exercises[${index}].setsCompleted`]: Number(e.detail.value) });
  },

  onRepsChange(e) {
    const { index, ri } = e.currentTarget.dataset;
    const val = Number(e.detail.value) || 0;
    this.setData({ [`exercises[${index}].repsPerSet[${ri}]`]: val });
  },

  onWeightChange(e) {
    const { index, wi } = e.currentTarget.dataset;
    const val = Number(e.detail.value) || 0;
    this.setData({ [`exercises[${index}].weightPerSet[${wi}]`]: val });
  },

  updateProgress() {
    const completed = this.data.exercises.filter(e => e.completed).length;
    this.setData({ completedCount: completed });
  },

  onMoodSelect(e) {
    const { mood } = e.currentTarget.dataset;
    this.setData({ mood });
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value });
  },

  choosePhoto() {
    wx.chooseImage({
      count: 3 - this.data.photos.length,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const photos = [...this.data.photos, ...res.tempFilePaths].slice(0, 3);
        this.setData({ photos });
      }
    });
  },

  deletePhoto(e) {
    const { index } = e.currentTarget.dataset;
    const photos = this.data.photos.filter((_, i) => i !== index);
    this.setData({ photos });
  },

  async submit() {
    if (this.data.completedCount === 0) {
      wx.showToast({ title: '请至少完成一个动作', icon: 'none' });
      return;
    }

    this.setData({ isSubmitting: true });

    try {
      const checkinData = {
        planId: this.data.planId,
        planName: this.data.planName,
        exercises: this.data.exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          muscleGroup: ex.muscleGroup,
          completed: ex.completed,
          setsCompleted: ex.setsCompleted,
          repsPerSet: ex.repsPerSet,
          weightPerSet: ex.weightPerSet,
          durationSeconds: ex.durationSeconds || 0,
          notes: ex.notes || ''
        })),
        mood: this.data.mood,
        notes: this.data.notes,
        photos: this.data.photos
      };

      const res = await callFn('checkin', { action: 'createCheckin', checkinData }, { loadingText: '提交中...' });

      wx.showToast({ title: '打卡成功!', icon: 'success' });

      // 更新 globalData 中的 streak
      const app = getApp();
      if (app.globalData.user && res.stats) {
        app.globalData.user.stats = res.stats;
      }

      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      this.setData({ isSubmitting: false });
    }
  }
});
