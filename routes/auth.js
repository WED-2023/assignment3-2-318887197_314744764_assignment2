var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");

/**
 * Register a new user.
 * - Checks if username already exists.
 * - Hashes the password.
 * - Inserts the new user into the database.
 */
router.post("/Register", async (req, res, next) => {
  try {
    // Gather user details from request body
    let user_details = {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      password: req.body.password,
      email: req.body.email,
      profilePic: req.body.profilePic
    }
    // Get all existing usernames
    let users = [];
    users = await DButils.execQuery("SELECT username from users");

    // Check if username is already taken
    if (users.find((x) => x.username === user_details.username))
      throw { status: 409, message: "Username taken" };

    // Hash the password
    let hash_password = bcrypt.hashSync(
      user_details.password,
      parseInt(process.env.bcrypt_saltRounds)
    );

    // Insert new user into the database
    await DButils.execQuery(
      `INSERT INTO users (username, firstname, lastname, country, password, email) VALUES ('${user_details.username}', '${user_details.firstname}', '${user_details.lastname}',
      '${user_details.country}', '${hash_password}', '${user_details.email}')`
    );
    res.status(201).send({ message: "user created", success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * Login a user.
 * - Checks if the username exists.
 * - Verifies the password.
 * - Sets the session id.
 */
router.post("/Login", async (req, res, next) => {
  try {
    // Check that username exists
    const users = await DButils.execQuery("SELECT username FROM users");
    if (!users.find((x) => x.username === req.body.username))
      throw { status: 401, message: "Username or Password incorrect" };

    // Get user details from database
    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE username = '${req.body.username}'`
      )
    )[0];

    // Check that the password is correct
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set session id for the user
    req.session.id = user.id;

    // Return success response
    res.status(200).send({ message: "login succeeded " , success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * Logout the current user.
 * - Resets the session.
 */
router.post("/Logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
});


/**
 * Get current user information.
 * Returns the logged-in user's profile details (username, firstname, lastname, country, email).
 * Requires authentication - user must be logged in with a valid session.
 * @route GET /me
 * @returns {Object} User profile information
 * @throws {401} If user is not authenticated (no valid session)
 * @throws {404} If user not found in database
 */
router.get("/me", async (req, res, next) => {
  try {
    // Check if user is logged in by verifying session contains user ID
    if (!req.session.id) {
      throw { status: 401, message: "Unauthorized" };
    }

    // Query database to get user profile information
    // Only return non-sensitive fields (excludes password, etc.)
    const user = (
      await DButils.execQuery(
        `SELECT username, firstname, lastname, country, email FROM users WHERE id = ${req.session.id}`
      )
    )[0];

    // Check if user exists in database
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    // Return user profile details
    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;