<template>
  <div>
    <Nav></Nav>
    <div class="outer-container">
      <form class="inner-container" v-on:submit="inviteMember()">
        <div class="title-container">
          <h3 class="title">Invite Member</h3>
          <div class="title-link"><a class="account-link" href="/teams" v-on:click.prevent="navigateToTeam()">Back to my team</a></div>
        </div>
        <p>Invite a new member to your team by entering their email.</p>
        <label class="field-label">Email</label>
        <input class="input-field" v-model="inviteEmail">
        <label class="password-hint">{{teamDetails.maxMembers - teamDetails.members.length}} invites left</label>
        <button class="btn-submit" v-on:click.prevent="inviteMember()">Invite</button>
        <button class="btn-submit btn-submit--cancel" v-on:click.prevent="navigateToTeam()">Cancel</button>
      </form>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
  import Nav from "../Nav";
  import Footer from "../Footer";
  import navigationPresets from "../../navigationPresets";
  import {mapActions, mapMutations, mapState} from "vuex";
  import multiguard from "vue-router-multiguard";
  import authorizedRouteGuard from "@/guards/authorizedGuard";
  import teamOwnerGuard from "@/guards/teamOwnerGuard";
  import getStore from "@/stores/appStore";
  import {Notifications} from "@/constants";
  import {inviteTeamMembers} from "@/services/teamService";

  export default {
    name: "TeamInvite",
    components: {Nav, Footer},
    beforeRouteEnter: multiguard([authorizedRouteGuard, teamOwnerGuard,
      async (to, from, next) => {
        await getStore().commit('setLoading', true);
        await getStore().dispatch('awaitUntilUserDetailsInitialized');
        await getStore().dispatch('refreshTeamDetails');
        await getStore().commit('setLoading', false);
        next();
      }]),
    data: () => {
      return {
        inviteEmail: ""
      };
    },
    computed: {
      ...mapState(['teamDetails'])
    },
    methods: {
      async inviteMember() {
        if (!this.inviteEmail) this.showErrorMsg();

        try {
          this.setLoading(true);
          await inviteTeamMembers([this.inviteEmail]);
          this.showTeamMemberInvited();
          this.inviteEmail = '';
          await this.refreshTeamDetails();

          if (this.teamDetails.maxMembers === this.teamDetails.members.length) this.navigateToTeam();
        } catch {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      ...mapMutations([
        'setLoading'
      ]),
      ...mapActions([
        'refreshTeamDetails'
      ]),
      ...navigationPresets,
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
    max-width: 440px;
  }

  form.inner-container {
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
    font-size: 13px;
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
    background-color: #03a87c;
    outline: none;
    text-align: center;
    font-size: 16px;
    line-height: 50px;
    font-weight: 700;
    color: #fff;
  }

  button.btn-submit--cancel {
    margin-top: 20px;
    color: #9CA5B4;
    background-color: #2f333d;
  }

  @media (hover: hover) {
    button.btn-submit:hover {
      background-color: #0071DF;
      color: #fff;
    }
  }

  button.btn-submit:disabled {
    color: #5E656F;
    background-color: #282C34;
    cursor: not-allowed;
  }

  @media screen and (max-width: 520px) {
    form.inner-container {
      padding: 40px 20px;
      border-radius: 0;
    }
  }

</style>