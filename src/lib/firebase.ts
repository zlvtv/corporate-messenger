import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDnAd826jCc5Cc5mUN0Rpf-wSLrDxHyX2Y",
  authDomain: "teambridge-f033d.firebaseapp.com",
  projectId: "teambridge-f033d",
  storageBucket: "teambridge-f033d.firebasestorage.app",
  messagingSenderId: "507962840376",
  appId: "1:507962840376:web:944d6f030478c5e1dc5dcd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);