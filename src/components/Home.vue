<template>
  <div>
    <Nav></Nav>
    <div class="marketing-homepage">
      <section class="hero">
        <div class="container">
          <div class="hero-text">
            <div class="hero-pen">
              <img src="../assets/wiggle.svg" alt="Annotate with a pen tool">
            </div>
            <div class="hero-text-wrapper">
              <label><strong>Screenshot & Annotate</strong> Images, PDFs & Websites</label>
              <h1>Hello Productivity.</h1>
              <p>Try a screenshot and annotation tool that works on the web. Made for Mac, Windows, Linux and Chrome.</p>
              <a href="/signUp" v-on:click.prevent="navigateToSignUp('home_hero')" class="hero-link">Sign Up For Free</a>
              <div class="hero-subtext">Free & no credit card required</div>
            </div>
            <div class="hero-crosshair">
              <img src="../assets/crosshair.svg" alt="Screenshot crosshair">
              <label>480<br>80</label>
            </div>
          </div>
          <div class="hero-image">
            <img src="../assets/hero.jpg" alt="Take screenshots and annotate images with Markup Hero">
          </div>
        </div>
      </section>
      <section class="section-logos">
        <div class="container">
          <img src="../assets/companies.svg" alt="Companies That Use Markup Hero">
        </div>
      </section>
      <section class="how-section">
        <div class="container">
          <div class="section-text">
            <h2>Speed Up Your Workflow</h2>
            <p>Markup Hero helps you capture ideas, communicate clearly, save time and stay organized.</p>
          </div>
          <div class="how-row">
            <div class="how-image how-image--two">
              <img src="../assets/capture.png" alt="Capture ideas with Markup Hero">
            </div>
            <div class="how-text">
              <div class="how-title">
                <span class="how-icon how-icon--1"></span>
                <h3>Capture Ideas</h3>
              </div>
              <p>Instantly capture and share ideas with Markup Hero's <a href="/download" v-on:click.prevent="navigateToDownload()">screenshot app</a> and <a href="/new" v-on:click.prevent="navigateToNew()">image / PDF uploader</a>.</p>
              <a href="/download" v-on:click.prevent="navigateToDownload" class="how-btn">Download App</a>
            </div>
          </div>
          <div class="how-row">
            <div class="how-image">
              <img src="../assets/communicate.png" alt="Communicate clearly with Markup Hero">
            </div>
            <div class="how-text">
              <div class="how-title">
                <span class="how-icon how-icon--2"></span>
                <h3>Communicate Clearly</h3>
              </div>
              <p>Clearly communicate your message on any image, PDF or website with easy to use annotation tools.</p>
              <a href="/new" v-on:click.prevent="navigateToNew" class="how-btn how-btn--orange">Upload And Test</a>
            </div>
          </div>
          <div class="how-row">
            <div class="how-image how-image--two">
              <img src="../assets/save.png" alt="Save time with Markup Hero">
            </div>
            <div class="how-text">
              <div class="how-title">
                <span class="how-icon how-icon--3"></span>
                <h3>Save Time</h3>
              </div>
              <p>Access all your markups and annotations with a click and make edits on the fly.</p>
              <a href="/share/K7UNitaQjozAME5vbg61" class="how-btn how-btn--green">See An Example</a>
            </div>
          </div>
          <div class="how-row">
            <div class="how-image">
              <img src="../assets/organize.png" alt="Stay organized with Markup Hero">
            </div>
            <div class="how-text">
              <div class="how-title">
                <span class="how-icon how-icon--4"></span>
                <h3>Stay Organized</h3>
              </div>
              <p>Keep all your markups organized with titles, collections, history and custom privacy settings.</p>
              <a href="/pricing" v-on:click.prevent="navigateToPricing()" class="how-btn how-btn--purple">Compare Plans</a>
            </div>
          </div>
        </div>
      </section>
      <section class="feature-section">
        <div class="container">
          <div class="section-text">
            <h2>Feature Overview</h2>
            <p>All the tools you need to communicate your message on any image or PDF.</p>
          </div>
          <div class="feature-row">
            <div class="feature-content">
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-screenshot icon-featured"></span></div>
                <label>Screenshots</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-upload icon-featured"></span></div>
                <label>Upload Images & PDFs</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-link icon-featured"></span></div>
                <label>Capture Full Websites</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-add icon-featured"></span></div>
                <label>Add Multiple Pages</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-view icon-featured"></span></div>
                <label>Full History & Editing</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-locked icon-featured"></span></div>
                <label>Privacy Settings</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-text icon-featured"></span></div>
                <label>Text Tool</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-arrow icon-featured"></span></div>
                <label>Arrow Tool</label>
              </div>
            </div>
            <div class="feature-content">
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-line icon-featured"></span></div>
                <label>Line Tool</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-rectangle icon-featured"></span></div>
                <label>Rectangle Tool</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-oval icon-featured"></span></div>
                <label>Oval Tool</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-blur icon-featured"></span></div>
                <label>Blur Tool</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-pen icon-featured"></span></div>
                <label>Pen Tool</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-highlighter icon-featured"></span></div>
                <label>Highlighter Tool</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="color color5"></span></div>
                <label>Colors</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-line2 icon-featured"></span></div>
                <label>Size & Thickness</label>
              </div>
            </div>
            <div class="feature-content">
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-insert-image icon-featured"></span></div>
                <label>Insert Images</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-crop icon-featured"></span></div>
                <label>Crop Canvas</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-undo icon-featured"></span></div>
                <label>Undo & Redo</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-share icon-featured"></span></div>
                <label>Sharable Links</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-copy icon-featured"></span></div>
                <label>Copy To Clipboard</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-download icon-featured"></span></div>
                <label>Download</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-duplicate icon-featured"></span></div>
                <label>Duplicate</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-delete icon-featured"></span></div>
                <label>Delete</label>
              </div>
            </div>
            <div class="feature-content--row">
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-screenshot icon-featured"></span></div>
                <label>Screenshots</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-upload icon-featured"></span></div>
                <label>Upload Images & PDFs</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-link icon-featured"></span></div>
                <label>URL Screenshot</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-add icon-featured"></span></div>
                <label>Add Multiple Pages</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-view icon-featured"></span></div>
                <label>Full History & Editing</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-locked icon-featured"></span></div>
                <label>Privacy Settings</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-text icon-featured"></span></div>
                <label>Text Tool</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-arrow icon-featured"></span></div>
                <label>Arrow Tool</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-line icon-featured"></span></div>
                <label>Line Tool</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-rectangle icon-featured"></span></div>
                <label>Rectangle Tool</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-oval icon-featured"></span></div>
                <label>Oval Tool</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-blur icon-featured"></span></div>
                <label>Blur Tool</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-pen icon-featured"></span></div>
                <label>Pen Tool</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-highlighter icon-featured"></span></div>
                <label>Highlighter Tool</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="color color5"></span></div>
                <label>Colors</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-line2 icon-featured"></span></div>
                <label>Size & Thickness</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-insert-image icon-featured"></span></div>
                <label>Insert Images</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-crop icon-featured"></span></div>
                <label>Crop Canvas</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-undo icon-featured"></span></div>
                <label>Undo & Redo</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-share icon-featured"></span></div>
                <label>Sharable Links</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-copy icon-featured"></span></div>
                <label>Copy To Clipboard</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-download icon-featured"></span></div>
                <label>Download</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-duplicate icon-featured"></span></div>
                <label>Duplicate</label>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><span class="icon icon-delete icon-featured"></span></div>
                <label>Delete</label>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div class="container">
          <div class="section-text">
            <h2>Highlighted Reading</h2>
            <p>Find productivity tips, product reviews, and more from Markup Hero.</p>
          </div>
          <div class="blog-row">
            <a class="blog-card" href="/blog/what-are-product-manager-salary/" rel="noopener" target="_blank">
              <div class="blog-tag"><strong>Product Management</strong> | 4 Mar 2021</div>
              <h3>Product Manager Salary Guide for 2021 — Ultimate Career Report</h3>
              <p>Product Managers are the new rock stars and they make rock star salaries. Learn everything about how much money a role in product management can make you.</p>
            </a>
            <a class="blog-card" href="/blog/boost-remote-team-productivity-in-2021/" rel="noopener" target="_blank">
              <div class="blog-tag"><strong>Productivity</strong> | 20 Jan 2021</div>
              <h3>7 Ways To Boost Remote Team Productivity in 2021</h3>
              <p>Your remote team is here to stay. Follow these 7 guidelines to maximize productivity and performance in 2021.</p>
            </a>
            <a class="blog-card" href="https://hackernoon.com/making-the-case-for-integrated-file-annotation-with-popular-saas-tools-p9q3zul" rel="noopener" target="_blank">
              <div class="blog-tag"><strong>Hacker Noon</strong> | 5 Dec 2020</div>
              <h3>Making The Case for Integrated File Annotation with Popular SaaS Tools</h3>
              <p>Adding annotations to images and PDFs is a daily operation, yet many SaaS tools don't have it built into their product.</p>
            </a>
            <a class="blog-card" href="/blog/a-guide-to-project-management-essentials/" rel="noopener" target="_blank">
              <div class="blog-tag"><strong>Product Management</strong> | 11 Nov 2020</div>
              <h3>A Guide to Project Management Essentials</h3>
              <p>How important is good project management? Here's a walkthrough of project management best practices so you can optimize your business.</p>
            </a>
          </div>
        </div>
      </section>
      <section class="use-section">
        <div class="container">
          <div class="section-text">
            <h2>What People Are Saying</h2>
            <p>Markup Hero is loved by managers, educators and creators alike.</p>
          </div>
          <div class="use-row">
            <div class="use-content">
              <a class="use-review" href="https://www.capterra.com/p/205064/Markup-Hero/#reviews" rel="noopener" target="_blank">
                <img src="../assets/capterra.svg" alt="Markup Hero Capterra Ratings & Reviews - 4.7/5 Avg">
              </a>
              <p>"This is a must have. I can literally save hours everyday by annotating screenshots instead of typing instructions for my team."</p>
              <h4>- Jeheen Mahmood Z, Capterra</h4>
            </div>
            <div class="use-content">
              <a class="use-review" href="https://www.g2.com/products/markup-hero/reviews#reviews" rel="noopener" target="_blank">
                <img src="../assets/g-2.svg" alt="Markup Hero G2 Ratings & Reviews - 4.5/5 Avg">
              </a>
              <p>"The best markup tool! The tool is super easy to use. We use it for sharing screenshots, mocks and commenting for design changes."</p>
              <h4>- Jamie S, G2</h4>
            </div>
            <div class="use-content">
              <a class="use-review" href="https://chrome.google.com/webstore/detail/markup-hero/bnlghmkgojdehkigfkkblmmeldkmoccb" rel="noopener" target="_blank">
                <img src="../assets/chrome-web-store.svg" alt="Markup Hero Chrome Web Store Ratings & Reviews - 4.9/5 Avg">
              </a>
              <p>"This is undoubtedly one of the best screenshot and annotation tools I've used. It's my true hero without the cape."</p>
              <h4>- Skoshly MarTech, Chrome Web Store</h4>
            </div>
          </div>
          <a href="/signUp" v-on:click.prevent="navigateToSignUp('home_reviews')" class="use-link">Sign Up For Free</a>
        </div>
      </section>
      <Footer></Footer>
    </div>
  </div>
</template>

<script>
  import notAuthorizedRouteGuard from "../guards/notAuthorizedGuard";
  import navigationPresets from "../navigationPresets";
  import Nav from "./Nav";
  import Footer from "./Footer";

  export default {
    name: "Home",
    components: {Nav, Footer},
    beforeRouteEnter: notAuthorizedRouteGuard,
    methods: navigationPresets
  }
</script>

<style scoped>
  @import '../styles/globalShared.css';

  div, label, input, button, form, span, a {
    box-sizing : border-box !important;
  }

  .marketing-homepage{
    margin-top: 60px;
  }

  section {
    padding: 60px 40px;
    color: #fff;
  }

  .hero {
    padding-bottom: 0;
    background-color: #181A1F;
    overflow: hidden;
  }

  .container {
    margin: auto;
    max-width: 960px;
  }

  .hero-text {
    margin: 60px auto 40px auto;
    max-width: 480px;
    position: relative;
  }

  .hero-crosshair {
    position: absolute;
    top: 94px;
    right: -13px;
  }

  .hero-crosshair img {
    width: 26px;
  }

  .hero-crosshair label {
    display: block;
    margin-top: -10px;
    padding-left: 20px;
    width: 6px;
    font-size: 10px;
    line-height: 10px;
    color: #000;
    text-shadow: 1px 1px #fff;
  }

  .hero-text-wrapper {
    position: relative;
  }

  .hero-pen {
    position: absolute;
    top: -14px;
    left: 75px;
  }

  .hero-pen img {
    width: 100%;
  }

  .hero-text-wrapper label {
    display: block;
    margin-bottom: 5px;
    font-size: 13px;
    line-height: 20px;
    color: #5E656F;
  }

  .hero-text-wrapper label strong {
    color: #fff;
  }

  h1 {
    margin: 0 0 20px 0;
    padding: 10px 0;
    font-size: 52px;
    line-height: 60px;
    text-align: center;
    border: 1px solid #fff;
    background-color: rgba(255,255,255,0.1);
  }

  p {
    margin: 0 0 30px 0;
    font-size: 20px;
    line-height: 30px;
    text-align: center;
    color: #9CA5B4;
  }

  .hero-link {
    display: block;
    margin: auto;
    width: 160px;
    height: 50px;
    font-size: 16px;
    line-height: 50px;
    text-align: center;
    font-weight: 700;
    background-image: linear-gradient(to bottom right,#FCD117,#FF377C 67%);
    background-color: #FF377C;
    color: #fff;
    text-decoration: none;
    border-radius: 2px;
  }

  @media (hover: hover) {
    .hero-link:hover {
      background-image: linear-gradient(to bottom right,#0071DF,#FF377C 67%);
      background-color: #0071DF;
    }
  }

  .hero-subtext {
    margin: 20px auto 0 auto;
    font-size: 13px;
    line-height: 20px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #5E656F;
  }

  .hero-image {
    border-radius: 6px 6px 0 0;
    border: 2px solid #35363A;
    border-bottom: none;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0,0,0,.33);
  }

  img {
    width: 100%;
    display: block;
  }

  .section-logos {
    padding: 40px;
  }

  .how-section {
    padding-bottom: 80px;
  }

  .section-text {
    margin: 60px auto;
    max-width: 640px;
  }

  h2 {
    margin: 0 0 20px 0;
    font-size: 42px;
    line-height: 50px;
    text-align: center;
  }

  .how-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 20px;
  }

  .how-text {
    margin: 40px 0;
    width: calc(50% - 60px);
  }

  .how-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  span.how-icon {
    display: block;
    height: 40px;
    width: 40px;
    flex-shrink: 0;
  }

  span.how-icon--1 {
    mask: url('../assets/screenshot.svg') no-repeat center left;
    mask-size: 67%;
    background-color: #0071df;
  }

  span.how-icon--2 {
    mask: url('../assets/arrow.svg') no-repeat center left;
    mask-size: 67%;
    background-color: #ff7a59;
  }

  span.how-icon--3 {
    mask: url('../assets/pen.svg') no-repeat center left;
    mask-size: 67%;
    background-color: #03a87c;
  }

  span.how-icon--4 {
    mask: url('../assets/star-filled.svg') no-repeat center left;
    mask-size: 67%;
    background-color: #A859FF;
  }

  div.how-text p a {
    color: #9ca5b4;
  }

  h3 {
    margin: 0;
    font-size: 32px;
    line-height: 40px;
  }

  .how-text p {
    text-align: left;
  }

  a.how-btn {
    display: inline-block;
    margin-right: 20px;
    width: 160px;
    height: 50px;
    font-size: 16px;
    line-height: 50px;
    text-align: center;
    font-weight: 700;
    background-color: #0071df;
    color: #fff;
    text-decoration: none;
    border-radius: 25px;
  }

  a.how-btn--orange {
    background-color: #ff7a59;
  }

  a.how-btn--green {
    background-color: #03a87c;
  }

  a.how-btn--purple {
    background-color: #A859FF;
  }

  @media (hover: hover) {
    a.how-btn:hover {
      background-image: linear-gradient(to bottom right,#0071DF,#FF377C 67%);
      background-color: #0071DF;
    }
  }

  a.how-link {
    font-size: 16px;
    line-height: 40px;
    text-align: center;
    font-weight: 700;
    color: #9CA5B4;
    text-decoration: none;
  }

  .how-image {
    margin: 40px 0;
    width: 50%;
    border-radius: 2px;
    -webkit-filter: drop-shadow(0 4px 8px rgba(0,0,0,.33));
    filter: drop-shadow(0 4px 8px rgba(0,0,0,.33));
  }

  .how-image--two {
    order: 2;
  }

  .feature-section {
    background-color: #181A1F;
    padding-bottom: 120px;
  }

  .feature-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }

  .feature-content {
    width: calc((100% - 60px)/3);
  }

  div.feature-content--row {
    display: none;
  }

  div.feature-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 20px;
  }

  div.feature-icon {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    border-radius: 25px;
    background-color: #2f333d;
    margin-right: 12px;
  }

  span.icon-featured {
    background-color: #fff;
  }

  div.feature-item label {
    display: block;
    font-size: 20px;
    line-height: 25px;
    color: #fff;
  }

  div.blog-row {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: space-between;
    flex-wrap: wrap;
    padding-bottom: 20px;
  }

  a.blog-card {
    display: block;
    width: calc((100% - 40px)/2);
    margin-bottom: 40px;
    padding: 60px 40px;
    border-radius: 2px;
    text-decoration: none;
    color: #fff;
    background-color: #181A1F;
    box-shadow: 0 4px 8px rgba(0,0,0,.16);
  }

  a.blog-card:nth-child(1) {
    background-image: linear-gradient(to bottom right,#FCD117,#0071DF 67%);
    background-color: #0071DF;
  }

  a.blog-card:nth-child(2) {
    background-image: linear-gradient(to bottom right,#0071DF,#ff7a59 67%);
    background-color: #ff7a59;
  }

  a.blog-card:nth-child(3) {
    background-image: linear-gradient(to bottom right,#ff7a59,#03a87c 67%);
    background-color: #03a87c;
  }

  a.blog-card:nth-child(4) {
    background-image: linear-gradient(to bottom right,#03a87c,#A859FF 67%);
    background-color: #A859FF;
  }

  a.blog-card:hover {
    background-image: linear-gradient(to bottom right,#FCD117,#FF377C 67%);
    background-color: #0071DF;
  }

  div.blog-tag {
    margin-bottom: 10px;
    font-size: 13px;
    line-height: 20px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: rgba(255,255,255,0.67);
  }

  a.blog-card h3 {
    font-size: 20px;
    line-height: 25px;
    margin-bottom: 20px;
  }

  a.blog-card p {
    font-size: 16px;
    line-height: 25px;
    margin-top: 20px;
    margin-bottom: 0;
    text-align: left;
    color: rgba(255,255,255,0.67);
  }

  .use-section {
    background-color: #181A1F;
  }

  .use-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }

  .use-content {
    width: calc((100% - 60px)/3);
    margin-bottom: 60px;
  }

  a.use-review {
    display: block;
    width: 100%;
    max-width: 225px;
    margin-bottom: 30px;
  }

  h4 {
    margin: 0;
    font-size: 16px;
    line-height: 30px;
    color: #9ca5b4;
  }

  .use-content p {
    text-align: left;
    color: #fff;
    margin: 10px 0;
  }

  .use-link {
    display: block;
    margin: auto;
    margin-bottom: 60px;
    width: 160px;
    height: 50px;
    font-size: 16px;
    line-height: 50px;
    text-align: center;
    font-weight: 700;
    background-image: linear-gradient(to bottom right,#FCD117,#FF377C 67%);
    background-color: #FF377C;
    color: #fff;
    text-decoration: none;
    border-radius: 2px;
  }

  @media (hover: hover) {
    .use-link:hover {
      background-image: linear-gradient(to bottom right,#0071DF,#FF377C 67%);
      background-color: #0071DF;
    }
  }

  @media screen and (max-width: 1079px) {
    .how-text {
      width: calc(50% - 40px);
    }
    .use-content {
      width: calc((100% - 40px)/3);
    }
  }

  @media screen and (max-width: 767px) {
    .hero-crosshair {
      top: 84px;
    }
    h1 {
      font-size: 42px;
      line-height: 50px;
    }
    .how-row {
      display: block;
    }
    .how-text {
      width: 100%;
    }
    .how-image {
      width: 100%;
    }
    div.feature-row {
      display: block;
    }
    div.feature-content {
      display: none;
    }
    div.feature-content--row {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      flex-wrap: wrap;
    }
    div.feature-item {
      width: auto;
      height: 40px;
      border-radius: 20px;
      background-color: #2f333d;
      margin-right: 10px;
    }
    div.feature-icon {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      margin-right: 0;
    }
    div.feature-item label {
      font-size: 13px;
      line-height: 20px;
      margin-right: 12px;
      font-weight: 700;
      white-space: nowrap;
    }
    a.blog-card {
      width: 100%;
      padding: 40px 20px;
    }
  }

  @media screen and (max-width: 599px) {
    .use-row {
      display: block;
    }
    .use-content {
      width: 100%;
    }
  }

  @media screen and (max-width: 479px) {
    section {
      padding: 60px 20px;
    }
    .section-logos {
      padding: 20px;
    }
    .hero-crosshair {
      top: 74px;
    }
    h1 {
      font-size: 32px;
      line-height: 40px;
    }
    h2 {
      font-size: 32px;
      line-height: 40px;
    }
    h3 {
      font-size: 32px;
      line-height: 40px;
    }
  }
</style>