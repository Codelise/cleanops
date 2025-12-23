document.addEventListener("DOMContentLoaded", () => {
  initScheduleModal();
});

const body = document.querySelector("body");
const hamburgerBtn = document.querySelector("#hamburgerMenu");
const openMobileMenu = document.querySelector("#mobileMenu");
const closeMobileMenu = document.querySelector("#closeMobileMenu");
const overlay = document.querySelector("#sidebarOverlay");

// function to toggle mobile sidebar
function toggleMobileSidebar() {
  openMobileMenu.classList.toggle("hidden");

  if (openMobileMenu.classList.contains("hidden")) {
    openMobileMenu.classList.remove("translate-x-0");
    openMobileMenu.classList.add("translate-x-full");

    if (overlay) overlay.remove("overflow-hidden");
    body.classList.remove("overflow-hidden");

    hamburgerBtn.setAttribute("aria-expanded", "false");
  } else {
    openMobileMenu.classList.remove("translate-x-full");
    openMobileMenu.classList.add("translate-x-0");

    if (overlay) overlay.classList.remove("hidden");
    body.classList.add("overflow-hidden");

    hamburgerBtn.setAttribute("aria-expanded", "true");
  }
}

if (closeMobileMenu) {
  closeMobileMenu.addEventListener("click", toggleMobileSidebar);
}

if (overlay) {
  overlay.addEventListener("click", toggleMobileSidebar);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !openMobileMenu.classList.contains("hidden")) {
    toggleMobileSidebar();
  }
});

// Register = Goes to registration page
const registerBtn = document.querySelector(".registerBtn");

registerBtn.addEventListener("click", () => {
  window.location.href = "auth/register.html";
});

// Hardcoded Baranggay Waste Collection Schedules
const wastes_schedules = {
  asinan: {
    baranggay_id: 1,
    name: "Asinan",
    full_name: "Barangay Asinan",
    schedules: [
      {
        id: 1,
        date: "2025-10-01",
        day_name: "Tuesday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 1,
        year: 2025,
        waste_type: "Biodegradable",
        status: "upcoming",
      },
    ],
  },

  banicain: {
    baranggay_id: 2,
    name: "Banicain",
    full_name: "Barangay Banicain",
    schedules: [
      {
        id: 1,
        date: "2025-10-02",
        day_name: "Wednesday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 1,
        year: 2025,
        waste_type: "Non-Biodegradable",
        status: "upcoming",
      },
    ],
  },

  barretto: {
    baranggay_id: 3,
    name: "Barretto",
    full_name: "Barangay Barretto",
    schedules: [
      {
        id: 1,
        date: "2025-10-03",
        day_name: "Thursday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 1,
        year: 2025,
        waste_type: "Biodegradable",
        status: "upcoming",
      },
    ],
  },

  east_bajac_bajac: {
    baranggay_id: 4,
    name: "East Bajac-Bajac",
    full_name: "Barangay East Bajac-Bajac",
    schedules: [
      {
        id: 1,
        date: "2025-10-04",
        day_name: "Friday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 1,
        year: 2025,
        waste_type: "Recyclable",
        status: "upcoming",
      },
    ],
  },

  west_bajac_bajac: {
    baranggay_id: 5,
    name: "West Bajac-Bajac",
    full_name: "Barangay West Bajac-Bajac",
    schedules: [
      {
        id: 1,
        date: "2025-10-05",
        day_name: "Saturday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 1,
        year: 2025,
        waste_type: "Biodegradable",
        status: "upcoming",
      },
    ],
  },

  east_tapinac: {
    baranggay_id: 6,
    name: "East Tapinac",
    full_name: "Barangay East Tapinac",
    schedules: [
      {
        id: 1,
        date: "2025-10-06",
        day_name: "Monday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 2,
        year: 2025,
        waste_type: "Non-Biodegradable",
        status: "upcoming",
      },
    ],
  },

  west_tapinac: {
    baranggay_id: 7,
    name: "West Tapinac",
    full_name: "Barangay West Tapinac",
    schedules: [
      {
        id: 1,
        date: "2025-10-07",
        day_name: "Tuesday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 2,
        year: 2025,
        waste_type: "Recyclable",
        status: "upcoming",
      },
    ],
  },

  gordon_heights: {
    baranggay_id: 8,
    name: "Gordon Heights",
    full_name: "Barangay Gordon Heights",
    schedules: [
      {
        id: 1,
        date: "2025-10-08",
        day_name: "Wednesday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 2,
        year: 2025,
        waste_type: "Biodegradable",
        status: "upcoming",
      },
    ],
  },

  kalaklan: {
    baranggay_id: 9,
    name: "Kalaklan",
    full_name: "Barangay Kalaklan",
    schedules: [
      {
        id: 1,
        date: "2025-10-09",
        day_name: "Thursday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 2,
        year: 2025,
        waste_type: "Non-Biodegradable",
        status: "upcoming",
      },
    ],
  },

  mabayuan: {
    baranggay_id: 10,
    name: "Mabayuan",
    full_name: "Barangay Mabayuan",
    schedules: [
      {
        id: 1,
        date: "2025-10-10",
        day_name: "Friday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 2,
        year: 2025,
        waste_type: "Biodegradable",
        status: "upcoming",
      },
    ],
  },

  new_cabalan: {
    baranggay_id: 11,
    name: "New Cabalan",
    full_name: "Barangay New Cabalan",
    schedules: [
      {
        id: 1,
        date: "2025-10-11",
        day_name: "Saturday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 2,
        year: 2025,
        waste_type: "Recyclable",
        status: "upcoming",
      },
    ],
  },

  old_cabalan: {
    baranggay_id: 12,
    name: "Old Cabalan",
    full_name: "Barangay Old Cabalan",
    schedules: [
      {
        id: 1,
        date: "2025-10-12",
        day_name: "Sunday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 2,
        year: 2025,
        waste_type: "Biodegradable",
        status: "upcoming",
      },
    ],
  },

  new_ilalim: {
    baranggay_id: 13,
    name: "New Ilalim",
    full_name: "Barangay New Ilalim",
    schedules: [
      {
        id: 1,
        date: "2025-10-13",
        day_name: "Monday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 3,
        year: 2025,
        waste_type: "Non-Biodegradable",
        status: "upcoming",
      },
    ],
  },

  new_kababae: {
    baranggay_id: 14,
    name: "New Kababae",
    full_name: "Barangay New Kababae",
    schedules: [
      {
        id: 1,
        date: "2025-10-14",
        day_name: "Tuesday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 3,
        year: 2025,
        waste_type: "Biodegradable",
        status: "upcoming",
      },
    ],
  },

  new_kalalake: {
    baranggay_id: 15,
    name: "New Kalalake",
    full_name: "Barangay New Kalalake",
    schedules: [
      {
        id: 1,
        date: "2025-10-14",
        day_name: "Tuesday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 3,
        year: 2025,
        waste_type: "Biodegradable",
        status: "upcoming",
      },
    ],
  },

  pag_asa: {
    baranggay_id: 16,
    name: "Pag-asa",
    full_name: "Barangay Pag-asa",
    schedules: [
      {
        id: 1,
        date: "2025-10-15",
        day_name: "Wednesday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 3,
        year: 2025,
        waste_type: "Recyclable",
        status: "upcoming",
      },
    ],
  },

  santa_rita: {
    baranggay_id: 17,
    name: "Santa Rita",
    full_name: "Barangay Santa Rita",
    schedules: [
      {
        id: 1,
        date: "2025-10-16",
        day_name: "Thursday",
        time: "6:00 AM",
        due_time: "9:00 AM",
        week_number: 3,
        year: 2025,
        waste_type: "Biodegradable",
        status: "upcoming",
      },
    ],
  },
};

// function to get waste schedule from the wastes_schedules object
function getWasteSchedule(baranggay_id) {
  const normalizedId = baranggay_id.replace(/-/g, "_");

  if (wastes_schedules.hasOwnProperty(normalizedId)) {
    return wastes_schedules[normalizedId];
  } else {
    return {
      baranggay_id: 0,
      name: "Unknown",
      full_name: "Unknown",
      schedules: [],
    };
  }
}

// function to format date to string
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { month: "short", day: "numeric", weekday: "short" };
  return date.toLocaleDateString("en-US", options);
}

// function to get the type of waste for each baranggay
function getWasteType(wasteType) {
  switch (wasteType) {
    case "Biodegradable":
      return "bg-forest-green/10 text-forest-green";
      break;
    case "Non-Biodegradable":
      return "bg-trust-blue/10 text-trust-blue";
      break;
    case "Recyclable":
      return "bg-action-orange/10 text-action-orange";
      break;
    case "Special Waste":
      return "bg-purple-500/10 text-purple-500";
    default:
      return "bg-gray-100 text-gray-800";
      break;
  }
}

// function to show the dot color depending on the type of waste
function getWasteTypeDot(wasteType) {
  switch (wasteType) {
    case "Biodegradable":
      return "bg-forest-green";
      break;
    case "Non-Biodegradable":
      return "bg-trust-blue";
      break;
    case "Recyclable":
      return "bg-action-orange";
      break;
    case "Special Waste":
      return "bg-purple-500";
      break;
    default:
      return "bg-gray-400";
      break;
  }
}

// function to initialize, start the waste collection modal
function initScheduleModal() {
  const baranggayDropdown = document.querySelector("#barangay-select");
  const scheduleModal = document.querySelector("#schedule-modal");
  const modalCloseBtn = document.querySelector("#modal-close-btn");

  if (!baranggayDropdown) {
    return;
  }

  if (!scheduleModal) {
    console.error();
    return;
  }

  baranggayDropdown.addEventListener("change", selectedSchedule);

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeModal);
  }
}

// function to show a selected schedule
function selectedSchedule(event) {
  const getBaranggayId = event.target.value;

  if (!getBaranggayId || getBaranggayId === "") {
    return window.alert("No baranggay id found");
  }

  const baranggayData = getWasteSchedule(getBaranggayId);

  if (baranggayData.schedules.length === 0) {
    alert("No schedule available for this baranggay");
    return;
  }

  updateModal(baranggayData);

  openModal();
}

// function to show the updated schedule of the baranggay
function updateModal(baranggayData) {
  const modalTitle = document.querySelector("#modal-title");
  modalTitle.textContent = baranggayData.full_name;

  const modalTableBody = document.querySelector("#t-body");
  modalTableBody.innerHTML = "";

  baranggayData.schedules.forEach((schedule) => {
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-50 dark:hover:bg-white/5 transition-colors";
    row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                ${baranggayData.name}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                ${formatDate(schedule.date)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                ${schedule.time}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                Week ${schedule.week_number}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                ${schedule.year}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getWasteType(
                  schedule.waste_type
                )}">
                    <span class="w-1.5 h-1.5 rounded-full ${getWasteTypeDot(
                      schedule.waste_type
                    )}"></span>
                    ${schedule.waste_type}
                </span>
            </td>
        `;

    modalTableBody.appendChild(row);
  });
}

// function to open the modal of waste collection
function openModal() {
  const scheduleModal = document.querySelector("#schedule-modal");
  const body = document.body;

  scheduleModal.classList.remove("hidden");
  body.classList.add("overflow-hidden");

  document.querySelector("#modal-close-btn").focus();
}

// function to close the modal
function closeModal() {
  const scheduleModal = document.querySelector("#schedule-modal");
  const body = document.body;
  const baranggayDropdown = document.querySelector("#select");

  scheduleModal.classList.add("hidden");

  body.classList.remove("overflow-hidden");

  baranggayDropdown.value = "";

  baranggayDropdown.focus();
}
