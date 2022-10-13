import getStore from '../stores/appStore';
import {getSubscriptionDetails} from "../services/subscriptionService";

const notSuperheroGuard = async (to, from, next) => {
  await getStore().dispatch('awaitUntilUserDetailsInitialized');
  if (getStore().state.userDetails.planType === 'SuperHero') {
    const subscriptionDetails = await getSubscriptionDetails();
    if (subscriptionDetails.status === 'Active') return next('/new');
  }

  next();
};

export default notSuperheroGuard;