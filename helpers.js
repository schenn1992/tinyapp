const getUserByEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  } 
};

function generateRandomString(length) {
  let result = '';
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlsForUser = function(id, urls) {
  let newURLsObj = {};
  for(let url in urls) {
    if(urls[url].userID === id) {
      newURLsObj[url] = urls[url];
    }
    console.log(urls[url]);
  }
  return newURLsObj;
} 

module.exports = { generateRandomString, urlsForUser, getUserByEmail };