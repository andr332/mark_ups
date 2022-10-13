<template>
  <div>
    <a v-if="!teamBrand || !teamBrand.logoUrl" class="logo" href="/" v-on:click.prevent="navigateToRoot()" title="Markup Hero"></a>
    <a v-if="teamBrand && teamBrand.logoUrl && !teamBrand.isCustomDomain" class="brand-logo" href="/" v-on:click.prevent="navigateToRoot()" :title="teamBrand.teamName || 'Markup Hero'">
      <img :src="teamBrand.logoUrl" alt="Team Logo">
    </a>
    <div v-if="teamBrand && teamBrand.logoUrl && teamBrand.isCustomDomain" class="brand-logo-url">
      <img :src="teamBrand.logoUrl" alt="Team Logo">
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import navigationPresets from "@/navigationPresets";

export default {
  name: "Logo",
  data() {
    return {
      showDropdown: false
    };
  },
  computed: mapState([
    'teamBrand'
  ]),
  methods: {
    ...navigationPresets
  }
}
</script>

<style scoped>
  a.logo {
    background: url('../../assets/markupherologo.svg') no-repeat center center;
    margin: 0 5px;
    display: inline-block;
    height: 40px;
    width: 64px;
  }

  a.brand-logo {
    position: relative;
    margin: 0 10px;
    display: inline-block;
    height: 40px;
    width: 40px;
    border-radius: 2px;
    overflow: hidden;
  }

  div.brand-logo-url {
    position: relative;
    margin: 0 10px;
    display: block;
    height: 40px;
    width: 40px;
    border-radius: 2px;
    overflow: hidden;
  }

  a.brand-logo img, div.brand-logo-url img {
    position: absolute;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  @media screen and (max-width: 520px) {
    a.logo {
      width: 48px;
    }
    a.brand-logo {
      margin: 0 9px;
    }
  }
</style>