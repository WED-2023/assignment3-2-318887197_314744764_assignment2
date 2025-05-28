var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");
const { is } = require("express/lib/request");

// Middleware to authenticate all incoming requests
router.use(async function (req, res, next) {
  console.log("Checking authentication for user:", req.session.id);
  if (req.session && req.session.id) {
    DButils.execQuery("SELECT id FROM users").then((users) => {
      if (users.find((x) => x.id === req.session.id)) {
        req.id = req.session.id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
})

/**
 * Add a recipe to the favorites list of the logged-in user.
 * Expects { recipeId } in the body.
 */
router.post('/favorites', async (req, res, next) => {
  try{
    // Validate recipe id format
    let recipeId = req.body.recipeId;
    if (!valid_id(recipeId)) {
      return res.status(400).send("Invalid recipe id");
    }
    // Determine if recipe is local or remote
    const islocal = recipeId.charAt(0) == 'L' ? true : false;

    // Remove prefix to get numeric id
    const recipe_id = recipeId.substring(1);

    const id = req.session.id;
    await user_utils.markAsFavorite(id, recipe_id, islocal);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * Get all favorite recipe IDs for the logged-in user.
 */
router.get('/favorites', async (req, res, next) => {
  try{
    const id = req.session.id;
    const recipes_id = await user_utils.getFavoriteRecipes(id);
     res.status(200).send(recipes_id);
  } catch(error){
    next(error); 
  }
})

/**
 * Remove a recipe from the favorites list of the logged-in user.
 * Expects { recipeId } in the body.
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
    const id = req.session.id; 

    await user_utils.removeFavoriteRecipe(id, recipe_id, islocal);
    res.status(200).send("The Recipe successfully removed from favorites");
  } catch(error){
    next(error);
  } 
})

/**
 * Add a recipe to the watched list of the logged-in user.
 * Expects { recipeId } in the body.
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
    const id = req.session.id;
    await user_utils.markAsWatched(id, recipe_id, islocal);
    res.status(200).send("The Recipe successfully saved as watched");
  } catch(error){
    next(error);
  }
}
)

/**
 * Get all watched recipe IDs for the logged-in user.
 */
router.get('/watched', async (req, res, next) => {
  try{
    const id = req.session.id;
    const recipes_id = await user_utils.getLastWatched(id);
     res.status(200).send(recipes_id);
  } catch(error){
    next(error); 
  }
})

/**
 * Remove a recipe from the watched list of the logged-in user.
 * Expects { recipeId } in the body.
 */
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
    const id = req.session.id; 

    await user_utils.removeLastWatched(id, recipe_id, islocal);
    res.status(200).send("The Recipe successfully removed from watched");
  } catch(error){
    next(error);
  } 
})

/**
 * Add a recipe to the liked list of the logged-in user.
 * Expects { recipeId } in the body.
 */
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
    const id = req.session.id;
    await user_utils.markAsLiked(id, recipe_id, islocal);
    res.status(200).send("The Recipe successfully saved as liked");
  } catch(error){
    next(error);
  }
})

/**
 * Get all liked recipe IDs for the logged-in user.
 */
router.get('/likes', async (req, res, next) => {
  try{
    const id = req.session.id;
    const recipes_id = await user_utils.getLikes(id);
     res.status(200).send(recipes_id);
  } catch(error){
    next(error); 
  }
})

/**
 * Remove a recipe from the liked list of the logged-in user.
 * Expects { recipeId } in the body.
 */
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
    const id = req.session.id; 

    await user_utils.removeLike(id, recipe_id, islocal);
    res.status(200).send("The Recipe successfully removed from likes");
  } catch(error){
    next(error);
  } 
})

/**
 * Get my recipe ids that are not family recipes (created by the logged-in user).
 */
router.get('/myRecipes', async (req, res, next) => {
  try{
    const id = req.session.id;
    const recipes_id = await user_utils.getMyRecipes(id);
     res.status(200).send(recipes_id);
  } catch(error){
    next(error); 
  }
})

/**
 * Add a new recipe created by the logged-in user.
 * Expects { recipe } in the body.
 */
router.post('/myRecipes', async (req, res, next) => {
  try{
    // save the recipe in the db
    const id = req.session.id;
    const recipe = req.body.recipe;
    if (!recipe) {
      return res.status(400).send("Invalid recipe data");
    }

    // Send the recipe to the user_utils function to save it
    let recipe_id = await user_utils.addRecipe(id, recipe);

    // Send the recipe id back to the client
    res.status(200).send({ recipeId: "L" + recipe_id });

  } catch(error){
    next(error);
  }})
  
/**
 * Get all family recipe ids created by the logged-in user.
 */
router.get('/myFamilyRecipes', async (req, res, next) => {
  try{
    const id = req.session.id;
    const recipes_id = await user_utils.getFamilyRecipes(id);
     res.status(200).send(recipes_id);
  } catch(error){
    next(error); 
  }
})

/**
 * Helper function to check if the recipe id is valid.
 * Valid IDs are in the form L[1-9][0-9]* or S[1-9][0-9]*
 */
function valid_id(recipe_id) {
  // Check if the recipe id is in the form L[1-9][0-9] or S[1-9][0-9]
  if (!recipe_id.match(/^[LS][1-9][0-9]*$/)) {
    return false;
  }
  return true;
}

module.exports = router;
