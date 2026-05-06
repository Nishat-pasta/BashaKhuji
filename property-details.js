import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA-nmR9szA415d_qX16fbMX8-lDMa-zrU4",
  authDomain: "bashakhuji-503d1.firebaseapp.com",
  projectId: "bashakhuji-503d1",
  storageBucket: "bashakhuji-503d1.firebasestorage.app",
  messagingSenderId: "697249288857",
  appId: "1:697249288857:web:76987e2b2ab10f90005e08"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

const params     = new URLSearchParams(window.location.search);
const propertyId = params.get("id");

if (!propertyId) {
  showError("No property ID found in URL.");
} else {
  loadProperty(propertyId);
}

async function loadProperty(id) {
  try {
    const snap = await getDoc(doc(db, "properties", id));
    if (!snap.exists()) { showError("Property not found."); return; }

    const p = { id: snap.id, ...snap.data() };

    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("propertyPage").style.display  = "block";

    buildGallery(p.photos || []);

    document.getElementById("verifiedBadge").innerHTML = `
      <div class="verified-banner">✅ This property is <strong>Verified</strong> by BashaKhuji</div>`;

    document.getElementById("basicInfo").innerHTML = `
      <h3>📋 Basic Information</h3>
      <div class="info-grid">
        <div class="info-item"><label>Title</label><span>${p.title || "N/A"}</span></div>
        <div class="info-item"><label>Type</label><span>${p.type || "N/A"}</span></div>
        <div class="info-item"><label>Rooms</label><span>${p.rooms || "N/A"}</span></div>
        <div class="info-item"><label>Bathrooms</label><span>${p.bathrooms || "N/A"}</span></div>
        <div class="info-item"><label>Floor</label><span>${p.floor || "N/A"}</span></div>
        <div class="info-item"><label>Size</label><span>${p.sqft ? p.sqft + " sqft" : "N/A"}</span></div>
        <div class="info-item"><label>Furnishing</label><span>${p.furnish || "N/A"}</span></div>
        <div class="info-item"><label>Available From</label><span>${p.availDate || "N/A"}</span></div>
        <div class="info-item"><label>Status</label><span class="badge-available">Available</span></div>
      </div>`;

    document.getElementById("locationInfo").innerHTML = `
      <h3>📍 Location</h3>
      <div class="info-grid">
        <div class="info-item"><label>Division</label><span>${p.division || "N/A"}</span></div>
        <div class="info-item"><label>District</label><span>${p.district || "N/A"}</span></div>
        <div class="info-item"><label>Area</label><span>${p.area || "N/A"}</span></div>
      </div>`;

    document.getElementById("summaryInfo").innerHTML = `
      <h3>📄 Description</h3>
      <p class="summary-text">${p.description || "No description."}</p>`;

    const utils = (p.utilities || []).map(u =>
      `<span class="utility-tag">${u}</span>`).join("") || "None";
    document.getElementById("utilitiesInfo").innerHTML = `
      <h3>⚡ Utilities</h3>${utils}`;

    document.getElementById("priceInfo").innerHTML = `
      <h3>💰 Price</h3>
      <div class="price-text">৳ ${Number(p.rent).toLocaleString()} <span>/ month</span></div>
      ${p.deposit ? `<p style="color:#666;margin-top:8px;">Deposit: ৳ ${Number(p.deposit).toLocaleString()}</p>` : ""}
      <div class="action-buttons">
        <button class="btn-contact" onclick="checkLogin()">📞 Contact Owner</button>
        <button class="btn-save" id="saveBtn" onclick="toggleSave('${id}')">🤍 Save Property</button>
      </div>`;

    onAuthStateChanged(auth, user => {
      if (user) {
        document.getElementById("ownerInfo").innerHTML = `
          <h3>👤 Owner Info</h3>
          <div class="owner-card">
            <div class="owner-avatar">${(p.ownerName || "O")[0]}</div>
            <div class="owner-details">
              <div class="owner-name">${p.ownerName || "N/A"}</div>
              <div class="owner-contact">
                <a href="tel:${p.ownerPhone}">${p.ownerPhone || "N/A"}</a>
                <span>${p.ownerEmail || "N/A"}</span>
              </div>
            </div>
          </div>`;
      } else {
        document.getElementById("ownerInfo").innerHTML = `
          <h3>👤 Owner Info</h3>
          <p class="locked">🔒 Login করো Owner এর contact দেখতে</p>
          <button class="btn-contact" onclick="window.location.href='tenant-login.html'" style="margin-top:12px;">Login করো</button>`;
      }
    });

  } catch(err) {
    showError(err.message);
  }
}

function buildGallery(photos) {
  const slider = document.getElementById("imageSlider");
  const defaultImg = "images/default-property.jpg";

  if (!photos || photos.length === 0) {
    slider.innerHTML += `<img src="${defaultImg}" class="active">`;
    return;
  }

  let slideHTML = "";
  let thumbHTML = `<div class="thumbnail-strip">`;
  photos.forEach((src, i) => {
    slideHTML += `<img src="${src}" class="${i===0?'active':''}" onerror="this.src='${defaultImg}'">`;
    thumbHTML += `<img src="${src}" class="${i===0?'active-thumb':''}" onclick="goSlide(${i})" onerror="this.src='${defaultImg}'">`;
  });
  thumbHTML += `</div>`;

  const nextBtn = slider.querySelector(".next");
  nextBtn.insertAdjacentHTML("afterend", slideHTML + thumbHTML);

  document.getElementById("photoCountBadge").textContent = `1 / ${photos.length}`;

  let cur = 0;
  window.changeSlide = function(dir) {
    goSlide((cur + dir + photos.length) % photos.length);
  };
  window.goSlide = function(n) {
    const imgs   = slider.querySelectorAll("img");
    const thumbs = slider.querySelectorAll(".thumbnail-strip img");
    imgs[cur].classList.remove("active");
    if(thumbs[cur]) thumbs[cur].classList.remove("active-thumb");
    cur = n;
    imgs[cur].classList.add("active");
    if(thumbs[cur]) thumbs[cur].classList.add("active-thumb");
    document.getElementById("photoCountBadge").textContent = `${cur+1} / ${photos.length}`;
  };
}

function showError(msg) {
  document.getElementById("loadingSpinner").style.display = "none";
  document.getElementById("errorMessage").style.display  = "flex";
  document.getElementById("errorText").textContent = msg;
}

window.checkLogin = function() {
  document.getElementById("loginOverlay").style.display = "flex";
};
window.closePopup = function() {
  document.getElementById("loginOverlay").style.display = "none";
};

window.toggleSave = function(id) {
  const btn = document.getElementById("saveBtn");
  const key = "saved_" + id;
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    btn.innerHTML = "🤍 Save Property";
    btn.classList.remove("saved");
  } else {
    localStorage.setItem(key, "true");
    btn.innerHTML = "❤️ Saved!";
    btn.classList.add("saved");
  }
};

window.addEventListener("load", () => {
  const id  = params.get("id");
  const btn = document.getElementById("saveBtn");
  if (btn && id && localStorage.getItem("saved_" + id)) {
    btn.innerHTML = "❤️ Saved!";
    btn.classList.add("saved");
  }
});