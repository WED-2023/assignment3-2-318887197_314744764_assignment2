const axios = require("axios");
const DButils = require("./DButils");
const e = require("express");
const api_domain = "https://api.spoonacular.com/recipes";

// get the recipe information from the spooncular API
async function getRemoteRecipeInformation(recipe_id) {
    let recipe = await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
    // format the recipe
    recipe = recipe.data;

    // Get the ingredients as a list of ("item", "amount", "measure") tuples
    let formatted_ingredients = recipe.extendedIngredients.map(ingredient => [
        ingredient.name,
        ingredient.amount,
        ingredient.unit
    ]);

    // Get the likes from the db
    let local_likes = await DButils.execQuery(
        `SELECT COUNT(*) as count FROM Likes WHERE recipe_id='${recipe.id}' and isLocal=0`
    );
    local_likes = local_likes[0].count;

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

// get the recipe information from the local database
async function getLocalRecipeInformation(recipe_id) {
    let recipe = await DButils.execQuery(
        `SELECT id, title, readyInMinutes, servings, glutenFree, vegan, vegetarian, ingredients, instructions, image, family_creator, family_occasion, family_pictures 
         FROM Recipes WHERE id='${recipe_id}'`
    );

        if (recipe.length == 0) {
        throw { status: 404, message: "Recipe not found" };
    }
    recipe = recipe[0];

    // Get the likes from the db
    let local_likes = await DButils.execQuery(
        `SELECT COUNT(*) as count FROM Likes WHERE recipe_id='${recipe.id}' and isLocal=1`
    );
    local_likes = local_likes[0].count;

    console.log("ingredients", recipe.ingredients);

    // format the recipe
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
 * This function returns a random number of recipes from the local database and the spooncular API.
 * It first gets a random number of recipes from the local database, then gets the rest from the spooncular API.
 * It returns an array of recipes, each recipe is an object with the following properties:
 * - id: the recipe id, prefixed with 'L' for local recipes and 'S' for spooncular recipes
 * - title: the recipe title
 * - readyInMinutes: the time it takes to prepare the recipe
 * - servings: the number of servings the recipe makes
 * - glutenFree: whether the recipe is gluten free
 * - vegan: whether the recipe is vegan
 * - vegetarian: whether the recipe is vegetarian
 * - ingredients: an array of ingredients, each ingredient is an array of [name, amount, unit]
 * - instructions: the instructions for preparing the recipe
 * - image: the URL of the recipe image
 * - aggregateLikes: the total number of likes for the recipe, including local and remote likes 
 * - family_creator: the creator of the recipe in the family
 * - family_occasion: the occasion for which the recipe was created in the family
 * @param {int} number 
 */
async function getRandomRecipe(number) {
    // Get the number of recipes in the local database
    let numberOfRecipesInLocal = await DButils.execQuery(
        `SELECT COUNT(*) as count FROM Recipes`
    );

    numberOfRecipesInLocal = numberOfRecipesInLocal[0].count;

    // Get a random number to try to get from the local database
    let random = Math.floor(Math.random() * (Math.min(numberOfRecipesInLocal, number) + 1));

    let local_recipes = await DButils.execQuery(
    `SELECT r.id, r.title, r.readyInMinutes, r.servings, r.glutenFree, r.vegan, r.vegetarian, r.ingredients, r.instructions, r.image, r.family_creator, r.family_occasion, r.family_pictures,
            COUNT(l.user_id) AS aggregateLikes
     FROM Recipes r
     LEFT JOIN Likes l ON r.id = l.recipe_id AND l.isLocal = 1
     GROUP BY r.id
     ORDER BY RAND()
     LIMIT ${random}`
    );

    // format the local recipes
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

    // Get number-random recipes from the spooncular API
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

    // Format the ingredients of the remote recipes
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

    // Combine local and remote recipes
    let combined_recipes = local_recipes.concat(remote_recipes);

    // Shuffle the combined recipes
    combined_recipes.sort(() => Math.random() - 0.5);

    // Return all recipes
    return combined_recipes.slice(0, number);
}

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


exports.getRemoteRecipeInformation = getRemoteRecipeInformation;
exports.getLocalRecipeInformation = getLocalRecipeInformation;
exports.getRandomRecipe = getRandomRecipe;
exports.Search = Search;



