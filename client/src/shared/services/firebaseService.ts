import envConfig from "@/config/env";
import { initializeApp, getApps, getApp } from "@firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: envConfig.apiKey,
  authDomain: envConfig.authDomain,
  projectId: envConfig.projectId,
  storageBucket: envConfig.storageBucket,
  messagingSenderId: envConfig.messagingSenderId,
  appId: envConfig.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export default app;
export const storage = getStorage(app);