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

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const allImages = Array.from(document.querySelectorAll("#photoGrid img"));

let currentPhotoId = null;

// ===== USERNAME SETUP =====
let username = localStorage.getItem("username");
if (!username) {
  username = prompt("Masukkan nama kamu:", "Anonymous") || "Anonymous";
  localStorage.setItem("username", username);
}

// ===== FOLLOW BUTTON =====
let following = JSON.parse(localStorage.getItem("following")) || false;

function renderFollowButton() {
  if (following) {
    followBtn.textContent = "Following";
    followBtn.classList.remove("primary");
  } else {
    followBtn.textContent = "Follow";
    followBtn.classList.add("primary");
  }
}

// pertama kali load, render sesuai data tersimpan
renderFollowButton();

followBtn.addEventListener("click", () => {
  following = !following;
  localStorage.setItem("following", JSON.stringify(following));
  renderFollowButton();
  updateFollowers(following ? 1 : -1);
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

// ========== LOCAL STORAGE HELPERS ==========
function getData(photoId) {
  const data = localStorage.getItem("photo-" + photoId);
  return data ? JSON.parse(data) : { likes: 0, comments: [] };
}

function saveData(photoId, data) {
  localStorage.setItem("photo-" + photoId, JSON.stringify(data));
}

// ========== RENDER DATA ==========
function renderData(photoId) {
  const data = getData(photoId);
  likeCountEl.textContent = `${data.likes} likes`;
  commentsContainer.innerHTML = "";
  data.comments.forEach((c) => {
    const p = document.createElement("p");
    if (typeof c === "string") {
      // Komentar lama (versi string) → tetap tampil sebagai Anonymous
      p.textContent = `Anonymous: ${c}`;
    } else {
      p.textContent = `${c.user}: ${c.text}`;
    }
    commentsContainer.appendChild(p);
  });
}

// ========== SHOW PHOTO BY ID ==========
function showPhotoById(photoId) {
  const img = allImages.find((i) => i.dataset.id === String(photoId));
  if (!img) return;
  currentPhotoId = img.dataset.id;
  lbImage.src = img.src;
  lbImage.alt = img.alt || "";
  lightbox.setAttribute("aria-hidden", "false");
  renderData(currentPhotoId);
}

// ========== LIGHTBOX EVENTS ==========
grid.addEventListener("click", (e) => {
  const fig = e.target.closest("figure");
  if (!fig) return;
  const img = fig.querySelector("img");
  if (!img) return;
  showPhotoById(img.dataset.id);
});

likeBtn.addEventListener("click", () => {
  if (!currentPhotoId) return;
  const data = getData(currentPhotoId);
  data.likes++;
  saveData(currentPhotoId, data);
  renderData(currentPhotoId);
});

commentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentPhotoId) return;
  const text = commentInput.value.trim();
  if (!text) return;

  const data = getData(currentPhotoId);
  const newComment = { user: username, text };
  data.comments.push(newComment);

  saveData(currentPhotoId, data);
  commentInput.value = "";
  renderData(currentPhotoId);
});

lbClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

// navigasi Next/Prev
nextBtn.addEventListener("click", () => {
  if (!currentPhotoId) return;
  const idx = allImages.findIndex((i) => i.dataset.id === currentPhotoId);
  const nextIdx = (idx + 1) % allImages.length;
  showPhotoById(allImages[nextIdx].dataset.id);
});

prevBtn.addEventListener("click", () => {
  if (!currentPhotoId) return;
  const idx = allImages.findIndex((i) => i.dataset.id === currentPhotoId);
  const prevIdx = (idx - 1 + allImages.length) % allImages.length;
  showPhotoById(allImages[prevIdx].dataset.id);
});

function closeLightbox() {
  lightbox.setAttribute("aria-hidden", "true");
  lbImage.src = "";
  currentPhotoId = null;
}
