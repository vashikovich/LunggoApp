'use strict';

import React from 'react';
import Button from 'react-native-button';
import * as Formatter from '../../components/Formatter';
import { Icon } from 'react-native-elements';
import {
  Platform, StyleSheet, TouchableOpacity, Text, View, Image,
  TextInput, ScrollView, Linking
} from 'react-native';
import Maps from '../../components/Maps';
import { WebBrowser } from 'expo';
import Avatar from './../../../commons/components/Avatar';

export default class BookedPageDetail extends React.Component {

  constructor(props) {
    super(props);

    this.details = {
      totalPaxCount: 0,
      ...props.navigation.state.params.details,
    };
    this.details.paxCount.map(categ => {
      this.details.totalPaxCount += categ.count;
    });
  }

  // _onContinuePaymentPressed = () => {
  //   this.props.navigation.navigate(
  //     'PaymentScreen', {rsvNo:this.details.rsvNo}
  //   );
  // }

  _viewActivityDetail = () => {
    this.props.navigation.navigate('DetailScreen', {
      details: {
        id: this.details.activityId,
        ...this.details,
      },
      hideFooter: true
    });
  }

  _viewPdfVoucher = async () => {
    let { rsvNo, pdfUrl } = this.details;
    // TODO uncomment this buat local PDF
    // let localUri = await getItemAsync('myBookings.pdfVoucher.' + rsvNo);
    // WebBrowser.openBrowserAsync(localUri || pdfUrl);
    WebBrowser.openBrowserAsync(pdfUrl);
  }

  _callOperator = () => Linking.openURL('tel:' + this.details.operatorPhone)
  _smsOperator = () => Linking.openURL('sms:' + this.details.operatorPhone)

  _showTicket() {
    let { bookingStatus, hasPdfVoucher, isPdfUploaded, ticketNumber } = this.details;

    if (bookingStatus == 'BOOK')
      return <View style={styles.labelText}><Text style={{ color: '#ff5f5f' }}>Menunggu proses pembayaran</Text></View>;
    else if (bookingStatus == 'FORW')
      return <View style={styles.labelText}><Text style={{ color: '#ff5f5f' }}>Sedang menunggu konfirmasi operator</Text></View>;
    else if (bookingStatus == 'TKTD' && hasPdfVoucher && isPdfUploaded) {
      return (
        <Button
          containerStyle={styles.labelOk}
          style={{ fontSize: 12, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}
          onPress={() => this._viewPdfVoucher()}
        >
          Lihat Tiket
        </Button>
      );
    }
    else if (bookingStatus == 'TKTD' && ticketNumber) {
      return (
        <View>
          <Text style={styles.activityTitle}>
            Kode Tiket
          </Text>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              {ticketNumber}
            </Text>
          </View>
        </View>);
    }
    else if (bookingStatus == 'CONF')
      return (
        <View style={styles.labelText}>
          <Text style={{ color: '#ff5f5f' }}>
            Tiket sedang dalam proses penerbitan
          </Text>
        </View>)
    else 
      return (
        <View style={styles.labelText}>
          <Text style={{ color: '#ff5f5f' }}>
            {bookingStatus}
          </Text>
        </View>)
  }

  render() {
    let { name, mediaSrc, date, price, city, address, bookingStatus,
      selectedSession, operatorName, operatorPhone, ticketNumber,
      operatorEmail, totalPaxCount, latitude, longitude, paxes,
      hasPdfVoucher, isPdfUploaded, paxCount
    } = this.details;
    // let bookingStatusText = bookingStatus;
    // switch (bookingStatus) {
    //   case 'PROC': bookingStatusText = 'dalam progres'; break;
    // }
    console.log(selectedSession ? true : false);
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={[styles.container, { flexDirection: 'row' }]}>

          <Image style={styles.thumbprofile} source={{ uri: mediaSrc }}/>

          <View style={{ flex: 3, paddingLeft: 15 }}>
            <View style={{marginBottom:3}}>
              <Text style={styles.activityTitle}>
                {name}
              </Text>
            </View>

            <View style={{ flex: 1, flexDirection: 'row',}}>
             {/* <View style={{justifyContent:'center'}}>
                <Icon name='calendar' type='octicon' size={18} color='#009389' style={{width:20}} />
              </View>*/}
              <View>
                <Text style={styles.activityDesc}>
                  {Formatter.dateFullLong(date)}
                </Text>
              </View>
            </View>

            {!!selectedSession && (
              <View style={{ flex: 1, flexDirection: 'row'}}>
                {/* <View style={{justifyContent:'center'}}>
                  <Icon name='ios-time' type='ionicon' size={18} color='#009389' style={{width:20}} />
                </View> */}
                <View>
                  <Text style={styles.activityDesc}>
                    {selectedSession}
                  </Text>
                </View>
              </View>)
            }

            <View style={{ flex: 1, flexDirection: 'row'}}>
              {/*<View style={{justifyContent:'center'}}>
                <Icon name='md-people' type='ionicon' size={18} color='#009389' style={{width:20}} />
              </View>*/}
              <View>
                <Text style={styles.activityDesc}>
                  {paxCount.filter(t => t.count != 0).map((t) => `${t.count} ${t.type}`).join(', ')}
                </Text>
              </View>
            </View>

            <View style={{ flex: 1, flexDirection: 'row'}}>
              {/*<View style={{justifyContent:'center'}}>
                <Icon  name='location' type='octicon' size={18} color='#009389' style={{width:20}} />
              </View>*/}
              <View>
                <Text style={styles.activityDesc}>
                  {city}
                </Text>
              </View>
            </View>

          </View>

          <TouchableOpacity onPress={this._viewActivityDetail} style={{alignItems: 'flex-end'}}>
            <Text style={{fontSize: 12, color: '#00d3c5', }}>
              Lihat Detail
            </Text>
          </TouchableOpacity>
        </View>{/* end container */}

        <View style={styles.divider} />
        <View style={styles.container}>
          <View style={{marginBottom:10}}>
            <Text style={styles.sectionTitle}>
              Kontak Operator
            </Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{flex:2, flexDirection: 'row' }}>
              <Avatar size={40} name={operatorName} style={[styles.avatar, { marginRight: 15 }]} />
              <View>
                <View style={{marginBottom:7}}>
                  <Text style={styles.reviewTitle}>
                    {operatorName}
                  </Text>
                </View>
                <Text style={styles.activityDesc}>
                  {operatorPhone}
                </Text>
                <Text style={styles.activityDesc}>
                  {operatorEmail}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={this._callOperator} style={{width:35, height:35, marginRight:10, borderWidth:1, borderRadius:25, borderColor:'#00d3c5', justifyContent:'center'}}>
                <Icon
                  name='ios-call'
                  type='ionicon'
                  size={23}
                  color='#00d3c5' />
              </TouchableOpacity>
              <TouchableOpacity onPress={this._smsOperator} style={{width:35, height:35,borderWidth:1, borderRadius:25, borderColor:'#00d3c5', justifyContent:'center'}}>
                 <Icon
                  name='ios-mail'
                  type='ionicon'
                  size={23}
                  color='#00d3c5' />
              </TouchableOpacity>
            </View>
          </View>

         {/* <View style={{marginTop:15}}>
            {this._showTicket()}
          </View>*/}

        </View>{/* end container */}

        <View style={styles.divider} />
        <View style={styles.container}>
          <View style={{marginBottom:10}}>
            <Text style={styles.sectionTitle}>
              Kode Tiket
            </Text>
          </View>
          <View style={{alignItems:'center'}}>
            <Text style={styles.kodetiket}>LDRSJWC</Text>
          </View>
        </View>

        {/*<View style={styles.divider}/>
        <View style={styles.container}>
          <View style={{flex:1, flexDirection:'row',}}>
            <View>
              <Text style={styles.activityTitle}>
                Status
              </Text>
              <Text style={styles.status}>
                {bookingStatusText}
              </Text>
            </View>
            <View style={{flex:1, flexDirection:'row', alignItems:'flex-end', justifyContent:'flex-end'}}>
              <Button
                containerStyle={{height:35, width:'70%', paddingTop:10, paddingBottom:10, borderRadius:4, backgroundColor: '#00c8be'}}
                style={{fontSize: 12, color: '#fff', fontWeight:'bold'}}
                onPress={this._onContinuePaymentPressed}
              >
                Lanjut Bayar
              </Button>
            </View>
          </View>
          <View style={{flex:1, flexDirection:'row', marginTop:25}}>
            <Text style={{flex:1,fontSize:12, color:'#454545',}}>
              Total yang harus dibayar
            </Text>
            <Text style={{flex:1, alignItems:'flex-end', justifyContent:'flex-end',fontSize:12}}>
              {Formatter.price(price)}
            </Text>
          </View>
          <View style={{flex:1, flexDirection:'row', marginTop:5}}>
            <Text style={{flex:1,fontSize:12, color:'#454545',}}>
              Sisa waktu pembayaran
            </Text>
            <Text style={{flex:1, alignItems:'flex-end', justifyContent:'flex-end',fontSize:12, color:'#00c8be'}}>
              {this.state.timeLeft}
            </Text>
          </View>
        </View>{/* end container */}

        <View style={styles.divider} />
        <View style={[styles.container, { flex: 1, }]}>
          <Text style={styles.sectionTitle}>
            Lokasi
          </Text>
          <Maps lat={latitude} long={longitude} name={name}
            address={address} city={city} {...this.props} />
        </View>
        <View style={styles.divider} />
        {/* <View style={styles.container}>
          <View>
            <Text style={[styles.activityTitle, { marginBottom: 10 }]}>
              Peserta: {totalPaxCount} orang
            </Text>
            {paxes && paxes.map((pax, idx) =>
              <TouchableOpacity key={idx} style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderBottomColor: '#efefef',
                borderBottomWidth: 1,
                paddingBottom: 20,
                marginTop: 20
              }}>
                <Text>{pax.name}</Text>
                <Icon
                  name='chevron-thin-right'
                  type='entypo'
                  size={20}
                  color='#707070' />
              </TouchableOpacity>
            )}
          </View> */}
        {/* <View style={{marginTop:25,}}>
            <Text style={styles.activityTitle}>
              Hal yang Perlu Diperhatikan
            </Text>
            <Text style={{marginTop:8,fontSize:13, color:'#454545',}}>
              Arung jeram dapat diikuti oleh peserta dewasa, remaja dana anak-anak berusia di atas 12 tahun.
            </Text>
          </View>
        </View>*/}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    flex: 1
  },
  thumbnailMedium: {
    resizeMode: 'cover',
    width: '100%',
    height: 100,
    borderRadius: 5,
  },
  thumb: {
    resizeMode: 'cover',
    width: '100%',
    height: 170,
  },
  thumbprofile: {
    height: 60,
    width: 60,
  },
  activityTitle: {
    fontFamily: 'Hind-Bold',
    fontSize: 15,
    color: '#454545',
    ...Platform.select({
      ios: {
        lineHeight: 10,
        paddingTop: 10,
        marginBottom: -12,
      },
      android: {
        lineHeight: 20,

      },
    }),
  },
  activityDesc: {
    fontSize: 14,
    color: '#454545',
    fontFamily: 'Hind-Light',
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
  status: {
    color: '#f19a4b',
    fontSize: 12,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  barcode: {
    width: 130,
    height: 130,
    resizeMode: 'cover',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#efefef',
    marginTop: 5,
    marginBottom: 5,
  },
  labelWarning: {
    backgroundColor: '#ff5f5f',
    padding: 10,
    borderRadius: 3,
    marginTop: 5,
    alignItems: 'center',
  },
  labelOk: {
    backgroundColor: '#00d3c5',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    alignItems: 'center',
  },
  labelText: {
    borderColor: '#ff5f5f',
    padding: 10,
    borderRadius: 3,
    borderWidth: 1,
    marginTop: 5,
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'Hind-SemiBold',
    fontSize: 18,
    color: '#454545',
    ...Platform.select({
      ios: {
        lineHeight: 15 * 0.8,
        paddingTop: 20 - (19 * 0.4),
        marginBottom: 0,
      },
      android: {
        lineHeight: 24,
        marginBottom: 10
      },
    }),
  },
  reviewTitle: {
    fontFamily: 'Hind-SemiBold',
    fontSize: 17,
    color: '#454545',
    ...Platform.select({
      ios: {
        lineHeight: 15 * 0.8,
        paddingTop: 20 - (19 * 0.4),
        marginBottom: -15,
        //backgroundColor:'red'
      },
      android: {
        lineHeight: 13
        //paddingTop: 23 - (23* 1),

      },
    }),
  },
  reviewDate: {
    fontSize: 13,
    color: '#9a9a9a',
    marginTop: 2

  },
  kodetiket: {
    fontFamily: 'Hind-Bold',
    fontSize: 24,
    color: '#00d3c5',
    ...Platform.select({
      ios: {
        lineHeight: 10,
        paddingTop: 20,
        marginBottom: -15,
      },
      android: {
        lineHeight: 20,

      },
    }),
  },
});
