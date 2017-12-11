'use strict';

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Image,
  TextInput, KeyboardAvoidingView, TouchableHighlight,TouchableOpacity,
} from 'react-native';
import { fetchTravoramaLoginApi } from '../components/Common';
import { Icon } from 'react-native-elements'
import Button from 'react-native-button';

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static navigationOptions = {
    header: null,
  }

  _login = () => {
    this.setState({isLoading:true})
    let {navigation} = this.props;
    // //// validation
    //TODO

    //// if validation passed, POST to API
    fetchTravoramaLoginApi(this.state.userName, this.state.password)
    .then(response => {
      this.setState({isLoading:false});
      if (response.status == 200)
        if (navigation.state.params)
          navigation.navigate('BookingDetail',navigation.state.params);
        else
          navigation.navigate('MainTabNavigator');
      else console.log(response);
    }).catch(error => {
      this.setState({isLoading:false});
      console.log("Login error!!");
      console.log(error);
    })
  }
  
  render() {
    let {userName, password, showPassword, isLoading} = this.state;
    return (
      <View style={styles.container}>
        {/*<KeyboardAvoidingView behavior="position">*/}
          <View style={{marginBottom:40}}>
            <Text style={styles.categoryTitle}>Sign In</Text>
          </View>
          <View style={{marginBottom:10}}>
            <TextInput
              style={styles.searchInput}
              placeholder='Email / No. Handphone'
              keyboardType='email-address'
              underlineColorAndroid='transparent'
              autoCapitalize={'none'}
              autoCorrect={false}
              onChangeText={ userName => this.setState({userName}) }
              onSubmitEditing={(event) => { 
                this.refs.passwordInput.focus(); 
              }}
            />
          </View>
          <View>
            <TextInput
              ref='passwordInput'
              style={styles.searchInputFalse} 
              underlineColorAndroid='transparent' 
              placeholder='Password'
              secureTextEntry={!showPassword}
              autoCapitalize={'none'}
              autoCorrect={false}
              onChangeText={ password => this.setState({password}) }
              onSubmitEditing={this._login}
            />
            <View style={{position:'absolute', right:20, top:11,}}>
              <TouchableOpacity
                onPress={() =>
                  this.setState({showPassword:!showPassword})}
              >
                <View>
                  <Icon
                    name={showPassword ? 'eye' : 'eye-with-line'}
                    type='entypo'
                    size={22}
                    color='#acacac'
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{alignItems:'center', marginTop:10}}>
            <Text style={{color:'#fc2b4e'}}>Invalid username or password</Text>
          </View>
          <Button
            containerStyle={{marginTop:30, height:45, paddingTop:13, paddingBottom:10, overflow:'hidden', borderRadius:25, backgroundColor: '#01d4cb',}}
            style={{fontSize: 16, color: '#ffffff'}}
            onPress={this._login}
            disabled={isLoading || !userName || !password}
          >
            Sign in
          </Button>
          <View style={{marginTop:15, alignItems:'flex-end'}}>
            <Text style={{fontSize:12, color:'#464646'}}>
              Forgot Password ?
            </Text>
          </View>
          <Button
            containerStyle={{marginTop:50, height:45, paddingTop:13, paddingBottom:10, overflow:'hidden', borderRadius:25, backgroundColor: '#0080d4',}}
            style={{fontSize: 16, color: '#ffffff'}}
            onPress={this._handlePress}
          >
          Login With Facebook
          </Button>
          <Button
            containerStyle={{marginTop:15, height:45, paddingTop:13, paddingBottom:10, overflow:'hidden', borderRadius:25, backgroundColor: '#24bf49',}}
            style={{fontSize: 16, color: '#ffffff'}}
            onPress={this._handlePress}
          >
          Login With Facebook
          </Button>
          <View style={{marginTop:30, alignItems:'center'}}>
            <TouchableHighlight
              onPress={() => this.props.navigation.navigate('Registration')}
            >
              <Text style={{fontSize:12, color:'#000'}}>
                Don't have account ? Register here
              </Text>
            </TouchableHighlight>
          </View>
        {/*</KeyboardAvoidingView>*/}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:15,
    paddingTop:60,
    backgroundColor: '#fff',
  },
  categoryTitle :{
    fontWeight:'bold',
    fontSize:26,
    color:'#454545'
  },
  normaltext: {
    backgroundColor: 'transparent',
    color: '#ffffff',
  },
  loginemail: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    marginTop: 50,
  },
  description: {
    backgroundColor: 'transparent',
    textAlign: 'center',
    fontSize: 30,
    padding: 40,
    color: '#ffffff'
  },
  searchInput: {
    height: 45,
    paddingLeft:15,
    paddingTop:10,
    paddingBottom:10,
    marginRight: 5,
    flexGrow: 1,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 25,
    color: '#acacac',
    backgroundColor:'#f5f5f5',
  },
  searchInputFalse: {
    height: 45,
    paddingLeft:15,
    paddingTop:10,
    paddingBottom:10,
    marginRight: 5,
    flexGrow: 1,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#fc2b4e',
    borderRadius: 25,
    color: '#acacac',
    backgroundColor:'#f5f5f5',
  },
});