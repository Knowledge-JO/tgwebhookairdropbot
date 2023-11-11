// Import the functions you need from the SDKs you need
// import { getAnalytics } from "firebase/analytics";
const { initializeApp } = require("firebase/app");
const dotenv = require("dotenv");
dotenv.config();
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBTb1SkMjy9Wv0EMH-7BnX5c6CKf3SzTWg",
  authDomain: "fir-68263.firebaseapp.com",
  projectId: "fir-68263",
  storageBucket: "fir-68263.appspot.com",
  messagingSenderId: "994848549306",
  appId: "1:994848549306:web:15b7ce7d6bb005b5401583",
  measurementId: "G-7NXHX4PM8V",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

module.exports = { app };
