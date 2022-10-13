import getStore from '../stores/appStore';

const superheroGuard = async (to, from, next) => {
  await getStore().dispatch('awaitUntilUserDetailsInitialized');
  if (getStore().state.userDetails.planType !== 'SuperHero') {
    next('/new');
  } else {
    next();
  }
};

export default superheroGuard;