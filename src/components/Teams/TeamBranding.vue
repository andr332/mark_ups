<template>
  <div class="inner-container">
    <div class="title-container">
      <h3 class="title">Team Branding & Domain</h3>
      <p>Add your logo and name to be displayed on your secure custom domain when sharing markups and for you and your members when logged in to Markup Hero. Please read our <a href="https://help.markuphero.com/article/3" target="_blank">team branding & custom domain documentation</a> for proper setup.</p>
    </div>
    <label class="field-label">Team Logo</label>
    <div class="flex-buttons">
      <input id="file-input" accept="image/*" type="file" name="file-input" style="display: none;" v-on:change="handleFileUpload" />
      <button class="team-logo" v-on:click="openFileDialog()">
        <div class="upload"></div>
        <img v-if="teamDetails.logoUrl" :src="`${teamDetails.logoUrl}`">
      </button>
      <button v-if="teamDetails.logoUrl" class="delete-img" v-on:click.prevent="removeLogo()"><span class="icon icon-delete"></span></button>
    </div>
    <label class="password-hint">Upload a jpg, png or svg that is 180px x 180px for optimal usage.</label>
    <label class="field-label">Team Name</label>
    <input class="input-field" v-model="teamName">
    <label class="field-label">Custom Domain <label class="field-label-required">*</label></label>
    <div class="inset-input">
      <label>https://</label>
      <input class="input-field" v-model="cname">
    </div>
    <label class="password-hint">Share your markups on your secure custom domain. Configure your DNS by adding a CNAME from <strong>yourdomain.com</strong> to <strong>markuphero.com</strong></label>
    <button class="action action-invite" v-on:click.prevent="saveChanges()">Save Changes</button>
  </div>
</template>

<script>
import navigationPresets from "../../navigationPresets";
import {mapActions, mapMutations, mapState} from "vuex";
import {Notifications} from "@/constants";
import {inviteTeamMembers, updateTeamDetails, uploadLogo} from "@/services/teamService";

export default {
  name: "TeamBranding",
  data: () => {
    return {
      teamName: '',
      cname: '',
      file: null
    };
  },
  mounted() {
    this.setTeamDetails();
  },
  computed: {
    ...mapState(['teamDetails']),
  },
  methods: {
    setTeamDetails() {
      this.teamName = this.teamDetails.name;
      this.cname = this.teamDetails.cName;
    },
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
    openFileDialog() {
      let fileInput = document.getElementById('file-input');
      fileInput.click();
    },
    resetFileDialog() {
      this.file = null;
      let fileInput = document.getElementById('file-input');
      fileInput.value = [];
    },
    handleFileUpload() {
      let fileInput = document.getElementById('file-input');

      if (!fileInput.files) return;

      this.file = fileInput.files[0];
      this.uploadLogo();
    },
    async uploadLogo() {
      if (!this.file) return;

      try {
        this.setLoading(true);

        await uploadLogo(this.file);
        await this.refreshTeamDetails();
        await this.refreshTeamBrand();
        this.showLogoUpdated();
      } catch {
        this.showErrorMsg();
      } finally {
        this.setLoading(false);
        this.resetFileDialog();
      }
    },
    async removeLogo() {
      try {
        this.setLoading(true);

        await updateTeamDetails({
          logoIdentifier: null,
          teamName: this.teamDetails.name,
          cName: this.cname
        });

        await this.refreshTeamDetails();
        await this.refreshTeamBrand();
        this.setTeamDetails();
        this.showLogoRemoved();
      } catch {
        this.showErrorMsg();
      } finally {
        this.setLoading(false);
        this.resetFileDialog();
      }
    },
    async saveChanges() {
      try {
        this.setLoading(true);

        await updateTeamDetails({
          logoIdentifier: this.teamDetails.logoIdentifier,
          teamName: this.teamName,
          cName: this.cname
        });

        await this.refreshTeamDetails();
        await this.refreshTeamBrand();
        this.setTeamDetails();
        this.showTeamDetailsUpdated();
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
      'refreshTeamDetails',
      'refreshTeamBrand'
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

p a {
  color: #9CA5B4;
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

button.action-invite {
  height: 40px;
  margin-top: 40px;
  margin-left: auto;
  padding: 0 12px;
  border-radius: 2px;
  background-color: #03a87c;
}

@media (hover: hover) {
  button.action:hover {
    color: #fff;
    background-color: #0071DF;
  }
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

@media screen and (max-width: 520px) {
  div.inner-container {
    padding: 40px 20px;
    border-radius: 0;
  }
}

</style>