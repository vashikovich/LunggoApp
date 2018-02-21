'use strict';

import React from 'react';
import LoadingAnimation from '../../components/LoadingAnimation';
import BlankScreen from './WishlistBlankScreen';
import ListScreen from '../SearchActivity/ActivityResultScreen';

const { getItemAsync, setItemAsync, deleteItemAsync } = Expo.SecureStore;

export default class WishlistScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      list: [],
    };
    this._getWishlist = this._getWishlist.bind(this);
  }

  static navigationOptions = {
    title: 'Wishlist',
  };

  _getWishlist = async () => {
    let activityList = JSON.parse(await getItemAsync('wishlist'));
    this.setState({ list: activityList });
  }

  componentDidMount() {
    let { params } = this.props.navigation.state;
    if (params && !params.loggedIn) return;
    this.props.navigation.addListener('didFocus', this._getWishlist);
  }

  render() {
    let { isLoading, list } = this.state;
    let { props } = this;
    if (isLoading) return <LoadingAnimation />
    else if (list && list.length > 0)
      return <ListScreen list={list} isWishlist={true} {...props} />
    else return <BlankScreen {...props} />
  }
}

// const styles = StyleSheet.create({
// });