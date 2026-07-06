const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobileMenu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const quoteCount = document.querySelector("[data-quote-count]");
const quoteButtons = document.querySelectorAll("[data-add-quote]");
let quoteItems = Number(quoteCount?.textContent || 2);

quoteButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    quoteItems += 1;
    if (quoteCount) quoteCount.textContent = String(quoteItems);
    button.animate(
      [{ transform: "scale(1)" }, { transform: "scale(.94)" }, { transform: "scale(1)" }],
      { duration: 220, easing: "cubic-bezier(.22, 1, .36, 1)" }
    );
  });
});
