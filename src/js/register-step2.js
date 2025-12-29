import { supabase } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  let registrationData = JSON.parse(
    localStorage.getItem("cleanops_registration_data") || "{}"
  );

  if (!registrationData || !registrationData.step1) {
    alert("Please complete Step 1 first");
    window.location.href = "../auth/register.html";
    return;
  }

  const fullNameInput = document.querySelector("#fullname");
  const addressInput = document.querySelector("#address");
  const barangaySelect = document.querySelector("#barangay");
  const contactInput = document.querySelector("#contact");
  const backButton = document.querySelector("#backBtn");
  const nextBtn = document.querySelector("#nextBtn");

  // saves the input for step 2
  if (registrationData.step2) {
    populateFormWithSavedData(registrationData.step2);
  }

  function populateFormWithSavedData(step2Data) {
    fullNameInput.value = step2Data.fullName || "";
    addressInput.value = step2Data.address || "";
    barangaySelect.value = step2Data.barangay || "";
    contactInput.value = step2Data.contactNumber || "";
  }

  // function to add input listener later
  fullNameInput.addEventListener("input", () =>
    validateFullName(fullNameInput.value)
  );
  addressInput.addEventListener("input", () =>
    validateAddress(addressInput.value)
  );
  contactInput.addEventListener("input", () =>
    validateContactNumber(contactInput.value)
  );

  // function for back and next btn
  backButton.addEventListener("click", () => {
    handleBack();
  });

  nextBtn.addEventListener("click", () => {
    handleNextStep();
  });

  // function to validate full name length, at least more than 2
  function validateFullName(name) {
    const nameParts = name.trim().split(" ");
    return nameParts.length >= 2;
  }

  // function to validate address
  function validateAddress(address) {
    return address.trim().length > 5;
  }

  //function for contact number validation
  function validateContactNumber(contact) {
    contact = contact.trim();
    const phRegex = /^(09|\+639)\d{9}$/;
    return phRegex.test(contact);
  }

  // function to get back to register.html
  function handleBack() {
    window.location.href = "../auth/register.html";
  }

  // function to save data to localStorage and supabase
  async function handleNextStep() {
    let formData = {
      fullName: fullNameInput.value,
      address: addressInput.value,
      barangay: barangaySelect.value,
      contactNumber: contactInput.value,
    };

    if (!validateFullName(formData.fullName)) {
      alert("Please enter your full name");
      return;
    }

    if (!validateAddress(formData.address)) {
      alert("Please enter a valid address");
      return;
    }

    if (
      formData.barangay === "" ||
      formData.barangay === "Select your Baranggay"
    ) {
      alert("Please select your baranggay");
      return;
    }

    if (!validateContactNumber(formData.contactNumber)) {
      alert("Please enter a valid Philippine contact number (09XXXXXXXXX)");
      return;
    }

    registrationData = JSON.parse(
      localStorage.getItem("cleanops_registration_data") || "{}"
    );
    registrationData.step2 = formData;
    localStorage.setItem(
      "cleanops_registration_data",
      JSON.stringify(registrationData)
    );

    //save to supabase from localStorage
    try {
      // gets the userId from localStorage step 1
      const userId = registrationData.userId;

      if (userId) {
        // saved from localStorage to the profile table's columns
        const profileData = {
          id: userId,
          email: registrationData.step1.email,
          full_name: formData.fullName,
          address: formData.address,
          barangay: formData.barangay,
          contact_number: formData.contactNumber,
          role: "resident",
        };

        // inserts the saved account from localStorage to profiles table
        const { data: profileResult, error: profileError } = await supabase
          .from("profiles")
          .upsert(profileData)
          .select();

        if (profileError) {
          alert("Upsert error: ", profileError.message);
          return;
        }

        alert("Profile upserted: ", profileResult[0].full_name);

        registrationData.completed = true;
        delete registrationData.step1.password;
        delete registrationData.step1.confirmPassword;
        localStorage.setItem(
          "cleanops_registration_data",
          JSON.stringify(registrationData)
        );

        window.location.href = "../auth/register3.html";
      } else {
        alert("User not found. Please start over.");
        localStorage.removeItem("cleanops_registration_data");
        window.location.href = "../auth/register.html";
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  }
});
