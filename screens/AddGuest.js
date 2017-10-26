'use strict';

import React, { Component } from 'react';
import Button from 'react-native-button';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
} from 'react-native';

export default class AddParticipant extends Component {

  constructor (props) {
    super(props)
    this.state = {
      friendName: null,
      birthDate : null,
      email : null,
      tel : null,
      idCardNo : null,
    };
  }

  static navigationOptions = {
    title: 'Peserta Baru',
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>
          Nama Peserta
        </Text>
        <TextInput
          underlineColorAndroid= 'transparent'
          style={styles.txtInput}
          onChangeText={ friendName => this.setState({friendName}) }
          value={this.state.friendName}
          placeholder="ex: John Doe"
        />
        <Text style={styles.label}>
          Tanggal Lahir
        </Text>
        <TextInput
          underlineColorAndroid= 'transparent'
          style={styles.txtInput}
          onChangeText={ birthDate => this.setState({birthDate}) }
          value={this.state.birthDate}
          placeholder="DD/MM/YYYY"
        />
        <Text style={styles.label}>
          Email
        </Text>
        <TextInput
          underlineColorAndroid= 'transparent'
          style={styles.txtInput}
          onChangeText={ email => this.setState({email}) }
          value={this.state.email}
          placeholder="example@email.com"
        />
        <Text style={styles.label}>
          No. Telp
        </Text>
        <TextInput
          underlineColorAndroid= 'transparent'
          style={styles.txtInput}
          onChangeText={ tel => this.setState({tel}) }
          value={this.state.tel}
          placeholder="0812345678"
        />
        <Text style={styles.label}>
          No. KTP / Passport
        </Text>
        <TextInput
          underlineColorAndroid= 'transparent'
          style={styles.txtInput}
          onChangeText={ idCardNo => this.setState({idCardNo}) }
          value={this.state.idCardNo}
          placeholder="01234567890"
        />
        <View style={{alignItems: 'flex-end',}}>
          <Button
            containerStyle={{
              height: 40,
              width: 90,
              paddingTop: 10,
              paddingBottom :10,
              overflow: 'hidden',
              borderRadius: 4,
              backgroundColor: '#437ef7',
            }}
            style={{fontSize: 14, color: '#ffffff'}}
            // onPress={() => this._blabla()}
          >
            Tambahkan
          </Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding:20,
    backgroundColor: '#fff',
    flex:1,
  },
  label: {
    marginBottom: 5,
  },
  txtInput: {
    height: 40, 
    borderColor: '#cdcdcd', 
    borderWidth: 1, 
    paddingRight:10, 
    paddingLeft:10, 
    marginBottom:20, 
  },
});
