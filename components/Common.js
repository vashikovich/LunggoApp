import {clientId, clientSecret, deviceId,
  DOMAIN, AUTH_LEVEL } from '../constants/env';
// function fetchWrapper(url, method, headers, data, then, error) {
//   headers.Accept = headers["Content-Type"] = "application/json";
//   fetch(url, {method, headers, body: JSON.stringify(data) })
//   .then(response => response.json())
//   .then(then).catch(error);
// }

const {getItemAsync,setItemAsync,deleteItemAsync} = Expo.SecureStore;
export {AUTH_LEVEL} from '../constants/env';
export async function fetchTravoramaLoginApi(userName, password) {
  let url = DOMAIN + '/v1/login';
  let data = {clientId, clientSecret, deviceId, userName, password};
  setItemAsync('authLevel', AUTH_LEVEL.User);
  //redundant with getAuthAccess()
  let response = await fetch(url, {
    method: 'POST',
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  });
  response = await response.json();
  ({accessToken, refreshToken, expTime, status} = response);
  switch (status + '') { //// cast to string
    case '200':
      setItemAsync('accessToken', accessToken);
      setItemAsync('refreshToken', refreshToken);
          if (__DEV__) console.log(response)
              // setItemAsync('expTime', new Date().toISOString());
              // console.log('set expTime to ' + new Date())
            // } else
      setItemAsync('expTime', expTime);
      break;
    case '400':
    case '500':
    default:
      console.log('error ' + status)
  }
  //end of redundant
  return response;
}

async function getAuthAccess() {
  let url = DOMAIN + '/v1/login';
  try {
    let [accessToken, refreshToken, expTime, authLevel] = 
        await Promise.all([
          getItemAsync('accessToken'), getItemAsync('refreshToken'),
          getItemAsync('expTime'), getItemAsync('authLevel')
        ]);
    let data = {clientId, clientSecret, deviceId};
    if( new Date(expTime) > new Date() ) { //// token not expired
      //already logged in, go to next step
      return {accessToken, authLevel};
    } //// else then token is expired or client dont have expTime
    if (refreshToken) {
      console.log('login-by-refreshToken---------')
      data.refreshToken = refreshToken;
    } else {
      console.log('login-as-guest---------')
      authLevel = AUTH_LEVEL.Guest
      setItemAsync('authLevel', AUTH_LEVEL.Guest);
    }

    // console.log('prepare fetching auth')
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });
    response = await response.json();
            __DEV__ && console.log(response);
    ;({accessToken, refreshToken, expTime, status} = response);
    switch (status + '') { //// cast to string
      case '200':
        setItemAsync('accessToken', accessToken);
        setItemAsync('refreshToken', refreshToken);
        setItemAsync('expTime', expTime);
        break;
      case '400':
      case '500':
      default:
        console.log('error!!');
        console.log(response);
    }
    return {accessToken, authLevel};
  } catch (error) {
    console.log('get auth access error');
    console.log(error);
  }
}

//// fetch API
export async function fetchTravoramaApi (request) {
  try{
    let {path, method, data, requiredAuthLevel} = request;
    if (!requiredAuthLevel)
      throw 'ERROR fetch: requiredAuthLevel needed!';

    //// Get auth info and check if user authorized for the request
    let {accessToken, authLevel} = await getAuthAccess();

    //// check if client have sufficent authLevel for request
    authLevel = parseInt(authLevel);
    requiredAuthLevel = parseInt(requiredAuthLevel);
    if (authLevel < requiredAuthLevel) return {
      status: 400, message:'Not Authorized!', requiredAuthLevel
    }

    //// Execute request
    let url = DOMAIN + (path || request);
    let response = await fetch(url, {
      method: method || 'GET',
      headers: {
        "Authorization": 'Bearer ' + accessToken,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request.data),
    });
    if (response.status == 401) {
      await deleteItemAsync('expTime');
      return fetchTravoramaApi(request);
    } else if (response.error == "ERRGEN98") { //invalid JSON format
      console.log(JSON.stringify(request.data))
      throw 'invalid JSON format :' + JSON.stringify(request.data);
    }
    response = await response.json();
    // if (response.status != 200) {
              if (__DEV__){
                  console.log('accessToken: '+accessToken)
                  console.log('authLevel: '+authLevel)
                  console.log('response from '+ url +' :') ///
                  console.log(response) ///
              }
      // throw response;
    // }
    return response;
  } catch (err) { console.log(err) }
}