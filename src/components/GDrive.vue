<template>
  <div class="flex-container">
    <button v-on:click.prevent="loginToGoogle" v-if="!googleUserAuthorized" class="white-btn"><span class="drive-logo"></span>Authorize Google Drive</button>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import navigationPresets from "@/navigationPresets";
import {getExportFileDownloadUrl, getFileDownloadUrl, getFileMetadata} from "@/services/gcloudService";
import {
  createMarkUpFromImageUrl,
  createMarkUpFromPdfUrl,
  getMarkUpAndAwaitUntilPresent
} from "@/services/markUpService";
import getStore from "@/stores/appStore";
import {trackMarkUpCreate} from "@/services/analytics";

export default {
  name: "GDrive",
  beforeRouteEnter: async (to, _, next) => {
    await getStore().commit('setLoading', {
      isLoading: true,
      loaderStyle: 'gdrive'
    });
    await getStore().dispatch('awaitUntilUserInitialized');

    next();
  },
  data() {
    return {
      state: null,
      googleUserAuthorized: null
    };
  },
  computed: {
    ...mapState([
        'googleAccessToken'
    ])
  },
  async mounted() {
    let install = this.$route.query.install;

    if (install == 1) {
      await this.authUserForInstall();
    } else {
      let state = this.$route.query.state;
      if (state) {
        this.state = JSON.parse(decodeURI(state));

        this.googleUserAuthorized = await this.isGoogleUserAuthorized({
          gAuth: this.$gAuth,
          userId: this.state.userId
        });

        if (!this.googleUserAuthorized) {
          this.setLoading(false);
        } else {
          await this.createGdriveMarkUp(state);
        }
      } else {
        this.navigateTo404();
      }
    }
  },
  methods: {
    async authUserForInstall() {
      const success = await this.reAuthorizeUser(this.$gAuth);
      this.setLoading(false);
      if (!success) {
        this.navigateToFailedGdrive();
      } else {
        this.navigateToSuccessGdrive();
      }
    },
    async createGdriveMarkUp() {
      this.setLoading({
        isLoading: true,
        loaderStyle: 'gdrive'
      });

      let markUpId = null;

      if (this.state.ids && this.state.ids.length > 0) {
        const fileId = this.state.ids.length > 0 ? this.state.ids[0] : this.state.exportIds[0];
        const metadata = await getFileMetadata(fileId);
        markUpId = metadata.mimeType === 'application/pdf' ? await createMarkUpFromPdfUrl(getFileDownloadUrl(fileId), this.googleAccessToken) : await createMarkUpFromImageUrl(getFileDownloadUrl(fileId), this.googleAccessToken);
      } else {
        const fileId = this.state.exportIds[0];
        markUpId = await createMarkUpFromPdfUrl(getExportFileDownloadUrl(fileId), this.googleAccessToken);
      }

      await getMarkUpAndAwaitUntilPresent(markUpId, null, false);

      trackMarkUpCreate(markUpId, 'gdrive');

      this.setLoading(false);
      this.navigateToMarkUp(markUpId);
    },
    async loginToGoogle() {
      this.setLoading({
        isLoading: true,
        loaderStyle: 'google-auth'
      });

      this.googleUserAuthorized = await this.ensureGoogleUserAuthorized({
        gAuth: this.$gAuth,
        userId: this.state.userId
      });

      if (!this.googleUserAuthorized) {
        return this.navigateToFailedGdrive();
      }

      await this.createGdriveMarkUp();
    },
    ...mapActions([
        'ensureGoogleUserAuthorized',
        'isGoogleUserAuthorized',
        'reAuthorizeUser'
    ]),
    ...mapMutations([
        'setLoading'
    ]),
    ...navigationPresets
  }
}
</script>

<style scoped>
  @import '../styles/globalShared.css';

  div.flex-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>