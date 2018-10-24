require("dotenv").config();
const express = require("express");
const session = require("express-session");
const app = express();
const port = 3001;
const passport = require("passport");
const AuthStrategy = require("passport-auth0");
const { DOMAIN, CLIENT_ID, CLIENT_SECRET, SESSION_SECRET } = process.env;
const students = require("./students.json");

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new AuthStrategy(
    {
      domain: DOMAIN,
      clientID: CLIENT_ID, // <---- potential casing error
      clientSecret: CLIENT_SECRET,
      callbackURL: "/login", // <---- potential casing error
      scope: "openid email profile"
    },
    (authToken, refreshToken, extraParams, profile, done) => done(null, profile)
  )
);

passport.serializeUser((user, done) =>
  done(null, {
    clientID: user.id,
    email: user._json.email,
    name: user._json.name
  })
);
passport.deserializeUser((obj, done) => done(null, obj));

//actual landing point
app.get(
  "/login",
  passport.authenticate("auth0", {
    successRedirect: "/students",
    failureRedirect: "/login",
    connection: "github"
  })
);

function authenticated(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
}

app.get("/students", authenticated, (req, res, next) => {
  res.status(200).send(students);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
