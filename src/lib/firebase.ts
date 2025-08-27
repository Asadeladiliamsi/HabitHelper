// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "habithelper-9o371",
  "appId": "1:140507692145:web:37f29c86ff391f3ec66fd0",
  "storageBucket": "habithelper-9o371.firebasestorage.app",
  "apiKey": "AIzaSyASvbApR6BP1T0g_ySTZWkxEdkVfsW_yiY",
  "authDomain": "habithelper-9o371.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "140507692145"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
