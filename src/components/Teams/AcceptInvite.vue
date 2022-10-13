<template>
  <div>
    <Nav></Nav>
    <Footer></Footer>
  </div>
</template>

<script>
import Nav from "../Nav";
import Footer from "../Footer";
import navigationPresets from "../../navigationPresets";
import {mapActions, mapMutations, mapState} from "vuex";
import getStore from "@/stores/appStore";
import {acceptInvite} from "@/services/teamService";
import {signalUserAttributeUpdate, signOut} from "@/services/authService";
import {Notifications} from "@/constants";
import {trackAcceptInvite} from "@/services/analytics";

export default {
  name: "AcceptInvite",
  beforeRouteEnter: async (to, from, next) => {
    await getStore().commit('setLoading', true);
    await getStore().dispatch('awaitUntilUserInitialized');

    await getStore().commit('setLoading', false);

    if (!getStore().state.isAuthenticated) {
      await getStore().commit('setPreviousAuthRoute', to);
      next(`/signUp?email=${encodeURIComponent(to.query.email)}`);
    } else {
      next();
    }
  },
  components: {Nav, Footer},
  computed: {
    ...mapState([
      'teamBrand'
    ])
  },
  async mounted() {
    this.setLoading(true);

    try {
      const teamId = this.$route.params.teamId;
      const invitationId = this.$route.params.invitationId;

      await acceptInvite(teamId, invitationId);
      await this.refreshUserDetails();
      await this.refreshTeamBrand();
      signalUserAttributeUpdate();

      this.navigateToTeamConfirmation();
      trackAcceptInvite(this.teamBrand.teamName);
    } catch (err) {
      if (err.detail) {
        switch (err.detail) {
          case "INVITATION_EMAIL_NOT_MATCHED":
            this.setPreviousAuthRoute(this.$route);
            this.showInvalidAcceptInviteEmail();
            await signOut();
            await this.refreshUserDetails();
            this.$router.push(`/signUp?email=${encodeURIComponent(this.$route.query.email)}`).catch(() => {});
            break;
          case "INVITATION_REVOKED_OR_ACCEPTED":
          case "INVALID_INVITATION_CODE":
            this.showInvalidInvitation();
            this.navigateToNew();
            break;
          default:
            this.showErrorMsg();
            this.navigateToNew();
            break;
        }
      } else {
        this.showErrorMsg();
        this.navigateToNew();
      }
    } finally {
      this.setLoading(false);
    }
  },
  methods: {
    ...mapMutations([
      'setLoading',
      'setPreviousAuthRoute'
    ]),
    ...mapActions([
      'refreshUserDetails',
      'refreshTeamBrand'
    ]),
    ...navigationPresets
  },
  notifications: Notifications
}
</script>

<style scoped>
@import '../../styles/globalShared.css';

div, label, input, button, form {
  box-sizing : border-box !important;
}

div.outer-container {
  margin: 120px auto;
  max-width: 960px;
}

div.inner-container {
  padding: 40px;
  background-color: #21252b;
  border-radius: 2px;
  margin-bottom: 60px;
}

div.title-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

h3.title {
  color: #fff;
  font-size: 23px;
  font-weight: 700;
  line-height: 25px;
  margin: 20px 0;
}

a.account-link {
  color: #0071df;
  font-weight: 700;
}

p {
  margin: 0;
  font-size: 16px;
  line-height: 25px;
  color: #9CA5B4;
}

label.field-label {
  display: block;
  color: #9ca5b4;
  font-size: 13px;
  line-height: 20px;
  margin: 20px 0 10px 0;
}

label.field-label-required {
  color: #ff7a59;
  font-size: 13px;
  line-height: 20px;
  font-weight: 700;
}

input.input-field {
  width: 100%;
  display: block;
  border-radius: 2px;
  border: solid 1px #5e656f;
  height: 48px;
  background-color: #21252b;
  color: #fff;
  font-size: 16px;
  padding-left: 15px;
  padding-right: 15px;
}

select {
  width: 100%;
  display: block;
  border-radius: 2px;
  border: solid 1px #5e656f;
  height: 48px;
  background-color: #21252b;
  color: #fff;
  font-size: 16px;
  padding-left: 15px;
  padding-right: 15px;
}

label.password-hint {
  display: block;
  font-size: 13px;
  margin-top: 10px;
  line-height: 15px;
  color: #5e656f;
}

button.btn-submit {
  width: 100%;
  height: 50px;
  margin-top: 40px;
  border-radius: 2px;
  border: 0;
  cursor: pointer;
  padding: 0;
  background-color: #0071DF;
  outline: none;
  text-align: center;
  font-size: 16px;
  line-height: 50px;
  font-weight: 700;
  color: #fff;
}

@media screen and (max-width: 520px) {
  div.inner-container {
    padding: 40px 20px;
    border-radius: 0;
  }
}

</style>