const searchInput = document.getElementById("searchInput");
const searchOptionBox = document.getElementById("searchOptions");
const searchButton = document.querySelector(".search-btn");

// AJAX fetch function
async function updateListings(params) {
    const searchUrl = `/listings?${params.toString()}`;

    try {
        const response = await fetch(searchUrl, {
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        // Handle JSON response
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (data.redirect) {
                window.location.href = data.redirect;
                return;
            }
        }

        // Render only carfds/listings
        const partialHTML = await response.text();
        const container = document.getElementById("listings-container");
        
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

//  search
const performSearch = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryVal = searchInput ? searchInput.value.trim() : "";

    if (queryVal) {
        searchParams.set("query", queryVal);
    } else {
        searchParams.delete("query");
    }
    updateListings(searchParams);
};

// Search button click handler
if (searchButton) {
    searchButton.addEventListener("click", (e) => {
        e.preventDefault();
        performSearch();
    });
}

// Display search option box on focus
searchInput?.addEventListener("focus", () => {
    searchOptionBox.style.display = "block";
});

// Hide search option box when clicking outside
document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-wrapper")) {
        searchOptionBox.style.display = "none";
    }
});

// Static Search Options Auto-Search
const searchOptions = document.getElementsByClassName("search-option");
for (const option of searchOptions) {
    option.addEventListener("click", () => {
        const strongText = option.querySelector("strong")?.innerText || "";
        const smallText = option.querySelector("small")?.innerText || "";

        searchInput.value = smallText ? `${strongText}, ${smallText}` : strongText;
        searchOptionBox.style.display = "none";
        performSearch();
    });
}

//  Autocomplete Auto-Search
searchInput?.addEventListener("input", async () => {
    const query = searchInput.value.trim();

    if (query.length <= 2) {
        searchOptionBox.style.display = "none";
        return;
    }

    try {
        const result = await maptilerClient.geocoding.forward(query, {
            autocomplete: true,
            limit: 5
        });

        searchOptionBox.innerHTML = "";
        searchOptionBox.style.display = "none";

        if (result.features && result.features.length > 0) {
            searchOptionBox.style.display = "block";

            result.features.forEach((feature) => {
                const option = document.createElement("div");
                option.className = "search-option";

                option.innerHTML = `
                    <i class="fa-solid fa-location-dot"></i>
                    <div>
                        <strong>${feature.text || "Popular destinations"}</strong>
                        <small>${feature.place_name || "Explore popular stays"}</small>
                    </div>
                `;

                option.addEventListener("click", () => {
                    searchInput.value = feature.place_name || feature.text;
                    searchOptionBox.style.display = "none";
                    performSearch();
                });

                searchOptionBox.appendChild(option);
            });
        }
    } catch (error) {
        searchOptionBox.innerHTML = "";
        searchOptionBox.style.display = "none";
    }
});

const filters = document.querySelectorAll(".filter");

filters.forEach((filter) => {
    const categoryName = filter.querySelector("p").innerText.trim();
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

        urlParams.delete("category");
        selectedCategories.forEach(cat => urlParams.append("category", cat));
        updateListings(urlParams);
    });
});