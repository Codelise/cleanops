class DashboardDataManager {
  // instance properties
  today = new Date();
  cachedData = {};
  lastFetchTime = {};

  constructor(userId, barangay) {
    this.userId = userId;
    this.barangay = barangay;
  }

  // METHODS / FUNCTIONS
  // TODAY SCHEDULE COLLECTION
  async fetchTodaySchedule() {
    // Check cache first (5-minute cache)
    if (
      this.cachedData.todaySchedule &&
      this.lastFetchTime.todaySchedule > Date.now() - 300000
    ) {
      return Promise.resolve(this.cachedData.todaySchedule);
    }
    const dayName = new Date(this.today).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const { data: response, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("barangay", this.barangay)
      .eq("day_of_week", dayName)
      .order("collection_time", { ascending: true });

    if (error) {
      throw new Error("Failed to fetch schedule: " + error.message);
    }

    // process data
    let processedData = this.processScheduleData(response.data);

    // saves to data to cache
    this.cachedData.todaySchedule = processedData;
    this.lastFetchTime.todaySchedule = Date.now();

    return processedData;
  }

  // USER REPORTS
  async fetchUserReports(limit = 5) {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", this.userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      throw new Error("Failed to fetch reports");
    }
    return this.processReportsData(data);
  }

  // UPCOMING SCHEDS
  // for next days
  getNextDays(baseDate, days) {
    const start = new Date(baseDate);
    const result = [];

    for (let i = 0; i <= days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      result.push(d.getDay()); // 0–6 (Sun–Sat)
    }

    return { days: result };
  }

  async fetchUpcomingSchedule(days = 3) {
    const upcomingDays = this.getNextDays(this.today, days);

    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("barangay", this.barangay)
      .in("day_of_week", upcomingDays.days)
      .order("day_of_week", { ascending: true })
      .order("collection_time", { ascending: true });

    if (error) {
      throw new Error("Failed to fetch upcoming schedule");
    }
    return this.groupScheduleByDay(data);
  }

  getMonthStartDate(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
  }

  getMonthEndDate(date) {
    return new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59
    ).toISOString();
  }

  // User Stats
  async fetchUserStats() {
    const monthStart = this.getMonthStartDate(this.today);
    const monthEnd = this.getMonthEndDate(this.today);

    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select("id, status, created_at")
      .eq("user_id", this.userId)
      .gte("created_at", monthStart)
      .lte("created_at", monthEnd);

    if (reportsError) {
      throw new Error("Failed to fetch reports");
    }

    const { data: collections, error: collectionsError } = await supabase
      .from("collection_history")
      .select("id, status, actual_date, collected_date")
      .eq("user_id", this.userId);

    if (collectionsError) {
      throw new Error("Failed to fetch collection history");
    }

    return this.caculcateStats(reports, collections);
  }

  // live tracker data
  async fetchLiveTrackerData() {
    const { data: locations, error: locationsError } = await supabase
      .from("collector_locations")
      .select("*")
      .eq("barangay", this.barangay)
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(3);

    if (locationsError) {
      throw new Error("Failed to fetch tracker data");
    }

    return this.processTrackerData(locations);
  }

  // alert and notif
  async fetchAlerts() {
    const { data: alerts, error: alertsError } = await supabase
      .from("alerts")
      .select("*")
      .or(`barangay.eq.${this.barangay},barangay.eq.all`)
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3);

    if (alertsError) {
      throw new Error("Failed to fetch alerts");
    }

    return alerts ?? []; // if null return empty array []
  }

  async fetchAllDashboardData() {
    const results = await Promise.all([
      this.fetchTodaySchedule(),
      this.fetchUserReports(),
      this.fetchUpcomingSchedule(),
      this.fetchUserStats(),
      this.fetchAlerts(),
    ]);
    return {
      todaySchedule: results[0],
      recentReports: results[1],
      upcomingSchedule: results[2],
      userStats: results[3],
      alerts: results[4],
    };
  }

  // DATA PROCESSING HELPERS
  processScheduleData(schedules) {
    if (!schedules || schedules.length === 0) {
      return {
        hasCollection: false,
        message: "No collection scheduled for today",
      };
    }

    const now = new Date();
    let currentTime = now.getTime();
    let nextCollection = null;

    for (const schedule of schedules) {
      const scheduleTime = new Date(
        `${now.toDateString()} ${schedule.collection_time}`
      ).getTime();
      if (scheduleTime > currentTime) {
        nextCollection = schedule;
        break;
      }
    }

    if (nextCollection === null && schedules.length > 0) {
      nextCollection = schedules[0];
      nextCollection.status = "completed";
    } else if (nextCollection !== null) {
      nextCollection.status = "upcoming";
    }

    return {
      hasCollection: true,
      nextCollection: nextCollection,
      allCollections: schedules,
      status: this.calculateCollectionStatus(nextCollection, currentTime),
    };
  }

  formatStatus(status) {
    const map = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      completed: "Completed",
    };

    return map[status] || "Unknown";
  }

  calculateTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

    return "Just now";
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  processReportsData(reports) {
    if (!reports || reports.length === 0) return [];

    return reports.map((report) => {
      return {
        ...report,
        status_display: this.formatStatus(report.status),
        time_ago: this.calculateTimeAgo(report.created_at),
        formatted_date: this.formatDate(report.created_at),
      };
    });
  }

  calculateLevel(points) {
    if (points >= 500) return "Eco Hero";
    if (points >= 250) return "Eco Champ";
    if (points >= 100) return "Eco Starter";
    return "Beginner";
  }

  calculateLevelProgress(points) {
    const levelCaps = {
      Beginner: 100,
      "Eco Starter": 250,
      "Eco Champ": 500,
      "Eco Hero": 1000,
    };

    const level = this.calculateLevel(points);
    const cap = levelCaps[level] || 100;

    return Math.min((points / cap) * 100, 100);
  }

  calculateStats(reports = [], collections = []) {
    // ===== Reports stats =====
    const totalReports = reports.length;
    const resolvedReports = reports.filter(
      (r) => r.status === "resolved"
    ).length;
    const pendingReports = totalReports - resolvedReports;

    // ===== Collection stats =====
    const totalCollections = collections.length;
    const completedCollections = collections.filter(
      (c) => c.status === "completed"
    ).length;
    const missedCollections = totalCollections - completedCollections;

    // ===== Eco-points =====
    const ecoPoints = resolvedReports * 10 + completedCollections * 5;
    const level = this.calculateLevel(ecoPoints);

    return {
      reports: {
        total: totalReports,
        resolved: resolvedReports,
        pending: pendingReports,
        resolution_rate:
          totalReports > 0 ? (resolvedReports / totalReports) * 100 : 0,
      },
      collections: {
        total: totalCollections,
        completed: completedCollections,
        missed: missedCollections,
        completion_rate:
          totalCollections > 0
            ? (completedCollections / totalCollections) * 100
            : 0,
      },
      eco_points: {
        points: ecoPoints,
        level: level,
        progress: this.calculateLevelProgress(ecoPoints),
      },
    };
  }

  calculateDistance(from, to) {
    if (!from || !to) return null;

    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // Earth radius in KM

    const dLat = toRad(to.lat - from.lat);
    const dLng = toRad(to.lng - from.lng);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(from.lat)) *
        Math.cos(toRad(to.lat)) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  }

  calculateETA(distanceKm) {
    if (!distanceKm) return null;

    const averageSpeedKmH = 20; // assumed collector speed
    return Math.ceil((distanceKm / averageSpeedKmH) * 60);
  }

  formatETA(minutes) {
    if (!minutes) return "Unknown";

    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}h ${mins}m`;
  }

  processTrackerData(trackerData = []) {
    if (!trackerData.length) return [];

    const userLocation = this.userLocation; // { lat, lng }

    return trackerData.map((tracker) => {
      const distanceKm = this.calculateDistance(userLocation, {
        lat: tracker.latitude,
        lng: tracker.longitude,
      });

      const etaMinutes = this.calculateETA(distanceKm);

      return {
        ...tracker,
        distance_km: distanceKm,
        eta_minutes: etaMinutes,
        formatted_eta: this.formatETA(etaMinutes),
      };
    });
  }
}
