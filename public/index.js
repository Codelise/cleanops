const body = document.querySelector("body");
const hamburgerBtn = document.querySelector("#hamburgerMenu");
const openMobileMenu = document.querySelector("#mobileMenu");
const closeMobileMenu = document.querySelector("#closeMobileMenu");
const overlay = document.querySelector("#sidebarOverlay");

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
