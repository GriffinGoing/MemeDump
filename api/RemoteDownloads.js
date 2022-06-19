import * as FileSystem from 'expo-file-system';
import { getAuth } from "firebase/auth"
import { update } from 'firebase/database';
import { storeImageMetadata } from '../fb-utils/fb-db-utils';
import { saveImage } from '../fb-utils/fb-funcs';

import * as Analytics from "expo-firebase-analytics";


const progressCallback = (downloadProgress) => {
  const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
  updateProgress(progress)
};

export function getFilePath(filename) {
  return `${FileSystem.documentDirectory}${filename}`
}

export async function addImageFromURL(url, ttl, updateFetchingStatus, progressCallback, onFailure) {
  const auth = getAuth()
  const userID = auth.currentUser.uid
  // log an attempt to download
  Analytics.logEvent('attemptFileDownload', {
    sender: 'fileDownload',
    user: userID,
    screen: 'Files',
    purpose: 'Attempt to download a file (does not indicate fail or success)',
  });

  // figured it would be this simple but googled to check
  // https://befused.com/javascript/get-filename-url/
  var filename = url.substring(url.lastIndexOf('/')+1);
  //console.log(`Downloading FILE: ${filename}`)
  progressCallback(0) // reset download progress to 0 before starting download

  // set up download
  /*
  try {
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    const downloadedFile = await FileSystem.downloadAsync(url, fileUri);
  } catch(e) {
    console.log("Failed to download image...")
    console.log(e)
    updateFetchingStatus(false)
    return
  }
  if (downloadedFile.status != 200) {
    //handleError();
    console.log('Failed to download image')
    updateFetchingStatus(false)
  } else {
    console.log("Upload here!")
    console.log(downloadedFile.uri)
    storeImageMetadata(filename, ttl)
  }
  updateFetchingStatus(false)
  */
 try {
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {},
      progressCallback
    );
    const { uri } = await downloadResumable.downloadAsync();
    storeImageMetadata(filename, ttl)
    //console.log('Finished downloading to ', uri);
    updateFetchingStatus(false)
    Analytics.logEvent('successFileDownload', {
      sender: 'fileDownload',
      user: userID,
      screen: 'Files',
      purpose: 'Succeeded to download a file',
    });
  } catch(e) {
    //console.log(e)
    updateFetchingStatus(false)
    onFailure()
    Analytics.logEvent('failureFileDownload', {
      sender: 'fileDownload',
      user: userID,
      screen: 'Files',
      purpose: 'Failed to download a file',
    });
  }

}

export async function deleteImageFromFilesystem(filename, callback) {
  let filepath = getFilePath(filename)
  await FileSystem.deleteAsync(filepath)
  callback()
}