'use strict';
                    
import React from 'react';
import {AUTH_LEVEL, fetchTravoramaApi} from '../../api/Common';
import * as Formatter from '../components/Formatter';
import Moment from 'moment';
import 'moment/locale/id';
import globalStyles from '../../commons/globalStyles';
import Button from 'react-native-button';
import { Rating, Icon } from 'react-native-elements';
import { StyleSheet, TouchableOpacity, Text, View, Image, TextInput,
  ScrollView, } from 'react-native';


async function fetchTravoramaCartAddApi(rsvNo) {
  const version = 'v1';
  let response = await fetchTravoramaApi({
    method: 'PUT',
    path: `/${version}/cart/${rsvNo}`,
    requiredAuthLevel: AUTH_LEVEL.User,
  });
  return response;
}

async function fetchTravoramaBookApi(data) {
  const version = 'v1';
  let response = await fetchTravoramaApi({
    method: 'POST',
    path: `/${version}/activities/book`,
    requiredAuthLevel: AUTH_LEVEL.User,
    data,
  });
  return response;
}

export default class BookingDetail extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      isDateSelected: true,
      isPaxFilled: true,
    };
  }

  static navigationOptions = {
    title: 'Detail Pesanan'
  };

  setPaxListItemIndexes = indexes =>
    this.setState({paxListItemIndexes: indexes});

  setPax = pax => {
    let changes = {pax}
    if (pax.length>0) changes.isPaxFilled = true;
    this.setState(changes);
  }

  setSchedule = scheduleObj => {
    scheduleObj.isDateSelected = true;
    this.setState(scheduleObj);
  }

  _book = async () => {
    let {pax, date} = this.state;

    //// validation
    if (!pax) this.setState({isPaxFilled:false});
    if (!date) this.setState({isDateSelected:false});
    if (!pax || !date) return;

    //// prepare fetching book
    this.setState({isLoading:true});
    let data = {
      date, pax,
      activityId: this.props.navigation.state.params.activityId,
      contact: {
        title: 1,
        name: "Testing",
        countryCallCd: 62,
        phone : 1234567890,
        email: "developer@travelmadezy.com"
      },
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
    };
    try {
      this.setState({isLoading:false});
      let response = await fetchTravoramaBookApi(data);
      if(response.status != 200) {
        console.error("Book API: status other than 200 returned!");
        console.log(response);
        return;
        // this.props.navigation.navigate(
        //   'WebViewScreen',{rsvNo:response.rsvNo}
        // );
      }

      //// after done booking and get RsvNo, add item to cart
      response = await fetchTravoramaCartAddApi(response.rsvNo);
      if (response.status != 200) {
        console.error("Cart API: status other than 200 returned!");
        console.log(response);
        return;
      } else console.log(response);
      //// TODO : DO SOMETHING HERE

    } catch (error) {
      this.setState({isLoading:false});
      console.log(error);
    }
  }

  _goToCalendarPicker = () => {
    let {navigation} = this.props;
    let {price, availableDateTimes } = navigation.state.params;
    navigation.navigate('CalendarPicker', {
      price, availableDateTimes,
      setSchedule: this.setSchedule,
      selectedDate: this.state.date,
    });
  }

  render() {
    let {navigation} = this.props;
    let {price, requiredPaxData} = navigation.state.params;
    let {pax, date, paxListItemIndexes} = this.state;
    if (!paxListItemIndexes) paxListItemIndexes = [];

    let selectedDateText = date ?
      Moment(date).format('ddd, D MMM YYYY')
      :
      'Atur Jadwal'

    let setDateButton = date ?
      <Text style={{fontSize: 12, color: '#01d4cb'}}> Ubah </Text>
      :
      <Icon name='plus' type='evilicon' size={26} color='#01d4cb'/>

    let rincianHarga = (pax && date) ?
      <TouchableOpacity style={{flex:1.5}} onPress={
        () => this.props.navigation.navigate('RincianHarga')
      }>
        <View style={{alignItems: 'flex-start'}}>
          <View>
            <Text style={{fontSize:15, color:'#000',}}>
              Total
              {/* pax && pax.length>0 ? pax.length+' orang' : 'Start from'*/}
            </Text> 
          </View>
          <View style={{marginTop:3}}>
            <Text style={{
              color:'#000',
              fontWeight: 'bold',
              fontSize:17,
            }}>{ Formatter.price(price) /* Formatter.price( pax && pax.length>0 ? pax.length*price : price)*/}</Text>
            {/*<Text>/ 2 orang</Text>*/}
          </View>
          <View style={{marginTop:4}} >
            <Text style={{fontSize:11, color:'#01d4cb', fontWeight:'bold'}}>Lihat Rincian Harga</Text> 
          </View>
        </View>
      </TouchableOpacity>
      :
      <View style={{flex:1.5, justifyContent:'center'}} />

    return (
      <View style={{flex:1, backgroundColor:'#fff'}}>
        <ScrollView style={{}}>
          <View style={styles.container}>
            <View style={{}}>
              <View style={{flex:1, marginBottom:15}}>
                <Image
                  style={styles.thumb}
                  source={require('../../assets/images/detailimg3.jpg')}
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
                {/*<Text style={styles.activityDesc}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit, sed do eiusmod tempor incididunt ut labore et 
                  dolore magna aliqua. Ut enim ad minim veniam.
                </Text>*/}

                <View style={{marginTop:20}}>

                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={{}}>
                      <Icon
                      name='location'
                      type='entypo'
                      size={16}
                      color='#454545'/>
                    </View>
                    <View style={{marginTop:1, marginLeft:10}}>
                      <Text style={{fontSize:14}}>
                        Jepang
                      </Text>
                    </View>
                  </View>
                  <View style={{flex: 1, flexDirection: 'row', marginTop:8}}>
                    <View style={{}}>
                      <Icon
                      name='person'
                      type='materialicons'
                      size={16}
                      color='#454545'/>
                    </View>
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
                <Text style={this.state.isDateSelected ?
                  styles.normalText : styles.warningText} >
                  {selectedDateText}
                </Text>
                <TouchableOpacity containerStyle={styles.addButton}
                  onPress={this._goToCalendarPicker} >
                  {setDateButton}
                </TouchableOpacity>
                {/*<Text style={styles.validation}>isi jadwal</Text>*/}
              </View>
            </View>
            <View>
              <View>
                <Text style={styles.activityTitle}>
                  Peserta
                </Text>
              </View>
              <View style={{
                borderBottomColor: '#efefef',
                borderBottomWidth:1,
                paddingBottom:20,
                marginVertical:20,
              }}>
                <View style={{flexDirection:'row',}}>
                  <View style={{flex:1}}>
                    <Text>Dewasa</Text>
                  </View>
                  <View style={{alignItems:'center', justifyContent:'flex-end', flex:1, flexDirection:'row',}}>
                    <Text>1</Text>
                     <View style={{borderWidth:1, borderRadius:2, marginRight:8, marginLeft:15, paddingVertical:5, paddingHorizontal:15, borderColor:'#f9a3a3', justifyContent:'center', alignItems:'center'}}>
                      <Icon
                      name='minus'
                      type='entypo'
                      size={10}
                      color='#ff5f5f'/>
                    </View>
                    <View style={{borderWidth:1, borderRadius:2, paddingVertical:5, paddingHorizontal:15, borderColor:'#ff5f5f', justifyContent:'center', alignItems:'center'}}>
                      <Icon
                      name='plus'
                      type='octicon'
                      size={10}
                      color='#ff5f5f'/>
                    </View>
                  </View>
                </View>
                <View style={{marginTop:20, flexDirection:'row',}}>
                  <View style={{flex:1}}>
                    <Text>Anak-anak</Text>
                  </View>
                  <View style={{alignItems:'center', justifyContent:'flex-end', flex:1, flexDirection:'row',}}>
                    <Text>1</Text>
                     <View style={{borderWidth:1, borderRadius:2, marginRight:5, marginLeft:15, paddingVertical:5, paddingHorizontal:15, borderColor:'#f9a3a3', justifyContent:'center', alignItems:'center'}}>
                      <Icon
                      name='minus'
                      type='entypo'
                      size={10}
                      color='#ff5f5f'/>
                    </View>
                    <View style={{borderWidth:1, borderRadius:2, paddingVertical:5, paddingHorizontal:15, borderColor:'#ff5f5f', justifyContent:'center', alignItems:'center'}}>
                      <Icon
                      name='plus'
                      type='octicon'
                      size={10}
                      color='#ff5f5f'/>
                    </View>
                  </View>
                </View>

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
                {pax && pax.map( item =>
                  <View  key={item.key} style={{paddingVertical:20, borderBottomWidth:1, borderBottomColor:'#efefef',}}>
                    <Text>{item.name}</Text>
                  </View>
                )}
              <View style={{
                flexDirection:'row',
                justifyContent: 'space-between',
                paddingBottom:20,
                marginTop:20
              }}>
                <Text style={this.state.isPaxFilled ?
                  styles.normalText : styles.warningText} >
                  Atur Peserta
                </Text>
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
                  <View style={{flexDirection:'row'}}>
                    <Icon name='plus' type='evilicon' size={26} color='#01d4cb'/>
                    <View style={{justifyContent:'center', alignItems:'center', marginLeft:10}}>
                      {/*<Text style={styles.validation}>isi peserta</Text>*/}
                    </View>
                  </View>
                  
                </TouchableOpacity>
              </View>
            </View>
            
          </View>

          <View style={globalStyles.bottomCtaBarContainer1}>
            {rincianHarga}
            <View style={{alignItems: 'flex-end', flex:1, justifyContent:'flex-end'}}>
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
          {/*bottom CTA button*/}

        </ScrollView>


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
  validation:{
    color:'#fc2b4e',
    fontSize:12
  },
  warningText: {
    color: 'red',
  }
});
