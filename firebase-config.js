// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCr-DZn-PpQFXc1d2B0v8hPgbn6ip4Vjyc",
    authDomain: "smart-home-335009.firebaseapp.com",
    databaseURL:
        "https://smart-home-335009-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-home-335009",
    storageBucket: "smart-home-335009.appspot.com",
    messagingSenderId: "529388317822",
    appId: "1:529388317822:web:cb18dd721fca535383bc2f",
    measurementId: "G-ZGZG95CK7Z",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore();
export default firestore;
