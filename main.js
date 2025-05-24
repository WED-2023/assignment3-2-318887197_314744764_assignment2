require("dotenv").config();
//#region express configures
var express = require("express");
var path = require("path");
var logger = require("morgan");
const session = require("client-sessions");
const DButils = require("./routes/utils/DButils");
var cors = require('cors')

// api key workaround
const fs = require('fs');

// Read API key from api-key.txt
const apiKeyPath = path.join(__dirname, 'api_key.txt');
if (fs.existsSync(apiKeyPath)) {
  process.env.spooncular_apiKey = fs.readFileSync(apiKeyPath, 'utf8').trim();
}

var app = express();
app.use(logger("dev")); //logger
app.use(express.json()); // parse application/json
app.use(
  session({
    cookieName: "session", // the cookie key name
    //secret: process.env.COOKIE_SECRET, // the encryption key
    secret: "template", // the encryption key
    duration: 24 * 60 * 60 * 1000, // expired after 20 sec
    activeDuration: 1000 * 60 * 10, // if expiresIn < activeDuration,
    cookie: {
      httpOnly: false,
    }
    //the session will be extended by activeDuration milliseconds
  })
);
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public"))); //To serve static files such as images, CSS files, and JavaScript files
//local:
app.use(express.static(path.join(__dirname, "dist")));
//remote:
// app.use(express.static(path.join(__dirname, '../assignment-3-3-frontend/dist')));

app.get("/",function(req,res)
{ 
  //remote: 
  // res.sendFile(path.join(__dirname, '../assignment-3-3-frontend/dist/index.html'));
  //local:
  res.sendFile(__dirname+"/index.html");

});

const corsConfig = {
  origin: true,
  credentials: true
};

app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

var port = process.env.PORT || "80"; //local=3000 remote=80
//#endregion
const user = require("./routes/user");
const recipes = require("./routes/recipes");
const auth = require("./routes/auth");


//#region cookie middleware
app.use(function (req, res, next) {
  if (req.session && req.session.id) {
    DButils.execQuery("SELECT id FROM users")
      .then((users) => {
        if (users.find((x) => x.id === req.session.id)) {
          req.id = req.session.id;
        }
        next();
      })
      .catch((error) => next());
  } else {
    next();
  }
});
//#endregion

// ----> For cheking that our server is alive - Debug
app.get("/alive", (req, res) => res.send("I'm alive"));

// Routings
app.use("/users", user);
app.use("/recipes", recipes);
app.use("/", auth);
// TODO add your routes here

// Default router
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).send({ message: err.message, success: false });
});

const server = app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});

process.on("SIGINT", function () {
  if (server) {
    server.close(() => console.log("server closed"));
  }
  process.exit();
});
