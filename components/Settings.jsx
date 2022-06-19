import React from "react";
import { useState, useEffect } from "react";
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ImageBackground, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Button, Input } from "react-native-elements";

import { firebaseConfig } from "../credentials/fb-config";
import { initFirebase } from "../fb-utils/fb-funcs";
import { getAuth } from "firebase/auth";
import { setupPrefListener, storeUserPrefs } from "../fb-utils/fb-db-utils";
import { update } from "firebase/database";

const Settings = ({route, navigation}) => {

  const [userPrefs, setUserPrefs] = useState({})

  const updateUserPrefsObject = (vals) => {
    setUserPrefs({
      ...userPrefs,
      ...vals,
    })
  }

  const firebaseApp = initFirebase()
  const auth = getAuth(firebaseApp)

  const signOutPressed = () => {
    auth.signOut(() => {
      //console.log("Signing out")
    })
  }

  const savePressed = () => {
    // save settings HERE
    storeUserPrefs(userPrefs)
    let navigateTo = route.params.lastScreen ? route.params.lastScreen : "Picture Library"
    navigation.navigate(navigateTo, {})
  }

  // add buttons to header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            let navigateTo = route.params.lastScreen ? route.params.lastScreen : "Picture Library"
            navigation.navigate(navigateTo, {}
          )
          }}
        >
          <Text style={styles.navText}>Cancel</Text>
        </TouchableOpacity>
      ),
    })
  })

  // fetch and watch user preferences
  useEffect(() => {
    setupPrefListener(setUserPrefs)
  }, [])

  return(
    
    <ImageBackground
      source={require('../assets/memeDumpBG.png')}
      style={styles.image}
      >
      <TouchableWithoutFeedback 
        style={styles.containerFull}
        onPress={Keyboard.dismiss}
      >
    <SafeAreaView style={styles.container}>
      <View style={[styles.inputPairView, {marginTop: 120}]}>
        <Text style={styles.optionText}>Keep Files (days):</Text>
        <Input
          title='TTL'
          keyboardType="numeric"
          style={styles.input}
          containerStyle={styles.inputContainer}
          value={String(userPrefs.imageTTL)}
          onChangeText={(val) => {
            updateUserPrefsObject({imageTTL: val})
        }}
        errorMessage={userPrefs.imageTTL < 1 ? "Must be > 0" : ""}
        />
      </View>
      <View style={styles.inputPairView}>
        <Text style={styles.optionText}>Keep Videos (days):</Text>
        <Input
          title='TTL'
          keyboardType="numeric"
          style={styles.input}
          containerStyle={styles.inputContainer}
          value={String(userPrefs.videoTTL)}
          onChangeText={(val) => updateUserPrefsObject({videoTTL: val})}
          errorMessage={userPrefs.videoTTL < 1 ? "Must be > 0" : ""}
        />
      </View>
      <Button
        title='Save'
        onPress={savePressed}
        containerStyle={styles.buttonContainer}
        buttonStyle={styles.button}
        titleStyle={styles.buttonText}
        disabled={userPrefs.imageTTL < 1 || userPrefs.videoTTL < 1}
      />
      <Button
        title='Sign Out'
        onPress={signOutPressed}
        containerStyle={styles.buttonContainer}
        buttonStyle={styles.button}
        titleStyle={styles.buttonText}
      />
    </SafeAreaView> 
    </TouchableWithoutFeedback>
    </ImageBackground>

  )
}


const styles = StyleSheet.create({
  containerFull: {
    flex: 1,
    //backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  },

  container: {
    flex: 1,
    //backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%'
  },

  inputPairView: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '80%',
    marginLeft: '30%'
  },

  inputContainer: {
    width: '30%',
    marginRight: 40
  },

  buttonContainer: {
    margin: 10,
    width: '75%',
  },

  button: {
    backgroundColor: 'ivory',
    borderRadius: 10,
  },

  buttonText: {
    color: 'black'
  },

  navText: {
    fontSize: 18,
    color: 'white'
  },

  optionText: {
    fontSize: 24,
    color: 'white'
  },

  image: {
    flex: 1,
    justifyContent: "center"
  },

  input: {
    color: 'white',
    textAlign: 'center'
  },

});

export default Settings