'use strict';
import { fetchTravoramaApi, AUTH_LEVEL } from '../../../api/Common';
import { Permissions, Notifications } from 'expo';
import { NavigationActions } from 'react-navigation';
import { observable, action } from 'mobx';
const { getItemAsync, setItemAsync, deleteItemAsync } = Expo.SecureStore;

export async function getMyBookingList() {
  console.log("running getMyBookingList");
  let shouldRefresh = await getItemAsync('shouldRefresh.myBookingList');
  console.log("shouldRefresh: " + shouldRefresh)
  if (shouldRefresh) {
    deleteItemAsync('shouldRefresh.myBookingList');
    myBookingStore.removeNewBookingMark();

    let fetched = await fetchMyBookingList();
    if (fetched.status != 200)
      return [];

    return fetched.myBookings;
  }

  let myBookingsJson = await getItemAsync('myBookings');
  if (!myBookingsJson) {
    let fetched = await fetchMyBookingList();
    if (fetched.status != 200)
      return [];

    return fetched.myBookings;
  } else {
    let myBookings = await JSON.parse(myBookingsJson);
    let bookings = myBookings.reduce((a, b) => a.concat(b.activities), []);
    // setTimeout(() => downloadPdfVouchers(bookings), 0);
    return myBookings;
  }
}

async function fetchMyBookingList() {
  const version = 'v1';
  let request = {
    path: `/${version}/activities/mybooking?perpage=1000`,
    requiredAuthLevel: AUTH_LEVEL.User,
  }
  let response = await fetchTravoramaApi(request);
  let myBookingsJson = await JSON.stringify(response.myBookings);
  await setItemAsync('myBookings', myBookingsJson);
  return response;
}

export async function shouldRefreshMyBookingList() {
  setItemAsync('shouldRefresh.myBookingList', 'true');
  myBookingStore.setNewBookingMark();
  console.log("refreshing my bookinglist")
}

export async function myBookingListenerFunction({ origin, data }) {
  console.log("cool data: " + origin + data);
  if (data.function && data.function == "refreshMyBooking" && origin == "received") {
    console.log("refreshing my bookinglist");
    shouldRefreshMyBookingList();
  }
  if (data.function && data.function == "refreshMyBooking" && origin == "selected") {
    console.log("selecting notif");
    goToMyBookingScreen();
  }
}

export function goToMyBookingScreen() {
  let { reset, navigate } = NavigationActions;
  shouldRefreshMyBookingList();
  this.props.navigation.navigate("Main", 1);
}

export async function purgeMyBookingList() {
  deleteItemAsync('myBookings');
}

export async function cancelReservation(rsvNo) {
  const version = 'v1';
  let request = {
    path: `/${version}/activities/mybooking/${rsvNo}/cancel`,
    method: 'POST',
    requiredAuthLevel: AUTH_LEVEL.User
  }
  let response = await fetchTravoramaApi(request);
  return (response.status === 200);
}

export async function fetchMyBookingActivityHistoryList(startDate, endDate, page, perPage) {
  const version = 'v1';
  let request = {
    path: `/${version}/activities/mybooking?startDate=${startDate}&endDate=${endDate}&page=${page}&perPage=${perPage}`,
    requiredAuthLevel: AUTH_LEVEL.User,
  }
  let response = await fetchTravoramaApi(request);
  return response;
}

export async function fetchMyBookingTrxHistoryList(startDate, endDate, page, perPage) {
  const version = 'v1';
  let request = {
    path: `/${version}/activities/mybooking?startDate=${startDate}&endDate=${endDate}&page=${page}&perPage=${perPage}`,
    requiredAuthLevel: AUTH_LEVEL.User,
  }
  let response = await fetchTravoramaApi(request);
  return response;
}

async function downloadPdfVouchers(bookings) {
  console.log('download');

  for (let i = 0; i < bookings.length; i++) {
    let booking = bookings[i];
    if (!booking.isPdfUploaded)
      continue;
    let { rsvNo, pdfUrl } = booking;
    let directory = Expo.FileSystem.documentDirectory;
    let path = directory + 'myBookings/';
    let info = await Expo.FileSystem.getInfoAsync(path);
    let isDirectoryExist = info.exists && info.isDirectory;
    if (!isDirectoryExist)
      Expo.FileSystem.makeDirectoryAsync(path);
    let isLocalUriExist = await getItemAsync('myBookings.pdfVoucher.' + rsvNo);
    if (!isLocalUriExist) {
      let { status, uri } = await Expo.FileSystem.downloadAsync(pdfUrl, path + rsvNo);
      if (status == 200)
        await setItemAsync('myBookings.pdfVoucher.' + rsvNo, uri);
    }
  }
}
class MyBookingStoreMobx {
  @observable hasNewBooking = false;

  @action setNewBookingMark = () => {
    console.log('diset');
    this.hasNewBooking = true;
  }

  @action removeNewBookingMark = () => {
    console.log('dibuang');
    this.hasNewBooking = false;
  }
}

export const myBookingStore = new MyBookingStoreMobx;