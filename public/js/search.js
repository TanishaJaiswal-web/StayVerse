const searchInput = document.getElementById("searchInput");
const searchOptionBox = document.getElementById("searchOptions");
const searchButton = document.querySelector(".search-btn");
const flashContainer = document.getElementById("flash-container");

// AJAX fetch function
async function updateListings(params) {
    const searchUrl = `/listings?${params.toString()}`;
    console.log("Request URL:", searchUrl);

    try {
        const response = await fetch(searchUrl, {
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        const contentType = response.headers.get("content-type") || "";
        const container = document.getElementById("listings-container");

        if (contentType.includes("application/json")) {
            const data = await response.json();

          
            if (!data.success) {
                // Display flash message
                showFlashMessage(data.message);

                // Clear old listings from the container on no results
                if (container) {
                    container.innerHTML = "";
                }

                // Update URL even when no results are found
                window.history.pushState({}, "", searchUrl);
                return;
            }
        }

        // If successful HTML response, clear flash messages
        if (flashContainer) {
            flashContainer.innerHTML = "";
        }

        const partialHTML = await response.text();

        if (container) {
            container.innerHTML = partialHTML;
            window.history.pushState({}, "", searchUrl);
        } else {
            console.error("Container #listings-container not found in DOM");
        }

    } catch (error) {
        console.error("Error updating listings:", error);
    }
}

// Perform search while preserving active filters
const performSearch = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryVal = searchInput ? searchInput.value.trim() : "";

    if (queryVal) {
        searchParams.set("query", queryVal);
    } else {
        searchParams.delete("query");
    }

    if (searchOptionBox) {
        searchOptionBox.style.display = "none";
    }

    updateListings(searchParams);
};

// 1. Search button click handler
if (searchButton) {
    searchButton.addEventListener("click", (e) => {
        e.preventDefault();
        performSearch();
    });
}

// 2. Handle Enter key inside search input
if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            performSearch();
        }
    });

    searchInput.addEventListener("focus", () => {
        if (searchOptionBox && searchOptionBox.children.length > 0) {
            searchOptionBox.style.display = "block";
        }
    });
}

// 3. Event Delegation for Search Options
if (searchOptionBox) {
    searchOptionBox.addEventListener("click", (e) => {
        const option = e.target.closest(".search-option");
        if (!option) return;

        const strongText = option.querySelector("strong")?.innerText || "";
        const smallText = option.querySelector("small")?.innerText || "";
        const selectedValue = option.dataset.value || (smallText ? `${strongText}, ${smallText}` : strongText);

        if (searchInput) {
            searchInput.value = selectedValue;
        }

        searchOptionBox.style.display = "none";
        performSearch();
    });
}

// Hide search option box when clicking outside
document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-wrapper")) {
        if (searchOptionBox) {
            searchOptionBox.style.display = "none";
        }
    }
});

// Autocomplete Auto-Search via MapTiler
searchInput?.addEventListener("input", async () => {
    const query = searchInput.value.trim();

    if (query.length <= 2) {
        if (searchOptionBox) {
            searchOptionBox.style.display = "none";
        }
        return;
    }

    try {
        const result = await maptilerClient.geocoding.forward(query, {
            autocomplete: true,
            limit: 5
        });

        if (!searchOptionBox) return;

        searchOptionBox.innerHTML = "";

        if (result.features && result.features.length > 0) {
            searchOptionBox.style.display = "block";

            result.features.forEach((feature) => {
                const option = document.createElement("div");
                option.className = "search-option";

                const mainText = feature.text || "Popular destinations";
                const subText = feature.place_name || "Explore popular stays";
                option.dataset.value = feature.place_name || feature.text || "";

                option.innerHTML = `
                    <i class="fa-solid fa-location-dot"></i>
                    <div>
                        <strong>${mainText}</strong>
                        <small>${subText}</small>
                    </div>
                `;

                searchOptionBox.appendChild(option);
            });
        } else {
            searchOptionBox.style.display = "none";
        }

    } catch (error) {
        console.error("Autocomplete error:", error);
        if (searchOptionBox) {
            searchOptionBox.innerHTML = "";
            searchOptionBox.style.display = "none";
        }
    }
});

// Category Filters logic
const filters = document.querySelectorAll(".filter");

filters.forEach((filter) => {
    const categoryElement = filter.querySelector("p");
    if (!categoryElement) return;

    const categoryName = categoryElement.innerText.trim();
    const initialParams = new URLSearchParams(window.location.search);

    if (initialParams.getAll("category").includes(categoryName)) {
        filter.classList.add("filter-selected");
    }

    filter.addEventListener("click", () => {
        const urlParams = new URLSearchParams(window.location.search);
        let selectedCategories = urlParams.getAll("category");

        if (selectedCategories.includes(categoryName)) {
            selectedCategories = selectedCategories.filter(cat => cat !== categoryName);
            filter.classList.remove("filter-selected");
        } else {
            selectedCategories.push(categoryName);
            filter.classList.add("filter-selected");
        }

        // Maintain active search input term when clicking filters
        if (searchInput && searchInput.value.trim()) {
            urlParams.set("query", searchInput.value.trim());
        }

        urlParams.delete("category");
        selectedCategories.forEach(cat => urlParams.append("category", cat));

        updateListings(urlParams);
    });
});

// Flash Message helper
function showFlashMessage(message) {
    if (!flashContainer) return;

    flashContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show col-6 offset-3 w-50 mt-2" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}