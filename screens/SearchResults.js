'use strict';

import React, { Component } from 'react'
import {
  StyleSheet, Image, View, Text,
  TouchableHighlight, FlatList,
} from 'react-native';

//// Format price to Rp1.000.000
var priceFormatter = price => "Rp" +
  price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

class ListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.index);
  }

  render() {
    const item = this.props.item;
    // const price = item.price_formatted.split(' ')[0];
    return (
      <TouchableHighlight
        onPress={this._onPress}
        underlayColor='#dddddd'>
        <View style={styles.rowContainer}>
          <View style={styles.containerItem}>
            <Image style={styles.thumb}  source={{ uri: item.imgSrc }} />
            <View style={styles.textContainer}>
              <Text style={styles.title}numberOfLines={1}>{item.name}</Text>
              <Text style={styles.price}>{priceFormatter(item.price)}</Text>
              <View style={{flexDirection: 'row'}}>
                <Text style={{marginRight:7}}>Bintang</Text>
                <Text>20 Reviews</Text>
              </View>
            </View>
          </View>
          <View style={styles.containerItem2}>
            <Image style={styles.thumb} source={{ uri: item.imgSrc }} />
            <View style={styles.textContainer}>
              <Text style={styles.title}numberOfLines={1}>{item.name}</Text>
              <Text style={styles.price}>{priceFormatter(item.price)}</Text>
              <View style={{flexDirection: 'row'}}>
                <Text style={{marginRight:7}}>Bintang</Text>
                <Text>20 Reviews</Text>
              </View>
            </View>
          </View>

        </View>
      </TouchableHighlight>
    );
  }
}

export default class SearchResults extends Component {

  static navigationOptions = {
    title: 'Results',
  };
 
  _keyExtractor = (item, index) => index;

  _renderItem = ({item, index}) => (
    <ListItem
      item={item}
      index={index}
      onPressItem={this._onPressItem}
    />
  );

  _onPressItem = (index) => {
    console.log("Pressed row: "+index);
    this.props.navigation.navigate(
      'DetailScreen'//, { list: response.activityList}
    )
  };
  
  render() {
    return (
      <FlatList
        data={this.props.navigation.state.params.list}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem}
      />
    );
  }

}

const styles = StyleSheet.create({
  thumb: {
    resizeMode:'cover', 
    width:'100%', 
    height:170, 
    marginBottom:7,
  },
  textContainer: {
  },
  separator: {
    height: 1,
    backgroundColor: '#dddddd'
  },
  price: {
    color:'green'
  },
  title: {
  },
  rowContainer: {
    flexDirection: 'row',
    padding: 10,
    flex:1,
  },
  containerItem: {
    paddingRight:8,
    flex:1,
  },
  containerItem2: {
    flex:1,
  }
});