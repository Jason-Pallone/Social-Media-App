import Firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

const config = {
    apiKey: "AIzaSyAQYoBV3L5gjoXy-SPU4g77rnYuMkBpGMk",
    authDomain: "social-media-app-ebb51.firebaseapp.com",
    projectId: "social-media-app-ebb51",
    storageBucket: "social-media-app-ebb51.appspot.com",
    messagingSenderId: "1069830504321",
    appId: "1:1069830504321:web:1e26ed939a0df74e967280"
};

const firebase = Firebase.initializeApp(config);
const { FieldValue } = Firebase.firestore;


export { firebase, FieldValue }  