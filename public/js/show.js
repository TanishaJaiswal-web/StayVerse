
// Delete Modal Functions
const popUp = document.querySelector(".pop-up");

function showPopUp() {
    if (popUp) popUp.style.display = "flex";
}

function closePopUp() {
    if (popUp) popUp.style.display = "none";
}

// Wishlist Functionality
const wishlistIcon = document.querySelector(".heart-overlay i");
const toolTip = document.querySelector(".heart-overlay .tool-tip");




    wishlistIcon.addEventListener("click", async () => {
        const wasRegular = wishlistIcon.classList.contains("fa-regular");
        try {
            // Send Request to Express Controller
            const response = await fetch(`/listings/${listing._id}/wishlist`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                     "X-Requested-With": "XMLHttpRequest", 
                }
            });

             if (response.status === 401) {
            const data = await response.json();

         window.location.href = data.redirectUrl || "/login";

              
            return;
        }

            const data = await response.json();

            if (data && data.success) {

                toggleWishlistUI(data.isWishlisted);
            } else {
              
               console.log(data.message)
            }

        } catch (err) {
            console.error("Wishlist request failed:", err);

        }
    });


// Helper to handle icon and tooltip state changes
function toggleWishlistUI(isWishlisted) {
    if (isWishlisted) {
        wishlistIcon.classList.remove("fa-regular");
        wishlistIcon.classList.add("fa-solid");
        toolTip.innerText = "Added to Wishlist";
    } else {
        wishlistIcon.classList.remove("fa-solid");
        wishlistIcon.classList.add("fa-regular");
        toolTip.innerText = "Add to Wishlist";
    }
}

