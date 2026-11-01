// ===============================
// GOOGLE ADDRESS AUTOCOMPLETE
// ===============================

let selectedAddress = "";

function initAutocomplete() {
  const input = document.getElementById("autocomplete");
  if (!input || !window.google || !google.maps || !google.maps.places) return;

  const autocomplete = new google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: "us" },
    types: ["address"],
    fields: ["formatted_address", "address_components", "geometry"]
  });

  autocomplete.addListener("place_changed", function () {
    const place = autocomplete.getPlace();

    if (!place || !place.formatted_address || !place.address_components) {
      selectedAddress = "";
      console.log("Google place data missing:", place);
      return;
    }

    let street = "";
    let city = "";
    let state = "";
    let postal = "";
    let country = "";

    place.address_components.forEach(component => {
      const types = component.types;

      if (types.includes("street_number")) {
        street = component.long_name + " " + street;
      }

      if (types.includes("route")) {
        street += component.long_name;
      }

      if (types.includes("locality")) {
        city = component.long_name;
      }

      if (types.includes("administrative_area_level_1")) {
        state = component.short_name;
      }

      if (types.includes("postal_code")) {
        postal = component.long_name;
      }

      if (types.includes("country")) {
        country = component.long_name;
      }
    });

    selectedAddress = place.formatted_address;

    localStorage.setItem("addressStreet", street);
    localStorage.setItem("addressCity", city);
    localStorage.setItem("addressState", state);
    localStorage.setItem("addressPostal", postal);
    localStorage.setItem("addressCountry", country);
    localStorage.setItem("address", place.formatted_address);

    console.log("Selected address:", place.formatted_address);
  });
}

window.initAutocomplete = initAutocomplete;

/* ===============================
ADDRESS FORM SUBMIT
/ -> /get-your-offer/
================================ */

document.addEventListener("DOMContentLoaded", function () {
  const addressForm = document.getElementById("addressForm");
  if (!addressForm) return;

  addressForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const input = document.getElementById("autocomplete");
    const typedAddress = input ? input.value.trim() : "";
    const finalAddress = selectedAddress || typedAddress;

    if (!finalAddress) {
      alert("Please enter your property address.");
      return;
    }

    localStorage.setItem("address", finalAddress);

    const btn = document.getElementById("offerBtn");
    if (btn) {
      btn.innerText = "Requesting...";
      btn.disabled = true;
    }

    setTimeout(function () {
      const params = new URLSearchParams();
      params.set("address", finalAddress);

      [
        "fbclid",
        "fbc",
        "fbp",
        "utm_source",
        "utm_medium",
        "utm_campaign_name",
        "utm_campaign",
        "utm_adgroup",
        "utm_ad",
        "utm_term",
        "utm_device"
      ].forEach(function (key) {
        const value = localStorage.getItem(key);
        if (value) params.set(key, value);
      });

      window.location.href = "/get-your-offer/?" + params.toString();
    }, 800);
  });
});

/* ===============================
   NEW CRM (LEO) — LEAD DELIVERY
   The ingest endpoint doesn't support CORS, so this is sent as a "simple"
   request: no-cors with a form-encoded body (it ignores text/plain bodies)
   (verified 2026-10-30). keepalive lets it finish even though the page
   navigates away right after. Fire-and-forget: it can never block or break
   the existing lead flow.
================================ */
// Facebook-landing-page leads. (The two main websites use a separate key.)
const CRM_INGEST_URL = "https://api.leo.sm3marketing.com/v1/ingest/SoOifVA0u3TCRA2sbk0WW3RFs_AISeA8";

function sendLeadToCRM(lead) {
  try {
    const payload = Object.assign({
      source: location.hostname,
      page_url: location.href,
      submitted_at: new Date().toISOString()
    }, lead);
    // Drop blanks so the CRM never overwrites a field with an empty value.
    Object.keys(payload).forEach(function (k) {
      if (payload[k] === "" || payload[k] == null) delete payload[k];
    });
    fetch(CRM_INGEST_URL, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      // URLSearchParams sets Content-Type: application/x-www-form-urlencoded.
      body: new URLSearchParams(payload)
    }).catch(function () {});
  } catch (e) {}
}

/* ===============================
CONTACT FORM SUBMIT
/get-your-offer/ -> /get-your-offer-send/
================================ */

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const firstName = document.getElementById("firstName")?.value.trim() || "";
    const lastName = document.getElementById("lastName")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const phone = document.getElementById("phone")?.value.trim() || "";

    const address = localStorage.getItem("address") || "";
    const city = localStorage.getItem("addressCity") || "";
    const state = localStorage.getItem("addressState") || "";
    const postal = localStorage.getItem("addressPostal") || "";
    const country = localStorage.getItem("addressCountry") || "";

    localStorage.setItem("firstName", firstName);
    localStorage.setItem("lastName", lastName);
    localStorage.setItem("email", email);
    localStorage.setItem("phone", phone);

    const params = new URLSearchParams(window.location.search);
    params.set("address", address);
    params.set("city", city);
    params.set("state", state);
    params.set("postal_code", postal);
    params.set("country", country);
    params.set("first_name", firstName);
    params.set("last_name", lastName);
    params.set("email", email);
    params.set("phone", phone);

    // Step 2 is where a lead has full contact details and has given SMS
    // consent, so it's captured here even if they never finish step 3.
    const consentEl = document.getElementById("consentCheckbox");
    const consentText = consentEl && consentEl.closest("label")
      ? consentEl.closest("label").textContent.replace(/\s+/g, " ").trim()
      : "";
    const crmLead = {
      brand: "Three Brothers Realty",
      lead_source: "Facebook",
      form: "Facebook landing page",
      first_name: firstName,
      last_name: lastName,
      full_name: (firstName + " " + lastName).trim(),
      email: email,
      phone: phone,
      address: address,
      street: localStorage.getItem("addressStreet") || "",
      city: city,
      state: state,
      postal_code: postal,
      country: country,
      sms_consent: !!(consentEl && consentEl.checked),
      consent_method: "checkbox",
      sms_consent_text: consentText
    };
    ["fbclid", "fbc", "fbp", "utm_source", "utm_medium", "utm_campaign_name",
     "utm_campaign", "utm_adgroup", "utm_ad", "utm_term", "utm_device"].forEach(function (k) {
      const v = localStorage.getItem(k);
      if (v) crmLead[k] = v;
    });
    // Send once per lead per session: a double-tap on Continue, or Back then
    // Continue, would otherwise create a duplicate lead in the CRM.
    const crmSig = [email, phone, address].join("|").toLowerCase();
    let alreadySent = false;
    try {
      alreadySent = sessionStorage.getItem("crm_lead_sent") === crmSig;
      if (!alreadySent) sessionStorage.setItem("crm_lead_sent", crmSig);
    } catch (e) {}
    if (!alreadySent) sendLeadToCRM(crmLead);

    window.location.href = "/get-your-offer-send/?" + params.toString();
  });
});

/* ===============================
FINAL OFFER PAGE LOGIC
/get-your-offer-send/
================================ */

document.addEventListener("DOMContentLoaded", function () {
  const offerForm = document.getElementById("offerPageForm");
  const offerBtn = document.getElementById("offerPageBtn");
  const offerInput = document.getElementById("offerAddress");

  if (offerForm && offerBtn && offerInput) {
    offerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const address = offerInput.value.trim();

      if (!address) {
        alert("Please enter your property address.");
        return;
      }

      localStorage.setItem("address", address);

      offerBtn.innerText = "Requesting...";
      offerBtn.disabled = true;

      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("address", address);
        window.location.href = "/get-your-offer-send/?" + params.toString();
      }, 800);
    });
  }
});

function toggleMenu() {
  const menu = document.getElementById("dropdownMenu");
  if (menu) menu.classList.toggle("show");
}

function openMenu() {
  document.getElementById("sideMenu")?.classList.add("active");
  document.getElementById("menuOverlay")?.classList.add("active");
}

function closeMenu() {
  document.getElementById("sideMenu")?.classList.remove("active");
  document.getElementById("menuOverlay")?.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", function () {
  const hero = document.querySelector(".hero");
  const floatingBar = document.getElementById("floatingOffer");
  const nav = document.querySelector(".top-nav");

  if (!hero || !floatingBar || !nav) return;

  function handleScroll() {
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    const scrollPosition = window.scrollY;

    if (scrollPosition > heroBottom - 100) {
      floatingBar.classList.add("sticky");
      nav.classList.add("hidden");
    } else {
      floatingBar.classList.remove("sticky");
      nav.classList.remove("hidden");
    }
  }

  window.addEventListener("scroll", handleScroll);
  handleScroll();
});

document.addEventListener("DOMContentLoaded", function () {
  const stateEl = document.getElementById("userState");
  if (!stateEl) return;

  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(data => {
      if (data && data.region) {
        stateEl.textContent = data.region;
      }
    })
    .catch(() => {});
});

document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll(".faq-item");

  items.forEach(item => {
    const question = item.querySelector(".faq-question");
    if (!question) return;

    question.addEventListener("click", () => {
      item.classList.toggle("active");
    });
  });
});

(function () {
  const params = new URLSearchParams(window.location.search);

  const fbclid = params.get("fbclid");
  if (fbclid) {
    localStorage.setItem("fbclid", fbclid);
    const fbc = "fb.1." + Date.now() + "." + fbclid;
    localStorage.setItem("fbc", fbc);
  }

  const fbpMatch = document.cookie.match(/(?:^|; )_fbp=([^;]+)/);
  if (fbpMatch) {
    localStorage.setItem("fbp", decodeURIComponent(fbpMatch[1]));
  }

  [
    "utm_source",
    "utm_medium",
    "utm_campaign_name",
    "utm_campaign",
    "utm_adgroup",
    "utm_ad",
    "utm_term",
    "utm_device"
  ].forEach(function (key) {
    const value = params.get(key);
    if (value) {
      localStorage.setItem(key, value);
    }
  });
})();

(function () {
  const fieldMap = {
    fbclid: "fbclid",
    fbc: "fbc",
    fbp: "fbp",
    utm_source: "utm_source",
    utm_medium: "utm_medium",
    utm_campaign_name: "utm_campaign_name",
    utm_campaign: "utm_campaign",
    utm_adgroup: "utm_adgroup",
    utm_ad: "utm_ad",
    utm_term: "utm_term",
    utm_device: "utm_device"
  };

  function populate() {
    Object.keys(fieldMap).forEach(function (param) {
      const stored = localStorage.getItem(param);
      const input = document.querySelector(`[name="${fieldMap[param]}"]`);
      if (stored && input) input.value = stored;
    });
  }

  document.addEventListener("DOMContentLoaded", populate);
  setTimeout(populate, 500);
  setTimeout(populate, 1500);
  setTimeout(populate, 3000);
})();

document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const addressFromUrl = params.get("address") || "";

  const field =
    document.querySelector('[name="address"]') ||
    document.getElementById("offerAddress") ||
    document.getElementById("autocomplete");

  if (!field) return;

  if (field.id === "autocomplete") {
    field.value = "";
    localStorage.removeItem("address");
    localStorage.removeItem("addressStreet");
    localStorage.removeItem("addressCity");
    localStorage.removeItem("addressState");
    localStorage.removeItem("addressPostal");
    localStorage.removeItem("addressCountry");
    selectedAddress = "";
    return;
  }

  if (addressFromUrl) {
    field.value = addressFromUrl;
  }
});

// ===============================
// OFFER SEND PAGE ADDRESS PREFILL
// ===============================

document.addEventListener("DOMContentLoaded", function () {
  const displayAddress = document.getElementById("displayAddress");
  const addressField = document.getElementById("addressField");
  const cityField = document.getElementById("cityField");
  const stateField = document.getElementById("stateField");
  const postalField = document.getElementById("postalField");
  const countryField = document.getElementById("countryField");

  if (!displayAddress || !addressField) return;

  const params = new URLSearchParams(window.location.search);

  const address = (params.get("address") || "").trim();
  const city = (params.get("city") || "").trim();
  const state = (params.get("state") || "").trim();
  const postal = (params.get("postal") || "").trim();
  const country = (params.get("country") || "").trim();

  // Build pretty display line
  let prettyAddress = address;

  if (!prettyAddress) {
    const pieces = [];
    if (address) pieces.push(address);
    if (city) pieces.push(city);
    if (state) pieces.push(state);
    if (postal) pieces.push(postal);
    prettyAddress = pieces.join(", ");
  }

  if (prettyAddress) {
    displayAddress.textContent = prettyAddress;
    addressField.value = address || prettyAddress;
  } else {
    displayAddress.textContent = "your property";
    addressField.value = "";
  }

  cityField.value = city;
  stateField.value = state;
  postalField.value = postal;
  countryField.value = country;
});

document.addEventListener("DOMContentLoaded", function () {
  const floatingOffer = document.getElementById("floatingOffer");
  const header = document.querySelector(".top-nav");
  const hero = document.querySelector(".hero");

  if (!floatingOffer || !header || !hero) return;

  function handleStickyOffer() {
    const heroBottom = hero.offsetTop + hero.offsetHeight;

    if (window.scrollY > heroBottom) {
      floatingOffer.classList.add("sticky");
      header.classList.add("hidden");
    } else {
      floatingOffer.classList.remove("sticky");
      header.classList.remove("hidden");
    }
  }

  handleStickyOffer();
  window.addEventListener("scroll", handleStickyOffer);
  window.addEventListener("resize", handleStickyOffer);
});
