import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBoyngOVTB-HSSaSOWFs868OmmMPZIwvSs',
  authDomain: 'foodly-4d744.firebaseapp.com',
  projectId: 'foodly-4d744',
  storageBucket: 'foodly-4d744.firebasestorage.app',
  messagingSenderId: '940622562738',
  appId: '1:940622562738:web:e41b8720fd733f04dcd0ab',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
