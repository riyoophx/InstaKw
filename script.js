// references
const followBtn = document.getElementById('followBtn');
const followersCountEl = document.getElementById('followersCount');
const grid = document.getElementById('photoGrid');
const lightbox = document.getElementById('lightbox');
const lbImage = document.getElementById('lbImage');
const lbClose = document.getElementById('lbClose');

const likeBtn = document.getElementById('likeBtn');
const likeCountEl = document.getElementById('likeCount');
const commentForm = document.getElementById('commentForm');
const commentInput = document.getElementById('commentInput');
const commentsContainer = document.getElementById('lbComments');

// ---------------- FOLLOW BUTTON ----------------
let following = false;
followBtn.addEventListener('click', () => {
  following = !following;
  if (following) {
    followBtn.textContent = 'Following';
    followBtn.classList.remove('primary');
    updateFollowers(1);
  } else {
    followBtn.textContent = 'Follow';
    followBtn.classList.add('primary');
    updateFollowers(-1);
  }
});

function updateFollowers(delta){
  let val = followersCountEl.textContent.trim();
  if (val.endsWith('k')) {
    val = parseFloat(val.replace('k','')) * 1000;
  } else {
    val = parseInt(val.replace(/,/g,''), 10);
  }
  val = Math.max(0, Math.round(val + delta));
  followersCountEl.textContent = val >= 1000 ? (val/1000).toFixed(1).replace('.0','') + 'k' : String(val);
}

// ---------------- LIKE & COMMENTS (LOCALSTORAGE) ----------------
let currentPhotoId = null;

function getData(photoId){
  const data = localStorage.getItem("photo-"+photoId);
  return data ? JSON.parse(data) : {likes:0, comments:[]};
}
function saveData(photoId, data){
  localStorage.setItem("photo-"+photoId, JSON.stringify(data));
}

likeBtn.addEventListener('click', () => {
  if (!currentPhotoId) return;
  const data = getData(currentPhotoId);
  data.likes++;
  saveData(currentPhotoId, data);
  renderData(data);
});

commentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentPhotoId) return;
  const text = commentInput.value.trim();
  if (text) {
    const data = getData(currentPhotoId);
    data.comments.push(text);
    saveData(currentPhotoId, data);
    renderData(data);
    commentInput.value = '';
  }
});

function renderData(data){
  likeCountEl.textContent = `${data.likes} likes`;
  commentsContainer.innerHTML = "";
  data.comments.forEach(c => {
    const p = document.createElement('p');
    p.textContent = c;
    commentsContainer.appendChild(p);
  });
}

// ---------------- LIGHTBOX ----------------
grid.addEventListener('click', (e) => {
  const img = e.target.closest('img');
  if (!img) return;
  currentPhotoId = img.dataset.id;
  lbImage.src = img.src;
  lbImage.alt = img.alt;
  lightbox.setAttribute('aria-hidden','false');

  // load data dari localStorage
  renderData(getData(currentPhotoId));
});

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});
function closeLightbox(){
  lightbox.setAttribute('aria-hidden','true');
  lbImage.src = '';
  currentPhotoId = null;
}
