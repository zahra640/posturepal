import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            'FIREBASE_KEY_REMOVED',
  authDomain:        'AUTH_DOMAIN_REMOVED',
  projectId:         'PROJECT_ID_REMOVED',
  storageBucket:     'STORAGE_BUCKET_REMOVED',
  messagingSenderId: 'SENDER_ID_REMOVED',
  appId:             '1:SENDER_ID_REMOVED:web:a395113271ebde5b9a2b8c',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)
