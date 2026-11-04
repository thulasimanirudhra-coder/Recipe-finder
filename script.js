
// ========================================
// RECIPE FINDER - script.js
// ========================================

// API URL
const API_URL = "https://www.themealdb.com/api/json/v1/1";

// DOM Elements
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const recipeContainer = document.getElementById("recipeContainer");
const themeBtn = document.getElementById("themeBtn");
const randomBtn = document.getElementById("randomBtn");

// Local Storage
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// ========================================
// 1. SEARCH RECIPES
// ========================================

async function searchRecipes(query) {
    if (!query.trim()) {
        alert("Please enter a recipe name!");
        return;
    }

    try {
        recipeContainer.innerHTML = "<p>Loading recipes...</p>";

        const response = await fetch(
            `${API_URL}/search.php?s=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch recipes");
        }

        const data = await response.json();

        displayRecipes(data.meals || []);

    } catch (error) {
        console.error(error);
        recipeContainer.innerHTML =
            "<p>Something went wrong. Please try again.</p>";
    }
}

// Search button
if (searchBtn) {
    searchBtn.addEventListener("click", () => {
        searchRecipes(searchInput.value);
    });
}

// Enter key search
if (searchInput) {
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            searchRecipes(searchInput.value);
        }
    });
}

// ========================================
// 2. DISPLAY RECIPES
// ========================================

function displayRecipes(recipes) {
    if (!recipeContainer) return;

    recipeContainer.innerHTML = "";

    if (recipes.length === 0) {
        recipeContainer.innerHTML =
            "<p>No recipes found. Try another search.</p>";
        return;
    }

    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card";

        card.innerHTML = `
            <img
                src="${recipe.strMealThumb || ""}"
                alt="${recipe.strMeal}"
            >

            <div class="recipe-info">
                <h3>${recipe.strMeal}</h3>

                <p>${recipe.strCategory || "Recipe"}</p>

                <button class="view-btn">
                    View Recipe
                </button>

                <button class="favorite-btn">
                    ${favorites.some(item => item.idMeal === recipe.idMeal)
                        ? "❤️"
                        : "🤍"}
                </button>
            </div>
        `;

        card.querySelector(".view-btn").addEventListener("click", () => {
            displayRecipeDetails(recipe.idMeal);
        });

        card.querySelector(".favorite-btn").addEventListener("click", () => {
            addToFavorites(recipe);
        });

        recipeContainer.appendChild(card);
    });
}

// ========================================
// 3. RECIPE DETAILS
// ========================================

async function displayRecipeDetails(id) {
    try {
        const response = await fetch(`${API_URL}/lookup.php?i=${id}`);
        const data = await response.json();

        const recipe = data.meals?.[0];

        if (!recipe) return;

        saveRecentlyViewed(recipe);

        const ingredients = [];

        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];

            if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure || ""} ${ingredient}`);
            }
        }

        alert(
            `${recipe.strMeal}\n\nIngredients:\n${ingredients.join("\n")}\n\nInstructions:\n${recipe.strInstructions}`
        );

    } catch (error) {
        console.error("Recipe details error:", error);
    }
}

// ========================================
// 4. ADD TO FAVORITES
// ========================================

function addToFavorites(recipe) {
    const exists = favorites.some(
        item => item.idMeal === recipe.idMeal
    );

    if (exists) {
        favorites = favorites.filter(
            item => item.idMeal !== recipe.idMeal
        );

        showToast("Removed from Favorites");
    } else {
        favorites.push(recipe);
        showToast("Added to Favorites ❤️");
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));

    displayRecipes(window.currentRecipes || []);
}

// ========================================
// 5. RECENTLY VIEWED
// ========================================

function saveRecentlyViewed(recipe) {
    let recent = JSON.parse(
        localStorage.getItem("recentRecipes")
    ) || [];

    recent = recent.filter(
        item => item.idMeal !== recipe.idMeal
    );

    recent.unshift(recipe);

    recent = recent.slice(0, 10);

    localStorage.setItem(
        "recentRecipes",
        JSON.stringify(recent)
    );
}

// ========================================
// 6. SOUTH INDIAN RECIPES
// ========================================

async function loadSouthIndianRecipes() {
    const southIndianFoods = [
        "Dosa",
        "Idli",
        "Sambar",
        "Uttapam",
        "Rasam",
        "Appam"
    ];

    const allRecipes = [];

    try {
        for (const food of southIndianFoods) {
            const response = await fetch(
                `${API_URL}/search.php?s=${food}`
            );

            const data = await response.json();

            if (data.meals) {
                allRecipes.push(...data.meals);
            }
        }

        displayRecipes(allRecipes);

    } catch (error) {
        console.error("South Indian recipes error:", error);
    }
}

// ========================================
// 7. RANDOM RECIPE
// ========================================

async function getRandomRecipe() {
    try {
        const response = await fetch(`${API_URL}/random.php`);
        const data = await response.json();

        if (data.meals) {
            displayRecipes(data.meals);
        }

    } catch (error) {
        console.error("Random recipe error:", error);
    }
}

if (randomBtn) {
    randomBtn.addEventListener("click", getRandomRecipe);
}

// ========================================
// 8. DARK / LIGHT MODE
// ========================================

function toggleTheme() {
    document.body.classList.toggle("dark-mode");

    const theme = document.body.classList.contains("dark-mode")
        ? "dark"
        : "light";

    localStorage.setItem("theme", theme);
}

if (themeBtn) {
    themeBtn.addEventListener("click", toggleTheme);
}

// Restore saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}

// ========================================
// 9. TOAST MESSAGE
// ========================================

function showToast(message) {
    const toast = document.createElement("div");

    toast.className = "toast";
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2500);
}

// ========================================
// 10. LOAD DEFAULT RECIPES
// ========================================

async function loadDefaultRecipes() {
    try {
        const response = await fetch(
            `${API_URL}/search.php?s=chicken`
        );

        const data = await response.json();

        window.currentRecipes = data.meals || [];

        displayRecipes(window.currentRecipes);

    } catch (error) {
        console.error("Default recipes error:", error);
    }
}

loadDefaultRecipes();
