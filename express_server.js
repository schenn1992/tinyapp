const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
const { response } = require("express");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = "https://" + urlDatabase[req.params.shortURL];
  console.log("shortURL", shortURL);
  console.log("longURL", longURL);
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase); 
  res.redirect(`urls/${shortURL}`);         
});

app.post("/urls/:url/delete", (req, res) => {
  delete urlDatabase[req.params.url]; 
  res.redirect("/urls");
});

app.post("/urls/:url", (req, res) => {
  urlDatabase[req.params.url] = "http://" + req.body.newLongURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.inputName);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(length) {
  let result = '';
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

