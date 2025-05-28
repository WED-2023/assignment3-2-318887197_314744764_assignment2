const axios = require("axios");
const DButils = require("./DButils");
const e = require("express");
const api_domain = "https://api.spoonacular.com/recipes";

/**
 * Fetches full recipe information from the Spoonacular API by recipe ID.
 * Adds local likes from the database to the aggregateLikes field.
 * Formats the recipe object to match the local schema.
 * @param {string} recipe_id - The Spoonacular recipe ID
 * @returns {object} Formatted recipe object
 */
async function getRemoteRecipeInformation(recipe_id) {
    let recipe = await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
    recipe = recipe.data;

    // Format ingredients as [name, amount, unit]
    let formatted_ingredients = recipe.extendedIngredients.map(ingredient => [
        ingredient.name,
        ingredient.amount,
        ingredient.unit
    ]);

    // Get local likes for this remote recipe
    let local_likes = await DButils.execQuery(
        `SELECT COUNT(*) as count FROM Likes WHERE recipe_id='${recipe.id}' and isLocal=0`
    );
    local_likes = local_likes[0].count;

    // Build the formatted recipe object
    let formatted_recipe = {
        id: "S" + recipe.id,
        title: recipe.title,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        glutenFree: recipe.glutenFree,
        vegan: recipe.vegan,
        vegetarian: recipe.vegetarian,
        ingredients: formatted_ingredients,
        instructions: recipe.instructions,
        image: recipe.image,
        aggregateLikes: recipe.aggregateLikes + local_likes,
        family_creator: null,
        family_occasion: null,
        family_pictures: []
    }
    return formatted_recipe;
}

/**
 * Fetches full recipe information from the local database by recipe ID.
 * Adds local likes from the database.
 * Formats the recipe object to match the local schema.
 * @param {string} recipe_id - The local recipe ID (number)
 * @returns {object} Formatted recipe object
 */
async function getLocalRecipeInformation(recipe_id) {
    let recipe = await DButils.execQuery(
        `SELECT id, title, readyInMinutes, servings, glutenFree, vegan, vegetarian, ingredients, instructions, image, family_creator, family_occasion, family_pictures 
         FROM Recipes WHERE id='${recipe_id}'`
    );

        if (recipe.length == 0) {
        throw { status: 404, message: "Recipe not found" };
    }
    recipe = recipe[0];

    // Get local likes for this recipe
    let local_likes = await DButils.execQuery(
        `SELECT COUNT(*) as count FROM Likes WHERE recipe_id='${recipe.id}' and isLocal=1`
    );
    local_likes = local_likes[0].count;

    console.log("ingredients", recipe.ingredients);

    // Build the formatted recipe object
    recipe = {
        id: "L" + recipe.id,
        title: recipe.title,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        glutenFree: recipe.glutenFree,
        vegan: recipe.vegan,
        vegetarian: recipe.vegetarian,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        image: recipe.image,
        aggregateLikes: local_likes,
        family_creator: recipe.family_creator,
        family_occasion: recipe.family_occasion,
        family_pictures: recipe.family_pictures
    }
    return recipe;
}

/**
 * Returns a random selection of recipes from both the local database and the Spoonacular API.
 * Combines and shuffles the results, then returns the requested number.
 * @param {int} number - The total number of recipes to return
 * @returns {Array} Array of formatted recipe objects
 */
async function getRandomRecipe(number) {
    // Get the number of recipes in the local database
    let numberOfRecipesInLocal = await DButils.execQuery(
        `SELECT COUNT(*) as count FROM Recipes`
    );

    numberOfRecipesInLocal = numberOfRecipesInLocal[0].count;

    // Randomly decide how many to take from local
    let random = Math.floor(Math.random() * (Math.min(numberOfRecipesInLocal, number) + 1));

    // Get random local recipes with their like counts
    let local_recipes = await DButils.execQuery(
    `SELECT r.id, r.title, r.readyInMinutes, r.servings, r.glutenFree, r.vegan, r.vegetarian, r.ingredients, r.instructions, r.image, r.family_creator, r.family_occasion, r.family_pictures,
            COUNT(l.user_id) AS aggregateLikes
     FROM Recipes r
     LEFT JOIN Likes l ON r.id = l.recipe_id AND l.isLocal = 1
     GROUP BY r.id
     ORDER BY RAND()
     LIMIT ${random}`
    );

    // Format local recipes
    local_recipes = local_recipes.map(recipe => {
        return {
            id: "L" + recipe.id,
            title: recipe.title,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            glutenFree: recipe.glutenFree,
            vegan: recipe.vegan,
            vegetarian: recipe.vegetarian,
            ingredients: JSON.parse(recipe.ingredients),
            instructions: recipe.instructions,
            image: recipe.image,
            aggregateLikes: recipe.aggregateLikes || 0, // Handle cases where there are no likes
            family_creator: recipe.family_creator,
            family_occasion: recipe.family_occasion,
            family_pictures: JSON.parse(recipe.family_pictures)
        };
    });

    // Get the rest from Spoonacular API
    let remote_recipes = await axios.get(`${api_domain}/random`, {
        params: {
            number: number - random,
            apiKey: process.env.spooncular_apiKey
        }
    });

    remote_recipes = remote_recipes.data.recipes;

    // Collect all remote recipe IDs
    const remoteIds = remote_recipes.map(r => r.id);

    // Query Likes table for all these IDs at once
    let likesRows = [];
    if (remoteIds.length > 0) {
        likesRows = await DButils.execQuery(
            `SELECT recipe_id, COUNT(*) as count FROM Likes WHERE isLocal=0 AND recipe_id IN (${remoteIds.join(",")}) GROUP BY recipe_id`
        );
    }

    // Build a map of recipe_id -> likes count
    const likesMap = {};
    likesRows.forEach(row => {
        likesMap[row.recipe_id] = row.count;
    });

    // Attach likes to each recipe
    remote_recipes = remote_recipes.map(recipe => ({
        ...recipe,
        aggregateLikes: (recipe.aggregateLikes || 0) + (likesMap[recipe.id] || 0)
    }));

    // Format remote recipes
    remote_recipes = remote_recipes.map(recipe => {
        let formatted_ingredients = recipe.extendedIngredients.map(ingredient => [
            ingredient.name,
            ingredient.amount,
            ingredient.unit
        ]);
        return {
            id: "S" + recipe.id,
            title: recipe.title,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            glutenFree: recipe.glutenFree,
            vegan: recipe.vegan,
            vegetarian: recipe.vegetarian,
            ingredients: formatted_ingredients,
            instructions: recipe.instructions,
            image: recipe.image,
            aggregateLikes: recipe.aggregateLikes || 0, // Handle cases where there are no likes
            family_creator: null,
            family_occasion: null,
            family_pictures: []
        };
    });

    // Combine and shuffle
    let combined_recipes = local_recipes.concat(remote_recipes);
    combined_recipes.sort(() => Math.random() - 0.5);

    // Return the requested number of recipes
    return combined_recipes.slice(0, number);
}

/**
 * Searches for recipes using the Spoonacular API based on provided filters.
 * Returns an array of matching recipe IDs (prefixed with 'S').
 * @param {object} filters - Search filters (title, cuisine, diet, intolerances, amount)
 * @returns {Array} Array of recipe ID strings
 */
async function Search({ title, cuisine, diet, intolerances, amount }) {
    // Get the recipe IDs from the spooncular API based on the search parameters
    let response = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: title,
            cuisine: cuisine,
            diet: diet,
            intolerances: intolerances,
            number: amount,
            apiKey: process.env.spooncular_apiKey
        }
    });

    let recipeIds = response.data.results.map(recipe => "S" + recipe.id);
    return recipeIds;
}

// Export all utility functions
exports.getRemoteRecipeInformation = getRemoteRecipeInformation;
exports.getLocalRecipeInformation = getLocalRecipeInformation;
exports.getRandomRecipe = getRandomRecipe;
exports.Search = Search;



