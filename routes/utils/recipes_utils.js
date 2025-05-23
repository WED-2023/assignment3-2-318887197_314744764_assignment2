const axios = require("axios");
const DButils = require("./DButils");
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

    // format the recipe
    recipe = {
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
        aggregateLikes: local_likes,
        family_creator: recipe.family_creator,
        family_occasion: recipe.family_occasion,
        family_pictures: JSON.parse(recipe.family_pictures)
    }
    return recipe;
}




exports.getRemoteRecipeInformation = getRemoteRecipeInformation;
exports.getLocalRecipeInformation = getLocalRecipeInformation;



