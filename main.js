const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");
const mobileLinks = mobileMenu?.querySelectorAll("a") ?? [];
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const contactApiHost = "https://contact.apps-api.instantpage.secureserver.net";
const contactEndpoint = `${contactApiHost}/v3/messages`;
const websiteDetails = {
  websiteId: "ccdd8d30-b5dc-4ba4-b8d0-094a25c441a7",
  widgetId: "9348b19c-e100-4b57-87f3-917139bec823",
  pageId: "287f429b-ed6e-416e-aa2a-319409973b79",
  accountId: "cfa35dc9-6762-4461-a1c7-9c2939d49ba4",
};
let recaptchaLoadPromise;
let recaptchaSiteKey;

function updateHeader() {
  header?.classList.toggle("scrolled", window.scrollY > 24);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

function setMenu(open) {
  if (!menuToggle || !mobileMenu) return;

  menuToggle.setAttribute("aria-expanded", String(open));
  mobileMenu.hidden = !open;
  document.body.classList.toggle("menu-open", open);

  const label = menuToggle.querySelector(".sr-only");
  if (label) label.textContent = open ? "Close menu" : "Open menu";
}

menuToggle?.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

mobileLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

function setError(field, message) {
  const error = document.querySelector(`[data-error-for="${field.name}"]`);
  field.setAttribute("aria-invalid", message ? "true" : "false");
  if (error) error.textContent = message;
}

function validateForm(form) {
  let valid = true;
  const name = form.elements.name;
  const phone = form.elements.phone;
  const email = form.elements.email;
  const message = form.elements.message;

  setError(name, "");
  setError(phone, "");
  setError(email, "");
  setError(message, "");

  if (!name.value.trim()) {
    setError(name, "Please enter your name.");
    valid = false;
  }

  if (!phone.value.trim()) {
    setError(phone, "Please enter your mobile number.");
    valid = false;
  } else {
    const phoneValue = phone.value.trim();
    const phoneDigits = phoneValue.replace(/\D/g, "");
    const hasValidFormat = /^\+?[0-9\s().-]+$/.test(phoneValue);

    if (!hasValidFormat || phoneDigits.length < 7 || phoneDigits.length > 15) {
      setError(phone, "Please enter a valid mobile number.");
      valid = false;
    }
  }

  if (!email.value.trim()) {
    setError(email, "Please enter your email address.");
    valid = false;
  } else if (!email.validity.valid) {
    setError(email, "Please enter a valid email address.");
    valid = false;
  }

  if (!message.value.trim()) {
    setError(message, "Please enter a message.");
    valid = false;
  }

  return valid;
}

function loadRecaptcha() {
  if (!recaptchaLoadPromise) {
    recaptchaLoadPromise = (async () => {
      const response = await fetch(`${contactApiHost}/v3/recaptcha`);
      if (!response.ok) throw new Error("Could not load reCAPTCHA settings");

      const { siteKey } = await response.json();
      if (!siteKey) throw new Error("Missing reCAPTCHA site key");
      recaptchaSiteKey = siteKey;

      if (!window.grecaptcha?.execute) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
          script.async = true;
          script.defer = true;
          script.onload = () => window.grecaptcha.ready(resolve);
          script.onerror = reject;
          document.head.append(script);
        });
      }
    })().catch((error) => {
      recaptchaLoadPromise = undefined;
      throw error;
    });
  }

  return recaptchaLoadPromise;
}

function getFormMetadata() {
  const userAgent = navigator.userAgent;
  const browserName = /Edg\//.test(userAgent)
    ? "Microsoft Edge"
    : /Firefox\//.test(userAgent)
      ? "Firefox"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "Unknown";
  const deviceOs = /Windows/i.test(userAgent)
    ? "Windows"
    : /Mac OS X/i.test(userAgent)
      ? "MacOS"
      : /Android/i.test(userAgent)
        ? "Android"
        : /iPhone|iPad|iPod/i.test(userAgent)
          ? "iOS"
          : /Linux/i.test(userAgent)
            ? "Linux"
            : "Unknown";

  return {
    formIdentifier: "CONTACT_US",
    pathName: window.location.pathname,
    deviceType: /Mobi|Android/i.test(userAgent) ? "mobile" : "desktop",
    deviceOs,
    browserName,
  };
}

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateForm(contactForm)) {
    formStatus.textContent = "Please check the highlighted fields.";
    return;
  }

  const submitButton = contactForm.querySelector(".submit-button");
  const submitLabel = contactForm.querySelector("[data-submit-label]");

  submitButton.disabled = true;
  submitLabel.textContent = "Sending...";
  formStatus.textContent = "";

  try {
    await loadRecaptcha();
    const recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, {
      action: "formSubmit",
    });
    const phoneValue = contactForm.elements.phone.value.trim();
    const response = await fetch(contactEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({
        ...websiteDetails,
        domainName: "mavubevu.com",
        optedToSubscribe: false,
        locale: "en-US",
        metadata: getFormMetadata(),
        formData: [
          {
            label: "Name",
            value: contactForm.elements.name.value.trim(),
            keyName: "name",
          },
          {
            label: "Mobile Number",
            value: phoneValue.replace(/[+()-]/g, ""),
            keyName: "phone",
          },
          {
            label: "Email",
            value: contactForm.elements.email.value.trim(),
            replyTo: true,
            keyName: "email",
          },
          {
            label: "Message",
            value: contactForm.elements.message.value,
            keyName: "message",
          },
          {
            label: "_app_id",
            value: contactForm.elements._app_id.value,
          },
        ],
        recaptchaToken,
      }),
    });

    if (!response.ok) throw new Error("Contact request failed");

    contactForm.reset();
    formStatus.textContent = "Thanks for reaching out. We'll be in touch soon.";
  } catch {
    formStatus.textContent =
      "We couldn't send your message. Please try again shortly.";
  } finally {
    submitLabel.textContent = "Send";
    submitButton.disabled = false;
  }
});
