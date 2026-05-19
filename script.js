const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
if (navToggle && navMenu) navToggle.addEventListener("click", () => navMenu.classList.toggle("open"));

window.addEventListener("load", () => {
  const loader = document.getElementById("pageLoader");
  if (loader) setTimeout(() => loader.classList.add("hidden"), 600);
});

const revealObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    }),
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

const contactForm = document.querySelector(".contact-form");
if (contactForm)
  contactForm.addEventListener("submit", () => {
    const method = (contactForm.getAttribute("method") || "GET").toUpperCase();
    const action = (contactForm.getAttribute("action") || "").trim();
    const isRemotePostForm = action.length > 0 && method === "POST";

    if (!isRemotePostForm) return;

    const button = contactForm.querySelector("button[type='submit']");
    if (button) {
      button.textContent = "Pošiljanje ...";
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
    }
  });
