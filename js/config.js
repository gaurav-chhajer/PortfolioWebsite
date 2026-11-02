/*
 * Site settings. Nothing else needs touching to ship, apart from the domain
 * (see README: run scripts/set-site-url.sh once).
 *
 * live      Public URL of each hosted project. "" hides that project's "Live app" button.
 * formKey   Free access key from https://web3forms.com. With a key the contact form sends
 *           the message itself. Without one it opens a pre-filled email draft instead.
 * paper     Link or DOI of the research paper. "" shows the title only.
 */
window.SITE_CONFIG = {
  name: "Gaurav Chhajer",

  // Assembled in script so the address is not sitting in the HTML as a plain string.
  email: { user: "gchhajer259", domain: "gmail.com" },
  phone: { dial: "919602237149", display: "+91-9602237149" },

  formKey: "",

  live: {
    studentconnect: "https://gauravchhajer.pythonanywhere.com/login",
    journal: "https://emotion-aware-journal-app.vercel.app/",
    translator: ""
  },

  paper: ""
};
