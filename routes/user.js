var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");
const { is } = require("express/lib/request");

// TODO fix commnets to make sense
// TODO split to more files?

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
})

/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req, res, next) => {
  try{
    // Check if the recipe id is in the form L[1-9][0-9] or S[1-9][0-9]
    let recipeId = req.body.recipeId;
    if (!valid_id(recipeId)) {
      return res.status(400).send("Invalid recipe id");
    }
    // Check if the recipe is local or from spoonacular
    const islocal = recipeId.charAt(0) == 'L' ? true : false;

    // Remove the first character (L or S)
    const recipe_id = recipeId.substring(1);

    const user_id = req.session.user_id;
    await user_utils.markAsFavorite(user_id, recipe_id, islocal);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
// TODO - check this later mybe sort
router.get('/favorites', async (req, res, next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
})

/**
 * Remove a recipe from the favorites list of the logged-in user
 */
router.delete('/favorites', async (req, res, next) => {
  try{
    let recipeId = req.body.recipeId;
    if (!valid_id(recipeId)) {
      return res.status(400).send("Invalid recipe id");
    }

    // Check if the recipe is local or from spoonacular
    const islocal = recipeId.charAt(0) == 'L' ? true : false;

    // Remove the first character (L or S)
    const recipe_id = recipeId.substring(1);
    const user_id = req.session.user_id; 

    await user_utils.removeFavoriteRecipe(user_id, recipe_id, islocal);
    res.status(200).send("The Recipe successfully removed from favorites");
  } catch(error){
    next(error);
  } 
})

/**
 * 
 */
router.post('/watched', async (req, res, next) => {
  try{
    // Check if the recipe id is in the form L[1-9][0-9] or S[1-9][0-9]
    let recipeId = req.body.recipeId;
    if (!valid_id(recipeId)) {
      return res.status(400).send("Invalid recipe id");
    }
    // Check if the recipe is local or from spoonacular
    const islocal = recipeId.charAt(0) == 'L' ? true : false;

    // Remove the first character (L or S)
    const recipe_id = recipeId.substring(1);
    const user_id = req.session.user_id;
    await user_utils.markAsWatched(user_id, recipe_id, islocal);
    res.status(200).send("The Recipe successfully saved as watched");
  } catch(error){
    next(error);
  }
}
)

// TODO - check this later mybe sort
router.get('/watched', async (req, res, next) => {
  try{
    const user_id = req.session.user_id;
    let watched_recipes = {};
    const recipes_id = await user_utils.getLastWatched(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
})

router.delete('/watched', async (req, res, next) => {
  try{
    let recipeId = req.body.recipeId;
    if (!valid_id(recipeId)) {
      return res.status(400).send("Invalid recipe id");
    }

    // Check if the recipe is local or from spoonacular
    const islocal = recipeId.charAt(0) == 'L' ? true : false;

    // Remove the first character (L or S)
    const recipe_id = recipeId.substring(1);
    const user_id = req.session.user_id; 

    await user_utils.removeLastWatched(user_id, recipe_id, islocal);
    res.status(200).send("The Recipe successfully removed from watched");
  } catch(error){
    next(error);
  } 
})

router.post('/likes', async (req, res, next) => {
  try{
    // Check if the recipe id is in the form L[1-9][0-9] or S[1-9][0-9]
    let recipeId = req.body.recipeId;
    if (!valid_id(recipeId)) {
      return res.status(400).send("Invalid recipe id");
    }
    // Check if the recipe is local or from spoonacular
    const islocal = recipeId.charAt(0) == 'L' ? true : false;

    // Remove the first character (L or S)
    const recipe_id = recipeId.substring(1);
    const user_id = req.session.user_id;
    await user_utils.markAsLiked(user_id, recipe_id, islocal);
    res.status(200).send("The Recipe successfully saved as liked");
  } catch(error){
    next(error);
  }
})

router.get('/likes', async (req, res, next) => {
  try{
    const user_id = req.session.user_id;
    let liked_recipes = {};
    const recipes_id = await user_utils.getLikes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
})

router.delete('/likes', async (req, res, next) => {
  try{
    let recipeId = req.body.recipeId;
    if (!valid_id(recipeId)) {
      return res.status(400).send("Invalid recipe id");
    }

    // Check if the recipe is local or from spoonacular
    const islocal = recipeId.charAt(0) == 'L' ? true : false;

    // Remove the first character (L or S)
    const recipe_id = recipeId.substring(1);
    const user_id = req.session.user_id; 

    await user_utils.removeLike(user_id, recipe_id, islocal);
    res.status(200).send("The Recipe successfully removed from likes");
  } catch(error){
    next(error);
  } 
})



/**
 * Create a new Family recipe
 */
// dunno what liel added here, change this
router.post('/FullFamilyRecipe', async (req, res, next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.addFamilyRecipe(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as family recipe");
  } catch(error){
    next(error);
  }
}
)

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
