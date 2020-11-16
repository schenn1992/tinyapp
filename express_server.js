const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const PORT = 8080; // default port 8080
const { response } = require("express");
const { generateRandomString, urlsForUser, getUserByEmail } = require("./helpers");
const bcrypt = require('bcrypt');
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
let users = {};

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//MY URLS PAGE
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const urls = urlsForUser(id, urlDatabase);
  const templateVars = { urls, user};
  if(!user) {
    res.status(403);
    res.send("Please log in first");
    return;
  }
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  let longURL = req.body.longURL;
  const userID = req.session.user_id;
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`urls/${shortURL}`);
});

//CREATE TINYURL PAGE
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    shortURL,
    longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

//DIRECT TO DESIGNATED PAGE
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//DELETE URL
app.post("/urls/:url/delete", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const shortURL = req.params.url;
  if (!user) {
    res.status(403);
    res.send("You must be logged in");
    return;
  }
  if (id !== urlDatabase[shortURL].userID) {
    res.status(403);
    res.send("You do not have permission to delete this URL");
    return;
  }
  delete urlDatabase[req.params.url];
  res.redirect("/urls");
});

//REGISTRATION PAGE
app.get("/register", (req, res) => {
  const templateVars = { user: ''};
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString(7);
  const saltRounds = 10;
  if (getUserByEmail(email, users)) {
    return res.status(400).send("this email already registered");
  }
  if (email === "" || password === "") {
    return res.status(400).send("400 error. Please enter valid email or password");
  }
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  users[id] = { id, email, password: hashedPassword };
  req.session.user_id = id;
  res.redirect("/urls");
});

//LOGIN PAGE
app.get("/login", (req, res) => {
  const templateVars = { user: req.session.user_id };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const receivedEmail = req.body.email;
  const receivedPassword = req.body.password;
  const user = getUserByEmail(receivedEmail , users);
  if (user && bcrypt.compareSync(receivedPassword, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    return res.status(403).send("403 error. Please enter valid email or password");
  }
});

//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const shortURL = req.params.shortURL;
  const receivedLongURL = req.body.newLongURL;
  if (!user) {
    res.status(403);
    res.send("You must be logged in");
    return;
  }
  if (id !== urlDatabase[shortURL].userID) {
    res.status(403);
    res.send("You do not have permission to edit this URL");
    return;
  }
  urlDatabase[shortURL].longURL = receivedLongURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





