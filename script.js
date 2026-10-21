// BABA ASTRO settings — update WhatsApp and social links before publishing.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwLDKnAtuiMrghdh1CG01BnOU2K3hLMqIG1RS6MvFu1mnr-Veb0i9n_h_ypIL9CGPqm/exec";
const WHATSAPP_NUMBER = "919519608505"; // Replace Xs with official support number, digits only.
const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/infobabaastro/",
  facebook: "https://www.facebook.com/infobabaastro",
  youtube: "https://www.youtube.com/@infobabaastro",
  whatsapp: "+919519608505"
};
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  document.querySelectorAll(".optional-image").forEach(img => {
    img.addEventListener("load", () => { if (img.naturalWidth) img.classList.add("image-ready"); });
    img.addEventListener("error", () => { img.classList.add("image-missing"); img.style.display = "none"; });
    if (img.complete && img.naturalWidth) img.classList.add("image-ready");
  });
  const menu = document.getElementById("mainNav"), toggle = document.getElementById("menuToggle");
  toggle.addEventListener("click", () => menu.classList.toggle("open"));
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => menu.classList.remove("open")));
  const number = WHATSAPP_NUMBER.replace(/\D/g, "");
  const whatsappUrl = SOCIAL_LINKS.whatsapp || (number && !number.includes("919519608505") ? `https://wa.me/${number}` : "");
  document.querySelectorAll("[data-whatsapp]").forEach(a => {
    if (whatsappUrl) { a.href = whatsappUrl; a.target = "_blank"; a.rel = "noopener noreferrer"; }
    else { a.href = "#join"; a.addEventListener("click", e => { e.preventDefault(); toast("Please add your WhatsApp support number in script.js."); }); }
  });
  document.querySelectorAll("[data-social]").forEach(a => {
    const url = SOCIAL_LINKS[a.dataset.social];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; }
    else { a.addEventListener("click", e => { e.preventDefault(); toast("Add the official social link in script.js."); }); }
  });

  const form = document.getElementById("astrologerForm"), pages = [...document.querySelectorAll(".form-page")];
  const prev = document.getElementById("prevBtn"), next = document.getElementById("nextBtn"), submit = document.getElementById("submitBtn");
  const count = document.getElementById("pageCount"), progress = document.getElementById("progressBar");
  const error = document.getElementById("formError"), status = document.getElementById("formStatus");
  let current = 0, submitted = false;
  function setPage(n) {
    current = n; pages.forEach((p,i) => p.classList.toggle("active", i === current));
    prev.hidden = current === 0; next.hidden = current === pages.length - 1; submit.hidden = current !== pages.length - 1;
    count.textContent = `Step ${current+1} of ${pages.length}`; progress.style.width = `${(current+1)/pages.length*100}%`; error.textContent = "";
  }
  function validPage() {
    const active = pages[current];
    for (const f of active.querySelectorAll("input[required],select[required],textarea[required]")) {
      if (f.type === "checkbox") continue;
      if (!f.checkValidity()) { f.reportValidity(); return false; }
    }
    if (current === 0 && !active.querySelector('[name="languages"]:checked')) { error.textContent = "Please select at least one preferred language."; return false; }
    if (current === 1 && !active.querySelector('[name="expertise"]:checked')) { error.textContent = "Please select at least one area of expertise."; return false; }
    if (current === 2 && (!active.querySelector('[name="contactPermission"]').checked || !active.querySelector('[name="privacyAcknowledgement"]').checked)) { error.textContent = "Please tick both consent boxes before submitting."; return false; }
    return true;
  }
  next.addEventListener("click", () => { if (validPage()) { setPage(Math.min(current+1,pages.length-1)); document.querySelector(".form-card").scrollIntoView({behavior:"smooth",block:"start"}); } });
  prev.addEventListener("click", () => setPage(Math.max(current-1,0)));
  form.addEventListener("submit", e => {
    e.preventDefault(); if (!validPage()) return;
    if (!APPS_SCRIPT_URL.includes("/exec")) { status.textContent = "Please add the deployed Apps Script /exec URL in script.js."; return; }
    if (form.elements.website.value.trim()) return;
    status.textContent = "Submitting your application… please keep this page open."; status.style.color = "#8a6a2d";
    submit.disabled = true; submitted = true; form.action = APPS_SCRIPT_URL; form.method = "post"; form.target = "submissionFrame"; form.submit();
    setTimeout(() => { if (submitted && submit.disabled) { status.textContent = "Your form was sent. If no confirmation appears, check the Google Sheet or contact support."; submit.disabled = false; status.style.color = "#8a6a2d"; } }, 10000);
  });
  window.addEventListener("message", e => {
    if (!e.data || e.data.type !== "BABA_ASTRO_FORM_RESULT") return;
    submitted = false; submit.disabled = false;
    status.textContent = e.data.message || (e.data.success ? "Application submitted successfully." : "Could not submit. Please try again.");
    status.style.color = e.data.success ? "#36734c" : "#a33a42";
    if (e.data.success) { form.reset(); setPage(0); }
  });
});
function toast(message) { const el = document.getElementById("toast"); el.textContent = message; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 3500); }
