import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";

import { BrowserRouter, useLocation } from "react-router-dom";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import "firebase/compat/firestore";
import { useEffect } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyBNDPJU-AGZ_sHjvzexoB0IGo7fhxEaTzo",
  authDomain: "mbtmi-96d3c.firebaseapp.com",
  projectId: "mbtmi-96d3c",
  storageBucket: "mbtmi-96d3c.appspot.com",
  messagingSenderId: "280416874928",
  appId: "1:280416874928:web:fc091df640a0850d8da675",
  measurementId: "G-SMSK9HFLZ1",
};

function ScrollToTop() {
  const home = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [home]);
  return null;
}

firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
export const storage = firebase.storage();

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
