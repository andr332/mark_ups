<template>
  <div>
    <Nav></Nav>
    <div class="container">
      <h1>Copyright Notice</h1>
      <label>Updated March 25, 2020</label>
      <article dir="ltr"><p>Hero takes claims of copyright infringement seriously. We will respond to notices of alleged copyright infringement that comply with applicable law. If you believe any materials accessible on or from this site (the "Site") infringe your copyright, you may request removal of those materials (or access to them) from the Site by submitting written notification to our designated DMCA agent below. In accordance with the Online Copyright Infringement Liability Limitation Act of the Digital Millennium Copyright Act (17 U.S.C. § 512) ("DMCA"), the written notice (the "DMCA Notice") must include substantially the following:</p>
        <ul>
          <li>Your physical or electronic signature.</li>
          <li>Identification of the copyrighted work you believe to have been infringed or, if the claim involves multiple works on the Site, a representative list of such works.</li>
          <li>Identification of the material you believe to be infringing in a sufficiently precise manner to allow us to locate that material.</li>
          <li>Adequate information by which we can contact you (including your name, postal address, telephone number, and, if available, email address).</li>
          <li>A statement that you have a good faith belief that use of the copyrighted material is not authorized by the copyright owner, its agent, or the law.</li>
          <li>A statement that the information in the written notice is accurate.</li>
          <li>A statement, under penalty of perjury, that you are authorized to act on behalf of the copyright owner.</li>
        </ul>
        <p>You may submit your notice to our designated DMCA agent by mail or email as set forth below:</p>
        <p>HERO, Inc. <br>9415 Culver Blvd. &nbsp;<br>Suite #186 <br>Culver City, CA 90232 <br>Email: <a href="mailto:support@markuphero.com" rel="noopener" target="_blank">support@markuphero.com</a></p>
        <p>If you fail to comply with all of the requirements of Section 512(c)(3) of the DMCA, your DMCA Notice may not be effective.</p>
        <p>Please be aware that if you knowingly materially misrepresent that material or activity on the Site is infringing your copyright, you may be held liable for damages (including costs and attorneys' fees) under Section 512(f) of the DMCA.</p>
        <p><b>Counter-Notification Procedures <br></b>If you believe that material you posted on the Site was removed or access to it was disabled by mistake or misidentification, you may file a counter-notification with us (a "Counter-Notice") by submitting written notification to our DMCA agent designated above. Pursuant to the DMCA, the Counter-Notice must include substantially the following:</p>
        <ul>
          <li>Your physical or electronic signature.</li>
          <li>An identification of the material that has been removed or to which access has been disabled and the location at which the material appeared before it was removed or access disabled.</li>
          <li>Adequate information by which we can contact you (including your name, postal address, telephone number, and, if available, email address).</li>
          <li>A statement under penalty of perjury by you that you have a good faith belief that the material identified above was removed or disabled as a result of a mistake or misidentification of the material to be removed or disabled.</li>
          <li>A statement that you will consent to the jurisdiction of the Federal District Court for the judicial district in which your address is located (or if you reside outside the United States for any judicial district in which the Site may be found) and that you will accept service from the person (or an agent of that person) who provided the Site with the complaint at issue.</li>
        </ul>
        <p>The DMCA allows us to restore the removed content if the party filing the original DMCA Notice does not file a court action against you within ten business days of receiving the copy of your Counter-Notice.</p>
        <p>Please be aware that if you knowingly materially misrepresent that material or activity on the Site was removed or disabled by mistake or misidentification, you may be held liable for damages (including costs and attorneys' fees) under Section 512(f) of the DMCA.</p>
        <p><b>Repeat Infringers <br></b>It is our policy in appropriate circumstances to disable and/or terminate the accounts of users who are repeat infringers.</p>
      </article>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
  import Nav from "./Nav";
  import Footer from "./Footer";
  export default {
    name: "Copyright",
    components: {Nav, Footer}
  }
</script>

<style scoped>
  div.container {
    margin: 120px auto;
    padding: 0 40px;
    max-width: 640px;
    color: #fff;
  }

  article {
    font-size: 16px;
    line-height: 25px;
  }

  label {
    color: #9ca5b4;
  }

  a {
    color: #fff;
  }

  @media screen and (max-width: 479px) {
    div.container {
      padding: 0 20px;
    }
  }
</style>