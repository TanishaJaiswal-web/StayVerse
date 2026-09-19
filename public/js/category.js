
const categoryBox = document.querySelector(".category-box");
const showCategory = document.querySelector("#category-inp");
const categoryInputWrapper = document.querySelector(".category-input-wrapper");

showCategory.addEventListener("click", () => {
    if (categoryBox.style.display !== "flex") {
        categoryInputWrapper.classList.add("active");
        categoryBox.style.display = "flex";
    } else {
        categoryInputWrapper.classList.remove("active");
        categoryBox.style.display = "none";
    }
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".category-section")) {
        categoryInputWrapper.classList.remove("active");
        categoryBox.style.display = "none";
    }
});

const checkboxes = document.querySelectorAll("#category input[type='checkbox']");
for (const checkbox of checkboxes) {

    checkbox.addEventListener("change", () => {

        const selectedCategories = [];

        for (const checkbox of checkboxes) {
            if (checkbox.checked) {
                selectedCategories.unshift(checkbox.value);
            }
        }

        showCategory.value = selectedCategories.join(", ");
    });

}







