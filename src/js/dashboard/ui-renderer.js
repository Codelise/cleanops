// for ui rendering components of dashboard

class DashboardRenderer {
  userData = {};
  dashboardData = {};

  constructor(userData, dashboardData) {
    this.userData = userData;
    this.dashboardData = dashboardData;
  }

  // this method/function is to call all render method/functions
  renderAll() {
    this.updateWelcomeMessage();
    this.renderTodayCollection();
    this.renderQuickActions();
    this.renderRecentActivity();
    this.renderUserStats();
    this.renderUpcomingSchedule();
    this.renderAlerts();
    this.renderWasteGuide();

    // render live tracker for garbage trucks if data exists
    if (this.dashboardData.liveTracker) {
      this.renderLiveTracker();
    }
  }

  //   sub method for welcome message method
  getGreetingBasedOnTime() {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }

  // welcome message method
  updateWelcomeMessage() {
    const welcomeMessage = document.querySelector("#welcomeGreeting");
    const barangayBadge = document.querySelector("#barangayBadge");
    const sidebarUsername = document.querySelector("#avatarName");

    // if the userData object does not exist, OR if the profile inside that data does not exist, stop running this function right now.
    if (!this.userData?.profile) return;

    const greeting = this.getGreetingBasedOnTime();
    let { full_name, barangay } = this.userData.profile;

    if (welcomeMessage) {
      welcomeMessage.textContent = `${greeting}, ${full_name}`;
    }

    if (barangayBadge) {
      barangayBadge.textContent = `Barangay ${barangay}`;
    }

    if (sidebarUsername) {
      sidebarUsername.textContent = full_name;
    }
  }

  //   sub method for format time window
  formatTimeWindow(startTime, durationMinutes) {
    if (!startTime || !durationMinutes) return "TBD";

    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60000); // 1 min = 60000 ms

    const options = { hour: "numeric", minute: "2-digit" };

    return `${start.toLocaleTimeString([], options)} - ${end.toLocaleTimeString(
      [],
      options
    )}`;
  }

  //   sub method for progress percentage
  calculateProgressPercentage(collection) {
    // if null return 0 instead of undefined
    if (!collection?.collection_time || !collection?.duration) return 0;

    const now = new Date();
    const start = new Date(collection.collection_time);
    const end = new Date(start.getTime() + collection.duration * 60000);

    if (now < start) return 0;
    if (now >= end) return 100;

    const elapsed = now - start;
    const total = end - start;

    return Math.round((elapsed / total) * 100);
  }

  //   today's waste collection
  renderTodayCollection() {
    const todayData = this.dashboardData.todaySchedule;
    const wasteType = document.querySelector("#wasteType");
    const time = document.querySelector("#timeWindow");
    const collectionStatus = document.querySelector("#collectionStatus");
    const progressBar = document.querySelector("#progressBar");
    const progressText = document.querySelector("#progressText");

    const setReminderBtn = document.querySelector("#setReminderBtn");
    setReminderBtn.disabled = true;
    if (todayData.hasCollection) {
      const collection = todayData.nextCollection;
      if (wasteType) {
        wasteType.textContent = collection.waste_type;
      }
      const timeWindow = this.formatTimeWindow(
        collection.collection_time,
        collection.duration
      );

      if (time) {
        time.textContent = timeWindow;
      }

      if (collectionStatus) {
        collectionStatus.style.color = todayData.status.color;
        collectionStatus.textContent = todayData.status.text;
      }

      const progressPercentage = this.calculateProgressPercentage(collection);
      if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
        progressText.textContent = todayData.status.progressText;
      }

      if (todayData.status.state === "upcoming") {
        setReminderBtn.disabled = false;
        setReminderBtn.textContent = `Set Reminder (${collection.time_until})`;
      } else {
        setReminderBtn.disabled = true;
      }
    } else {
      wasteType.textContent = "No Collection Today";
      time.textContent = "Enjoy your day!";
      collectionStatus.textContent = "No Schedule for Today";
      progressBar.style.display = "none";
      setReminderBtn.disabled = true;
    }
  }

  // quick actions method
  renderQuickActions() {
    const container = document.querySelector("#quick-actions-grid");
    if (!container) return;

    container.innerHTML = "";
    // These are static but could be dynamic based on user permissions
    const actions = [
      {
        id: "report-issue",
        icon: "photo_camera",
        label: "Report Issue",
        color: "accent",
      },
      {
        id: "request-pickup",
        icon: "calendar_add_on",
        label: "Request Pickup",
        color: "secondary",
      },
      {
        id: "live-tracker",
        icon: "location_on",
        label: "Live Tracker",
        color: "primary",
      },
      {
        id: "view-schedule",
        icon: "calendar_month",
        label: "View Schedule",
        color: "gray",
      },
    ];

    actions.forEach((action) => {
      const actionElement = this.createActionCard(action);
      container.appendChild(actionElement);
    });

    document
      .querySelector("#report-issue")
      ?.addEventListener("click", this.handleReportIssue.bind(this));

    document
      .querySelector("#request-pickup")
      ?.addEventListener("click", this.handleRequestPickup.bind(this));

    document
      .querySelector("#live-tracker")
      ?.addEventListener("click", this.handleLiveTracker.bind(this));

    document
      .querySelector("#view-schedule")
      ?.addEventListener("click", this.handleViewSchedule.bind(this));
  }

  //   recent activity
  renderRecentActivity() {
    const reports = this.dashboardData.recentReports || [];
    const activityList = document.querySelector("#recent-activity-list");
    const seeAllLink = document.querySelector("#see-all-reports");
    const recentActivityContainer = document.querySelector("#recent-activity");

    // If no reports, show empty state and return
    if (!reports.length) {
      if (recentActivityContainer) {
        recentActivityContainer.innerHTML = `<p class="empty-state">No recent activity</p>`;
      }
      return;
    }

    if (activityList) activityList.innerHTML = "";

    // show 3 recent reports
    reports.slice(0, 3).forEach((report) => {
      const activityItem = this.createActivityItem(report);
      if (activityList) activityList.appendChild(activityItem);
    });

    const totalReports = this.dashboardData.userStats?.reports?.total || 0;
    if (seeAllLink) {
      seeAllLink.textContent = `See All (${totalReports})`;
    }
  }

  // user statistics
  renderUserStats() {
    const stats = this.dashboardData.userStats;

    if (!stats) return;

    // Reports card
    const reportsCountEl = document.querySelector("#reports-count");
    const reportsResolvedEl = document.querySelector("#reports-resolved");
    const reportsProgressEl = document.querySelector("#reports-progress");

    if (reportsCountEl) reportsCountEl.textContent = stats.reports.total;
    if (reportsResolvedEl)
      reportsResolvedEl.textContent = `${stats.reports.resolved} resolved`;
    if (reportsProgressEl)
      reportsProgressEl.style.width = `${stats.reports.resolution_rate}%`;

    // Collections card
    const collectionsCountEl = document.querySelector("#collections-count");
    const collectionsMissedEl = document.querySelector("#collections-missed");
    const collectionsProgressEl = document.querySelector(
      "#collections-progress"
    );

    if (collectionsCountEl)
      collectionsCountEl.textContent = stats.collections.completed;
    if (collectionsMissedEl)
      collectionsMissedEl.textContent = `${stats.collections.missed} missed`;
    if (collectionsProgressEl)
      collectionsProgressEl.style.width = `${stats.collections.completion_rate}%`;

    // Eco-points card
    const ecoPointsCountEl = document.querySelector("#ecopoints-count");
    const ecoPointsLevelEl = document.querySelector("#ecopoints-level");
    const ecoPointsProgressEl = document.querySelector("#ecopoints-progress");

    if (ecoPointsCountEl)
      ecoPointsCountEl.textContent = stats.eco_points.points;
    if (ecoPointsLevelEl)
      ecoPointsLevelEl.textContent = `Level ${stats.eco_points.level}`;
    if (ecoPointsProgressEl)
      ecoPointsProgressEl.style.width = `${stats.eco_points.progress}%`;
  }

  // upcoming schedule
  renderUpcomingSchedule() {
    const upcoming = this.dashboardData.upcomingSchedule;
    const container = document.querySelector("#upcoming-list");
    const fullWeekBtn = document.querySelector("#full-week-btn");

    // Check if container exists
    if (!container) return;

    // Show empty state if no upcoming schedules
    if (!upcoming || upcoming.length === 0) {
      container.innerHTML = `<p class="empty-state">No upcoming schedule</p>`;
      return;
    }

    // Clear previous schedule items
    container.innerHTML = "";

    // Render up to 3 upcoming schedules
    upcoming.slice(0, 3).forEach((schedule) => {
      const scheduleItem = this.createScheduleItem(schedule);
      container.appendChild(scheduleItem);
    });

    // Add click handler for "Full Week" button
    if (fullWeekBtn) {
      fullWeekBtn.addEventListener("click", () => {
        this.handleViewFullSchedule();
      });
    }
  }

  //   alerts
  renderAlerts() {
    const alerts = this.dashboardData.alerts;
    const alertBanner = document.querySelector("#alert-banner");
    const alertTitle = document.querySelector("#alert-title");
    const alertMessage = document.querySelector("#alert-message");
    const dismissBtn = document.querySelector("#dismiss-alert");

    // Hide alert if no alerts
    if (!alerts || alerts.length === 0) {
      if (alertBanner) alertBanner.style.display = "none";
      return;
    }

    // Show the most important alert
    const primaryAlert = alerts[0];

    if (alertTitle) alertTitle.textContent = primaryAlert.title;
    if (alertMessage) alertMessage.textContent = primaryAlert.message;

    if (alertBanner) {
      // Example: set banner color based on priority
      alertBanner.className = `alert-banner ${primaryAlert.priority}`;
      alertBanner.style.display = "block";
    }

    // Add dismiss handler
    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => {
        this.dismissAlert(primaryAlert.id);
      });
    }
  }

  //   waste guide
  renderWasteGuide() {
    const container = document.querySelector("#waste-guide-list");
    if (!container) return;

    // Clear existing content
    container.innerHTML = "";

    // Static waste types (could be dynamic from CMS)
    const wasteTypes = [
      {
        id: "biodegradable",
        color: "green",
        items: ["Food scraps", "Garden waste", "Paper towels"],
      },
      {
        id: "recyclable",
        color: "blue",
        items: ["Plastics", "Paper", "Glass", "Metals"],
      },
      {
        id: "residual",
        color: "gray",
        items: ["Diapers", "Sanitary", "Ceramics"],
      },
    ];

    // Render each waste type
    wasteTypes.forEach((wasteType) => {
      const guideItem = this.createGuideItem(wasteType);
      container.appendChild(guideItem);
    });

    // Add expand/collapse functionality
    const headers = container.querySelectorAll(".guide-header");
    headers.forEach((header) => {
      header.addEventListener("click", (event) => {
        this.toggleGuideDetails(event);
      });
    });
  }

  //   live tracker
  renderLiveTracker() {
    const section = document.querySelector("#live-tracker-section");
    const truckIdEl = document.querySelector("#truck-id");
    const truckEtaEl = document.querySelector("#truck-eta");
    const truckMarker = document.querySelector("#truck-marker");
    const refreshBtn = document.querySelector("#refresh-tracker");

    if (
      !this.dashboardData.liveTracker ||
      !this.dashboardData.liveTracker.length
    ) {
      if (section) section.style.display = "none";
      return;
    }

    const trackerData = this.dashboardData.liveTracker[0]; // nearest truck

    if (truckIdEl) truckIdEl.textContent = `Truck ${trackerData.id}`;
    if (truckEtaEl) truckEtaEl.textContent = trackerData.formatted_eta;
    if (section) section.style.display = "block";

    // Simulated map update (convert lat/lon to percentages for demo)
    if (truckMarker) {
      const mapWidth = truckMarker.parentElement.offsetWidth;
      const mapHeight = truckMarker.parentElement.offsetHeight;

      // Example: simulate lat/lon as percentages
      const leftPercent = (trackerData.longitude % 100) / 100; // 0-1
      const topPercent = (trackerData.latitude % 100) / 100; // 0-1

      truckMarker.style.left = `${leftPercent * mapWidth}px`;
      truckMarker.style.top = `${topPercent * mapHeight}px`;
    }

    if (refreshBtn) {
      refreshBtn.onclick = () => {
        this.refreshTrackerData(); // you can re-fetch dashboardData.liveTracker
        this.renderLiveTracker(); // re-render marker
      };
    }
  }

  // loading states
  showEmptyState(containerId, message) {
    const container = document.querySelector(containerId);
    if (!container) return;

    const emptyStateHTML = `
    <div class="empty-state flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-300">
      <span class="material-symbols-outlined text-4xl mb-2">inbox</span>
      <p class="text-sm">${message}</p>
    </div>
  `;

    container.innerHTML = emptyStateHTML;
  }

  showLoadingState(section) {
    const container = document.querySelector(section);
    if (!container) return;

    container.classList.add("loading");

    const spinner = container.querySelector(".loading-spinner");
    if (spinner) {
      spinner.style.display = "block";
    } else {
      // If no spinner exists, create one
      const spinnerEl = document.createElement("div");
      spinnerEl.className =
        "loading-spinner w-6 h-6 border-4 border-gray-300 border-t-primary rounded-full animate-spin mx-auto my-4";
      container.appendChild(spinnerEl);
    }
  }

  hideLoadingState(section) {
    const container = document.querySelector(section);
    if (!container) return;

    container.classList.remove("loading");

    const spinner = container.querySelector(".loading-spinner");
    if (spinner) {
      spinner.style.display = "none";
    }
  }
}
