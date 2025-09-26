// element references
const followBtn = document.getElementById('followBtn');
const followersCountEl = document.getElementById('followersCount');
const grid = document.getElementById('photoGrid');
const lightbox = document.getElementById('lightbox');
const lbImage = document.getElementById('lbImage');
const lbClose = document.getElementById('lbClose');

// follow toggle (simple demo logic)
let following = false;
followBtn.addEventListener('click', () => {
  following = !following;
  if (following) {
    followBtn.textContent = 'Following';
    followBtn.classList.remove('primary');
    // increment followers (demo)
    updateFollowers(1);
  } else {
    followBtn.textContent = 'Follow';
    followBtn.classList.add('primary');
    updateFollowers(-1);
  }
});

function updateFollowers(delta){
  // read number like "2.1k" or numeric - simple logic to handle k format
  const el = followersCountEl;
  let val = el.textContent.trim();
  if (val.endsWith('k')) {
    val = parseFloat(val.replace('k','')) * 1000;
  } else {
    val = parseInt(val.replace(/,/g,''), 10);
  }
  val = Math.max(0, Math.round(val + delta));
  // show as k if >= 1000
  el.textContent = val >= 1000 ? (val/1000).toFixed(1).replace('.0','') + 'k' : String(val);
}

// click pada grid untuk membuka lightbox
grid.addEventListener('click', (e) => {
  const img = e.target.closest('img');
  if (!img) return;
  openLightbox(img.src, img.alt || 'Foto');
});

function openLightbox(src, alt){
  lbImage.src = src;
  lbImage.alt = alt;
  lightbox.setAttribute('aria-hidden','false');
}

// close lightbox
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
}

// contoh: generate lebih banyak gambar (opsional)
function generateMorePhotos(n = 6){
  for (let i=0;i<n;i++){
    const fig = document.createElement('figure');
    fig.className = 'grid-item';
    const img = document.createElement('img');
    const seed = Math.floor(Math.random()*1000);
    img.src = `https://picsum.photos/seed/${seed}/600`;
    img.alt = `Random ${seed}`;
    fig.appendChild(img);
    grid.appendChild(fig);
  }
}

// Uncomment bila ingin menambah foto secara programatik
// generateMorePhotos(6);
