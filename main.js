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
  const email = form.elements.email;
  const message = form.elements.message;

  setError(name, "");
  setError(email, "");
  setError(message, "");

  if (!name.value.trim()) {
    setError(name, "Please enter your name.");
    valid = false;
  }

  if (!email.value.trim()) {
    setError(email, "Please enter your email address.");
    valid = false;
  } else if (!email.validity.valid) {
    setError(email, "Please enter a valid email address.");
    valid = false;
  }

  if (!message.value.trim()) {
    setError(message, "Please tell us a little about your project.");
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

  /*
   * Development placeholder.
   *
   * Replace this block with the final GoDaddy/server endpoint once the
   * client's hosting/form setup is confirmed.
   *
   * Example:
   * const response = await fetch("/contact.php", {
   *   method: "POST",
   *   body: new FormData(contactForm)
   * });
   */

  await new Promise((resolve) => setTimeout(resolve, 700));

  submitLabel.textContent = "Send enquiry →";
  submitButton.disabled = false;
  formStatus.textContent =
    "The form is ready for the production email endpoint. Please configure the hosting endpoint before launch.";
});
