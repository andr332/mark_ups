import getStore from '../stores/appStore';

const notAuthorizedRouteGuard = async (to, from, next) => {
  await getStore().dispatch('awaitUntilUserInitialized');
  if (getStore().state.isAuthenticated) {
    next('/new');
  } else {
    next();
  }
};

export default notAuthorizedRouteGuard;