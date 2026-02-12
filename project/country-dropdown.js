// country-dropdown.js
export function initCountryDropdown(countries, countryCodeSelect, phoneInput, phoneError) {
  countries.forEach(c => {
    const option = document.createElement("option");
    option.value = c.code;
    option.textContent = `${c.code} ${c.name}`;
    option.dataset.length = c.length;
    if (c.name === "India") { 
      option.selected = true; 
      phoneInput.maxLength = c.length; 
    }
    countryCodeSelect.appendChild(option);
  });

  countryCodeSelect.addEventListener("change", () => {
    const selectedOption = countryCodeSelect.options[countryCodeSelect.selectedIndex];
    phoneInput.value = "";
    phoneInput.maxLength = selectedOption.dataset.length;
    phoneError.textContent = "";
  });

  // ================================
  // 🔹 Auto-resize dropdown width
  // ================================
  const resizeSelect = () => {
    const selectedOption = countryCodeSelect.options[countryCodeSelect.selectedIndex];
    const temp = document.createElement("span");
    temp.style.visibility = "hidden";
    temp.style.whiteSpace = "nowrap";
    temp.style.font = getComputedStyle(countryCodeSelect).font;
    temp.textContent = selectedOption.textContent;

    document.body.appendChild(temp);
    countryCodeSelect.style.width = temp.offsetWidth + 30 + "px"; // extra padding
    document.body.removeChild(temp);
  };

  resizeSelect(); // on init
  countryCodeSelect.addEventListener("change", resizeSelect);
}
