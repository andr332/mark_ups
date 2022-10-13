import getStore from '../stores/appStore';

const teamOwnerGuard = async (to, from, next) => {
    await getStore().dispatch('awaitUntilUserDetailsInitialized');
    if (!getStore().state.userDetails.isTeamOwner) {
        next('/new');
    } else {
        next();
    }
};

export default teamOwnerGuard;