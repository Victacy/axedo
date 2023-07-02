var firebaseConfig = {
    apiKey: "AIzaSyC6QwGCunqN5M1t5i_yvel8E8aBICrY3M0",
    authDomain: "axe-todo-8f789.firebaseapp.com",
    projectId: "axe-todo-8f789",
    storageBucket: "axe-todo-8f789.appspot.com",
    messagingSenderId: "1011830407048",
    appId: "1:1011830407048:web:e5b980340858e24757443d",
    measurementId: "G-Z68M2BWQ46"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  var db = firebase.firestore();