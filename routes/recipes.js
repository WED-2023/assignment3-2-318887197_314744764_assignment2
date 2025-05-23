var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const { is } = require("express/lib/request");

// Debugging path
router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {

    let recipeId = req.params.recipeId;
    // Validate the recipeId parameter
    if (!valid_id(recipeId)) {
      return res.status(400).send({ error: "Invalid recipe ID" });
    }

    // Check if the recipe is local or from spoonacular
    const isLocal = recipeId.charAt(0) === 'L';

    // Remove the first character (L or S)
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
 * Helper function to check if the recipe id is valid
 */
function valid_id(recipe_id) {
  // Check if the recipe id is in the form L[1-9][0-9] or S[1-9][0-9]
  if (!recipe_id.match(/^[LS][1-9][0-9]*$/)) {
    return false;
  }
  return true;
}

module.exports = router;
