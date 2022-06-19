import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, SafeAreaView, TouchableWithoutFeedback, Keyboard, ImageBackground } from "react-native";
import { Input, Button } from "react-native-elements";

const Login = ({attemptLogin, createAccount}) => {

  const [state, setState] = useState({
    username: "",
    password: ""
  })

  const updateStateObject = (vals) => {
    setState({
      ...state,
      ...vals,
    })
  }

  const [loginError, setLoginError] = useState("")

  const loginPressed = () => {
    console.log("LOGIN PRESSED!")
    attemptLogin(state.username, state.password, setLoginError)
  }

  const createAccountPressed = () => {
    console.log("create acct pressed")
    createAccount(state.username, state.password, setLoginError)
  }

  const errorSetter = () => {

  }

  useEffect(() => {

  }, )

  return(
      <ImageBackground
        source={require('../assets/loginBG.png')}
        style={styles.image}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} styles={styles.containerFull}>
    <SafeAreaView style={styles.containerFull}>
      <Input 
        placeholder="Email"
        style={[styles.input, {marginTop: 180}]}
        value={state.username}
        onChangeText={(val) => updateStateObject({username: val})}
        //errorMessage={"Check for email validity?"}
      />
      <Input 
        placeholder="Password"
        style={styles.input}
        value={state.password}
        onChangeText={(val) => updateStateObject({password: val})}
        errorMessage={loginError}
        secureTextEntry={true}
      />
      <Button 
        title='Login'
        onPress={loginPressed}
        containerStyle={styles.buttonContainer}
        buttonStyle={styles.button}
        titleStyle={styles.buttonText}
      />
      <Button 
        title='Create Account'
        onPress={createAccountPressed}
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
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%'
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  input: {
    color: 'white'
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

  image: {
    flex: 1,
    justifyContent: "center",
    width: '100%'
  },

  inputText: {
    color: 'white'
  },

});

export default Login;