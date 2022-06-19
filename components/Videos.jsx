import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Modal, Image, ImageBackground, Platform, Share } from "react-native";
import { Feather } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Button, Input, ListItem } from "react-native-elements";
import { addVideoToDatabse, setupVideoListener, setupPrefListener, youtubeParser } from "../fb-utils/fb-db-utils";
import { FlatList } from "react-native-gesture-handler";
import { FontAwesome } from '@expo/vector-icons';
import Toast from "react-native-root-toast";

const Videos = ({route, navigation}) => {

  //whether new video modal is visible
  const [modalVisible, setModalVisible] = useState(false)
  const [videoURL, setVideoURL] = useState("")
  const [videos, setVideos] = useState([])
  const [userPrefs, setUserPrefs] = useState({})

  function buildVideoLink(videoID) {
    return `https://www.youtube.com/watch?v=${videoID}`
  }

    // add buttons to header
    useEffect(() => {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Picture Library", {}
            )}
          >
            <Text style={styles.navText}>Files</Text>
          </TouchableOpacity>
        ),
  
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings", {lastScreen: "Videos"}
            )}
          >
            <Feather name="settings" size={24} color="white" />
          </TouchableOpacity>
        )
      })
    })

    // set up listener and get initial data for user's video data
    // clean after fetching (again, prefer this on server but costs money to do so)
    // DO HERE
    useEffect(() => {
      setupVideoListener(setVideos)
    }, [])

    // fetch and watch user preferences
    useEffect(() => {
      setupPrefListener(setUserPrefs)
    }, [])

    const onShare = async (videoID) => {
      try {
        const result = await Share.share({
          message: `https://www.youtube.com/watch?v=${videoID}`,
        });
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // shared with activity type of result.activityType
          } else {
            // shared
          }
        } else if (result.action === Share.dismissedAction) {
          // dismissed
        }
      } catch (error) {
        alert(error.message);
      }
    };

    // component for rendering video items
    const renderVideo = ({index, item}) => {
      //console.log(`${index} ${item}`)
      //console.log(item.thumbnail)
      //console.log(item.title)
      return(
        <TouchableOpacity
          onPress={() => {
            onShare(item.videoID)
          }}
        >
          <ListItem 
            key={index}
            title={item.title}
            bottomDivider
            chevron
            containerStyle={styles.itemContainer}
            >
            <Image 
              style={styles.stretch}
              source={{uri: item.thumbnail}}
            />
            <Text style={{width: '75%', color: 'ivory', fontSize: 18}}>{item.title}</Text>
          </ListItem>
        </TouchableOpacity>
      )
    }

  return(
    <ImageBackground
        source={require('../assets/gradientBG.png')}
        style={styles.image}
      >
    <View style={styles.container}>
      <FlatList 
      data={videos}
      renderItem={renderVideo}
      numColumns={1}
      style={{width: '100%'}}
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
          <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 10}}>Add Video from YouTube</Text>
          <Input 
            placeholder="Video Link"
            value={videoURL}
            onChangeText={setVideoURL}
            errorMessage={youtubeParser(videoURL) ? "" : "Must be a YouTube link"}
          />
          <Button 
            title={"Add Video"}
            containerStyle={styles.buttonContainerStyle}
            onPress={() => {
              addVideoToDatabse(videoURL, userPrefs.videoTTL)
              setModalVisible(!modalVisible)
              setVideoURL("")
            }}
            disabled={!youtubeParser(videoURL)}
          />
          <Button 
            title={"Cancel"}
            containerStyle={styles.buttonContainerStyle}
            onPress={() => {
              setModalVisible(!modalVisible)
              setVideoURL("")
              //console.log(videos)
            }}
          />
          </View>
        </View>
      </Modal>
      <View style={styles.thumbButtonView}>
        <TouchableOpacity
          onPress={() => setModalVisible(!modalVisible)}
        >
          <FontAwesome name="plus-circle" size={100} color="ivory" />
        </TouchableOpacity>
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
    width: 200,
    height: 200,
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
    margin: 10
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

  stretch: {
    width: 80,
    height: 80,
    resizeMode: 'stretch',
  },

  thumbButtonView: {
    position: 'absolute',
    bottom: 80,
    right: 40
  },

  image: {
    flex: 1,
    justifyContent: "center",
    width: '100%'
  },

  itemContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    margin: 10
  }

});

export default Videos;