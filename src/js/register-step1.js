import { supabase } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  //  Get the IDs
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const confirmPasswordInput = document.querySelector("#confirm-password");
  const nextButton = document.querySelector("#firstNextBtn");

  // Gets the saved data from localStorage
  const savedData = JSON.parse(
    localStorage.getItem("cleanops_registration_data") || "{}"
  );

  if (savedData && savedData.step1) {
    populateFormWithSavedData(savedData.step1);
  }

  function populateFormWithSavedData(step1Data) {
    emailInput.value = step1Data.email || "";
    passwordInput.value = step1Data.password || "";
    confirmPasswordInput.value = step1Data.confirmPassword || "";
  }

  emailInput.addEventListener("input", () => validateEmail(emailInput.value));
  passwordInput.addEventListener("input", () =>
    validatePasswordStrength(passwordInput.value)
  );
  confirmPasswordInput.addEventListener("input", () =>
    validatePasswordMatch(passwordInput.value, confirmPasswordInput.value)
  );

  nextButton.addEventListener("click", handleNextStep);

  // email validation function
  function validateEmail(email) {
    email = email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // password validation function
  function validatePasswordStrength(password) {
    if (password.length < 8) {
      // returns a message
      return {
        valid: false,
        message: "Password must be at least 8 characters",
      };
    }

    // checks the strengthness of password
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    const strengthScore = caculateStrengthScore(password);
    updatePasswordStrengthIndicator(strengthScore);

    // returns the strength score based on the validation
    return {
      valid: true,
      score: strengthScore,
    };
  }

  // event listener to dynamically change the bar colors based on the password input
  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;
    const score = caculateStrengthScore(password);
    updatePasswordStrengthIndicator(score, password);
  });

  // function to calculate score based on the password strength
  function caculateStrengthScore(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  }

  // function to update the 4 Bars password strength indicator
  function updatePasswordStrengthIndicator(score) {
    const bars = document.querySelectorAll("[data-bar]");
    const text = document.querySelector("#passwordStrengthText");

    bars.forEach((bar) => {
      bar.style.width = "0%";
      bar.classList.remove(
        "bg-red-500",
        "bg-yellow-500",
        "bg-green-500",
        "bg-green-600"
      );
    });

    if (!password) {
      text.textContent = "";
      return;
    }

    let colorClass = "bg-red-500";
    let message = "Very weak password";

    if (score === 2) {
      colorClass = "bg-yellow-500";
      message = "Weak Password";
    } else if (score === 3) {
      colorClass = "bg-green-500";
      message = "Good Password";
    } else if (score >= 4) {
      colorClass = "bg-green-600";
      message = "Strong Password";
    }

    bars.forEach((bar) => {
      const barLevel = Number(bar.dataset.bar);
      if (barLevel <= score) {
        bar.style.width = "100%";
        bar.classList.add(colorClass);
      }
    });

    text.textContent = message;
  }

  // function to check password and confirm password if match
  function validatePasswordMatch(password, confirmPassword) {
    return password === confirmPassword;
  }

  // function to save the input data to localStorage and Supabase
  async function handleNextStep() {
    const formData = {
      email: emailInput.value,
      password: passwordInput.value,
      confirmPassword: confirmPasswordInput.value,
    };

    if (!validateEmail(formData.email.trim())) {
      alert("Please enter a valid email address");
      return;
    }

    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.valid) {
      alert(passwordValidation.message);
      return;
    }

    if (!validatePasswordMatch(formData.password, formData.confirmPassword)) {
      alert("Passwords do not match");
      return;
    }

    // gets the data from localStorage
    const registrationData = JSON.parse(
      localStorage.getItem("cleanops_registration_data") || "{}"
    );
    registrationData.step1 = formData;
    registrationData.timestamp = Date.now();

    // saves the data to localStorage
    localStorage.setItem(
      "cleanops_registration_data",
      JSON.stringify(registrationData)
    );

    // this will saved the data from localStorage to supabase
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            email: formData.email,
            registration_step: 1,
          },
        },
      });

      if (error) {
        alert("Account creation failed: ", error.message);
        return;
      }

      const user = data.user ?? data.session?.user;

      if (!user) {
        alert("User created but no session found");
        return;
      }

      alert("User created: " + user.email);

      // saves data to localStorage
      registrationData.userId = user.id;
      registrationData.step1 = {
        email: formData.email,
      };
      localStorage.setItem(
        "cleanops_registration_data",
        JSON.stringify(registrationData)
      );

      window.location.href = "./register2.html";
    } catch (error) {
      alert("Error", error.message);
    }
  }

  // function to toggle password visibilty for passwordField and confirmPasswordFields
  // I WILL REMEMBER THIS DATA-TARGET SAVING MY ASS
  document.querySelectorAll("button[data-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const iconSpan = btn.querySelector("span");
      const input = document.getElementById(btn.dataset.target);

      if (input.type === "password") {
        input.type = "text";
        iconSpan.textContent = "visibility_off";
      } else {
        input.type = "password";
        iconSpan.textContent = "visibility";
      }
    });
  });
});
