import React, { useState } from "react";
import { useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, Modal, ActivityIndicator, ImageBackground } from "react-native";
import { Feather } from '@expo/vector-icons';
import { Button, Input } from "react-native-elements";
import { getImageAlt } from "../fb-utils/fb-funcs";
import { storeImageMetadata, setupImageListener, setupPrefListener, fetchImageFromURL, getFileType } from "../fb-utils/fb-db-utils";
import { addImageFromURL, getFilePath } from "../api/RemoteDownloads";
import { FontAwesome } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing'; 

import Toast from "react-native-root-toast";

const PictureLibrary = ({route, navigation}) => {

  const [modalVisible, setModalVisible] = useState(false)
  const [imageURL, setImageURL] = useState("")
  const [testImage, setTestImage] = useState("")
  const [images, setImages] = useState([])
  const [userPrefs, setUserPrefs] = useState({})
  const [fetchingImage, setFetchingImage] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  let openShareDialogAsync = async (uri) => {
    if (Platform.OS === 'web') {
      alert(`Uh oh, sharing isn't available on your platform`);
      return;
    }

    await Sharing.shareAsync(uri);
  }; 

  const renderImage = ({index, item}) => {
    const imageTypes = ['jpg', 'jpeg', 'png']
    if (imageTypes.includes(item.fileType)) {
      return(
        <TouchableOpacity
          onPress={() =>{
            //console.log("OPENING SHARE FROM IMAGE RENDER")
            let uri = getFilePath(item.imageName)
            openShareDialogAsync(uri)
          }}
        >
          <Image 
          style={styles.stretch}
          source={{uri: getFilePath(item.imageName)}}
          //url={testImage}
        />
        </TouchableOpacity>
      )
    }

    else {
      return(
        <TouchableOpacity
          style={styles.fileContainer}
          onPress={() =>{
            //console.log("OPENING SHARE FROM IMAGE RENDER")
            let uri = getFilePath(item.imageName)
            openShareDialogAsync(uri)
          }}
        >
          <Text style={{textAlign: 'center', paddingBottom: 50,}}>{item.imageName}</Text>
        </TouchableOpacity>
      )
    }
  }

  const downloadProgresscallback = downloadProgress => {
    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
    setDownloadProgress(progress)
    // we don't care to show the very beginning of the download (seems like metadata gets downloaded way before the file)
    if (progress > 0.00001) { 
      let toast = Toast.show(`Downloading... ${isNaN(progress) ? 0.0 : (progress*100).toFixed(2)}%`, {
        //duration: Toast.durations.SHORT,
        duration: 10,
        //position: 120,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true
      })
  }
    //console.log(`Progress: ${progress}`)
  };

  const downloadFailed = () => {
    let toast = Toast.show(`Failed to download file`, {
      //duration: Toast.durations.SHORT,
      duration: 2000,
      //position: 120,
      position: Toast.positions.BOTTOM,
      shadow: true,
      animation: true
    })
  }

  // add buttons to header
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Videos", {}
          )}
        >
          <Text style={styles.navText}>Videos</Text>
        </TouchableOpacity>
      ),

      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Settings", {lastScreen: "Picture Library"}
          )}
        >
          <Feather name="settings" size={24} color="white" />
        </TouchableOpacity>
      )
    })
  })

  // TEST: grab image
  useEffect(() => {
    getImageAlt("", (url) => {
      setTestImage(url)
      console.log("done")
    })
  }, [])

  // Grab user's image data
  useEffect(() => {
    setupImageListener(setImages)
  }, [])

  // fetch and watch user preferences
  useEffect(() => {
    setupPrefListener(setUserPrefs)
  }, [])

  return(
    <ImageBackground
        source={require('../assets/gradientBG.png')}
        style={styles.image}
      >
    <View style={styles.container}>
      <FlatList 
        data={images}
        renderItem={renderImage}
        numColumns={2}
      />
      <Modal 
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible)
        }}
      > 
      
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
          <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 10}}>Add File from the Web</Text>
          <Input 
            placeholder="Link to File"
            value={imageURL}
            onChangeText={setImageURL}
            errorMessage={getFileType(imageURL) === undefined ? "Must be a link to a file" : ""}
          />
          <Button 
            title={"Add File"}
            containerStyle={styles.buttonContainerStyle}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            style={{color: 'black'}}
            onPress={() => {
              setFetchingImage(true)
              addImageFromURL(imageURL, userPrefs.imageTTL, setFetchingImage, downloadProgresscallback, downloadFailed)
              setModalVisible(!modalVisible)
              setImageURL("")
            }}
            disabled={getFileType(imageURL) === undefined}
          />
          <Button 
            title={"Cancel"}
            containerStyle={styles.buttonContainerStyle}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            onPress={() => {
              setModalVisible(!modalVisible)
              setImageURL("")
              //console.log(images)
              //console.log(videos)
            }}
          />
          </View>
        </View>
      </Modal>
      <View style={styles.thumbButtonView}>
        {fetchingImage
        ? <ActivityIndicator 
          animating={true}
          size='large'
          color={'ivory'}
        />
        :  <TouchableOpacity
          onPress={() => setModalVisible(!modalVisible)}
        >
          <FontAwesome name="plus-circle" size={100} color="ivory" />
        </TouchableOpacity>
      }
      </View>
    </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },

  navText: {
    fontSize: 18,
    color: 'white'
  },

  stretch: {
    width: 195,
    height: 195,
    resizeMode: 'stretch',
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },

  buttonContainerStyle: {
    width: '75%',
    margin: 10,
  },

  button: {
    //backgroundColor: 'blue',
    borderRadius: 10,
  },

  buttonText: {
    color: 'white'
  },

  modalView: {
    margin: 20,
    width: '90%',
    backgroundColor: "ivory",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },

  thumbButtonView: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 80,
    right: 40
  },

  image: {
    flex: 1,
    justifyContent: "center",
    width: '100%',
  },

  fileContainer: {
    backgroundColor: 'mintcream',
    width: 195,
    height: 195,
    alignContent: 'flex-end',
    justifyContent: 'flex-end'
  },

});

export default PictureLibrary;