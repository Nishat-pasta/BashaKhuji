import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA-nmR9szA415d_qX16fbMX8-lDMa-zrU4",
  authDomain: "bashakhuji-503d1.firebaseapp.com",
  projectId: "bashakhuji-503d1",
  storageBucket: "bashakhuji-503d1.firebasestorage.app",
  messagingSenderId: "697249288857",
  appId: "1:697249288857:web:76987e2b2ab10f90005e08"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);