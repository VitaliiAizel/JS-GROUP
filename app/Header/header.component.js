const hamburgerButton = document.getElementById("hamburger-btn");
if (hamburgerButton) {
    hamburgerButton.addEventListener("click", () => {
        const ul = document.getElementById("header-ul");

        if (ul) {
            ul.classList.toggle("active");
            hamburgerButton.classList.toggle("active");
        }

    });
}