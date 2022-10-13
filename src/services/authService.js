import { Auth } from 'aws-amplify';
import axios from "axios";
import getStore from '../stores/appStore';
import {getAccessTokenHeader} from "../utils";
import EventBus from "../stores/eventBus";

const BASE_API_URL = process.env.VUE_APP_BASE_API_URL;

const signIn = async (username, password) => {
  const user = await Auth.signIn(username, password);
  return user;
};

const signUp = async (details) => {
  await Auth.signUp({
    username: details.email,
    password: details.password,
    attributes: {
      email: details.email,
      given_name: details.firstName,
      'custom:email_subscriber': details.emailSubscriber ? '1' : '0',
      'custom:from_appsumo': details.fromAppSumo ? '1' : '0',
    }
  });
  const user = await signIn(details.email, details.password);
  await getStore().commit('setUser', user);
  await claimAnonMarkUps();
  await signalUserAttributeUpdate();
  return user;
};

const signOut = async() => {
  await Auth.signOut();
  await getStore().commit('setUser', null);
  EventBus.$emit('signOutCompleted');
};

const forgotPassword = async (username) => {
  await Auth.forgotPassword(username);
};

const confirmForgotPassword = async (details) => {
  await Auth.forgotPasswordSubmit(details.username, details.code, details.newPassword);
};

const changeFirstName = async (firstName) => {
  let user = await getStore().state.user;
  const result = await Auth.updateUserAttributes(user, {
    'given_name': firstName
  });

  if (result !== 'SUCCESS') {
    throw {
      code: 'UnknownException'
    };
  }

  user = await Auth.currentAuthenticatedUser({bypassCache: true});
  await getStore().commit('setUser', user);

  signalUserAttributeUpdate();
};

const changeEmail = async (email) => {
  let user = await getStore().state.user;
  let result = await Auth.updateUserAttributes(user, {
    'email': email
  });

  if (result !== 'SUCCESS') {
    throw {
      code: 'UnknownException'
    };
  }

  user = await Auth.currentAuthenticatedUser({bypassCache: true});
  await getStore().commit('setUser', user);

  signalUserAttributeUpdate();
};

const confirmEmailChange = async (code) => {
  let result = await Auth.verifyCurrentUserAttributeSubmit('email', code);

  if (result !== 'SUCCESS') {
    throw {
      code: 'UnknownException'
    };
  }

  const user = await Auth.currentAuthenticatedUser({bypassCache: true});
  await getStore().commit('setUser', user);

  signalUserAttributeUpdate();
};

const changePassword = async (oldPassword, newPassword) => {
  let user = await getStore().state.user;

  await Auth.changePassword(user, oldPassword, newPassword);
};

const changeEmailSubscriberField = async (emailSubscriber) => {
  let user = await getStore().state.user;
  let result = await Auth.updateUserAttributes(user, {
    'custom:email_subscriber': emailSubscriber ? '1' : '0'
  });

  if (result !== 'SUCCESS') {
    throw {
      code: 'UnknownException'
    };
  }

  user = await Auth.currentAuthenticatedUser({bypassCache: true});
  await getStore().commit('setUser', user);

  signalUserAttributeUpdate();
};

const setAnonId = async () => {
  await axios.get(`${BASE_API_URL}/user/anonId`, {
    withCredentials: true
  });
};

const claimAnonMarkUps = async () => {
  const user = getStore().state.user;

  await axios.get(`${BASE_API_URL}/user/claimMarkUps`, {
    withCredentials: true,
    headers: {
      'Authorization': `Bearer ${user.signInUserSession.accessToken.jwtToken}`
    }
  });
};

const refreshUserCredentials = async () => {
  const user = await Auth.currentAuthenticatedUser({bypassCache: true});
  await getStore().commit('setUser', user);
  return user;
};

const getAnonId = () => {
  const cookieLines = document.cookie.split('; ');
  for (let cookieLine of cookieLines) {
    if (cookieLine.indexOf('AnonId=') === 0) {
      return cookieLine.split('=')[1];
    }
  }

  return null;
};

const getDetails = async () => {
  const response = await axios.get(`${BASE_API_URL}/user`, {
    withCredentials: true,
    headers: {
      ...await getAccessTokenHeader()
    }
  });

  return response.data;
};

const updateSettings = async (settings) => {
  const response = await axios.patch(`${BASE_API_URL}/user/settings`, settings, {
    withCredentials: true,
    headers: {
      ...await getAccessTokenHeader()
    }
  });

  return response.data;
};

const clearUserCache = async () => {
  await axios.delete(`${BASE_API_URL}/user/cache`, {
    withCredentials: true,
    headers: {
      ...await getAccessTokenHeader()
    }
  });
};

const heroCapReached = async () => {
  await axios.get(`${BASE_API_URL}/user/capReached`, {
    withCredentials: true,
    headers: {
      ...await getAccessTokenHeader()
    }
  });
};

const signalUserAttributeUpdate = async() => {
  await axios.get(`${BASE_API_URL}/user/userAttributeUpdate`, {
    withCredentials: true,
    headers: {
      ...await getAccessTokenHeader()
    }
  });
};

export {
  signIn,
  signUp,
  signOut,
  forgotPassword,
  confirmForgotPassword,
  changeFirstName,
  changeEmail,
  confirmEmailChange,
  changePassword,
  changeEmailSubscriberField,
  setAnonId,
  claimAnonMarkUps,
  refreshUserCredentials,
  getAnonId,
  getDetails,
  updateSettings,
  clearUserCache,
  heroCapReached,
  signalUserAttributeUpdate
}