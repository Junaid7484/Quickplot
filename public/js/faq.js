const faqButtons = document.querySelectorAll(".accordion-btn");

faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const answer = button.nextElementSibling;
    answer.classList.toggle("active");
  });
});
