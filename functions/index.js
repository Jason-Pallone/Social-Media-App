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
const { object } = require("firebase-functions/lib/providers/storage");
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

const FBAuth = (req, res, next) => {
  let idToken;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
     /* Extracts token, we use split to split into 2 arrays one with Bearer and the other with the token
        we use [1] to get the 2nd element back into our idToken variable, the 2nd element is the token */
     idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('No token found');
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // If the idToken exist and is our token, then this promise is fullfilled with the tokens decoded claims, like the user data
  admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      console.log(decodedToken)
      // Gets the user handle, we use limit to limit it to 1 user
      return db.collection('users')
       .where('userId', '==', req.user.uid)
       .limit(1)
       .get();
    })
    .then(data => {
      /* Assigns the users handle to req.user.handle, our previous db query returned an array of data,
         and the array only has 1 element because we limitied it to 1 prior,
         so we start at index 0 and access that data, then get the user handle from that data. */
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch(err => {
      console.error('Error while verifying token', err);
      return res.status(403).json(err);
    })
}

app.post("/chats", FBAuth, (req, res) => {

  const newChat = {
    body: req.body.body,
    userHandle: req.user.handle,
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

const isEmail = (email) => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(email.match(emailRegEx)) return true;
  else return false;
}

const isEmpty = (string) => {
  if(string.trim() === '') return true;
  else return false;
}

//Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  }
  
  //Validate data
  let errors = {}

  if(isEmpty(newUser.email)) {
    errors.email = 'Must not be empty';
  } else if (!isEmail(newUser.email)) {
    errors.email = 'Must be a valid email address'
  };

  if(isEmpty(newUser.password)) errors.password = 'Must not be empty';
  if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match';
  if(isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

  if(Object.keys(errors).length > 0) return res.status(400).json(errors);


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

app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  let errors = {};

  if(isEmpty(user.email)) errors.email = 'Must not be empty';
  if(isEmpty(user.password)) errors.password = 'Must not be empty';

  if(Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.error(err);
      if(err.code === 'auth/wrong-password' || 'auth/user-not-found') {
        return res.status(403).json({general: "Wrong credentials, please try again"})
      } else return res.status(500).json({error: err.code});
    })

})

exports.api = functions.https.onRequest(app);