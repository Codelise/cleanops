document.addEventListener("DOMContentLoaded", () => {
  const registrationData = JSON.parse(
    localStorage.getItem("cleanops_registration_data") || "{}"
  );

  if (!registrationData || !registrationData.completed) {
    alert("Registration not completed");
    window.location.href = "../auth/register.html";
    return;
  }

  const loginButton = document.querySelector("#goToLogin");

  // event listener for loginButton to go to login page
  loginButton.addEventListener("click", function () {
    handleGoToLogin();
    console.log("Clicked!");
  });
  //   setTimeout(() => {
  //     window.location.href = "../auth/login.html";
  //   }, 4500);

  // function to directs to login page
  function handleGoToLogin() {
    const registrationData = localStorage.getItem("cleanops_registration_data");

    if (registrationData && registrationData.step1) {
      localStorage.setItem(
        "cleanops_last_email",
        JSON.stringify(registrationData.step1.email)
      );

      localStorage.removeItem("cleanops_registration_data");
    }

    window.location.href = "../auth/login.html";
  }
});

function prepareForLogin() {
  const registrationData = localStorage.getItem("cleanops_registration_data");

  if (registrationData && registrationData.step1) {
    localStorage.setItem(
      "cleanops_last_email",
      JSON.stringify(registrationData.step1.email)
    );

    localStorage.removeItem("cleanops_registration_data");

    window.location.href = "./login.html?registered=true";
  }
}
