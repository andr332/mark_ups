<template>
  <div>
    <Nav></Nav>
    <section class="hero-section">
      <div class="container">
        <div class="hero-text">
          <div class="hero-text-wrapper">
            <h1>Choose Your Plan</h1>
            <p>Markup Hero’s Hero plan is free. No credit card required.</p>
            <div class="toggle-row">
              <div class="toggle-text toggle-text-right">Pay Monthly</div>
              <div>
                <label class="switch">
                  <input type="checkbox" v-model="isPricingAnnual">
                  <span class="slider round"></span>
                </label>
              </div>
              <div class="toggle-text toggle-text-left toggle-text--active">Pay Annually<br><span>Save 20%</span></div>
            </div>
          </div>
        </div>
        <div class="pricing-row">
          <div class="pricing-card basic">
            <h4>Hero</h4>
            <p>For individuals that want the basic tools and features with history for 10 markups per month.</p>
            <h5>Free</h5>
            <a class="card-button" href="/new" v-on:click.prevent="navigateToNew">Get Started</a>
            <div class="card-subtext">No credit card required</div>
          </div>
          <div class="pricing-card pro">
            <label class="banner">Pro Plan</label>
            <h4>Superhero</h4>
            <p>For professionals & teams that need access to all our tools and features with unlimited usage.</p>
            <h5>${{priceValue}} / month</h5>
            <a class="card-button" href="/upgrade?code=1MONTHFREE" v-on:click.prevent="navigateToUpgradePromo">Try 1 Month Free</a>
            <div class="card-subtext">Priced per member</div>
          </div>
        </div>
      </div>
    </section>
    <section class="table">
      <div class="container">
        <div class="hero-text">
          <div class="hero-text-wrapper">
            <h1 class="table-title">Compare Plans, Features & Pricing</h1>
          </div>
        </div>
        <div class="table-container feature-overview">
          <div class="flex-table header">
            <div class="flex-row feature hide-feature"></div>
            <div class="flex-row">Hero</div>
            <div class="flex-row"><label class="banner">Pro Plan</label>Superhero</div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Pricing</div>
            <div class="flex-row">Free</div>
            <div class="flex-row">${{priceValue}} / month / member</div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">File types</div>
            <div class="flex-row">Images, PDFs & websites</div>
            <div class="flex-row">Images, PDFs & websites</div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">File uploads (including screenshots)</div>
            <div class="flex-row">10 / month</div>
            <div class="flex-row">Unlimited</div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Edit markups & annotations for</div>
            <div class="flex-row">3 days</div>
            <div class="flex-row">Unlimited</div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">See your history for</div>
            <div class="flex-row">3 days</div>
            <div class="flex-row">Unlimited</div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Max size per file</div>
            <div class="flex-row">8MB</div>
            <div class="flex-row">50MB</div>
          </div>
        </div>
        <div class="table-container">
          <div class="table-section">Screenshot Apps</div>
          <div class="flex-table row">
            <div class="flex-row feature">Operating systems</div>
            <div class="flex-row">Mac, Windows, Linux & Chrome</div>
            <div class="flex-row">Mac, Windows, Linux & Chrome</div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Screenshot</div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Instantly sharable links</div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Custom keyboard shortcuts</div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Scrolling screenshot</div>
            <div class="flex-row"><a href="/integrations/chrome-extension.html" target="_blank">via Chrome Extension</a></div>
            <div class="flex-row"><a href="/integrations/chrome-extension.html" target="_blank">via Chrome Extension</a></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Offline mode</div>
            <div class="flex-row"><span class="no" title="No"></span></div>
            <div class="flex-row"><a href="https://roadmap.markuphero.com/boards/feedback/posts/offline-desktop-only-screenshots-and-annotations" rel="noopener" target="_blank">Coming soon</a></div>
          </div>
        </div>
        <div class="table-container">
          <div class="table-section">Markup & Edit Tools</div>
          <div class="flex-table row">
            <div class="flex-row feature">Markup & edit on</div>
            <div class="flex-row">Any modern desktop, mobile, or tablet web browser</div>
            <div class="flex-row">Any modern desktop, mobile, or tablet web browser</div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Text, arrow, line, rectangle, oval, pen & highlighter tools</div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Select background, colors, line thicknesses & font sizes</div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Move, rotate, undo, redo & delete objects</div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Modify any markup with duplicate</div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Blur (secure obfuscation) </div>
            <div class="flex-row"><span class="no" title="no"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Insert images</div>
            <div class="flex-row"><span class="no" title="no"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Crop canvas</div>
            <div class="flex-row"><span class="no" title="no"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Add pages</div>
            <div class="flex-row"><span class="no" title="no"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Custom colors</div>
            <div class="flex-row"><span class="no" title="no"></span></div>
            <div class="flex-row"><a href="https://roadmap.markuphero.com/boards/feedback/posts/annotation-tools-custom-color-picker" rel="noopener" target="_blank">Coming soon</a></div>
          </div>
        </div>
        <div class="table-container">
          <div class="table-section">More Settings & Features</div>
          <div class="flex-table row">
            <div class="flex-row feature">Sharable links</div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Copy markup images to clipboard</div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Download markup images</div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Export markups as PDFs</div>
            <div class="flex-row"><span class="no" title="No"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Delete markups</div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Duplicate markups</div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Custom sharing & privacy settings</div>
            <div class="flex-row"><span class="no" title="No"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Add titles & search history</div>
            <div class="flex-row"><span class="no" title="No"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Organize markups with collections</div>
            <div class="flex-row"><span class="no" title="No"></span></div>
            <div class="flex-row"><span class="yes" title="Yes"></span></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Invite & manage team members</div>
            <div class="flex-row"><span class="no" title="No"></span></div>
            <div class="flex-row"><a href="mailto:support@markuphero.com?subject=Join%20Teams%20Waitlist" rel="noopener">Beta - join waitlist</a></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Custom domain & branding for share links</div>
            <div class="flex-row"><span class="no" title="No"></span></div>
            <div class="flex-row"><a href="mailto:support@markuphero.com?subject=Join%20Custom%20Domain%20Waitlist" rel="noopener">Beta add on - join waitlist</a></div>
          </div>
          <div class="flex-table row">
            <div class="flex-row feature">Expiring share links</div>
            <div class="flex-row"><span class="no" title="No"></span></div>
            <div class="flex-row"><a href="https://roadmap.markuphero.com/boards/feedback/posts/expiring-link-shares" rel="noopener" target="_blank">Coming soon</a></div>
          </div>
        </div>
      </div>
    </section>
    <Footer></Footer>
  </div>
</template>

<script>
  import navigationPresets from "../../navigationPresets";
  import Nav from "../Nav";
  import Footer from "../Footer";

  export default {
    name: "ChooseYourPlan",
    components: {Nav, Footer},
    data() {
      return {
        isPricingAnnual: true
      };
    },
    computed: {
      priceValue() {
        return this.isPricingAnnual ? '4' : '5';
      }
    },
    methods: navigationPresets
  }
</script>

<style scoped>
  div, label, input, button, form {
    box-sizing : border-box !important;
  }

  section {
    padding: 60px 40px;
    color: #fff;
  }

  section.hero-section {
    margin-top: 60px;
    background-color: #21252b;
    padding: 60px 40px 80px 40px;
    color: #fff;
  }

  div.container {
    margin: auto;
    max-width: 740px;
  }

  div.hero-text {
    margin: 60px auto 40px auto;
    max-width: 960px;
    position: relative;
  }

  div.hero-text-wrapper {
    position: relative;
  }

  h1 {
    margin: 0 0 20px 0;
    font-size: 52px;
    line-height: 60px;
    text-align: center;
  }

  h2 {
    margin: 0 0 20px 0;
    font-size: 42px;
    line-height: 50px;
    text-align: center;
  }

  h3 {
    margin: 0 0 20px 0;
    font-size: 32px;
    line-height: 40px;
  }

  h3.emoji {
    font-size: 40px;
    margin-bottom: 20px;
  }

  h4 {
    margin: 0;
    font-size: 16px;
    line-height: 30px;
    color: #9CA5B4;
  }

  p {
    margin: 0 0 30px 0;
    font-size: 20px;
    line-height: 30px;
    text-align: center;
    color: #9CA5B4;
  }

  div.toggle-row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  div.toggle-text {
    margin-top: 2px;
    font-size: 13px;
    line-height: 15px;
    color: #5E656F;
    text-transform: uppercase;
    letter-spacing: 2px;
    width: 108px;
  }

  div.toggle-text-right {
    text-align: right;
  }

  div.toggle-text-left {
    text-align: left;
  }

  div.toggle-text--active {
    font-weight: 700;
    color: #fff;
  }

  div.toggle-text span {
    color: #03a87c;
  }

  .switch {
    position: relative;
    display: block;
    width: 48px;
    height: 24px;
    margin: 0 10px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #5E656F;
    border-radius: 12px;
    transition: .2s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    border-radius: 10px;
    left: 2px;
    top: 2px;
    background-color: #fff;
    transition: .2s;
  }

  input:checked + .slider {
    background-image: linear-gradient(to bottom right,#FCD117,#FF377C 67%);
    background-color: #FF377C;
  }

  input:checked + .slider:before {
    transform: translateX(24px);
  }

  div.pricing-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  div.pricing-card {
    position: relative;
    margin: 40px 0;
    padding:  40px 20px 20px 20px;
    width: calc((100% - 30px)/2);
    background-color: #181A1F;
    border-radius: 2px;
    text-align: center;
  }

  label.banner {
    display: block;
    position: absolute;
    top: -15px;
    left: calc(50% - 50px);
    height: 30px;
    width: 100px;
    border-radius: 2px;
    font-size: 13px;
    line-height: 30px;
    text-align: center;
    font-weight: 700;
    color: #fff;
    background-image: linear-gradient(to bottom right,#FCD117,#FF377C 67%);
    background-color: #FF377C;
  }

  div.pricing-card h4 {
    margin: 20px 0 10px 0;
    font-size: 32px;
    line-height: 40px;
    color: #fff;
  }

  div.pricing-card h5 {
    margin: 20px 0 10px 0;
    font-size: 32px;
    font-weight: 700;
    line-height: 40px;
  }

  div.pricing-card p {
    margin: 0 0 40px 0;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    color: #9CA5B4;
    min-height: 60px;
  }

  a.card-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 48px;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    font-weight: 700;
    border: 1px solid #9ca5b4;
    color: #9ca5b4;
    text-decoration: none;
    border-radius: 2px;
    margin: 40px 0 20px 0;
  }

  div.basic a.card-button {
    height: 50px;
    border: none;
    background-color: #03a87c;
    color: #fff;
  }

  div.pro a.card-button {
    height: 50px;
    border: none;
    background-image: linear-gradient(to bottom right,#FCD117,#FF377C 67%);
    background-color: #FF377C;
    color: #fff;
  }

  div.card-subtext {
    margin: 0;
    font-size: 13px;
    line-height: 20px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #5E656F;
  }

  section.table {
    padding: 60px 40px 120px 40px;
  }

  h1.table-title {
    margin: 0 0 80px 0;
    font-size: 42px;
    line-height: 50px;
  }

  div.table-container {
    display: block;
    width: 100%;
  }

  div.table-section {
    font-size: 20px;
    line-height: 60px;
    color: #5E656F;
  }

  div.flex-table {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  div.flex-table label.banner {
    top: -20px;
  }

  div.flex-row {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc((100% - 304px)/2);
    text-align: center;
    padding: 20px;
    margin-bottom: 2px;
    font-size: 16px;
    line-height: 20px;
    color: #9ca5b4;
    background-color: #181A1F;
    border-radius: 2px;
  }

  div.feature-overview div.flex-row {
    color: #fff;
  }

  div.flex-table:nth-child(odd) div.flex-row {
    background-color: #1C1F25;
  }

  div.feature, div.feature-overview div.feature {
    width: 300px;
    justify-content: left;
    text-align: left;
    color: #9ca5b4;
  }

  div.header div.flex-row {
    font-weight: 700;
    height: 80px;
    font-size: 20px;
    line-height: 30px;
    color: #fff;
  }

  div.header div.feature {
    background-color: transparent !important;
  }

  span.no {
    height: 20px;
    width: 20px;
    background-image: url('../../assets/no.svg');
  }

  span.yes {
    height: 20px;
    width: 20px;
    background-image: url('../../assets/yes.svg');
  }

  div.use-content p {
    text-align: left;
    color: #fff;
    margin: 10px 0;
  }

  div.flex-row a {
    color: #9CA5B4;
  }

  @media screen and (max-width: 1079px) {
    div.pricing-card {
      width: calc((100% - 30px)/2);
    }
    div.pricing-card p {
      min-height: 80px;
    }
  }

  @media screen and (max-width: 767px) {
    h1 {
      font-size: 42px;
      line-height: 50px;
    }
    div.pricing-row {
      display: block;
    }
    div.pricing-card {
      width: 100%;
      max-width: 400px;
      margin: 60px auto;
      padding:  40px 40px 20px 40px;
    }
    div.pricing-card p {
      min-height: 20px;
    }
    h1.table-title {
      font-size: 32px;
      line-height: 40px;
    }
    div.hide-feature {
      display: none;
    }
    div.table-section {
      margin-top: 20px;
      text-align: center;
    }
    div.flex-row {
      width: calc((100% - 2px)/2);
    }
    div.flex-table:nth-child(odd) div.flex-row {
      background-color: #181A1F;
    }
    div.feature, div.feature-overview div.feature {
      width: 100%;
      justify-content: center;
      text-align: center;
      font-weight: 700;
      background-color: transparent !important;
    }
  }

  @media screen and (max-width: 479px) {
    section {
      padding: 60px 20px;
    }
    section.hero-section {
      margin-top: 0;
      padding: 60px 20px;
    }
    h1, h2, h3 {
      font-size: 32px;
      line-height: 40px;
    }
    div.pricing-card {
      width: 100%;
      max-width: 400px;
      margin: 60px auto;
      padding:  40px 20px 20px 20px;
    }
    section.table {
      padding: 60px 2px 120px 2px;
    }
    h1.table-title {
      margin-left: 20px;
      margin-right: 20px;
    }
    div.table-section {
      margin-left: 20px;
      margin-right: 20px;
    }
  }
</style>