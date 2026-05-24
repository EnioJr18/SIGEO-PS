const toast = document.querySelector("#mapToast");
const pins = document.querySelectorAll(".pin");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");

pins.forEach((pin) => {
  pin.addEventListener("click", () => {
    toast.textContent = pin.dataset.project;
  });
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = searchInput.value.trim();
  toast.textContent = value ? `Buscando por: ${value}` : "Selecione um projeto no mapa";
  document.querySelector("#mapa").scrollIntoView({ behavior: "smooth", block: "start" });
});