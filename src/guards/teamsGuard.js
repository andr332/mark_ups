import getStore from '../stores/appStore';

const teamsGuard = async (to, from, next) => {
    await getStore().dispatch('awaitUntilUserDetailsInitialized');
    if (!getStore().state.userDetails.isTeamMember) {
        next('/new');
    } else {
        next();
    }
};

export default teamsGuard;