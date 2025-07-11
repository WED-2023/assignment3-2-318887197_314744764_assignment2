var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const { is } = require("express/lib/request");

// Debugging path to check if the router is working
router.get("/", (req, res) => res.send("im here"));


/**
 * Get recipe information by ID.
 * Looks for the recipe with the given id in the local or remote database.
 * L for local recipes and S for remote recipes.
 * Example:
 * - L1 for local recipe with id 1
 * - S123 for remote recipe with id 123
 * @returns {Object} recipe - The recipe object containing details about the recipe
 */
router.get("/info", async (req, res, next) => {
  try {
    let recipeId = req.query.recipeId;
    // Validate the recipeId parameter
    if (!valid_id(recipeId)) {
      return res.status(400).send({ error: "Invalid recipe ID" });
    }

    // Check if the recipe is local or from spoonacular
    const isLocal = recipeId.charAt(0) === 'L';

    // Remove the first character (L or S) to get the numeric id
    const recipe_id = recipeId.substring(1);
    let recipe;
    if (isLocal) {
      // Get the recipe details from local database
      recipe = await recipes_utils.getLocalRecipeInformation(recipe_id);
    } else {
      // Get the recipe details from Spoonacular API
      recipe = await recipes_utils.getRemoteRecipeInformation(recipe_id);
    }
    res.status(200).send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a list of random recipes.
 * @Param {int} number - The number of recipes to return (default 3)
 */
router.get("/random", async (req, res, next) => {
  try {
    // Get the 'number' parameter from the query string, default to 3 if not provided
    const number = parseInt(req.query.number) || 3;
    if (isNaN(number) || number < 1) {
      return res.status(400).send({ error: "Invalid number parameter" });
    }
    console.log("Fetching", number, "random recipes");
    // Get random recipes
    const recipes = await recipes_utils.getRandomRecipe(number);
    if (!recipes || recipes.length === 0) {
      return res.status(404).send({ error: "No recipes found" });
    }
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * Search for recipes using filters.
 * Accepts search parameters in the request body and returns matching recipe IDs.
 */
router.post("/Search", async (req, res, next) => {
  try {
    // Get search parameters from the request body
    const { title, cuisine, diet, intolerances, amount } = req.body;

    // Call the search function in recipes_utils.js
    const recipeIds = await recipes_utils.Search({ title, cuisine, diet, intolerances, amount });

    // Return the array of matching recipe IDs
    res.status(200).send(recipeIds);
  } catch (error) {
    next(error);
  }
});


/**
 * Helper function to check if the recipe id is valid.
 * Valid IDs are in the form L[1-9][0-9]* or S[1-9][0-9]*
 * @param {string} recipe_id
 * @returns {boolean}
 */
function valid_id(recipe_id) {
  if (!recipe_id || typeof recipe_id !== 'string') {
    return false;
  }
  // Check if the recipe id is in the form L[1-9][0-9] or S[1-9][0-9]
  if (!recipe_id.match(/^[LS][1-9][0-9]*$/)) {
    return false;
  }
  return true;
}

module.exports = router;
