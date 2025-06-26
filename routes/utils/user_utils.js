const DButils = require("./DButils");

<<<<<<< Updated upstream
async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
=======
/**
 * Mark a recipe as favorite for a user.
 * @param {number} user_id - The user's ID
 * @param {number} recipe_id - The recipe's ID
 * @param {boolean} islocal - True if the recipe is local, false if remote
 */
async function markAsFavorite(user_id, recipe_id, islocal) {
    await DButils.execQuery(
        `INSERT INTO FavoriteRecipes (user_id, recipe_id, dt, isLocal) 
         VALUES ('${user_id}', '${recipe_id}', NOW(), ${islocal})
         ON DUPLICATE KEY UPDATE dt = NOW()`
    );
>>>>>>> Stashed changes
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}


<<<<<<< Updated upstream

=======
/**
 * Mark a recipe as watched for a user.
 */
async function markAsWatched(user_id, recipe_id, islocal) {
    await DButils.execQuery(
        `INSERT INTO LastWatched (user_id, recipe_id, dt, isLocal) 
         VALUES ('${user_id}', '${recipe_id}', NOW(), ${islocal})
         ON DUPLICATE KEY UPDATE dt = NOW()`
    );
}

/**
 * Get all watched recipe IDs for a user, sorted by newest first.
 * Returns an array of strings with 'L' or 'S' prefix.
 */
async function getLastWatched(user_id){
    let recipes_id = await DButils.execQuery(`select recipe_id, isLocal from LastWatched where user_id='${user_id}' ORDER BY dt DESC`);
    
    // Convert the recipe_id to a string with 'L' or 'S' prefix, and remove isLocal property
    recipes_id = recipes_id.map(recipe => (recipe.isLocal ? 'L' : 'S') + recipe.recipe_id);
    
    return recipes_id;
}

/**
 * Remove a recipe from the user's watched list.
 */
async function removeLastWatched(user_id, recipe_id, islocal) {
    await DButils.execQuery(`delete from LastWatched where user_id='${user_id}' and recipe_id=${recipe_id} and islocal=${islocal}`);
}

/**
 * Mark a recipe as liked for a user.
 */
async function markAsLiked(user_id, recipe_id, islocal) {
    await DButils.execQuery(
        `INSERT INTO Likes (user_id, recipe_id, dt, isLocal) 
         VALUES ('${user_id}', '${recipe_id}', NOW(), ${islocal})
         ON DUPLICATE KEY UPDATE dt = NOW()`
    );
}

/**
 * Get all liked recipe IDs for a user, sorted by newest first.
 * Returns an array of strings with 'L' or 'S' prefix.
 */
async function getLikes(user_id){
    let recipes_id = await DButils.execQuery(`select recipe_id, isLocal from Likes where user_id='${user_id}' ORDER BY dt DESC`);
    
    // Convert the recipe_id to a string with 'L' or 'S' prefix
    recipes_id = recipes_id.map(recipe => (recipe.isLocal ? 'L' : 'S') + recipe.recipe_id);
    
    return recipes_id;
}

/**
 * Remove a recipe from the user's liked list.
 */
async function removeLike(user_id, recipe_id, islocal) {
    await DButils.execQuery(`delete from Likes where user_id='${user_id}' and recipe_id=${recipe_id} and islocal=${islocal}`);
}

/**
 * Get all non-family recipe IDs created by the user.
 * Returns an array of objects: { recipe_id: 'L123' }
 */
async function getMyRecipes(user_id) {
    // Fetch recipe ids created by the user and family creator is null
    let recipes = await DButils.execQuery(
        `SELECT id FROM Recipes WHERE family_creator IS NULL AND user_id='${user_id}'`
    );
    
    // Add 'L' prefix to each id
    recipes = recipes.map(recipe => {
        return { recipe_id: 'L' + recipe.id };
    });
    
    return recipes;
}

/**
 * Get all family recipe IDs created by the user.
 * Returns an array of objects: { recipe_id: 'L123' }
 */
async function getFamilyRecipes(user_id) {
    // Fetch recipe ids created by the user and family creator is not null
    let recipes = await DButils.execQuery(
        `SELECT id FROM Recipes WHERE family_creator IS NOT NULL AND user_id='${user_id}'`
    );
    
    // Add 'L' prefix to each recipe_id
    recipes = recipes.map(recipe => {
        return { recipe_id: 'L' + recipe.id };
    });
    
    return recipes;
}

/**
 * Add a new recipe to the Recipes table and return its new id.
 */
async function addRecipe(user_id, recipe) {
    // Insert a new recipe into the Recipes table and get its id
    const result = await DButils.execQuery(
        `INSERT INTO Recipes 
        (user_id, title, readyInMinutes, servings, glutenFree, vegan, vegetarian, ingredients, instructions, image, family_creator, family_occasion, family_pictures)
        VALUES (
            '${user_id}',
            '${recipe.title}',
            ${recipe.readyInMinutes},
            ${recipe.servings},
            ${recipe.glutenFree ? 1 : 0},
            ${recipe.vegan ? 1 : 0},
            ${recipe.vegetarian ? 1 : 0},
            '${JSON.stringify(recipe.ingredients)}',
            '${recipe.instructions.replace(/'/g, "''")}',
            '${recipe.image}',
            ${recipe.family_creator ? `'${recipe.family_creator}'` : 'NULL'},
            ${recipe.family_occasion ? `'${recipe.family_occasion}'` : 'NULL'},
            ${recipe.family_pictures ? `'${JSON.stringify(recipe.family_pictures)}'` : 'NULL'}
        )`
    );
    // Get the inserted id
    const idResult = await DButils.execQuery("SELECT LAST_INSERT_ID() as id");
    return idResult[0].id;
}

// Export all utility functions
>>>>>>> Stashed changes
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
