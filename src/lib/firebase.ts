// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASvbApR6BP1T0g_ySTZWkxEdkVfsW_yiY",
  authDomain: "habithelper-9o371.firebaseapp.com",
  projectId: "habithelper-9o371",
  storageBucket: "habithelper-9o371.appspot.com",
  messagingSenderId: "140507692145",
  appId: "1:140507692145:web:37f29c86ff391f3ec66fd0"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };