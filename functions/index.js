const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const app = express();


admin.initializeApp();

const firebaseConfig = {
  apiKey: "AIzaSyDHtE5V9qy4riZzg_mf1aV0PU8FNml0QBc",
  authDomain: "social-media-app-e8b7c.firebaseapp.com",
  databaseURL: "https://social-media-app-e8b7c-default-rtdb.firebaseio.com",
  projectId: "social-media-app-e8b7c",
  storageBucket: "social-media-app-e8b7c.appspot.com",
  messagingSenderId: "363649624248",
  appId: "1:363649624248:web:ecebf5afe49f65b727ec4d",
  measurementId: "G-MQ0PVZS48P"
};

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get("/chats", (req, res) => {
  db
    .collection('chats')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let chats = [];
      data.forEach(doc => {
        chats.push({
          chatID: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });
     return res.json(chats);
    })
    .catch(err => console.error(err))
})

app.post("/chats", (req, res) => {

  const newChat = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };
   
  db
    .collection('chats')
    .add(newChat)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully`})
    })
    .catch(err =>{
      res.status(500).json({ error: `something went wrong`});
      console.error(err)
    });
});


//Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  }

  //TODO: validate data
  let token, userId;
  db
    .doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if(doc.exists){
        return res.status(400).json({handle: `this handle is already taken`})
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      return db
        .doc(`/users/${newUser.handle}`)
        .set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token })
    })
    .catch(err => {
      console.error(err);
      if(err.code === 'auth/email-already-in-use'){
        return res.status(400).json({email: `email is already in use`});
      } else {
        res.status(400).json({error: err.code});
      }
    })
});

exports.api = functions.https.onRequest(app);