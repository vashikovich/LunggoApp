'use strict';

import React, { Component } from 'react';
import {AUTH_LEVEL, fetchTravoramaApi} from '../../api/Common';
import * as Formatter from '../components/Formatter';
import Moment from 'moment';
import 'moment/locale/id';
import globalStyles from '../../commons/globalStyles';
import Button from 'react-native-button';
import { Rating, Icon } from 'react-native-elements';
import { StyleSheet, TouchableOpacity, Text, View, Image, TextInput,
  ScrollView, } from 'react-native';

export default class BookingDetail extends Component {

  constructor (props) {
    super(props);
    this.state = {
      // date : null,
      // shift: null,
      // pax: null,
    };
  }

  static navigationOptions = {
    title: 'Detail Pesanan'
  };

  setPaxListItemIndexes = indexes =>
    this.setState({paxListItemIndexes: indexes});
  setPax = pax => this.setState({pax});
  setSchedule = scheduleObj => this.setState(scheduleObj);

  _book = () => {
    this.setState({isLoading:true});
    const version = 'v1';
    let {pax, date} = this.state;
    let request = {
      method: 'POST',
      path: `/${version}/activities/book`,
      requiredAuthLevel: AUTH_LEVEL.User,
      data: {
        activityId: this.props.navigation.state.params.activityId,
        contact: {
          title: 1,
          name: "Testing",
          countryCallCd: 62,
          phone : 1234567890,
          email: "developer@travelmadezy.com"
        }, date, pax,
        // "ticketCount" : 2
        // pax: [
        //   {
        //     type : 1,
        //     title : 1,
        //     name : "guest 1",
        //     dob : "02-18-1997",
        //     nationality : "ID",
        //     passportNo : "1234567",
        //     passportExp : "02-18-2022",
        //     passportCountry : "en",
        //   }
        // ],
      }
    };
    fetchTravoramaApi(request).then( response => {
      this.setState({isLoading:false});
      if(response.status == 200)
        this.props.navigation.navigate(
          'WebViewScreen',{rsvNo:response.rsvNo}
        );
    }).catch(error => {
      this.setState({isLoading:false});
      console.log(error);
    }); 
  }

  _goToCalendarSelection = () => {
    let {navigation} = this.props;
    let {price, availableDateTimes } = navigation.state.params;
    let {date} = this.state;
    navigation.navigate('CalendarPicker', {
      price, availableDateTimes,
      setSchedule: this.setSchedule,
      selectedDate: date,
    });
  }

  render() {
    let {navigation} = this.props;
    let {price, requiredPaxData} = navigation.state.params;
    let {pax, date, paxListItemIndexes} = this.state;
    if (!paxListItemIndexes) paxListItemIndexes = [];

    let selectedDate = date ?
      Moment(date).format('ddd, D MMM YYYY')
      :
      'Atur Jadwal'

    let setDateButton = date ?
      <Text style={{fontSize: 12, color: '#01d4cb'}}> Ubah </Text>
      :
      <Icon name='plus' type='evilicon' size={26} color='#01d4cb'/>

    return (
      <View style={{flex:1, backgroundColor:'#fff'}}>
        <ScrollView style={{marginBottom:80}}>
          <View style={styles.container}>
            {/*<View style={{flexDirection: 'row'}}>
              <View style={{flex:1, marginRight:20,}}>
                <Image
                  style={styles.thumb}
                  source={require('../../assets/images/other-img1.jpg')}
                />
              </View>
              <View style={{flex:1.5}}>
                <Text style={styles.activitydetailTitle}>
                  Trip to Sahara Desert
                </Text>
                <View style={{flexDirection: 'row', marginBottom:5}}>
                  <Rating
                    // startingValue={3.6}
                    readonly
                    imageSize={12}
                    // onFinishRating={this.ratingCompleted}
                  />
                </View>
                <Text style={styles.activityDesc}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit, sed do eiusmod tempor incididunt ut labore et 
                  dolore magna aliqua. Ut enim ad minim veniam.
                </Text>
              </View>
            </View>*/}
            <View style={{flex: 1, flexDirection: 'row'}}>
              <Icon name='location' type='entypo' size={16} color='#454545'/>
              <View style={{marginTop:1, marginLeft:10}}>
                <Text style={{fontSize:14}}>
                  Jepang
                </Text>
              </View>
            </View>
            <View style={{flex: 1, flexDirection: 'row', marginTop:8}}>
              <Icon name='person' type='materialicons' size={16} color='#454545'/>
              <View style={{marginTop:1, marginLeft:10}}>
                <Text style={{fontSize:14}}>
                  Maksimum 6 orang
                </Text>
              </View>
            </View>
            <View style={{flex: 1, flexDirection: 'row', marginTop:8}}>
              <View style={{}}>
                <Icon
                name='event'
                type='materialicons'
                size={16}
                color='#454545'/>
              </View>
              <View style={{marginTop:1, marginLeft:10}}>
                <Text style={{fontSize:14}}>
                  Khusus hari minggu
                </Text>
              </View>
            </View>
            <View style={{flex: 1, flexDirection: 'row', marginTop:8}}>
              <View style={{}}>
                <Icon
                name='receipt'
                type='materialicons'
                size={16}
                color='#454545'/>
              </View>
              <View style={{marginTop:1, marginLeft:10}}>
                <Text style={{fontSize:14}}>
                  Untuk usia diatas 10 tahun
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.divider}/>
          <View style={styles.container}>
            <View>
              <View>
                <Text style={styles.activityTitle}>
                  Jadwal
                </Text>
              </View>
              <View style={{
                flexDirection:'row',
                justifyContent: 'space-between',
                borderBottomColor: '#efefef',
                borderBottomWidth:1,
                paddingBottom:20,
                marginVertical:20,
              }}>
                <Text>{selectedDate}</Text>
                <TouchableOpacity containerStyle={styles.addButton}
                  onPress={this._goToCalendarSelection} >
                  {setDateButton}
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <View style={{flexDirection:'row'}}>
                <View>
                  <Text style={styles.activityTitle}>
                    Peserta
                  </Text>
                </View>
                <View style={{flex:1,alignItems:'flex-end',}}>
                  <Text style={styles.seeMore}>5 orang</Text>
                </View>
              </View>
                {pax && pax.map(
                  item => <View  key={item.key} style={{paddingVertical:20, borderBottomWidth:1, borderBottomColor:'#efefef',}}>
                    <Text>{item.name}</Text>
                    </View>
                )}
              <View style={{
                flexDirection:'row',
                justifyContent: 'space-between',
                paddingBottom:20,
                marginTop:20
              }}>
                <Text>Tambah Peserta</Text>
                <TouchableOpacity
                  containerStyle={styles.addButton}
                  onPress={() => navigation.navigate('PaxChoice', {
                    price, requiredPaxData,
                    setPax: this.setPax,
                    setPaxListItemIndexes: this.setPaxListItemIndexes,
                    paxListItemIndexes: paxListItemIndexes.slice(),
                    paxCount: pax? pax.length : 0,
                  })}
                >
                  <Icon name='plus' type='evilicon' size={26} color='#01d4cb'/>
                </TouchableOpacity>
              </View>
            </View>
            
          </View>
        </ScrollView>

        {/*bottom CTA button*/}
        <View style={globalStyles.bottomCtaBarContainer}>
          <TouchableOpacity style={{flex:1.5}} onPress={
            () => this.props.navigation.navigate('RincianHarga')
          }>
            <View style={{alignItems: 'flex-start'}}>
              <Text style={{fontSize:12, color:'#676767',}}>
                  {selectedDate} (09.00)
                  {
                  // pax && pax.length>0 ? pax.length+' orang' : 'Start from'
                  }
              </Text> 
              <Text style={{color:'#000', fontWeight: 'bold', fontSize:20}}>
                { Formatter.price(price) // Formatter.price( pax && pax.length>0 ? pax.length*price : price)
                //<Text>/ 2 orang</Text>
                }
              </Text>
              <Text style={{marginTop:4, fontSize:11, color:'#01d4cb', fontWeight:'bold'}}>
                Lihat Rincian Harga
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{alignItems: 'flex-end', flex:1}}>
            <Button
              containerStyle={globalStyles.ctaButton}
              style={{fontSize: 16, color: '#fff', fontWeight:'bold'}}
              onPress={this._book}
              disabled={this.state.isLoading}
              styleDisabled={{color:'#aaa'}}
            >
              Pesan
            </Button>
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
    flex:1
  },
  addButton: {
    height:35,
    width:'100%',
    paddingTop:10,
    paddingBottom:10,
    overflow:'hidden',
    borderRadius:4,
    backgroundColor: '#437ef7',
  },
  thumb: {
    resizeMode:'cover', 
    width:'100%', 
    height:170,
    borderRadius:5
  },
  seeMore: {
    fontSize:14,
    color:'#676767',
    marginTop:3
  },
  activityTitle: {
    fontWeight:'bold',
    fontSize:15,
    color:'#454545',
    marginBottom:5
  },
  activitydetailTitle: {
    fontWeight:'bold',
    fontSize:18,
    color:'#454545',
    marginBottom:5
  },
  activityDesc: {
    fontSize:14,
    color:'#454545',
    lineHeight: 20,
  },
   divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#efefef',
    marginTop: 5,
    marginBottom: 5,
  },
});
