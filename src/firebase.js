import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMPUR1SxffTQFhA6zbqv6fQjvKdWFQYF8",
  authDomain: "tortas-delivery-3a908.firebaseapp.com",
  projectId: "tortas-delivery-3a908",
  storageBucket: "tortas-delivery-3a908.firebasestorage.app",
  messagingSenderId: "1007585691990",
  appId: "1:1007585691990:web:c8d032687aef8f95e3eef7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);