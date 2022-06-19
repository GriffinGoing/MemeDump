import { initFirebase, getImage } from './fb-funcs';
import { getAuth } from "firebase/auth"
import { getDatabase, ref, onValue, set, push, remove } from 'firebase/database';
import { getVideoDetails } from '../api/videoServer';
import { deleteImageFromFilesystem } from '../api/RemoteDownloads';

import * as Analytics from "expo-firebase-analytics";

export function getFileType(filename) {
  // https://stackoverflow.com/questions/680929/how-to-extract-extension-from-filename-string-in-javascript
  var re = /(?:\.([^.]+))?$/;
  var ext = re.exec(filename)[1];
  return ext
}

// TODO: fix to add args and dynamic pathing
export function storeImageMetadata(filename, ttl) {
  const firebaseApp = initFirebase()
  const auth = getAuth(firebaseApp)
  const userID = auth.currentUser.uid
  const db = getDatabase();

  const reference = ref(db, `users/${userID}/images/`);

  const ext = getFileType(filename)

  push(reference, {
    imageName: filename,
    fileType: ext,
    createdAt: Date.now(),
    deathAt: getDeathTime(ttl)
  })
}

// Watches user JSON tree in DB for image changes
export function setupImageListener(updateFunc) {
  const firebaseApp = initFirebase()
  const auth = getAuth(firebaseApp)
  const userID = auth.currentUser.uid

  const db = getDatabase()
  const reference = ref(db, `users/${userID}/images/`);
  onValue(reference, (snapshot) => {
    //console.log("setupImageListener got snapshot: ", snapshot)
    if (snapshot?.val()) {
      //console.log("Unpacking...")
      const fbObject = snapshot.val()
      const newArr = []
      const deleteArr = []
      const currTime = Date.now()
      Object.keys(fbObject).map((key, index) => {
        //console.log(key, "||", index, "||", fbObject[key]);
        if (currTime < fbObject[key].deathAt) {
          //console.log("adding to curr")
          newArr.push({...fbObject[key], id: key});
        } else {
          //console.log("add to death")
          deleteArr.push({...fbObject[key], id: key})
        }
      });
      
      if (false) {
        // this is async download link fetching code fore FB storage
        // as we're not currently relying on it, this should not execute
        let numImagesToFetch = newArr.length
        newArr.forEach((element, index, theArr) => {
          getImage(userID, element.imageName, (url) => {
            theArr[index].downloadURL = url
            numImagesToFetch = numImagesToFetch - 1
            if (numImagesToFetch === 0) {
              updateFunc(newArr)
            }
          })
        })
      } 
      // update current images
      updateFunc(newArr)
      // delete dead images
      //deleteObjects(deleteArr, 'images')
      deleteImages(deleteArr)
      //updateFunc(newArr) // leave here? not sure
    } else {
      updateFunc([])
    }
  })
}

function deleteImages(images) {
  //console.log(`DELETE GOT: ${images}`)
  images.forEach(element => {
    deleteImageFromFilesystem(element.imageName, () => {
      //console.log(element)
      const auth = getAuth()
      const db = getDatabase();
      const userID = auth.currentUser.uid
      const reference = ref(db, `users/${userID}/images/${element.id}`);
      remove(reference)
    })
  })
}

// Watches user JSON tree in DB for video changes
export function setupVideoListener(updateFunc) {
  const firebaseApp = initFirebase()
  const auth = getAuth(firebaseApp)
  const userID = auth.currentUser.uid

  const db = getDatabase()
  const reference = ref(db, `users/${userID}/videos/`);
  onValue(reference, (snapshot) => {
    //console.log("setupVideoListener got snapshot: ", snapshot)
    if (snapshot?.val()) {
      //console.log("Unpacking...")
      const fbObject = snapshot.val()
      const newArr = []
      const deleteArr = []
      const currTime = Date.now()
      Object.keys(fbObject).map((key, index) => {
        //console.log(`Delete`)
        //console.log(key, "||", index, "||", fbObject[key]);
        if (currTime < fbObject[key].deathAt) {
          //console.log("addind to curr")
          newArr.push({...fbObject[key], id: key});
        } else {
          //console.log("add to death")
          deleteArr.push({...fbObject[key], id: key})
        }

      });
      // update with found 'alive' videos
      updateFunc(newArr)
      // delete dead videos
      deleteObjects(deleteArr, 'videos')
    } else {
      updateFunc([])
    }
  })
}

function deleteObjects(objectData, dir) {
  //console.log(`DELETE GOT: ${objectData}`)
  objectData.forEach(element => {
    //console.log(element)
    const auth = getAuth()
    const db = getDatabase();
    const userID = auth.currentUser.uid
    const reference = ref(db, `users/${userID}/${dir}/${element.id}`);
    remove(reference)
  })
}

// checks for expired images and deletes from storage/DB
// would prefer this happen server side but that costs money
export function cleanUserImages() {

}

export function createInitialUserData(userID) {
  const db = getDatabase();
  const reference = ref(db, `users/${userID}/prefs`);
  //set(reference, data);
  set(reference, {
    createdAt: Date(),
    imageTTL: 3,
    videoTTL: 3,
  })
}

// Youtube URLs come in quite a few formats and I didn't have a solid soution, so I grabbed 
// this from https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function youtubeParser(url){
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url.match(regExp);
  return (match&&match[7].length==11)? match[7] : false;
}

function getDeathTime(numDays) {
  const currTime = Date.now()
  const deathTime = currTime + (3600000 * 24 * numDays) // 3600000 ms in an hour
  return deathTime;
}

export function addVideoToDatabse(url, ttl, onFailure) {

  let videoID = youtubeParser(url)
  //.log(`Got Video ID: ${videoID}`)

  if (!videoID) {
    //console.log("FAILED TO ADD. Could not parse Video ID")
    // call on failure
  } else {
    getVideoDetails(videoID, (data) => {
      //console.log(data.items[0].snippet.title)
      const auth = getAuth()
      const db = getDatabase();
      const userID = auth.currentUser.uid
      const reference = ref(db, `users/${userID}/videos/`);
      // need to add kill time here. maybe "deathAt"?
      //console.log(`ADD DAYS RESULT: ${getDeathTime(ttl)}`)
      push(reference, {
        videoID: videoID,
        title: data.items[0].snippet.title,
        thumbnail: data.items[0].snippet.thumbnails.default.url,
        createdAt: Date.now(),
        deathAt: getDeathTime(ttl)
      })
      Analytics.logEvent('successFileDownload', {
        sender: 'videoAdd',
        user: userID,
        screen: 'Videos',
        purpose: 'Added a video entry',
      });
      
    })
    
  }
}

// Watches user JSON tree in DB for video changes
export function setupPrefListener(updateFunc) {
  const firebaseApp = initFirebase()
  const auth = getAuth(firebaseApp)
  const userID = auth.currentUser.uid

  const db = getDatabase()
  const reference = ref(db, `users/${userID}/prefs/`);
  onValue(reference, (snapshot) => {
    //console.log("setupPrefListener got snapshot: ", snapshot)
    if (snapshot?.val()) {
      //console.log("Unpacking...")
      const fbObject = snapshot.val()
      updateFunc(fbObject)
      //console.log(snapshot.val())
      //return snapshot.val()
    } else {
      //console.log("Sending Empty")
      updateFunc([])
    }
  })
}

export function storeUserPrefs(userPrefs) {
  const auth = getAuth()
  const userID = auth.currentUser.uid
  const db = getDatabase();
  const reference = ref(db, `users/${userID}/prefs`);
  //set(reference, data);
  set(reference, {
    imageTTL: userPrefs.imageTTL,
    videoTTL: userPrefs.videoTTL,
  })
}

export function fetchImageFromURL(url) {
  fetch(url).then((res) => {
    //console.log("Done fetching")
    //console.log(res)
  })
}