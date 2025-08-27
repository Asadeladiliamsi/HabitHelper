// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyASvbApR6BP1T0g_ySTZWkxEdkVfsW_yiY",
  authDomain: "habithelper-9o371.firebaseapp.com",
  projectId: "habithelper-9o371",
  storageBucket: "habithelper-9o371.firebasestorage.app",
  messagingSenderId: "140507692145",
  appId: "1:140507692145:web:37f29c86ff391f3ec66fd0",
  databaseURL: "https://habithelper-9o371-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app);
export const auth = getAuth(app);
