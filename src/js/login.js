import { supabase } from "./config.js";

const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const loginButton = document.querySelector("#loginBtn");
const visibilityToggle = document.querySelector("#visibilityToggle");
const forgotPasswordLink = document.querySelector("#forgotPassword");
document.addEventListener("DOMContentLoaded", () => {
  // gets the last saved email from localStorage for ease of login
  // comment for testing
  // const lastUsedEmail = JSON.parse(localStorage.getItem("cleanops_last_email"));

  // it will prefill the email field with saved email from localStorage and move the focus to password field IF TRUE
  // else it will move the focus to email
  // comment for testing
  // if (lastUsedEmail && lastUsedEmail !== "") {
  //   emailInput.value = lastUsedEmail;
  //   passwordInput.focus();
  // } else {
  //   emailInput.focus();
  // }

  // For future implementation REMEMBER ME
  //    rememberedEmail = GET_FROM_LOCALSTORAGE("cleanops_remembered_email")
  //     IF rememberedEmail EXISTS:
  //         SET emailInput.value = rememberedEmail
  //         CHECK_REMEMBER_ME_CHECKBOX() // If you add this feature

  const form = document.querySelector("form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handleLogin();
  });

  loginButton.addEventListener("click", handleLogin);
  visibilityToggle.addEventListener("click", togglePasswordVisibility);
  forgotPasswordLink.addEventListener("click", handleForgotPassword); // work in the future

  passwordInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleLogin();
    }
  });

  // this is for checking if the user was successfully registered and redirects to this login page
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("registered") && urlParams.get("registered") === "true") {
    alert("Account created successfully! Please log in.");

    const url = new URL(window.location.href);
    url.searchParams.delete("registered");
    window.history.replaceState({}, document.title, url.pathname);
  }

  // check if user is already logged in
  checkExistingSession();
});

// CORE FUNCTION
async function handleLogin() {
  if (loginButton.classList.contains("loading")) {
    return;
  }

  setButtonLoadingState(loginButton, true);

  let email = emailInput.value.trim();
  let password = passwordInput.value.trim();

  // basic validation
  const validationResult = validateLoginForm(email, password);
  if (!validationResult.valid) {
    showError(validationResult.message);
    setButtonLoadingState(loginButton, false);
    return;
  }

  const response = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (response.error) {
    setButtonLoadingState(loginButton, false);

    let errorCode = response.error.code;
    let errorMessage = response.error.message;

    handleLoginError(errorCode, errorMessage);
  } else {
    handleLoginSuccess(response.data);
  }
}

// VALIDATION FUNCTIONS

function validateLoginForm(email, password) {
  if (email === "") {
    return { valid: false, message: "Please enter your email address" };
  }

  if (!isValidEmail(email)) {
    return { valid: false, message: "Please enter a valid email address" };
  }

  if (password === "") {
    return { valid: false, message: "Please enter your password" };
  }

  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }

  return { valid: true, message: "" };
}

function isValidEmail(email) {
  email = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// LOGIN SUCCESS HANDLER

async function handleLoginSuccess(loginData) {
  const user = loginData.user;
  const session = loginData.session;

  localStorage.setItem(
    "cleanops_user_session",
    JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
    })
  );

  localStorage.setItem("cleanops_last_email", user.email);

  try {
    // returns a single row of matching user id
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      handleMissingProfile(user);
    } else {
      // let profile = profile_response.data;
      console.log("Profile loaded: ", profiles);
      // save user info to localStorage for the use of other pages
      let userInfo = {
        id: user.id,
        email: user.email,
        full_name: profiles.full_name,
        barangay: profiles.barangay,
        role: profiles.role,
        last_login: new Date().toISOString(),
      };

      localStorage.setItem("cleanops_user_info", JSON.stringify(userInfo));

      // redirects user to url path based on their roles. Maybe I will change it in the future heheheh
      let redirectPath = determineRedirectPath(profiles.role);

      showSuccessMessage("Login successful! Redirecting...");

      setTimeout(() => {
        window.location.href = redirectPath;
      }, 1500);
    }
  } catch (error) {
    // Reset Button state = back to null
    setButtonLoadingState(loginButton, false);
  }
}

// function to determine the path a user redirects after logging in
function determineRedirectPath(userRole) {
  switch (userRole) {
    case "resident":
      return "../resident/dashboard.html";
      break;
    case "lgu_admin":
      return "../admin/dashboard.html";
      break;
    case "garbage_collector":
      return "../garbage_collector/dashboard.html";
    default:
      return "../resident/dashboard.html";
      break;
  }
}

// ERROR HANDLING FUNCTIONS

// function for login errors
function handleLoginError(errorCode, errorMessage) {
  const errorMap = {
    invalid_credentials: "Invalid email or password. Please try again.",
    invalid_email: "Please enter a valid email address.",
    email_not_confirmed: "Please verify your email address before logging in.", // disabled for now for testing
    user_not_found: "No account found with this email.",
    too_many_requests: "Too many login attempts. Please try again later",
  };

  let userMessage = errorMap[errorCode] || "Login failed: " + errorMessage;

  showError(userMessage);

  if (errorCode === "user_not_found" || errorCode === "invalid_email") {
    highlightField(emailInput, "error");
  } else if (errorCode === "invalid_credentials") {
    highlightField(passwordInput, "error");
    passwordInput.value = "";
  }
  console.error("Login error: ", errorCode, errorMessage);
}

async function handleMissingProfile(user) {
  showInfoMessage("Completing profile setup...");

  let profileData = {
    id: user.id,
    email: user.email,
    full_name: user.email.split("@")[0].replace(/[._]/g, " "),
    role: "resident",
    created_at: new Date().toISOString(),
  };

  const { data: profiles, error } = await supabase
    .from("profiles")
    .insert(profileData);

  if (!error) {
    localStorage.setItem("cleanops_user_info", JSON.stringify(profileData));
    window.location.href = "../resident/dashboard.html";
  } else {
    showError("Profile setup failed. Please contact support.");
    await supabase.auth.signOut();
  }
}

// HELPER FUNCTIONS

function togglePasswordVisibility() {
  const currentType = passwordInput.getAttribute("type");

  if (currentType === "password") {
    passwordInput.setAttribute("type", "text");
    setVisibilityIcon("visibility_off");
  } else {
    passwordInput.setAttribute("type", "password");
    setVisibilityIcon("visibility");
  }
}

function setVisibilityIcon(iconName) {
  let iconSpan = visibilityToggle.querySelector(
    "span.material-symbols-outlined"
  );

  iconSpan.textContent = iconName;
}

function setButtonLoadingState(button, isLoading) {
  if (isLoading) {
    button.classList.add("loading");
    button.disabled = true;

    let originalText = button.textContent;
    button.dataset.originalText = originalText;

    button.textContent = "Logging in...";

    // Optional: Add spinner (IN THE FUTURE)
    // ADD_SPINNER_TO_BUTTON(button);
  } else {
    button.classList.remove("loading");
    button.disabled = false;

    let originalText = button.dataset.originalText;
    if (originalText) {
      button.textContent = originalText;
    }
  }

  // Remove spinner (in the future)
  // REMOVE_SPINNER_FROM_BUTTON(button);
}

async function checkExistingSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Session check failed: ", error.message);
    return;
  }

  const session = data.session;

  if (session && session.user) {
    showInfoMessage("You are already logged in. Redirecting...");
    // comment for testing
    let redirectPath = "../resident/dashboard.html";

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    // comment for testing
    // if (!profileError && profile?.role) {
    //   redirectPath = determineRedirectPath(profile.role);
    // }
    // setTimeout(() => {
    //   window.location.href = redirectPath;
    // }, 1000);
  }
}

function highlightField(field, state) {
  field.classList.remove("border-green-500", "border-red-500");

  switch (state) {
    case "error":
      field.classList.add("border-red-500");
      field.parentElement.classList.add("shake");
      break;
    case "success":
      field.classList.add("border-green-500");
      break;
    default:
      field.classList.add("border-gray-300");
  }
}

// UI FEEDBACK FUNCTIONS

function showError(message) {
  const error_id = "login-error-message";

  let errorElement = document.getElementById(error_id);

  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.id = error_id;
  }

  errorElement.className = [
    "mt-4",
    "p-3",
    "bg-red-50",
    "border",
    "border-red-200",
    "text-red-700",
    "rounded-lg",
    "text-sm",
  ].join(" ");

  errorElement.textContent = message;

  loginButton.insertAdjacentElement("afterend", errorElement);

  setTimeout(() => {
    if (errorElement && errorElement.parentNode) {
      errorElement.remove();
    }
  }, 5000);
}

function showSuccessMessage(message) {
  let successElement = document.getElementById("login-success-message");

  if (!successElement) {
    successElement = document.createElement("div");
    successElement.id = "login-success-message";
  }

  successElement.className =
    "mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm";

  successElement.textContent = message;

  loginButton.insertAdjacentElement("afterend", successElement);

  setTimeout(() => {
    successElement.remove();
  }, 3000);
}

function showInfoMessage(message) {
  let infoElement = document.getElementById("login-info-message");

  if (!infoElement) {
    infoElement = document.createElement("div");
    infoElement.id = "login-info-message";
  }

  infoElement.className =
    "mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm";

  infoElement.textContent = message;

  loginButton.insertAdjacentElement("afterend", infoElement);

  setTimeout(() => {
    infoElement.remove();
  }, 3000);
}

//  PASSWORD RESET (FOR FUTURE IMPLEMENTATION)

async function handleForgotPassword() {
  const email = emailInput.value.trim();

  if (email === "" || !isValidEmail(email)) {
    showError("Please enter your email address to reset password");
    return;
  }

  showInfoMessage("Sending reset instructions...");

  let { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:3000/reset-password.html",
  });

  if (!error) {
    showSuccessMessage("Password reset instructions sent to " + email);
  } else {
    showError("Failed to send reset instructions. Please try again.");
  }
}

// SESSION MANAGEMENT
function cleanupRegistrationData() {
  const registrationData = localStorage.getItem("cleanops_registration_data");

  if (registrationData) {
    if (registrationData.step1) {
      localStorage.setItem(
        "cleanops_last_email",
        JSON.parse(registrationData.step1.email)
      );

      localStorage.removeItem("cleanops_registration_data");
    }
  }
}

// THIS IS FOR TESTING ONLY
const resetBtn = document.querySelector("#resetBtn");

resetBtn.addEventListener("click", logoutUser);

// for testing purposel
async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  // Clear any saved data
  localStorage.removeItem("cleanops_user_session");
  localStorage.removeItem("cleanops_user_info");
  localStorage.removeItem("cleanops_last_email");

  if (error) {
    console.error("Error signing out:", error.message);
  } else {
    // Redirect to login page
    window.location.href = "../auth/login.html";
  }
}
