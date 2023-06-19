const express = require("express")
const session = require('express-session')
const https = require('https')
const fs = require("fs")
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const app = express()
const nodemailer = require('nodemailer');
const cors = require("cors")
require('dotenv').config();
    
var PORT = process.env.port || 3000

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'liuanselm01@gmail.com',
    pass: 'rtcfmqsajsuoffrn'
  }
});

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
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin)
  },
  credentials: true
}
))
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
  const { password, user, email} = req.body;
  try {
    const userTaken = await checkUser(user, email);
    if (userTaken){
      const hashedPassword = await hash(password);
      await upload(hashedPassword, user, email);
      const verifyHash = await getVerifyHash(user)
      req.session.name = user
      nodeemail(email, verifyHash)
      res.send({signup : true})
    }
    else{
      res.send(userTaken)
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ upload: false });
  }
})
app.post("/signin", async(req,res)=>{
	const { password, user } = req.body;
  try{
    const hashedPassword = await getHash(user)
    await confirmHash(password, hashedPassword)
    req.session.name = user
    res.send({signin : true})
  }catch(error){
    console.error('Error:', error);
    res.status(500).send({ signin: false });
  }
})
app.post("/signout", function(req,res){
	req.session.destroy()
  res.redirect("/")
})
app.get("/session", async (req, res)=>{
  if (req.session.name){
    console.log(req.session.name)
    const verified = await checkVerified(req.session.name)
    if (verified[0].verified){
      const keys = await getKeys(req.session.name)
      const info = {user: req.session.name, apikey: keys[0].apikey, secretkey: keys[0].secretkey}
      return res.send(info)
    }
    else{
      res.send({verified: false})
    }
  }
  else{
    return res.send({session: false})
  }
})
app.post("/verify", async (req, res)=>{
  const { verify } = req.body;
  const id = await getVerifyHash(req.session.name)
  if (id[0].verifiedhash == verify){
    //set verify to true
    changeVerified(req.session.name)
    if (changeVerified){
      res.send({verification: true})
    }
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

function upload(hash, user, email) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO passwords (password, user, email) VALUES (?, ?, ?)';
    con.query(sql, [hash, user, email], (err, result) => {
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

async function checkUser(user, email){
  return new Promise((resolve, reject)=>{
    const sql = 'SELECT user, email FROM passwords WHERE user = ? OR email = ?';
    con.query(sql, [user, email], (err, result) => {
      if (err) return reject(err);
      if (result.length === 0){
        resolve(true)
      }
      return reject(new Error('Username Taken'))
    })
  })
}

async function getKeys(user){
  return new Promise((resolve, reject)=>{
    const sql = 'SELECT apikey, secretkey FROM passwords WHERE user = ?'
    con.query(sql, [user], (err, result)=>{
      if (err) return reject(err);
      resolve(result)
    })
  })
}

async function getVerifyHash(user){
  return new Promise((resolve, reject)=>{
    const sql = 'SELECT verifiedhash FROM passwords WHERE user = ?'
    con.query(sql, [user], (err, result)=>{
      if (err) return reject(err);
      resolve(result)
    })
  })
}

async function checkVerified(user){
  return new Promise((resolve, reject)=>{
    const sql = 'SELECT verified FROM passwords WHERE user = ?'
    con.query(sql, [user], (err, result)=>{
      if (err) return reject(err);
      resolve(result)
    })
  })
}

async function changeVerified(user){
  return new Promise((resolve, reject)=>{
    const sql = 'UPDATE passwords SET verified = 1 WHERE user = ?'
    con.query(sql, [user], (err, result)=>{
      if (err) return reject(err);
      resolve(result)
    })
  })
}

function nodeemail(address, verifyHash){
  const mailOptions = {
    from: 'liuanselm01@gmail.com',
    to: address,
    subject: 'Welcome to Password Authentication',
    text: verifyHash[0].verifiedhash
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
   console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      // do something useful
    }
  });
}