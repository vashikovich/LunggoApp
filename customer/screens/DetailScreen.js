'use strict';

import React from 'react';
import {
  Platform, StyleSheet, Text, View, Image, TextInput,
  ScrollView, TouchableOpacity, Animated
} from 'react-native';
import * as Formatter from '../components/Formatter';
import globalStyles from '../../commons/globalStyles';
import Colors from '../../constants/Colors';
import ImageSlider from 'react-native-image-slider';
import Accordion from '../components/Accordion';
import MapView, { Marker } from 'react-native-maps';
import Button from 'react-native-button';
import { Rating, Icon } from 'react-native-elements';
import WishButton from '../components/WishButton';
import Swiper from 'react-native-swiper';
import LoadingAnimation from '../components/LoadingAnimation';
import {
  AUTH_LEVEL, fetchTravoramaApi, checkUserLoggedIn,
} from '../../api/Common';
import { APP_TYPE } from '../../constants/env';

export default class DetailScreen extends React.Component {

  constructor(props) {
    super(props)
    let { details, id } = this.props.navigation.state.params || {};;
    if (!details) {   //// if params.details doesnt exist,
      this.state = {  //// use default state object
        isLoading: true,
        id: 1,
        requiredPaxData: '',
        name: 'loading activity name...',
        city: 'loading address...',
        duration: { amount: 'loading ', unit: 'duration...' },
        price: '...',
        sliderImages: [],
        lat: 0,
        long: 0,
        review: {
          rating: 0.0,
          reviewCount: 0
        },
        contents: []
      }
    } else {
      details.sliderImages = [details.mediaSrc];
      this.state = details; //// prevent error when params == undefined
      this.state.review = {
        rating: 0.0,
        reviewCount: 0,
      };
      this.state.lat = 0;
      this.state.long = 0;
      this.state.contents = [];
    }
    this.state.scrollY = new Animated.Value(0);
    this.state.isLoading = true;
  }

  static navigationOptions = { header: null }

  componentDidMount() {
    const version = 'v1';
    const { id } = this.state;
    let request = {
      path: `/${version}/activities/${id}`,
      requiredAuthLevel: AUTH_LEVEL.Guest,
    };
    fetchTravoramaApi(request).then(response => {
      this.setState(response.activityDetail);
      this.setState({ isLoading: false });
      if (!response.activityDetail.package) {
        console.log('PACKAGES:');
        console.log(response.activityDetail.package);
        console.error(response.activityDetail.package);
      }
    }).catch(error => console.log(error));

    request.path = `/${version}/activities/${id}/availabledates`;
    fetchTravoramaApi(request).then(response => {
      this.setState(response);
      // this.forceUpdate( () => {/*this.marker.showCallout()*/} );
    }).catch(error => console.log(error));
  }

  render() {
    const { requiredPaxData, isLoading, name, city, duration, price, id,
      sliderImages, address, lat, long, wishlisted, shortDesc, contents,
      review, reviewCount, rating, ratingCount } = this.state;
    return (
      <View>
        <ScrollView
          style={{ backgroundColor: '#fff' }}
          onScroll={Animated.event([
            { nativeEvent: { contentOffset: { y: this.state.scrollY } } },
          ])}
          scrollEventThrottle={16}
        >

          <MediaContents media={sliderImages} />

          <View style={styles.container}>


            {isLoading && (
              <LoadingAnimation />
            )}

            {!isLoading && (
              <View>
                <MainInfo name={name} shortDesc={shortDesc} city={city} duration={duration} />
                <Contents contents={contents} />

                <View style={styles.divider} />

                <TouchableOpacity onPress={() => this.props.navigation.navigate('CancelationPolicy')}>
                  <View style={{ flex: 1, marginTop: 15, marginBottom: 15, }}>
                    <Text style={{ color: '#000', fontSize: 16, }}>
                      Ketentuan Pembatalan
                </Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.divider} />

                <ReviewAndRating rating={rating} ratingCount={ratingCount} review={review} reviewCount={reviewCount} id={id} {...this.props} />

                <View style={styles.divider} />

                <Map lat={lat} long={long} name={name} address={address} city={city} {...this.props} />
                <Accordion style={styles.containerdescriptionActivity}
                  sections={[
                    {
                      title: 'Agenda',
                      content: 'Lorem ipsum dolor sit amet, consectetur ',
                    },
                    {
                      title: 'Participant Requirement',
                      content: 'Lorem ipsum...',
                    },
                    {
                      title: 'Cancelation Policy',
                      content: 'Lorem ipsum...',
                    },
                  ]} />
                <Recommendation />
              </View>
            )}
          </View>
          <View style={{ paddingBottom: 65 }}></View>

        </ScrollView>

        <Header wishlisted={wishlisted} id={id} scrollY={this.state.scrollY} title={name} {...this.props} />
        {!isLoading && (
          <Footer price={price} details={this.state} {...this.props} />
        )}

      </View>
    );
  }
}

class Footer extends React.Component {
  constructor(props) {
    super();
    this.state = { isLoading: false };
  }

  _goToBookingDetail = async () => {
    this.setState({ isLoading: true })
    const { requiredPaxData, price, id, availableDateTimes } = this.props.details;
    let isUserLoggedIn = await checkUserLoggedIn();
    let nextScreen = isUserLoggedIn ? 'BookingDetail' : 'LoginScreen';
    this.props.navigation.navigate(nextScreen, {
      price, requiredPaxData, availableDateTimes,
      package: this.props.details.package,
      activityId: id,
    });
    this.setState({ isLoading: false })
  }

  _goToEditActivity = () => this.props.navigation.navigate('EditDetailActivity');

  _onCtaButtonClick = () => {
    //// if customer
    if (APP_TYPE == 'CUSTOMER') this._goToBookingDetail();
    //// if operator
    if (APP_TYPE == 'OPERATOR') this._goToEditActivity();
  }

  render() {
    let { price } = this.props;
    return (
      <View style={globalStyles.bottomCtaBarContainer}>
        <View style={{ alignItems: 'flex-start', flex: 1.5 }}>
          <View >
            <Text style={{ fontSize: 12, color: '#676767', }}>Start from</Text>
          </View>
          <View>
            <Text style={{
              color: '#000',
              fontWeight: 'bold',
              fontSize: 20,
            }}>{Formatter.price(price)}</Text>
          </View>

        </View>
        <View style={{ alignItems: 'flex-end', flex: 1 }}>
          <Button
            containerStyle={globalStyles.ctaButton}
            style={{ fontSize: 16, color: '#fff', fontWeight: 'bold' }}
            onPress={this._onCtaButtonClick}
            disabled={this.state.isLoading}
            styleDisabled={{ color: '#aaa' }}
          >
            {(APP_TYPE == 'CUSTOMER') ? 'Pesan' : 'Edit'}
          </Button>
        </View>
      </View>
    );
  }
}

class Header extends React.Component {

  componentWillMount() {
    let half = [200, 400];
    let sudden = [380, 400];
    this.setState({
      backgroundColor: this.props.scrollY.interpolate({
        inputRange: half,
        outputRange: ['#fff0', '#ffff'],
        extrapolate: 'clamp',
      }),
      elevation: this.props.scrollY.interpolate({
        inputRange: half,
        outputRange: [0, 2],
        extrapolate: 'clamp',
      }),
      opacity: this.props.scrollY.interpolate({
        inputRange: sudden,
        outputRange: [0, 1],
        extrapolate: 'clamp',
      })
    });
  }
  
  _goBack = () => this.props.navigation.goBack()

  render() {
    let { wishlisted, id, title } = this.props;
    let { backgroundColor, elevation, opacity } = this.state;
    return (
      <Animated.View style={[styles.headerBackground, {backgroundColor, elevation} ]}>
        <View style={styles.headerContentContainer}>
          <TouchableOpacity style={{ flex: 1, alignItems: 'flex-start'}} onPress={this._goBack}>
            <Icon name='arrow-back' type='materialicons' size={30} color='#000' />
          </TouchableOpacity>
          <Animated.View style={{opacity}}>
            <Text style={[styles.activitydetailTitle,{marginTop:7}]}>{title}</Text>
          </Animated.View>
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row'}}>
            {/* <TouchableOpacity style={{ marginLeft: 10 }}>
              <Icon name='share' type='materialicons' size={30} color='#000' />
            </TouchableOpacity> */}
            <WishButton wishlisted={wishlisted} id={id} big={true}
              {...this.props} style={{ marginLeft: 10 }} unwishlistedColor={'#000'} />
          </View>
        </View>
      </Animated.View>
    );
  }
}

class Recommendation extends React.Component {

  render() {
    return (
      <View>
        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Similiar Activities</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end', }}>
              <Text style={styles.seeMore}>See More</Text>
            </View>
          </View>
        </View>



        <View style={{ flex: 1, flexDirection: 'row', }}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={{ width: 140, marginLeft: 15, }}>
              <Image style={styles.thumbnailMedium} source={require('../../assets/images/other-img1.jpg')} />
              <View style={{ marginTop: 8, flexDirection: 'row' }}>
                <View style={{ flex: 4, }}>
                  <Text style={styles.namaKota}>
                    Jepang
                    </Text>
                  <Text style={styles.activityTitle}>
                    Create your own Sushi
                    </Text>
                  <Text style={styles.priceTitle}>
                    IDR 300.000
                    </Text>
                  <View>
                    <Rating
                      type="star"
                      fractions={1}
                      startingValue={3.6}
                      readonly
                      imageSize={11}
                      ratingColor="#00c5bc"
                      onFinishRating={this.ratingCompleted}
                      style={{ paddingTop: 2.5, marginRight: 5, }}
                    />
                  </View>
                </View>
                <View style={{ flex: 1, marginTop: 0 }}>
                  <Icon
                    name='favorite-border'
                    type='materialicons'
                    size={24}
                    color='#cdcdcd' />
                </View>
              </View>
            </View>
            <View style={{ width: 140, marginLeft: 15, }}>
              <Image style={styles.thumbnailMedium} source={require('../../assets/images/other-img2.jpg')} />
              <View style={{ marginTop: 8, flexDirection: 'row' }}>
                <View style={{ flex: 4, }}>
                  <Text style={styles.namaKota}>
                    Jepang
                    </Text>
                  <Text style={styles.activityTitle}>
                    Create your own Sushi
                    </Text>
                  <Text style={styles.priceTitle}>
                    IDR 300.000
                    </Text>
                  <View>
                    <Rating
                      type="star"
                      fractions={1}
                      startingValue={3.6}
                      readonly
                      imageSize={11}
                      ratingColor="#00c5bc"
                      onFinishRating={this.ratingCompleted}
                      style={{ paddingTop: 2.5, marginRight: 5, }}
                    />
                  </View>
                </View>
                <View style={{ flex: 1, marginTop: 0 }}>
                  <Icon
                    name='favorite-border'
                    type='materialicons'
                    size={24}
                    color='#cdcdcd' />
                </View>
              </View>
            </View>
            <View style={{ width: 140, marginLeft: 15, marginRight: 15 }}>
              <Image style={styles.thumbnailMedium} source={require('../../assets/images/other-img3.jpg')} />
              <View style={{ marginTop: 8, flexDirection: 'row' }}>
                <View style={{ flex: 4, }}>
                  <Text style={styles.namaKota}>
                    Jepang
                    </Text>
                  <Text style={styles.activityTitle}>
                    Create your own Sushi
                    </Text>
                  <Text style={styles.priceTitle}>
                    IDR 300.000
                    </Text>
                  <View>
                    <Rating
                      type="star"
                      fractions={1}
                      startingValue={3.6}
                      readonly
                      imageSize={11}
                      ratingColor="#00c5bc"
                      onFinishRating={this.ratingCompleted}
                      style={{ paddingTop: 2.5, marginRight: 5, }}
                    />
                  </View>
                </View>
                <View style={{ flex: 1, marginTop: 0 }}>
                  <Icon
                    name='favorite-border'
                    type='materialicons'
                    size={24}
                    color='#cdcdcd' />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
}

class Contents extends React.Component {

  render() {
    let { contents } = this.props;
    return contents.length ?
      (<View>
        {contents.map((content, index) => (
          <View style={styles.containerdescriptionActivity} key={index}>
            <Text style={styles.sectionTitle}>
              {content.title}
            </Text>
            <Text style={styles.activityDesc}>
              {content.desc}
            </Text>
          </View>
        ))}
      </View>) :
      null;
  }
};

class MainInfo extends React.Component {

  render() {
    console.log('main info rerendered');
    let { name, shortDesc, city, duration } = this.props;
    return (
      <View>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.activitydetailTitle}>
            {name}
          </Text>
        </View>
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.activityDesc}>
            {shortDesc}
          </Text>
        </View>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Icon name='ios-pin' type='ionicon' size={18} color='#454545' />
          <View style={{ marginTop: 1, marginLeft: 10 }}>
            <Text style={styles.activityDesc}>
              {city}
            </Text>
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: 'row', marginTop: 8 }}>
          <Icon name='ios-person' type='ionicon' size={18} color='#454545' />
          <View style={{ marginTop: 1, marginLeft: 10 }}>
            <Text style={styles.activityDesc}>
              DUMMY Maksimum 6 orang
                </Text>
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: 'row', marginTop: 8 }}>
          <Icon name='ios-calendar' type='ionicon' size={18} color='#454545' />
          <View style={{ marginTop: 1, marginLeft: 10 }}>
            <Text style={styles.activityDesc}>
              DUMMY Khusus hari minggu
                </Text>
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: 'row', marginTop: 8 }}>
          <Icon name='ios-clipboard' type='ionicon' size={18} color='#454545' />
          <View style={{ marginTop: 1, marginLeft: 10 }}>
            <Text style={styles.activityDesc}>
              DUMMY Untuk usia diatas 10 tahun
                </Text>
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Image style={styles.icon}
            source={require('../assets/icons/time.png')}
          />
          <Text style={styles.timeActivity}>
            {duration.amount + " " + duration.unit}
          </Text>
        </View>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Image style={styles.icon}
            source={require('../assets/icons/person.png')} />
          <Text style={styles.timeActivity}>
            DUMMY **20 orang**
          </Text>
        </View>
      </View>
    );
  }
}

class MediaContents extends React.Component {

  render() {
    let activeDot = <View style={styles.activeDot} />
    let dot = <View style={styles.dot} />
    let { media } = this.props;
    return (
      <Swiper style={styles.wrapper} activeDot={activeDot} dot={dot} showsButtons={false}>
        {media.map(m => (
          <View style={styles.slides} key={m} >
            <Image style={styles.slides} source={{ uri: m }} />
          </View>
        ))}
      </Swiper>
    )
  }
}

class Map extends React.Component {

  _enlargeMapView = () => {
    let { name, address, city, lat, long } = this.props;
    this.props.navigation.navigate('MapScreen',
      { name, address, city, lat, long }
    );
  }

  render() {
    let { name, address, city, lat, long } = this.props;
    return (
      <View style={styles.containerdescriptionActivity}>
        <TouchableOpacity onPress={this._enlargeMapView}>
          <MapView
            style={{ width: "100%", height: 150 }}
            region={{
              latitude: lat,
              longitude: long,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            zoomEnabled={false}
            rotateEnabled={false}
            scrollEnabled={false}
            pitchEnabled={false}
          >
            <Marker
              coordinate={{ latitude: lat, longitude: long }}
              title={address}
              description={city}
              ref={marker => (this.marker = marker)}
            />
          </MapView>
        </TouchableOpacity>
        <Text>
          {address}
        </Text>
      </View>
    )
  }
}

class ReviewAndRating extends React.Component {

  render() {
    let { rating, ratingCount, review, reviewCount, id } = this.props;
    return (
      <View>
        {!reviewCount && (
          <View style={{ flex: 1, marginTop: 15, marginBottom: 15, }}>
            <Text style={{ color: '#000', fontSize: 16, }}>
              Belum ada review
            </Text>
          </View>
        )}
        {!!reviewCount && (
          <View style={styles.containerdescriptionActivity}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <View style={{ flex: 2, flexDirection: 'row' }}>
                <View style={{ marginRight: 10 }}>
                  <Image style={styles.avatar} source={(review.avatar && {uri:review.avatar}) || require('../../assets/images/dummyProfile.png')} />
                </View>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end', }}>
                <Text style={styles.reviewDate}>
                  {Formatter.dateLong(review.date)}
                </Text>
              </View>
            </View>
            <View style={{ marginTop: 10 }}>
              <Text style={styles.reviewTitle}>
                {review.name}
              </Text>
              <Text style={styles.isireview}>
                {review.content}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.divider} />

        {!!reviewCount && (
          <TouchableOpacity onPress={() => reviewCount != 0 && this.props.navigation.navigate('Review', {id, rating, ratingCount})} >
            <View style={{ flex: 1, marginTop: 15, marginBottom: 15, flexDirection: 'row', }}>
              <View style={{ marginTop: 3, flexDirection: 'row', flex: 1 }}>
                <View>
                  <Text style={{ color: '#454545', fontSize: 18, fontWeight: 'bold' }}>{rating}</Text>
                </View>
                <Icon name='star' type='fontawesome' size={20} color='#00c5bc' />
              </View>

              <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end', flexDirection: 'row', flex: 2 }}>

                <View style={{ marginBottom: 5 }}>
                  <Text style={{ color: '#454545', fontSize: 16, }}>
                    Lihat semua {reviewCount} review
                  </Text>
                </View>
                <View style={{ marginLeft: 10, }}>
                  <Icon
                    name='chevron-right'
                    type='entypo'
                    size={24}
                    color='#00c5bc' />
                </View>

              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    )
  };
}

const styles = StyleSheet.create({
  headerContentContainer: {
    padding: 10,
    paddingTop: 20,
    flexDirection: 'row',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 60,
    borderBottomWidth: 0
  },
  container: {
    padding: 15,
    backgroundColor: '#fff',
  },
  similarActivityContainer: {
    marginRight: 10,
    width: 150,
    // flex:1,
  },
  wrapper: { height: 400 },
  slides: {
    flex: 1,
    width: '100%',
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: '#9DD6EB',
  },
  thumbnailMedium: {
    resizeMode: 'cover',
    width: 140,
    height: 150,
    borderRadius: 5,
  },
  namaKota: {
    fontSize: 12,
    color: '#454545',
  },
  avatar: {
    width: 40,
    height: 40,
    resizeMode: 'cover',
    borderRadius: 20
  },
  activityTitle: {
    fontFamily: 'Hind-Bold',
    fontSize: 15,
    color: '#454545',
    ...Platform.select({
      ios: {
        lineHeight: 15 * 0.8,
        paddingTop: 20 - (19 * 0.4),
        //backgroundColor:'red'
      },
      android: {
        lineHeight: 24
        //paddingTop: 23 - (23* 1),

      },
    }),
  },
  activitydetailTitle: {
    fontFamily: 'Hind-Bold',
    fontSize: 19,
    color: '#454545',
    ...Platform.select({
      ios: {
        lineHeight: 15 * 0.8,
        paddingTop: 20 - (19 * 0.4),
        marginBottom: -15,
        //backgroundColor:'red'
      },
      android: {
        lineHeight: 24
        //paddingTop: 23 - (23* 1),

      },
    }),
  },
  priceTitle: {
    fontSize: 12,
    color: '#676767',
    marginTop: 2
  },
  seeMore: {
    fontSize: 14,
    color: '#acacac'
  },
  activityDesc: {
    fontSize: 16,
    color: '#454545',
    fontFamily: 'Hind',
    ...Platform.select({
      ios: {
        lineHeight: 15 * 0.8,
        paddingTop: 10,
        marginBottom: -10
      },
      android: {
        //lineHeight:24
        //paddingTop: 23 - (23* 1),

      },
    }),
  },
  containerdescriptionActivity: {
    marginBottom: 30,
    marginTop: 30,
    flex: 1
  },
  containersimiliarActivity: {
    marginBottom: 20,
    marginTop: 20,
    flex: 1
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 7,
    color: '#454545',
  },

  reviewTitle: {
    fontSize: 15,
    marginBottom: 5,
    color: '#454545',
  },
  reviewDate: {
    fontSize: 12,
    color: '#cecece'

  },
  hyperlink: {
    fontSize: 11,
    marginTop: 8,
    color: '#437ef7',
    textDecorationLine: 'underline',
  },
  isireview: {
    fontSize: 11,
    marginTop: 10,
  },
  thumbprofile: {
    height: 30,
    width: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  ul: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 10,
  },
  li: {
    fontSize: 11,
    marginRight: 8
  },
  icon: {
    width: 15,
    height: 15,
    marginRight: 5,
  },
  descriptionActivity: {
    fontSize: 11,
    lineHeight: 15,
  },
  lidescriptionActivity: {
    fontSize: 11,
    marginBottom: 2,
    lineHeight: 15,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#efefef',
  },
  locationActivity: {
    fontSize: 12,
    marginBottom: 5,
  },
  timeActivity: {
    fontSize: 12,
    marginBottom: 5,
  },
  detailimg: {
    width: '100%',
    height: 350,
    resizeMode: 'cover',
  },
  activeDot: {
    backgroundColor: '#01aebc',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  dot: {
    backgroundColor: '#fff',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  }
});