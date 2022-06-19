import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ImageBackground } from 'react-native';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';
import { RootSiblingParent } from 'react-native-root-siblings';

import Login from './components/Login'
import PictureLibrary from './components/PictureLibrary';
import Settings from './components/Settings';
import Videos from './components/Videos'

import { initFirebase } from './fb-utils/fb-funcs';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"

import { getStorage, ref } from "firebase/storage";
import { createInitialUserData } from './fb-utils/fb-db-utils';

import * as Analytics from "expo-firebase-analytics";
import React, { useRef } from "react";


export default function App() {
  const navigationRef = useRef();
  const routeNameRef = useRef();

  const firebaseApp = initFirebase()
  const auth = getAuth(firebaseApp)
  const Stack = createNativeStackNavigator()

  const [user, setUser] = useState(false)

  const attemptLogin = (username, password, updateLoginError) => {
    //console.log(`Username: ${username} Password: ${password}`)
    //setUser(true)
    signInWithEmailAndPassword(auth, username, password)
    .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    setUser(user)
    //console.log(`USER UID: ${user.uid}`)
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    //console.log(`Failed login: ${errorCode}`)
    //console.log(errorMessage)
    updateLoginError("Invalid email/password")
  });
  }

  const createAccount = (username, password, updateLoginError) => {
    //console.log(`Username: ${username} Password: ${password}`)
    if (username === "" || password === "") {
      updateLoginError("Email/password required for account creation")
      return
    }
    //setUser(true)
    createUserWithEmailAndPassword(auth, username, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    setUser(user)
    // create initial user data
    createInitialUserData(user.uid)
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    //console.log(`Create Acct Failed: ${errorCode}`)
    //console.log(errorMessage)
    if (errorCode == "auth/invalid-email") {
      updateLoginError("Invalid email/password for account creation")
    }

    if (errorCode == "auth/email-already-in-use") {
      updateLoginError("An account already exists for this email")
    }
    if (errorCode == "auth/weak-password") {
      updateLoginError("Password must be at least 6 characters")
    }
    // ..
  });
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(user)
    } else {
      setUser(false)
    }
  })

  if (!user) {
    return(
      <View style={styles.containerFull}>
        <Login 
          attemptLogin={attemptLogin}
          createAccount={createAccount}
        />
      </View>
    )
  } 

  return (
    <RootSiblingParent>
    <NavigationContainer
      ref={navigationRef}
      onReady={() =>
        (routeNameRef.current = navigationRef.current.getCurrentRoute().name)
      }
      onStateChange={ async () => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current.getCurrentRoute().name;
        if (previousRouteName !== currentRouteName) {
          await Analytics.logEvent("screen_view", {
            screen_name: currentRouteName,
            screen_class: currentRouteName,
          });
        }
        // Save the current route name for later comparison
        routeNameRef.current = currentRouteName;
      }}
    >
      <ImageBackground
      source={require('./assets/memeDumpBG.png')}
      style={styles.image}
      >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: 'black',
          },
          headerTitleStyle: {
            color: 'white'
          },
          headerBackVisible: false,
          headerTitleAlign: 'center'
        }}
      >
        {/*<Stack.Screen name="Dashboard" component={Dashboard} />*/}
        <Stack.Screen name="Picture Library" component={PictureLibrary} options={{ title: 'Files' }} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Videos" component={Videos} />
      </Stack.Navigator>
      </ImageBackground>
    </NavigationContainer>
    </RootSiblingParent>
  );
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  appContainer: {
    flex: 1,
    backgroundColor: 'aqua',
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    flex: 1,
    justifyContent: "center"
  },

});
