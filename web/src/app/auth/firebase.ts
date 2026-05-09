import { getApp, getApps, initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyDMOtbLSsuxXcMkPg2gOB3pOCNyFW-N_Kk',
  authDomain: 'tf05-permit-app-dev.firebaseapp.com',
  projectId: 'tf05-permit-app-dev',
  storageBucket: 'tf05-permit-app-dev.firebasestorage.app',
  messagingSenderId: '1020804220535',
  appId: '1:1020804220535:web:1e3649f45242c4040a6872',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
