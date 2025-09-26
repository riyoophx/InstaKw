// ========== FIREBASE IMPORTS ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  increment
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ========== FIREBASE CONFIG (punya kamu) ==========
const firebaseConfig = {
  apiKey: "AIzaSyA0rCherDZ6KmXIQTTYMEFRxPE-s0222nA",
  authDomain: "instakw-b817c.firebaseapp.com",
  projectId: "instakw-b817c",
  storageBucket: "instakw-b817c.firebasestorage.app",
  messagingSenderId: "324044712721",
  appId: "1:324044712721:web:44c2b03b7e40775dfb3ab0",
  measurementId: "G-ZQ2DNE1ZEP"
};

// ========== INIT FIREBASE ==========
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========== DOM REFERENCES ==========
const followBtn = document.getElementById("followBtn");
const followersCountEl = document.getElementById("followersCount");
const grid = document.getElementById("photoGrid");
const lightbox = document.getElementById("lightbox");
const lbImage = document.getElementById("lbImage");
const lbClose = document.getElementById("lbClose");

const likeBtn = document.getElementById("likeBtn");
const likeCountEl = document.getElementById("likeCount");
const commentForm = document.getElementById("commentForm");
const commentInput = document.getElementById("commentInput");
const commentsContainer = document.getElementById("lbComments");

let currentPhotoId = null;

// ========== FOLLOW BUTTON ==========
let following = false;
followBtn.addEventListener("click", () => {
  following = !following;
  if (following) {
    followBtn.textContent = "Following";
    followBtn.classList.remove("primary");
    updateFollowers(1);
  } else {
    followBtn.textContent = "Follow";
    followBtn.classList.add("primary");
    updateFollowers(-1);
  }
});

function updateFollowers(delta) {
  let val = followersCountEl.textContent.trim();
  if (val.endsWith("k")) {
    val = parseFloat(val.replace("k", "")) * 1000;
  } else {
    val = parseInt(val.replace(/,/g, ""), 10);
  }
  val = Math.max(0, Math.round(val + delta));
  followersCountEl.textContent =
    val >= 1000
      ? (val / 1000).toFixed(1).replace(".0", "") + "k"
      : String(val);
}

// ========== FIRESTORE HELPERS ==========
async function getData(photoId) {
  try {
    const ref = doc(db, "posts", String(photoId));
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
    return { likes: 0, comments: [] };
  } catch (err) {
    console.error("getData error:", err);
    return { likes: 0, comments: [] };
  }
}

async function saveLike(photoId) {
  const ref = doc(db, "posts", String(photoId));
  try {
    await updateDoc(ref, { likes: increment(1) });
  } catch (err) {
    // kalau dokumen belum ada
    await setDoc(ref, { likes: 1, comments: [] });
  }
}

async function saveComment(photoId, text) {
  const ref = doc(db, "posts", String(photoId));
  try {
    await updateDoc(ref, { comments: arrayUnion(text) });
  } catch (err) {
    await setDoc(ref, { likes: 0, comments: [text] });
  }
}

async function renderData(photoId) {
  const data = await getData(photoId);
  likeCountEl.textContent = `${data.likes || 0} likes`;
  commentsContainer.innerHTML = "";
  (data.comments || []).forEach((c) => {
    const p = document.createElement("p");
    p.textContent = c;
    commentsContainer.appendChild(p);
  });
}

// ========== LIGHTBOX / EVENTS ==========
grid.addEventListener("click", async (e) => {
  const fig = e.target.closest("figure");
  if (!fig) return;
  const img = fig.querySelector("img");
  if (!img) return;

  currentPhotoId = img.dataset.id;
  lbImage.src = img.src;
  lbImage.alt = img.alt || "";
  lightbox.setAttribute("aria-hidden", "false");

  await renderData(currentPhotoId);
});

likeBtn.addEventListener("click", async () => {
  if (!currentPhotoId) return;
  await saveLike(currentPhotoId);
  await renderData(currentPhotoId);
});

commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentPhotoId) return;
  const text = commentInput.value.trim();
  if (!text) return;
  await saveComment(currentPhotoId, text);
  commentInput.value = "";
  await renderData(currentPhotoId);
});

lbClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

function closeLightbox() {
  lightbox.setAttribute("aria-hidden", "true");
  lbImage.src = "";
  currentPhotoId = null;
}
