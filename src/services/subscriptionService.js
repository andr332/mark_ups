import axios from "axios";
import {getAccessTokenHeader} from "../utils";

const BASE_API_URL = process.env.VUE_APP_BASE_API_URL;

const getPlans = async () => {
  const response = await axios.get(`${BASE_API_URL}/subscription/plans`, {
    withCredentials: true,
    headers: await getAccessTokenHeader()
  });

  return response.data;
};

const validateCouponCode = async (couponCode) => {
  const response = await axios.get(`${BASE_API_URL}/subscription/coupon/${couponCode}`, {
    withCredentials: true,
    headers: await getAccessTokenHeader()
  });

  return response.data;
};

const createSubscription = async (request) => {
  try {
    const response = await axios.post(`${BASE_API_URL}/subscription`, request, {
      withCredentials: true,
      headers: await getAccessTokenHeader()
    });

    return response.data;
  } catch (err) {
    if (err.response.status === 400) {
      throw err.response.data;
    } else {
      throw err;
    }
  }
};

const validateAppSumoCouponCode = async (couponCode) => {
  const response = await axios.get(`${BASE_API_URL}/subscription/appSumoCoupon/${couponCode}`, {
    withCredentials: true,
    headers: await getAccessTokenHeader()
  });

  return response.data;
};

const upgradeAppSumoSubscription = async (request) => {
  try {
    const response = await axios.post(`${BASE_API_URL}/subscription/appSumo`, request, {
      withCredentials: true,
      headers: await getAccessTokenHeader()
    });

    return response.data;
  } catch (err) {
    if (err.response.status === 400) {
      throw err.response.data;
    } else {
      throw err;
    }
  }
}

const getSubscriptionDetails = async () => {
  const response = await axios.get(`${BASE_API_URL}/subscription`, {
    withCredentials: true,
    headers: await getAccessTokenHeader()
  });

  return response.data;
};

const updateCreditCard = async (request) => {
  try {
    const response = await axios.patch(`${BASE_API_URL}/subscription/card`, request, {
      withCredentials: true,
      headers: await getAccessTokenHeader()
    });

    return response.data;
  } catch (err) {
    if (err.response.status === 400) {
      throw err.response.data;
    } else {
      throw err;
    }
  }
};

const cancelSubscription = async () => {
  const response = await axios.delete(`${BASE_API_URL}/subscription`, {
    withCredentials: true,
    headers: await getAccessTokenHeader()
  });

  return response.data;
};

export {
  getPlans,
  validateCouponCode,
  createSubscription,
  getSubscriptionDetails,
  updateCreditCard,
  cancelSubscription,
  validateAppSumoCouponCode,
  upgradeAppSumoSubscription
}