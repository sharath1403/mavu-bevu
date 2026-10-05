const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");
const mobileLinks = mobileMenu?.querySelectorAll("a") ?? [];
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");


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
    const formData = Object.fromEntries(new FormData(contactForm).entries());

    // Honeypot: real users never see or fill this field.
    if (formData.website) {
      formStatus.textContent = "Thanks for reaching out.";
      return;
    }

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.error || "We couldn't send your message. Please try again."
      );
    }

    contactForm.reset();
    formStatus.textContent =
      "Thanks for reaching out. We'll be in touch soon.";
  } catch (error) {
    console.error("Contact form error:", error);
    formStatus.textContent =
      error.message || "We couldn't send your message. Please try again shortly.";
  } finally {
    submitLabel.textContent = "Send →";
    submitButton.disabled = false;
  }
});
