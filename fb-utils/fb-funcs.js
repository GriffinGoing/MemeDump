// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from "../credentials/fb-config";

import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage'
import { getAuth } from "firebase/auth";


//import * as firebase from 'firebase';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
//const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export function initFirebase() {
  return initializeApp(firebaseConfig)
}

export function saveImage(imageURI, filename) {
  const auth = getAuth()
  const storage = getStorage()
  const userID = auth.currentUser.uid
  const imageRef = ref(storage, `${userID}/images/${filename}`)

  // send to FB
  // Create file metadata including the content type
  /** @type {any} */
  const metadata = {
    contentType: 'image/jpg',
  };

  //ref.put(imageURI, metadata)

  // Upload the file and metadata
  /*
  const uploadTask = uploadBytes(imageRef, imageURI, metadata).then((snapshot) =>{
    console.log("Uploaded!")
  });
  */

  
  let task = ref.put(imageURI, metadata).then(() => {
    //console.log("Uploaded")
  }).catch((e) => console.log(e))
}

export function getImageAlt(imageName, callback) {
  const storage = getStorage()
  getDownloadURL(ref(storage, `testImages/sample.jpeg`)).then((url) => {
    callback(url)
    //console.log(url)
  })

  //const imageRef = ref(storage, `testImages/sample.jpeg`);
}

export function getImage(userID, imageName, callback) {
  const storage = getStorage()
  getDownloadURL(ref(storage, `testImages/${imageName}`)).then((url) => {
    callback(url)
    //console.log(url)
  })
}