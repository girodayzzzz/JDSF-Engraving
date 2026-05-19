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

document.querySelectorAll(".contact-form").forEach((form) => {
  form.addEventListener("submit", () => {
    const action = form.getAttribute("action");
    const method = (form.getAttribute("method") || "GET").toUpperCase();
    const isRemotePost = action && method === "POST";
    if (!isRemotePost) return;

    const button = form.querySelector("button[type='submit']");
    if (button) {
      button.textContent = "Pošiljanje ...";
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
    }
  });
});
