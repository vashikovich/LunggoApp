'use strict';

import React from 'react';
import Button from 'react-native-button';
import {
  Platform, StyleSheet, Text, View, Image, Dimensions,
  FlatList, TouchableOpacity, TouchableWithoutFeedback, Alert
} from 'react-native';
import { cancelReservation, fetchMyBookingActivityList, cancelReservationInMobX } from './MyBookingController';
import * as Formatter from '../../components/Formatter';
import { WebBrowser } from 'expo';
import { getPaxCountText } from '../../../commons/otherCommonFunctions';
import { Icon } from 'react-native-elements';
import Modal from '../../../commons/components/Modal';
import Moment from 'moment';
import { dateFullShort } from './../../components/Formatter';

const { width } = Dimensions.get('window');

export class ActivityListItem extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      //tapX: ,
      //tapY: ,
    }
    this._openSettingModal = this._openSettingModal.bind(this);
  }

  _viewPdfVoucher = async item => {
    // TODO uncomment this buat local PDF
    // let localUri = await getItemAsync('myBookings.pdfVoucher.' + item.rsvNo);
    // WebBrowser.openBrowserAsync(localUri || item.pdfUrl);
    WebBrowser.openBrowserAsync(item.pdfUrl);
  }

  _goToBookedPageDetail = () => {
    this.props.navigation.navigate
      ('BookedPageDetail', { details: this.props.item })
  };

  _goToRefundScreen = () => {
    this.props.navigation.navigate
      ('RefundScreen', { rsvNo: this.props.item.rsvNo, ...this.props.item.refundBankAccount });
  };

  _goToHelpScreen = () => {
    this.props.navigation.navigate('HelpScreen');
  };

  _openSettingModal = (evt) => {
    this.setState({ tapX: evt.nativeEvent.pageX, tapY: evt.nativeEvent.pageY })
    this.refs.settingModal.openModal();
  }
  _closeSettingModal = () => this.refs.settingModal.closeModal();

  _cancelActivity = () => {
    Alert.alert('Membatalkan Aktivitas', 'Kamu yakin akan membatalkan aktivitas ini?\nNo. Pesanan ' + this.props.item.rsvNo, [
      { text: 'Ya', onPress: this._confirmCancelActivity },
      { text: 'Tidak' },
    ]);
  };

  _confirmCancelActivity = () => {
    cancelReservation(this.props.item.rsvNo);
    cancelReservationInMobX(this.props.item.rsvNo);
    fetchMyBookingActivityList();
  }

  _buttons = item => {
    let renderStatus = item => {
      switch (item.bookingStatus) {
        case 'Booked':
        case 'ForwardedToOperator':
          let now = Moment();
          let daysDiff = Moment(now).diff(item.timeLimit, 'days');
          let hoursDiff = Moment(now).diff(item.timeLimit, 'hours') - (daysDiff * 24);
          let timeLimitString = (daysDiff ? `${daysDiff} hari ` : '') + `${hoursDiff} jam`;
          return (
            <View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.activityDesc}>Status: </Text>
                <Text style={styles.statusTextOk}>Menunggu Konfirmasi (maks. 1x24 jam)</Text>
              </View>
            </View>);
        case 'Ticketing':
          return <View style={{ flexDirection: 'row' }}>
            <Text style={styles.activityDesc}>Status: </Text>
            <Text style={styles.statusTextOk}>Tiket Sedang Diproses</Text>
          </View>;
        case 'Ticketed':
          return (
            <View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.activityDesc}>Status: </Text>
                <Text style={styles.statusTextOk}>Tiket Terbit</Text>
              </View>
              <View>
                <StatusButton text="Lihat Tiket" onPress={
                  () => item.hasPdfVoucher
                    ? this._viewPdfVoucher(item)
                    : this._goToBookedPageDetail()
                } />
              </View>
            </View>
          );
        case 'CancelByCustomer':
        case 'CancelByOperator':
        case 'CancelByAdmin':
        case 'DeniedByOperator':
        case 'DeniedByAdmin':
        case 'NoResponseByAdmin':
        case 'NoResponseByOperator':
          return (
            <View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.activityDesc}>Status: </Text>
                <Text style={styles.statusTextDanger}>Dibatalkan</Text>
              </View>
              <View style={{ flexDirection: 'row', width: '100%', flex: 1, alignContent: 'space-between' }}>
                {item.needRefundBankAccount &&
                  <StatusButton text="Refund" onPress={this._goToRefundScreen}/>
                }
                <View style={{ marginLeft: 20 }}>
                  <StatusButton text="Tanya Travorama" onPress={this._goToHelpScreen}/>
                </View>
              </View>
            </View>);
        default:
          return (
            <View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.activityDesc}>
                  Terjadi kesalahan pada sistem
                </Text>
              </View>
            </View>
          );
      }
    }

    return (
      <View style={{ flexDirection: 'row' }}>
        <View>
          {renderStatus(item)}
        </View>
      </View >
    );
  }

  render() {
    let { item, showActionButtons, myBookingState } = this.props;
    return (
      <TouchableWithoutFeedback onPress={this._goToBookedPageDetail}>
        <View>
          <View style={{ paddingVertical: 25, paddingHorizontal: 15 }}>
            <View style={{ flexDirection: 'row', position: 'relative' }}>
              <View style={{ width: 70 }}><Image style={styles.thumbprofile} source={{ uri: item.mediaSrc }} /></View>
              <View style={{ flex: 3 }}>
                <Text style={styles.activityDesc}>No. Pesanan: {item.rsvNo}</Text>
                <Text style={styles.activityTitle}>
                  {item.name}
                </Text>
                <Text style={styles.activityDesc}>
                  Paket 5D4N
                </Text>
                <View style={{ flexDirection: 'row', }}>
                  <Text style={styles.activityDesc}>Tgl. Aktivitas: {Formatter.dateLong(item.date)}</Text>
                  <Text style={styles.activityDesc}>, </Text>
                  <Text style={styles.activityDesc}>{item.selectedSession}</Text>
                </View>
                <Text style={styles.activityDesc}>
                  a.n. {item.contact.name}, {getPaxCountText(item.paxCount)}
                </Text>
                <View>
                  {myBookingState == 'active' && showActionButtons && this._buttons(item)}
                  {myBookingState == 'unreviewed' && this._inputReview(item)}
                  {myBookingState == 'history' && this._buyAgain(item)}
                </View>
              </View>
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={{ width: 25, alignItems: 'center' }}
                  onPress={evt => this._openSettingModal(evt)}>
                  <Icon
                    name='md-more'
                    type='ionicon'
                    size={26}
                    color='#454545' />
                </TouchableOpacity>

                {this.props.showActionButtons &&
                  <Modal ref='settingModal'
                    style={styles.modalStyle}
                    animationIn='fadeIn'
                    animationOut='fadeOut'
                    backdropOpacity={0}
                    tapX={this.state.tapX}
                    tapY={this.state.tapY}
                  >

                    {item.bookingStatus == 'Ticketed' &&
                      <TouchableOpacity
                        onPress={(() => {
                          this._closeSettingModal();
                          item.hasPdfVoucher
                            ? this._viewPdfVoucher(item)
                            : this._goToBookedPageDetail();
                        })}
                        style={{ padding: 10, }}
                      >
                        <Text style={styles.teks3a}>Lihat Tiket</Text>
                      </TouchableOpacity>
                    }

                    <TouchableOpacity
                      onPress={() => {
                        this._closeSettingModal()
                        this._goToBookedPageDetail();
                      }}
                      style={{ padding: 10, }}
                    >
                      <Text style={styles.teks3a}>Lihat Detail</Text>
                    </TouchableOpacity>

                    {(item.refundBankAccount || item.needRefundBankAccount) &&
                      <TouchableOpacity
                        onPress={() => {
                          this._closeSettingModal()
                          this._goToRefundScreen();
                        }}
                        style={{ padding: 10, }}
                      >
                        <Text style={styles.teks3a}>{item.refundBankAccount ? 'Ubah Nomor Rekening Refund' : 'Isi Nomor Rekening Refund'}</Text>
                      </TouchableOpacity>
                    }

                    {item.bookingStatus != 'CancelByCustomer' &&
                      item.bookingStatus != 'CancelByOperator' &&
                      item.bookingStatus != 'CancelByAdmin' &&
                      item.bookingStatus != 'DeniedByOperator' &&
                      item.bookingStatus != 'DeniedByAdmin' &&
                      item.bookingStatus != 'NoResponseByAdmin' &&
                      item.bookingStatus != 'NoResponseByOperator' &&
                      <TouchableOpacity
                        onPress={() => {
                          this._closeSettingModal()
                          this._cancelActivity();
                        }}
                        style={{ padding: 10, }}
                      >
                        <Text style={styles.teks3a}>Batalkan Aktivitas</Text>
                      </TouchableOpacity>
                    }
                  </Modal>
                }
                {/* <TouchableWithoutFeedback onPress={this._goToBookedPageDetail}>
        <View>
          <View style={{ paddingVertical: 25, paddingHorizontal: 15 }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}><Image style={styles.thumbprofile} source={{ uri: item.mediaSrc }} /></View>
              <View style={{ flex: 3 }}>
                <Text style={styles.activityTitle}>
                  {item.name}
                </Text>
                <View style={{ flexDirection: 'row', }}>
                  <Text style={styles.activityDesc}>{Formatter.dateLong(item.date)}</Text>
                  <Text style={styles.activityDesc}>, </Text>
                  <Text style={styles.activityDesc}>{item.selectedSession}</Text>
                </View>
                <Text style={styles.activityDesc}>
                  {getPaxCountText(item.paxCount)}
                </Text>
              </View>
            </View>
            {this.props.showActionButtons && this._buttons(item)} */}
              </View>
            </View>


            {/*
        {(item.requestRating || item.requestReview) && (
          <View style={{ marginTop: 25 }}>
            <View style={{ flex: 1 }}>
              <Button
                containerStyle={globalStyles.ctaButtonReview}
                style={{ fontSize: 12, color: '#000', fontWeight: 'bold' }}
                onPress={
                  () => item.requestRating ?
                    this.props.navigation.navigate('SubmitRating', { rsvNo: item.rsvNo }) :
                    this.props.navigation.navigate('SubmitReview', { rsvNo: item.rsvNo })}
              >
                {item.requestRating ? 'Beri Rating' : 'Beri Review'}
              </Button>
            </View>
          </View>
        )}
        */}
          </View>
          <View style={styles.separator} />
        </View>
      </TouchableWithoutFeedback>
    )
  }

  _inputReview = item =>
    <View>
      <Text>Berikan Review</Text>
      <TouchableOpacity onPress={ () => this._writeReview(item)}>
        <Text>bintangbintang</Text>
      </TouchableOpacity>
    </View>

  _buyAgain = item =>
    <View style={{flexDirection: 'row'}}>
      <Text style={{flex:1}}>{Formatter.price(item.price)}</Text>
      <StatusButton text="Beli Lagi"
        onPress={() => this._onClickBuyAgain(item)}
      />
    </View>

  _writeReview = item => {
    const dest = item.requestRating ? 'SubmitRating' : 'SubmitReview';
    this.props.navigation.navigate( dest, { rsvNo: item.rsvNo });
  }

  _onClickBuyAgain = item => {
    this.props.navigation.navigate('DetailScreen', { details: item });
  }

}

export class TrxListItem extends React.PureComponent {

  _keyExtractor = (item, index) => index
  _renderItem = ({ item, index }) => (
    <ActivityListItem
      item={item}
      index={index}
      // onPressItem={this._onPressItem}
      navigation={this.props.navigation}
      showActionButtons={false}
    />
  )

  _showInvoice = () => {
    let { item } = this.props;
    let total = item.totalFinalPrice;
    let breakdown = item.activities.map(rsv => {
      return {
        name: rsv.name,
        details: rsv.paxCount.filter(pax => pax.count).map(pax => {
          return {
            unit: pax.type,
            count: pax.count,
            unitPrice: pax.totalPrice / pax.count,
            totalPrice: pax.totalPrice
          }
        })
      }
    });
    let modifiers = [];
    (item.totalDiscount != 0) && modifiers.push({ name: "Diskon", amount: -item.totalDiscount });
    (item.totalUniqueCode != 0) && modifiers.push({ name: "Kode unik", amount: item.totalUniqueCode });
    this.props.navigation.navigate('RincianHarga', { total, breakdown, modifiers });
  }
  _showInstruction = () => this.props.navigation.navigate('PaymentScreen') /// TODO ganti jd INstruction

  _labelPaymentStatus = status => {
    if (status == 'SETTLED')
      return (
        <TouchableWithoutFeedback onPress={this._showInvoice}>
          <View>
            <Text style={styles.labelTextLunas}>Lihat Invoice</Text>
          </View>
        </TouchableWithoutFeedback>);
    else
      return <View><Text style={styles.labelTextBelumLunas}>Belum Lunas</Text></View>;
  }

  _goToPayment = cartId => this.props.navigation.navigate('PaymentScreen', { cartId });

  render() {
    let { item } = this.props;
    return (
      <View style={styles.cartbox}>

        <View style={{ borderBottomWidth: 1, borderBottomColor: '#ececec', paddingBottom: 10, paddingHorizontal: 15 }}>
          <View>
            <Text style={styles.activityDesc}>
              Waktu Pemesanan: <Text style={styles.activityDesc}>
                {dateFullShort(item.trxTime)}
              </Text>
            </Text>
          </View>
        </View>

        <FlatList
          data={item.activities}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
        />

        <View style={{ paddingHorizontal: 15 }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.totalText}>Total</Text>

            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.totalText}>
                {Formatter.price(item.totalFinalPrice)}
              </Text>
              {this._labelPaymentStatus(item.paymentStatus)}
            </View>
          </View>
        </View>
        {item.paymentStatus == 'PENDING' && (
          <View>
            <Button
              containerStyle={styles.labelWarning}
              style={{ fontSize: 12, color: '#fff', fontWeight: 'bold' }}
              onPress={() => this._goToPayment(item.cartId)}
            >
              Lanjutkan Pembayaran
            </Button>
          </View>)}
      </View>
    )
  }
}

const StatusButton = props =>
  <Button
    containerStyle={styles.containerbtn}
    style={styles.statusbtn}
    onPress={props.onPress}
  >
    {props.text}
  </Button>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    backgroundColor: '#f1f0f0',
  },
  cartbox: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#e8f0fe',
        shadowOffset: {
          width: 0,
          height: 1
        },
        shadowRadius: 2,
        shadowOpacity: 0.9
      },
      android: {
        elevation: 5,
      },
    }),
  },
  activityTitle: {
    fontFamily: 'HindBold',
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
  activityPrize: {
    fontFamily: 'HindLight',
    fontSize: 14,
    color: '#000',
    ...Platform.select({
      ios: {
        lineHeight: 10,
        paddingTop: 13,
        marginBottom: -12,
      },
      android: {
        lineHeight: 24
        //paddingTop: 23 - (23* 1),

      },
    }),
  },
  activityDesc: {
    fontSize: 14,
    color: '#454545',
    fontFamily: 'HindLight',
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
  headerText: {
    fontSize: 14,
    color: '#454545',
    fontFamily: 'HindBold',
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
  thumbprofile: {
    height: 60,
    width: 60,
  },
  separator: {
    backgroundColor: '#bfbfbf',
    height: 0.5,
    width: '100%',
  },
  total: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  totalText: {
    fontSize: 16,
    color: '#454545',
    fontFamily: 'HindSemiBold',
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
  invoice: {
    marginTop: 10,
    paddingVertical: 10,
  },
  labelDanger: {
    width: '100%',
    paddingVertical: 6,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: '#23d3c3',
  },
  labelWarning: {
    backgroundColor: '#00d3c5',
    paddingVertical: 10,
    borderRadius: 3,
    marginTop: 13,
    alignItems: 'center',
    marginRight: 10,
  },
  labelReview: {
    backgroundColor: '#f57b76',
    paddingVertical: 10,
    borderRadius: 3,
    marginTop: 13,
    alignItems: 'center',
    marginRight: 10,
  },
  labelOff: {
    backgroundColor: '#8f8f8f',
    paddingVertical: 10,
    borderRadius: 3,
    marginTop: 13,
    alignItems: 'center',
    marginRight: 10,
    opacity: 0.7,

  },
  labelText: {
    borderColor: '#00d3c5',
    paddingVertical: 10,
    borderRadius: 3,
    borderWidth: 1,
    marginTop: 13,
    alignItems: 'center',
    marginRight: 10,
  },
  labelTextLunas: {
    color: '#00d3c5',
    fontSize: 14,
    textAlign: 'right',
    fontFamily: 'Hind',
    ...Platform.select({
      ios: {
        lineHeight: 15 * 0.8,
        paddingTop: 10,
        marginBottom: 0,
      },
      android: {
        //lineHeight:24
        //paddingTop: 23 - (23* 1),

      },
    }),
  },
  labelTextBelumLunas: {
    color: '#f74d4d',
    fontSize: 14,
    textAlign: 'right',
    fontFamily: 'HindSemiBold',
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
  statusTextOk: {
    fontSize: 13,
    color: '#1c7ce7',
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
  statusTextDanger: {
    fontSize: 13,
    color: '#F57B76',
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
  teks3a: {
    fontSize: 14,
    color: '#454545',
    fontFamily: 'Hind',
    textAlign: 'left',
    ...Platform.select({
      ios: {
        // lineHeight:19*0.8,
        // paddingTop: 20 - (19 * 0.4),
        marginBottom: -10,
      },
      android: {

      },
    }),
  },
  separatorOption: {
    paddingVertical: 8
  },

  labelOk: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  },

  containerbtn: {
    backgroundColor: '#00d3c5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 3,
    alignItems: 'center',
    marginTop: 7
  },
  statusbtn: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'HindSemiBold',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        lineHeight: 15 * 0.8,
        paddingTop: 4,
        marginBottom: -10
      },
      android: {
        //lineHeight:24
        //paddingTop: 23 - (23* 1),

      },
    }),
  },
  modalStyle: {
    backgroundColor: '#fff',
    maxWidth: width / 2,
    zIndex: 100,
    margin: -5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1
        },
        shadowRadius: 4,
        shadowOpacity: 0.2
      },
      android: {
        elevation: 2
      },
    }),
  }
});
