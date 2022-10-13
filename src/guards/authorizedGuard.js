import getStore from '../stores/appStore';

const authorizedRouteGuard = async (to, from, next) => {
  await getStore().dispatch('awaitUntilUserInitialized');
  if (!getStore().state.isAuthenticated) {
    await getStore().commit('setPreviousAuthRoute', to);
    next('/logIn');
  } else {
    next();
  }
};

export default authorizedRouteGuard;