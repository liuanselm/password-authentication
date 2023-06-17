const express = require("express")
const session = require('express-session')
const https = require('https')
const fs = require("fs")
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const app = express()
require('dotenv').config();
    
var PORT = process.env.port || 3000

const options = {
  key: fs.readFileSync('https/local.key'),
  cert: fs.readFileSync('https/local.crt'),
  passphrase: '12345'
}

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.PASSWORD,
  database: "passworddb"
});

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.get('origin'));
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(session({
  secret: 'Your_Secret_Key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'none',
    secure: 'true',
  }
}))
   
app.get("/", function(req, res){
  return res.send({root: true})    

})
app.post("/signup", async (req,res)=>{
  const { password, user } = req.body;
  try {
    const hashedPassword = await hash(password);
    await upload(hashedPassword, user);
    req.session.name = user
    res.send(req.session)
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ upload: false });
  }
})
app.post("/signin", function(req,res){
	req.session.name = req.sessionID
	return res.send(req.session)
})
app.post("/signout", function(req,res){
	req.session.destroy()
  res.redirect("/")
})
app.get("/session", function(req, res){
  if (req.session.name){
    return res.send(req.session)
  }
  else{
    return res.send({session: false})
  }
})

https.createServer(options, app).listen(PORT,()=>{
	console.log("HTTPS Server created Successfully on PORT :", PORT)
})

async function hash(password) {
  const saltRounds = 10;
  const hashed = await bcrypt.hash(password, saltRounds);
  return hashed;
}

function upload(hash, user) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO passwords (password, user) VALUES (?, ?)';
    con.query(sql, [hash, user], (err, result) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function getHash(user) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT password FROM passwords WHERE user = ?';
    con.query(sql, [user], (err, result) => {
      if (err) return reject(err);
      if (result.length === 0) return reject(new Error('User not found'));

      const hashedPassword = result[0].password;
      resolve(hashedPassword);
    });
  });
}

async function confirmHash(hash, hashDB){
  const confirm = await bcrypt.compare(hash, hashDB)
  return confirm
}
