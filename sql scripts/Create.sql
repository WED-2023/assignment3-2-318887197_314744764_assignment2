-- Active: 1747986818466@@127.0.0.1@3306@mydb
CREATE TABLE `users` (
    `id` int NOT NULL AUTO_INCREMENT,
    `username` varchar(255) NOT NULL,
    `firstname` varchar(100) NOT NULL,
    `lastname` varchar(100) NOT NULL,
    `country` varchar(100) NOT NULL,
    `password` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
)

CREATE TABLE `Recipes` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `title` varchar(255) NOT NULL,
    `readyInMinutes` int NOT NULL,
    `servings` int NOT NULL,
    `glutenFree` BOOLEAN NOT NULL,
    `vegan` BOOLEAN NOT NULL,
    `vegetarian` BOOLEAN NOT NULL,
    `ingredients` JSON NOT NULL,
    `instructions` TEXT NOT NULL,
    `image` varchar(255) NOT NULL,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `family_creator` varchar(255),
    `family_occasion` varchar(255),
    `family_pictures` JSON,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
)

CREATE TABLE `LastWatched` (
    `user_id` int NOT NULL,
    `recipe_id` int NOT NULL,
    `dt` datetime NOT NULL,
    `isLocal` BOOLEAN NOT NULL,
    PRIMARY KEY (`user_id`, `recipe_id`, `isLocal`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) 

CREATE TABLE `FavoriteRecipes` (
    `user_id` int NOT NULL,
    `recipe_id` int NOT NULL,
    `dt` datetime NOT NULL,
    `isLocal` BOOLEAN NOT NULL,
    PRIMARY KEY (`user_id`, `recipe_id`, `isLocal`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
)

CREATE TABLE `Likes` (
    `user_id` int NOT NULL,
    `recipe_id` int NOT NULL,
    `dt` datetime NOT NULL,
    `isLocal` BOOLEAN NOT NULL,
    PRIMARY KEY (`user_id`, `recipe_id`, `isLocal`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
)