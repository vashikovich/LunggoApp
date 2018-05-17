'use strict';

import React from 'react';
import { StyleSheet, View, Text, NetInfo, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';

export default class OfflineNotificationBar extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      isConnected: null,
      isClosed: false,
    };
    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this._handleConnectivityChange
    );
  }

  componentDidMount() {
    this.checkIsConnected();
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener(
        'connectionChange',
        this._handleConnectivityChange
    );
  }

  componentWillReceiveProps({isClosed}) {
    this.setState({isClosed});
  }

  checkIsConnected = async () => {
    const isConnected = await NetInfo.isConnected.fetch();
    this._handleConnectivityChange(isConnected);
    return isConnected;
  }
  
  _handleConnectivityChange = isConnected =>
    this.setState({isConnected})

  _onClose = () => this.setState({isClosed: true})

  render() {
    // return ( !this.state.isConnected && !this.state.isClosed &&
    return ( 
    	<View style={styles.offlineState}>
        <Text style={{color:'#fff'}}>
          <Text style={{color:'#fff', fontWeight:'bold'}}>Error! </Text>
          Terputus dari jaringan
        </Text>
        <TouchableOpacity onPress={this._onClose}>
          <Icon
            style={{ width: 45, alignItems: 'center', }}
            name='md-close'
            type='ionicon'
            size={26}
            color='#fff'
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  offlineState: {
    backgroundColor:'#fd5751',
    justifyContent:'space-between', 
    alignItems:'center', 
    flexDirection:'row', 
    paddingHorizontal:15, 
    position:'absolute', 
    bottom:0, 
    width:'100%', 
    height:60,  
    borderTopColor:'#e1e1e1', 
    borderTopWidth:1,
  },
});