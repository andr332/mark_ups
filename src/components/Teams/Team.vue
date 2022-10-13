<template>
  <div>
    <Nav></Nav>
    <div class="outer-container">
      <div class="inner-container">
        <div class="title-container">
          <h3 class="title">Team Members</h3>
          <p>Manage your team members. If you remove a member from your team you’ll have the option to delete or transfer their markups to another member.</p>
        </div>
        <div class="table-container">
          <div class="flex-table">
            <div class="flex-row row-label">Email</div>
            <div class="flex-row row-label">Name</div>
            <div class="flex-row row-label">Type</div>
            <div class="flex-row row-label">Status</div>
            <div class="flex-row row-label">Actions</div>
          </div>
          <div v-for="member in teamDetails.members" class="flex-table" :key="member.email" v-bind:class="{ 'member-pending': member.status === 'Pending' }">
            <div class="flex-row"><div class="truncate">{{member.email}}</div></div>
            <div class="flex-row"><div class="truncate">{{member.name}}</div></div>
            <div class="flex-row"><div class="truncate">{{member.userId === userId ? 'Owner' : 'Member'}}</div></div>
            <div class="flex-row"><div class="truncate">{{member.status}}</div></div>
            <div class="flex-row"><button v-if="member.status === 'Pending'" class="action action-reinvite" v-on:click.prevent="reinvite(member)">Reinvite</button><button v-if="member.userId !== userId" v-on:click="removeMember(member)" class="action action-remove">Remove</button></div>
          </div>
          <div class="flex-table">
            <div class="member-count">{{teamDetails.members.length}}/{{teamDetails.maxMembers}} Members</div>
            <button :disabled="teamDetails.maxMembers === teamDetails.members.length" v-on:click.prevent="navigateToTeamInvite()" class="action action-invite">New Invite</button>
          </div>
        </div>
      </div>
      <TeamBranding v-if="teamDetails.customBrandingEnabled"></TeamBranding>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
  import Nav from "../Nav";
  import Footer from "../Footer";
  import TeamBranding from "@/components/Teams/TeamBranding";
  import navigationPresets from "../../navigationPresets";
  import {mapActions, mapMutations, mapState} from "vuex";
  import authorizedRouteGuard from "@/guards/authorizedGuard";
  import multiguard from 'vue-router-multiguard';
  import teamOwnerGuard from "@/guards/teamOwnerGuard";
  import getStore from "@/stores/appStore";
  import {Notifications} from "@/constants";
  import {reinviteTeamMember, removeInvite} from "@/services/teamService";

  export default {
    name: "Team",
    components: {Nav, Footer, TeamBranding},
    beforeRouteEnter: multiguard([authorizedRouteGuard, teamOwnerGuard,
        async (to, from, next) => {
          await getStore().commit('setLoading', true);
          await getStore().dispatch('awaitUntilUserDetailsInitialized');
          await getStore().dispatch('refreshTeamDetails');
          await getStore().commit('setLoading', false);
          next();
        }]),
    computed: {
      ...mapState([
          'teamDetails',
          'userId',
          'userDetails'
      ])
    },
    methods: {
      async reinvite(member) {
        try {
          this.setLoading(true);
          await reinviteTeamMember({
            email: member.email
          });
          this.showTeamMemberReinvited();
        } catch {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
        }
      },
      async removeMember(member) {
        if (member.status === 'Pending') {
          try {
            this.setLoading(true);
            await removeInvite({
              email: member.email
            });
            this.showInviteRemoved();

            await this.refreshTeamDetails();
          } catch {
            this.showErrorMsg();
          } finally {
            this.setLoading(false);
          }
        } else {
          this.setTeamMemberToRemove(member);
          this.navigateToTeamRemove();
        }
      },
      ...mapMutations([
        'setLoading',
        'setTeamMemberToRemove'
      ]),
      ...mapActions([
        'refreshTeamDetails'
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

  h3.title {
    color: #fff;
    font-size: 23px;
    font-weight: 700;
    line-height: 25px;
    margin: 20px 0;
  }

  p {
    margin: 0;
    font-size: 16px;
    line-height: 25px;
    color: #9CA5B4;
  }

  div.table-container {
    display: block;
    width: 100%;
  }

  div.flex-table {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  div.flex-row {
    position: relative;
    display: flex;
    align-items: center;
    width: calc((100%)/5);
    min-height: 60px;
    padding-right: 10px;
    border-bottom: 1px solid #5E656F;
    font-size: 16px;
    line-height: 20px;
    color: #fff;
  }

  div.row-label {
    padding-top: 20px;
    font-size: 13px;
    color: #5E656F;
  }

  div.member-pending div.flex-row {
    color: #9CA5B4;
  }

  div.truncate {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  button.action {
    height: 32px;
    padding: 0 16px;
    font-size: 13px;
    line-height: 20px;
    font-weight: 700;
    border-radius: 16px;
    color: #fff;
  }

  button.action-reinvite {
    color: #9CA5B4;
    background-color: #2f333d;
    margin-right: 10px;
  }

  button.action-remove {
    background-color: #FF7A59;
  }

  button.action-invite {
    height: 40px;
    margin-top: 40px;
    margin-left: auto;
    padding: 0 12px;
    border-radius: 2px;
    background-color: #03a87c;
  }

  @media (hover: hover) {
    div.truncate:hover {
      overflow: visible;
      text-overflow: initial;
      background-color: #21252b;
      z-index: 10;
      padding-right: 10px;
    }
    button.action:hover {
      color: #fff;
      background-color: #0071DF;
    }
  }

  div.member-count {
    font-size: 16px;
    line-height: 40px;
    margin-top: 40px;
    color: #9CA5B4;
  }

  button.team-logo {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 2px;
    overflow: hidden;
    background-color: #21252b;
    border: 1px solid #5E656F;
  }

  div.upload {
    position: absolute;
    width: 80px;
    height: 80px;
    background-color: #9CA5B4;
    mask: url('../../assets/upload.svg') no-repeat center center;
  }

  button.team-logo img {
    position: absolute;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
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

  div.inset-input {
    width: 100%;
    display: flex;
    align-items: center;
    border-radius: 2px;
    border: solid 1px #5e656f;
    height: 48px;
    background-color: #21252b;
    color: #fff;
    font-size: 16px;
    padding-left: 15px;
    padding-right: 0;
  }

  div.inset-input label {
    color: #9CA5B4;
    font-size: 16px;
  }

  div.inset-input input.input-field {
    width: 100%;
    display: block;
    border-radius: none;
    border: none;
    height: 44px;
    background-color: transparent;
    color: #fff;
    font-size: 16px;
    padding-left: 0;
    padding-right: 15px;
  }

  label.password-hint {
    display: block;
    font-size: 13px;
    margin-top: 10px;
    line-height: 15px;
    color: #5e656f;
  }

  button.action-invite:disabled {
    color: #5E656F;
    background-color: #282C34;
    cursor: not-allowed;
  }

  div.flex-buttons {
    display: flex;
    align-items: flex-end;
  }

  button.delete-img {
    height: 40px;
    width: 40px;
    margin-left: 10px;
    background-color: #2f333d;
    border-radius: 2px;
  }

  @media (hover: hover) {
    button.delete-img:hover {
      background-color: #FF7A59;
    }
  }

  @media screen and (max-width: 920px) {
    div.flex-row {
      width: calc((100% - 240px)/2);
    }
    div.flex-row:nth-child(3), div.flex-row:nth-child(4) {
      width: 120px;
    }
    div.flex-row:nth-child(2) {
      display: none;
    }
  }

  @media screen and (max-width: 767px) {
    div.flex-row {
      width: calc((100% - 160px)/2);
    }
    div.flex-row:nth-child(3), div.flex-row:nth-child(4) {
      width: 80px;
    }
  }

  @media screen and (max-width: 767px) {
    div.flex-row {
      width: calc((100% - 80px)/2);
    }
    div.flex-row:nth-child(4) {
      display: none;
    }
  }

  @media screen and (max-width: 520px) {
    div.inner-container {
      padding: 40px 20px;
      border-radius: 0;
    }
    div.flex-row {
      width: calc((100%)/2);
    }
    div.flex-row:nth-child(3) {
      display: none;
    }
    div.flex-row:nth-child(5) {
      overflow-x: scroll;
    }
  }

</style>