const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id, islocal) {
    await DButils.execQuery(
  `INSERT INTO FavoriteRecipes (user_id, recipe_id, dt, isLocal) VALUES ('${user_id}', '${recipe_id}', NOW(), ${islocal})`
    );
}

async function getFavoriteRecipes(user_id){
    // sort by newest?
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function removeFavoriteRecipe(user_id, recipe_id, islocal) {
    await DButils.execQuery(`delete from FavoriteRecipes where user_id='${user_id}' and recipe_id=${recipe_id} and islocal=${islocal}`);
}

async function markAsWatched(user_id, recipe_id, islocal) {
    await DButils.execQuery(
  `INSERT INTO LastWatched (user_id, recipe_id, dt, isLocal) VALUES ('${user_id}', '${recipe_id}', NOW(), ${islocal})`
);
}

async function getLastWatched(user_id){
    // sort by newest?
    const recipes_id = await DButils.execQuery(`select recipe_id from LastWatched where user_id='${user_id}'`);
    return recipes_id;
}

async function removeLastWatched(user_id, recipe_id, islocal) {
    await DButils.execQuery(`delete from LastWatched where user_id='${user_id}' and recipe_id=${recipe_id} and islocal=${islocal}`);
}

async function markAsLiked(user_id, recipe_id, islocal) {
    await DButils.execQuery(
  `INSERT INTO Likes (user_id, recipe_id, dt, isLocal) VALUES ('${user_id}', '${recipe_id}', NOW(), ${islocal})`
);
}

async function getLikes(user_id){
    // sort by newest?
    const recipes_id = await DButils.execQuery(`select recipe_id from Likes where user_id='${user_id}'`);
    return recipes_id;
}

async function removeLike(user_id, recipe_id, islocal) {
    await DButils.execQuery(`delete from Likes where user_id='${user_id}' and recipe_id=${recipe_id} and islocal=${islocal}`);
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.removeFavoriteRecipe = removeFavoriteRecipe;
exports.markAsWatched = markAsWatched;
exports.getLastWatched = getLastWatched;
exports.removeLastWatched = removeLastWatched;
exports.markAsLiked = markAsLiked;
exports.getLikes = getLikes;
exports.removeLike = removeLike;

