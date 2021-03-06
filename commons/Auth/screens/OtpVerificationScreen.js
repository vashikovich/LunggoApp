/*

===== UNDESIRED BEHAVIOR =====
- pindah fokus ketika input dan ketika backspace blm perfect

*/

'use strict';

import React from 'react';
import Button from 'react-native-button';
import {
  StyleSheet, Text, View, TextInput, ScrollView, Keyboard,
  KeyboardAvoidingView, TouchableOpacity, TouchableWithoutFeedback,
} from 'react-native';
import { sendOtp, verifyOtp } from '../ResetPasswordController';
import Moment from 'moment';
import LoadingModal from './../../components/LoadingModal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import OfflineNotificationBar from './../../components/OfflineNotificationBar';
import { phoneWithoutCountryCode_Indonesia, reversePhoneWithoutCountryCode_Indonesia } from '../../../customer/components/Formatter';

const defaultCooldown = 120;

export default class OtpVerificationScreen extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      inputs: [null, null, null, null, null, null],
      isLoading: false,
      cooldownExpireAt: null,
    }
  }

  componentDidMount() {
    let { countryCallCd, phone } = this.props.navigation.state.params;
    this._sendOtp({ countryCallCd, phoneNumber: phone });
  }

  componentWillUnmount() {
    clearInterval(this._itv);
  }

  _startCountDown = (value = defaultCooldown) => {
    let now = new Date();
    console.log(now);
    console.log(value);
    this._itv = setInterval(this._countingDown, 1000);
    this.setState({
      cooldown: value,
      cooldownExpireAt: Moment(now).add(value, 'seconds'),
      showCooldown: true
    });

  }

  _countingDown = () => {
    let cooldown = this.getRemainingCooldown();
    this.setState({ cooldown });
    if (cooldown <= 0) {
      clearInterval(this._itv);
      this.setState({ showCooldown: false, cooldownExpireAt: null });
    }
  }

  _sendOtp = () => {
    let cooldown = this.getRemainingCooldown();
    if (cooldown > 0) return;

    let { countryCallCd, phone, email } = this.props.navigation.state.params;
    this.setState({ isLoading: true });
    sendOtp({countryCallCd, phoneNumber: phone, email}).then(response => {
      if (response.error = 'ERR_TOO_MANY_SEND_SMS_IN_A_TIME')
        this._startCountDown(response.resendCooldown);
      else
        this._startCountDown();
    }).finally(() => this.setState({ isLoading: false }));
  }

  _verifyOtp = () => {
    Keyboard.dismiss();
    let { navigation } = this.props;
    let { countryCallCd, phone, email, onVerified } = navigation.state.params;
    let otp = this.state.inputs.join('');
    this.setState({ isLoading: true });
    verifyOtp(countryCallCd, phone, otp).then(response => {
      if (response.status === 200) {
        clearInterval(this._itv);
        onVerified({ countryCallCd, phone, email, otp, navigation });
      } else
        this.setState({ errorMessage: response.message })
    }).catch(err => console.error(err)
    ).finally(() => this.setState({ isLoading: false }));;
  }

  _onChangeText = (inputText, index) => {
    let indexToFocus;
    //// if user was deleting text
    if (inputText.length == 0) {
      // if this textInput is the first one, do nothing
      // else focus on previous TextInput
      if (index > 0) indexToFocus = index - 1;
    } else { // if user was inserting text
      // if this textInput is the last one, do nothing
      // else focus on next TextInput
      if (index < 5) indexToFocus = index + 1;
    }
    //// update state
    this.state.inputs[index] = inputText;
    this.setState({ errorMessage: null });
    if (indexToFocus) this.refs['input-' + indexToFocus].focus();
  }

  _onKeyPress = ({ nativeEvent }, index) => {
    if (index == 0) return;
    if (nativeEvent.key == 'Backspace') {
      let indexToFocus = index - 1;
      let { inputs } = this.state;
      if (inputs[index] == '') inputs[indexToFocus] = '';
      this.refs['input-' + indexToFocus].focus();
    }
  }

  getRemainingCooldown() {
    let { cooldownExpireAt } = this.state;
    console.log(cooldownExpireAt);
    console.log(Math.ceil((cooldownExpireAt - new Date()) / 1000));
    return Math.ceil((cooldownExpireAt - new Date()) / 1000);
  }

  render() {
    let { inputs, isLoading, errorMessage, cooldown, showCooldown } = this.state;
    let { countryCallCd, phone, email } = this.props.navigation.state.params;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        
         <View style = {styles.container}>
         <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" enableOnAndroid={true} enableAutomaticScroll={true}>
          <LoadingModal isVisible={this.state.isLoading} />
          <View style={{ marginBottom: 30 }}>
            <Text style={styles.categoryTitle}>Masukkan Kode Verifikasi</Text>
          </View>
          <Text style={{ marginBottom: 30 }}>
            Kode verifikasi telah dikirimkan ke {email || `nomor ${reversePhoneWithoutCountryCode_Indonesia(phone)}`}
          </Text>
          {errorMessage ?
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ color: '#fc2b4e' }}>{errorMessage}</Text>
            </View> : null
          }
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.searchInput}
                keyboardType='numeric'
                underlineColorAndroid='transparent'
                maxLength={1}
                ref='input-0'
                autoFocus={true}
                selectTextOnFocus={true}
                value={inputs[0]}
                onKeyPress={e => this._onKeyPress(e, 0)}
                onChangeText={input => this._onChangeText(input, 0)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.searchInput}
                keyboardType='numeric'
                underlineColorAndroid='transparent'
                maxLength={1}
                ref='input-1'
                selectTextOnFocus={true}
                value={inputs[1]}
                onKeyPress={e => this._onKeyPress(e, 1)}
                onChangeText={input => this._onChangeText(input, 1)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.searchInput}
                keyboardType='numeric'
                underlineColorAndroid='transparent'
                maxLength={1}
                ref='input-2'
                selectTextOnFocus={true}
                value={inputs[2]}
                onKeyPress={e => this._onKeyPress(e, 2)}
                onChangeText={input => this._onChangeText(input, 2)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.searchInput}
                keyboardType='numeric'
                underlineColorAndroid='transparent'
                maxLength={1}
                ref='input-3'
                selectTextOnFocus={true}
                value={inputs[3]}
                onKeyPress={e => this._onKeyPress(e, 3)}
                onChangeText={input => this._onChangeText(input, 3)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.searchInput}
                keyboardType='numeric'
                underlineColorAndroid='transparent'
                maxLength={1}
                ref='input-4'
                selectTextOnFocus={true}
                value={inputs[4]}
                onKeyPress={e => this._onKeyPress(e, 4)}
                onChangeText={input => this._onChangeText(input, 4)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.searchInput}
                keyboardType='numeric'
                underlineColorAndroid='transparent'
                maxLength={1}
                ref='input-5'
                selectTextOnFocus={true}
                value={inputs[5]}
                onKeyPress={e => this._onKeyPress(e, 5)}
                onChangeText={input => this._onChangeText(input, 5)}
                returnKeyType='done'
                onSubmitEditing={this._verifyOtp}
              />
            </View>
          </View>
          <Button
            containerStyle={{ marginTop: 50, height: 45, paddingTop: 13, paddingBottom: 10, overflow: 'hidden', borderRadius: 25, backgroundColor: '#01d4cb', }}
            style={{ fontSize: 16, color: '#ffffff' }}
            onPress={this._verifyOtp}
            disabled={isLoading}
            styleDisabled={{ color: '#aaa' }}
          >
            Verifikasi
          </Button>
          <TouchableOpacity style={{ alignItems: 'center', marginTop: 15, }}
            onPress={this._sendOtp} activeOpacity={cooldown ? 1 : 0}
          >
            <Text style={{
              textAlign: 'center',
              color: cooldown ? 'gray' : '#01d4cb',
            }}>
              {showCooldown ? `Tunggu ${cooldown} detik untuk dapat mengirim ulang kode verifikasi` : 'Kirim ulang kode verifikasi'}
            </Text>
          </TouchableOpacity>
          <OfflineNotificationBar />
          </KeyboardAwareScrollView>
          </View>
        
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  categoryTitle: {
    fontWeight: 'bold',
    fontSize: 26,
    color: '#454545'
  },
  mediumText: {
    fontSize: 15,
    color: '#454545'
  },
  smallText: {
    fontSize: 13,
    color: '#afafaf',
    textAlign: 'justify'
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
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    height: 50,
    paddingLeft: 0,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 5,
    flexGrow: 1,
    fontSize: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 25,
    color: '#acacac',
    backgroundColor: '#f5f5f5',
  },
});
