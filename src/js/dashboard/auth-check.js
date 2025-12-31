import { supabase } from "../config.js";

// AUTHENTICATION & SESSION MANAGEMENT

async function checkAuthentication() {
  const currentSession = await supabase.auth.getSession();

  if (currentSession.error || currentSession.data.session === null) {
    showLoginRequiredMessage();
    setTimeout(() => {
      redirectToLoginPage();
    }, 1000);
    return null;
  }

  const user = currentSession.data.session.user;

  const profileResponse = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileResponse.error || !profileResponse.data) {
    await handleMissingProfile(user);
    return null;
  }

  const userInfo = {
    id: user.id,
    email: user.email,
    full_name: profileResponse.data.full_name,
    barangay: profileResponse.data.barangay,
    role: profileResponse.data.role,
    last_active: new Date().toISOString(),
  };

  localStorage.setItem("cleanops_current_user", JSON.stringify(userInfo));

  return {
    auth: user,
    profile: profileResponse.data,
  };
}

async function handleMissingProfile(user) {
  const profileData = {
    id: user.id,
    email: user.email,
    full_name: user.email.split("@")[0].replace(/[._]/g, " "),
    barangay: "Unknown",
    role: "resident",
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("profiles").insert(profileData);

  if (data && !error) {
    showInfoMessage("Profile created successfully");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    showError("Profile setup failed. Please contact support");
    await supabase.auth.signOut();
    setTimeout(() => {
      redirectToLoginPage();
    }, 1000);
  }
}

function showLoginRequiredMessage() {
  if (document.getElementById("auth-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "auth-overlay";
  overlay.className =
    "fixed inset-0 bg-black/50 flex items-center justify-center z-50";

  const modal = document.createElement("div");
  modal.className =
    "bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-lg";

  const message = document.createElement("p");
  message.className = "text-gray-800 text-lg mb-4";
  message.textContent = "Please log in to access your dashboard";

  const button = document.createElement("button");
  button.className =
    "mt-2 px-6 py-2 bg-yellow-400 text-black font-bold rounded-full hover:scale-105 transition";
  button.textContent = "Go to Login";

  button.addEventListener("click", () => {
    redirectToLoginPage();
  });

  modal.appendChild(message);
  modal.appendChild(button);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

function redirectToLoginPage() {
  localStorage.setItem("cleanops_redirect_after_login", window.location.href);

  window.location.href = ".././auth/login.html";
}

// SESSION MONITORING

async function setupSessionMonitoring() {
  // checks session every 5 mins
  setInterval(() => {
    checkSessionValidity();
  }, 300000);

  await supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      clearUserData(); // function to be written later
      window.location.href = ".././auth/login.html";
    } else if (event === "TOKEN_REFRESHED") {
      updateSessionData(session);
    }
  });
}

async function checkSessionValidity() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) return;

  const expiresAt = data.session.expires_at * 1000; //converts to ms
  const now = Date.now();

  if (expiresAt < now) {
    showSessionExpiredMessage();
    setTimeout(async () => {
      await supabase.auth.signOut();
    }, 60000);
  }
}

function clearUserData() {
  localStorage.removeItem("cleanops_current_user");
  localStorage.removeItem("cleanops_user_session");
}
