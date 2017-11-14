import { Notifications } from 'expo';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';

import SearchResults from '../screens/SearchResults';
import LoginScreenOp from '../screens/LoginScreenOp';
import AddParticipant from '../screens/AddGuest';
import DetailScreen from '../screens/DetailScreen';
import CalendarView from '../components/CalendarView';
import MyBooking from '../screens/MyBooking';
import ParticipantChoice from '../screens/ParticipantChoice';
import Registrasi from '../screens/Registrasi';
import BookingDetail from '../screens/BookingDetail';
import BookedPageDetail from '../screens/BookedPageDetail';
import AppointmentList from '../screens/AppointmentList';
// import WelcomeScreen from '../screens/WelcomeScreen';

const RootStackNavigator = StackNavigator(
  {
    Main: {
      screen: AppointmentList,
      //screen: LoginScreenOp,
      //screen: BookingDetail,
      //screen: Registrasi,
      // screen: Checkout,
      //screen: MyBooking,
      // screen: ParticipantChoice,
      //screen: LoginScreen,
      //screen: DetailScreen,
      // screen: MainTabNavigator,
      //screen: CalendarView,
    },
    // Profile: { screen: WelcomeScreen },
    MainTabNavigator: { screen: MainTabNavigator },
    SearchResults: { screen: SearchResults },
    DetailScreen: { screen: DetailScreen },
    CalendarView: { screen: CalendarView },
    ParticipantChoice: { screen: ParticipantChoice },
    AddParticipant: { screen: AddParticipant },
  },
  {
    navigationOptions: () => ({
      headerTitleStyle: {
        fontWeight: 'normal',
      },
    }),
  }
);

export default class RootNavigator extends React.Component {
  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }

  render() {
    return <RootStackNavigator />;
  }

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js
    registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
  }

  _handleNotification = ({ origin, data }) => {
    console.log(
      `Push notification ${origin} with data: ${JSON.stringify(data)}`
    );
  };
}
