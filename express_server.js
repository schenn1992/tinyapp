// Passing form data in a request
// Passing template variables to .ejs
// Setting the cookie and understanding you can access it in all subsequent requests (console.log(req.cookies))) 

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
const { response } = require("express");
const { generateRandomString } = require("./helpers");

const app = express();

const getUserByEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

let users = {};

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
  const id = req.cookies.user_id;
  const user = users[id];
  console.log(user)
  console.log("id:", id);
  const templateVars = { urls: urlDatabase, user};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase); 
  res.redirect(`urls/${shortURL}`);         
});

//CREATE TINYURL PAGE
app.get("/urls/new", (req, res) => {
  console.log("user: ", users[req.cookies.user_id])
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

//DIRECT TO DESIGNATED PAGE
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = "https://" + urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//DELETE URL
app.post("/urls/:url/delete", (req, res) => {
  delete urlDatabase[req.params.url]; 
  res.redirect("/urls");
});

//REGISTRATION PAGE
app.get("/register", (req, res) => {
  const templateVars = { user: ''} 
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString(7);
  if (getUserByEmail(email, users)) {
    return res.status(400).send("this email already registered");
  };
  users[id] = { id, email, password };
  if (email === "" || password === "") {
    return res.status(400).send("400 error. Please enter valid email or password");
  };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

//LOGIN PAGE
app.get("/login", (req, res) => {
  const templateVars = { user: req.cookies.user_id };
  console.log(req.cookies);
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const receivedEmail = req.body.email;
  const receivedPassword = req.body.password;
  const user = getUserByEmail(receivedEmail, users);
  console.log(user);
  if(user && user.password === receivedPassword) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    return res.status(403).send("403 error. Please enter valid email or password");
  }
});

//LOGOUT 
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls/:url", (req, res) => {
  urlDatabase[req.params.url] = "http://" + req.body.newLongURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





