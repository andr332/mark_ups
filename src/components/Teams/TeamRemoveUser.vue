<template>
  <div>
    <Nav></Nav>
    <div class="outer-container">
      <div class="inner-container">
        <div class="title-container">
          <h3 class="title">Remove Member</h3>
          <div class="title-link"><a class="account-link" href="/teams" v-on:click.prevent="navigateToTeam()">Back to my team</a></div>
        </div>
        <p>Are you sure you want to delete <strong>{{teamMemberToRemove.email}}</strong>? Please confirm by typing <strong>REMOVE MEMBER</strong> below and select if you want to transfer their markups to another account.</p>
        <label class="field-label">Type REMOVE MEMBER <label class="field-label-required">*</label></label>
        <input class="input-field" v-model="deleteConfirmation">
        <label class="field-label">Transfer Markups To <label class="field-label-required">*</label></label>
        <select name="Transfer Markups" v-model="transferOption">
          <option v-for="member in teamDetails.members.filter(m => m.status === 'Active' && m.userId !== teamMemberToRemove.userId)" :value="member.userId" :key="member.userId">{{member.email}}</option>
          <option value="delete-markups">Don't Transfer & Delete Markups</option>
        </select>
        <label class="password-hint">Select a member account you'd like to transfer <strong>{{teamMemberToRemove.email}}</strong>'s markups to or select delete markups.</label>
        <button :disabled="deleteConfirmation.toLowerCase().trim() !== 'remove member' || !this.transferOption" class="btn-submit" v-on:click.prevent="removeMember()">Remove Member</button>
        <button class="btn-submit btn-submit--cancel" v-on:click.prevent="navigateToTeam()">Cancel</button>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
  import Nav from "../Nav";
  import Footer from "../Footer";
  import navigationPresets from "../../navigationPresets";
  import {mapActions, mapMutations, mapState} from "vuex";
  import {Notifications} from "@/constants";
  import {removeMember} from "@/services/teamService";

  export default {
    name: "TeamRemoveUser",
    components: {Nav, Footer},
    data() {
      return {
        transferOption: '',
        deleteConfirmation: ''
      }
    },
    computed: {
      ...mapState([
          'teamDetails',
          'teamMemberToRemove'
      ])
    },
    methods: {
      async removeMember() {
        if (!this.teamMemberToRemove) this.showErrorMsg();

        try {
          this.setLoading(true);
          const transferMarkUps = this.transferOption !== 'delete-markups';

          await removeMember({
            transferMarkUps,
            destinationTransferUserId: transferMarkUps ? this.transferOption : null,
            member: {
              userId: this.teamMemberToRemove.userId
            }
          });

          this.setTeamMemberToRemove(null);
          await this.refreshTeamDetails();

          this.navigateToTeam();
          this.showTeamMemberRemoved();
        } catch {
          this.showErrorMsg();
        } finally {
          this.setLoading(false);
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

  select {
    border: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -ms-appearance: none;
  }

  div.outer-container {
    margin: 120px auto;
    max-width: 440px;
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

  select {
    width: 100%;
    display: block;
    border-radius: 2px;
    border: solid 1px #5e656f;
    height: 48px;
    color: #fff;
    font-size: 16px;
    padding-left: 15px;
    padding-right: 15px;
    background: #21252b url('../../assets/dropdown.svg') no-repeat right 8px top 50%;
    cursor: pointer;
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
    background-color: #FF7A59;
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
    div.inner-container {
      padding: 40px 20px;
      border-radius: 0;
    }
  }

</style>