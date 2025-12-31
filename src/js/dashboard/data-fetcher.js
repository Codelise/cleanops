class DashboardDataManager {
  // instance properties
  today = new Date();
  cachedData = {};
  lastFetchTime = {};

  constructor(userId, barangay) {
    this.userId = userId;
    this.barangay = barangay;
  }

  // methods / functions
  async fetchTodaySchedule() {
    // Check cache first (5-minute cache)
    if (
      this.cachedData.todaySchedule &&
      this.lastFetchTime.todaySchedule() > Date.now() - 300000
    ) {
      return Promise.resolve(this.cachedData.todaySchedule);
    }

    return await supabase.from;
    // TO BE CONTINUED
  }
}
