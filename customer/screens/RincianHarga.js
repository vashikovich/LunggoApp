'use strict';

import React, { Component } from 'react';
import Button from 'react-native-button';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';

export default class LoginScreen extends Component<{}> {
  
  static navigationOptions = {
    title: 'Rincian',
  };

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Text style={styles.categoryTitle}>Rincian Harga</Text>
        </View>
        <View style={{marginTop:3}}>
          <Text style={{color:'#454545', fontSize:13, letterSpacing:.8,}}>Menginap di Legian, Bali</Text>
        </View>
        <View style={{marginTop:20}}>
          <View style={{flexDirection:'row', justifyContent:'space-between', marginVertical:20}}>
            <View style={{flex:2, paddingRight:0}}>
              <Text style={{color:'#454545', fontSize:14, letterSpacing:.8,}}>Rp 550.000 x 2 malam</Text>
            </View>
            <View style={{flex:1, alignItems:'flex-end'}}>
              <Text style={{color:'#454545', fontSize:14, letterSpacing:.8,}}>Rp 1.100.000</Text>
            </View>
          </View>
          <View style={{flexDirection:'row', justifyContent:'space-between', marginVertical:20}}>
            <View style={{flex:2, paddingRight:5}}>
              <Text style={{color:'#454545', fontSize:14, letterSpacing:.8,}}>2 Tamu</Text>
            </View>
            <View style={{flex:1, alignItems:'flex-end'}}>
              <Text style={{color:'#454545', fontSize:14, letterSpacing:.8,}}>Rp 200.000</Text>
            </View>
          </View>
          <View style={{flexDirection:'row', justifyContent:'space-between', marginVertical:20}}>
            <View style={{flex:2, paddingRight:5}}>
              <Text style={{color:'#454545', fontSize:14, letterSpacing:.8,}}>Kebersihan</Text>
              <View style={{marginTop:6}}>
                <Text style={{color:'#454545', fontSize:11, letterSpacing:.8, lineHeight:14}}>One-time fee charged by host to cover the coast of cleaning theri space</Text>
              </View>
            </View>
            <View style={{flex:1, alignItems:'flex-end'}}>
              <Text style={{color:'#454545', fontSize:14, letterSpacing:.8, }}>Rp 50.000</Text>
            </View>
          </View>
          <View style={{flexDirection:'row', justifyContent:'space-between', marginVertical:20}}>
            <View style={{flex:2, paddingRight:5}}>
              <Text style={{color:'#454545', fontSize:14, letterSpacing:.8,}}>Pelayanan</Text>
              <View style={{marginTop:6}}>
                <Text style={{color:'#454545', fontSize:11, letterSpacing:.8, lineHeight:14}}>One-time fee charged by host to cover the coast of cleaning theri space</Text>
              </View>
            </View>
            <View style={{flex:1, alignItems:'flex-end'}}>
              <Text style={{color:'#454545', fontSize:14, letterSpacing:.8, }}>Rp 50.000</Text>
            </View>
          </View>
          <View style={{flexDirection:'row', justifyContent:'space-between', borderTopWidth:1, borderTopColor:'#efefef', paddingTop:20}}>
            <View style={{flex:1, paddingRight:5}}>
              <Text style={{color:'#454545', fontSize:14, letterSpacing:.8,}}>Total</Text>
            </View>
            <View style={{flex:1, alignItems:'flex-end'}}>
              <Text style={{color:'#454545', fontSize:14, letterSpacing:.8, fontWeight:'bold' }}>Rp 1.400.000</Text>
            </View>
          </View>
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
  reviewTitle: {
    fontSize:16,
    color:'#454545',
  }, 
  categoryTitle :{
    fontWeight:'bold',
    fontSize:28,
    color:'#454545'
  },
  reviewreply: {
    marginLeft:20,
    marginTop:25,
  },
   thumbprofile: {
    height: 30,
    width:30,
    borderRadius: 15,
    marginRight: 10,
  },
  hyperlink: {
    fontSize:11,
    marginTop:5,
    color:'#437ef7',
  },
  isireview: {
    fontSize:13,
    marginTop:10,
    color:'#454545',
  },
  reviewDate: {
    fontSize:12,
    color:'#cecece'
  },
});
