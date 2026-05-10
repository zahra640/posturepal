import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            'AIzaSyB2UPQKvZ2aSaUJXmKqB4JK6tJ_SzvV3Xw',
  authDomain:        'posturepal-879b2.firebaseapp.com',
  projectId:         'posturepal-879b2',
  storageBucket:     'posturepal-879b2.firebasestorage.app',
  messagingSenderId: '161962000229',
  appId:             '1:161962000229:web:a395113271ebde5b9a2b8c',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)
