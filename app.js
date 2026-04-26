/* CINEVAULT — app.js */

const BASE_URL = 'http://localhost:3000/api/search';

// ─── STATE ──────────────────────────────────────────────────
const state = {
  query:       '',
  type:        '',
  year:        '',
  page:        1,
  totalResults:0,
  results:     [],
  isLoading:   false,
  customPlaylistIds: null,
  customDisplayTitle: '',
  favorites:   JSON.parse(localStorage.getItem('cinevault_favs')) || [],
  lists:       JSON.parse(localStorage.getItem('cinevault_lists')) || {},
  viewPreferences: {
    discover: 'grid',
    favorites: 'grid',
    lists: 'grid'
  }
};

// ─── DOM REFS ────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const searchInput   = $('searchInput');
const clearBtn      = $('clearBtn');
const searchBtn     = $('searchBtn');
const typeFilter    = $('typeFilter');
const genreFilter   = $('genreFilter');
const loadingState  = $('loadingState');
const errorState    = $('errorState');
const emptyState    = $('emptyState');
const resultsSection= $('resultsSection');
const moviesGrid    = $('moviesGrid');
const pagination    = $('pagination');
const resultsTitle  = $('resultsTitle');
const resultsCount  = $('resultsCount');
const modalOverlay  = $('modalOverlay');
const modal         = $('modal');
const modalClose    = $('modalClose');
const modalInner    = $('modalInner');
const gridViewBtn   = $('gridViewBtn');
const listViewBtn   = $('listViewBtn');
const retryBtn      = $('retryBtn');

const navDiscover   = $('navDiscover');
const navFavorites  = $('navFavorites');
const navLists      = $('navLists');
const heroSection   = $('heroSection');

const listModalOverlay = $('listModalOverlay');
const listModalCancel  = $('listModalCancel');
const listModalSave    = $('listModalSave');
const existingListsContainer = $('existingListsContainer');
const newListNameInput = $('newListNameInput');
let movieToAdd = null;
let selectedExistingList = '';

// ─── MASTER LİSTELER ───────────────────────────────────────────────
const masterMovies = ['tt15239678', 'tt15327088', 'tt0816692', 'tt0468569', 'tt9362722', 'tt1517268', 'tt14230458', 'tt17009710', 'tt6751668', 'tt6710474', 'tt7286456', 'tt1745960', 'tt0111161', 'tt0068646', 'tt0109830', 'tt0110912', 'tt0137523', 'tt0108052', 'tt0120689', 'tt0099685', 'tt0114369', 'tt0482571', 'tt0081505', 'tt0078748', 'tt0054215', 'tt0084787', 'tt0070047', 'tt5052448', 'tt1375666', 'tt0062622', 'tt0083866', 'tt0076759', 'tt0088763', 'tt2543164', 'tt3659388', 'tt0107290', 'tt1160419', 'tt10872600', 'tt1877330', 'tt2328993', 'tt11030032', 'tt13238346'];
const masterSeries = ['tt0903747', 'tt0944947', 'tt4574334', 'tt0108778', 'tt0386676', 'tt0460649', 'tt0472954', 'tt0898266', 'tt1190634', 'tt2442560', 'tt0285331', 'tt1442437', 'tt0303461', 'tt0412142', 'tt0112159', 'tt0436992', 'tt0462538', 'tt1474684', 'tt0384766', 'tt2149175', 'tt1839578', 'tt2306299', 'tt0773262', 'tt0290978', 'tt0407362', 'tt0433587', 'tt0431958', 'tt0475710', 'tt2301451', 'tt0203259', 'tt0118310', 'tt0121955', 'tt0118401', 'tt0120282', 'tt0120283', 'tt0120284'];
const genrePlaylists = {
  'romance': ['tt0120338', 'tt0332280', 'tt3783958', 'tt0414387', 'tt0034583', 'tt0112471', 'tt0125439', 'tt0314331', 'tt0211915', 'tt0338013', 'tt0405046', 'tt1045658'],
  'horror': ['tt0081505', 'tt0078748', 'tt0054215', 'tt0084787', 'tt0070047', 'tt5052448', 'tt0077651', 'tt7784604', 'tt0117628', 'tt1457767', 'tt1502407', 'tt1042858'],
  'comedy': ['tt1119646', 'tt0829482', 'tt0838283', 'tt0357413', 'tt0109686', 'tt0107048', 'tt0120382', 'tt0118715', 'tt0091042', 'tt0377092', 'tt0073486', 'tt0081562'],
  'action': ['tt0468569', 'tt0095016', 'tt0103064', 'tt0133093', 'tt0172495', 'tt1392190', 'tt2604412', 'tt0848228', 'tt0090605', 'tt0381061', 'tt0110413', 'tt0111161'],
  'scifi': ['tt0816692', 'tt1375666', 'tt0062622', 'tt0083866', 'tt0076759', 'tt0088763', 'tt2543164', 'tt3659388', 'tt0107290', 'tt0113568', 'tt0120737', 'tt0133093'],
  'drama': ['tt0111161', 'tt0068646', 'tt0109830', 'tt0110912', 'tt0137523', 'tt0108052', 'tt0120689', 'tt0099685', 'tt0114369', 'tt0482571', 'tt0103064', 'tt0107290']
};

// ─── INIT ─────────────────────────────────────────────────────────────────────
(function init() {
  bindEvents();

const saved = JSON.parse(sessionStorage.getItem('cinevault_last_search'));

  if (saved && (saved.query || saved.type)) {
    state.query = saved.query || '';
    state.type = saved.type || '';
    state.page = saved.page || 1;

    searchInput.value = state.query;
    if (typeFilter) typeFilter.value = state.type;

    state.customPlaylistIds = null;
    searchMovies(false);
  } else {
    loadShowcase();
  }
})();


function loadShowcase() {
  state.query = ''; state.type = ''; state.year = ''; state.page = 1;
  state.customPlaylistIds = [...masterMovies.slice(0, 18), ...masterSeries.slice(0, 18)];
  searchInput.value = '';
  if(genreFilter) genreFilter.value = '';
  searchMovies(true); 
}

// ─── EVENT BINDINGS ──────────────────────────────────────────────────────────
function bindEvents() {
  searchBtn.addEventListener('click', () => triggerSearch(1));
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') triggerSearch(1); });
  searchInput.addEventListener('input', () => { clearBtn.classList.toggle('visible', searchInput.value.length > 0); });
  clearBtn.addEventListener('click', () => { searchInput.value = ''; clearBtn.classList.remove('visible'); searchInput.focus(); });

  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
      searchInput.value = tag.dataset.query;
      if(genreFilter) genreFilter.value = '';
      clearBtn.classList.add('visible');
      triggerSearch(1);
    });
  });

  gridViewBtn.addEventListener('click', () => setView('grid'));
  listViewBtn.addEventListener('click',  () => setView('list'));

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  retryBtn.addEventListener('click', () => triggerSearch(state.page));

  navDiscover.onclick = (e) => {
    e.preventDefault();
    setActiveNav(navDiscover);
    heroSection.classList.remove('hidden');
    applyView(state.viewPreferences.discover);
    loadShowcase();
  };

  navFavorites.onclick = (e) => {
    e.preventDefault();
    setActiveNav(navFavorites);
    heroSection.classList.add('hidden');
    applyView(state.viewPreferences.favorites);
    renderFavorites();
  };

  navLists.onclick = (e) => {
    e.preventDefault();
    setActiveNav(navLists);
    heroSection.classList.add('hidden');
    applyView(state.viewPreferences.lists);
    renderListsView();
  };
}

function setActiveNav(navEl) {
  [navDiscover, navFavorites, navLists].forEach(n => n.classList.remove('active'));
  navEl.classList.add('active');
}

function setView(view) {
  let currentTab = 'discover';
  if (navFavorites.classList.contains('active')) currentTab = 'favorites';
  if (navLists.classList.contains('active')) currentTab = 'lists';
  state.viewPreferences[currentTab] = view;
  applyView(view);
}

function applyView(view) {
  if (view === 'grid') {
    moviesGrid.classList.remove('list-view');
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
  } else {
    moviesGrid.classList.add('list-view');
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
  }
}

// ─── SEARCH TRIGGER ──────────────────────────────────────────────────────────
async function triggerSearch(page = 1) {
    state.page = page;
    state.query = searchInput.value.trim();
    state.type = typeFilter ? typeFilter.value : '';
    
    const selectedGenre = genreFilter ? genreFilter.value : '';

    if (selectedGenre && !state.query) {
        state.query = selectedGenre; 
    }

    state.customDisplayTitle = state.query ? `"${state.query}" Kategorisindeki Tüm İçerikler` : "Sonuçlar";

    // API Aramasını Başlat
    state.customPlaylistIds = null; 
    await searchMovies(false);

    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const targetTop = mainContent.offsetTop - 100;
        window.scrollTo({ 
            top: targetTop, 
            behavior: 'smooth' 
        });
    }
    sessionStorage.setItem('cinevault_last_search', JSON.stringify({
  query: state.query,
  type: state.type,
  page: state.page
}));
}

// ─── API CALL ────────────────────────────────────────────────────────────────
async function searchMovies(isShowcase = false) {
  if (state.isLoading) return;
  state.isLoading = true;
  showState('loading');

  const currentPlaylist = isShowcase ? null : state.customPlaylistIds; 
  const showcaseData = isShowcase ? state.customPlaylistIds : null;

  try {
    // Sabit Listeler Trendler veya Kategori İlk Açılış
    if (currentPlaylist || showcaseData) {
      const targetList = currentPlaylist || showcaseData;
      state.totalResults = targetList.length;
      
      const startIndex = (state.page - 1) * 12;
      const endIndex = state.page * 12;
      const pageIds = targetList.slice(startIndex, endIndex);

      const promises = pageIds.map(id => fetch(`${BASE_URL}?i=${id}`).then(res => res.json()));
      const results = await Promise.all(promises);
      
      state.results = results.filter(r => r.Response !== 'False');
    } 
    else {
      const startIndex = (state.page - 1) * 12;
      const endIndex = state.page * 12;
      
      const startOMDbPage = Math.floor(startIndex / 10) + 1;
      const endOMDbPage = Math.ceil(endIndex / 10);

      const promises = [];
      for (let p = startOMDbPage; p <= endOMDbPage; p++) {
        const params = new URLSearchParams({ s: state.query, page: p });
        
        if (state.type) params.set('type', state.type);
        
        promises.push(fetch(`${BASE_URL}?${params}`).then(res => res.json()));
      }

      const pagesData = await Promise.all(promises);
      let combinedResults = [];
      let totalRes = 0;

      pagesData.forEach(data => {
        if (data.Response !== 'False') {
          combinedResults = combinedResults.concat(data.Search);
          totalRes = parseInt(data.totalResults, 10);
        }
      });

      if (combinedResults.length === 0) throw new Error('İçerik bulunamadı');

      const offset = (startOMDbPage - 1) * 10;
      const localStart = startIndex - offset;
      const localEnd = endIndex - offset;

      state.results = combinedResults.slice(localStart, localEnd);
      state.totalResults = totalRes;
    }
    
    renderResults(isShowcase); 
  } catch (err) { 
    showError(err.message); 
  } finally { 
    state.isLoading = false; 
  }
}
// ─── FAVORİ İŞLEMLERİ ─────────────────────────────────────────────────────────
function toggleFavorite(movie, btnElement) {
  const favIndex = state.favorites.findIndex(f => f.imdbID === movie.imdbID);
  if (favIndex === -1) {
    state.favorites.push(movie);
    btnElement.classList.add('active');
    showToast(`"${movie.Title}" favorilere eklendi ❤️`);
  } else {
    state.favorites.splice(favIndex, 1);
    btnElement.classList.remove('active');
    showToast(`"${movie.Title}" favorilerden çıkarıldı`);
    if (navFavorites.classList.contains('active')) renderFavorites();
  }
  localStorage.setItem('cinevault_favs', JSON.stringify(state.favorites));
}

function renderFavorites() {
  moviesGrid.innerHTML = '';
  if (state.favorites.length === 0) {
    resultsTitle.textContent = "Favori İçeriklerim";
    resultsCount.textContent = "0 içerik";
    moviesGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 60px 0; color: var(--text-muted); font-size: 16px;">Henüz favorilere eklenmiş bir içerik yok.</div>`;
    pagination.innerHTML = '';
    showState('results');
    return;
  }
  state.favorites.forEach((movie, i) => moviesGrid.appendChild(createCard(movie, i)));
  resultsTitle.textContent = "Favori İçeriklerim";
  resultsCount.textContent = `${state.favorites.length} başyapıt`;
  pagination.innerHTML = ''; 
  showState('results');
}

// ─── LİSTE MODALI ─────────────────────────────────────────
function openListModal(movie) {
  movieToAdd = movie;
  selectedExistingList = ''; newListNameInput.value = '';
  existingListsContainer.innerHTML = '';
  const listNames = Object.keys(state.lists);
  if (listNames.length > 0) {
    listNames.forEach(name => {
      const tag = document.createElement('button');
      tag.className = 'list-tag'; tag.textContent = name;
      tag.onclick = () => {
        document.querySelectorAll('.list-tag').forEach(t => t.classList.remove('selected'));
        tag.classList.add('selected'); selectedExistingList = name; newListNameInput.value = ''; 
      };
      existingListsContainer.appendChild(tag);
    });
  } else { existingListsContainer.innerHTML = '<span>Kayıtlı liste yok.</span>'; }
  listModalOverlay.classList.add('open');
}

listModalCancel.onclick = () => { listModalOverlay.classList.remove('open'); movieToAdd = null; }
listModalSave.onclick = () => {
  let targetListName = newListNameInput.value.trim() || selectedExistingList;
  if (!targetListName) { showToast('Lütfen bir liste seçin.'); return; }
  if (!state.lists[targetListName]) state.lists[targetListName] = [];
  const exists = state.lists[targetListName].find(m => m.imdbID === movieToAdd.imdbID);
  if (exists) { showToast(`Zaten mevcut!`); } 
  else {
    state.lists[targetListName].push(movieToAdd);
    localStorage.setItem('cinevault_lists', JSON.stringify(state.lists));
    showToast(`Eklendi 🎬`);
  }
  listModalOverlay.classList.remove('open');
}

// ─── KLASÖR EKRANI ──────────────────────────────────────────
function renderListsView() {
  moviesGrid.innerHTML = '';
  const listNames = Object.keys(state.lists);

  resultsTitle.textContent = "Koleksiyonlarım";
  resultsCount.textContent = `${listNames.length} Klasör`;
  pagination.innerHTML = '';

  if(listNames.length === 0) {
    moviesGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 60px 0; color: var(--text-muted); font-size: 16px;">Henüz listeniz yok.</div>`;
    showState('results');
    return;
  }

  listNames.forEach((name, i) => {
    const count = state.lists[name].length;
    const wrapper = document.createElement('div');
    wrapper.className = 'folder-wrapper';
    wrapper.style.animationDelay = `${i * 0.05}s`;
    
    let bgImage = '';
    if (count > 0 && state.lists[name][0].Poster !== 'N/A') {
       bgImage = `background-image: url('${state.lists[name][0].Poster}');`;
    }

    wrapper.innerHTML = `
      <div class="list-folder">
        <div class="folder-bg" style="${bgImage}"></div>
        <div class="folder-overlay"></div>
        <div class="folder-content">
            <h3 class="folder-title">${name}</h3>
        </div>
      </div>

      <div class="folder-info-area">
         <h3 class="folder-title">${name}</h3>
      </div>

      <div class="folder-actions">
        <button class="edit-list-btn" title="Adı Değiştir">
          <svg viewBox="0 0 24 24" width="15" height="15"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          <span>Düzenle</span>
        </button>

        <button class="delete-list-btn" title="Sil">
          <svg viewBox="0 0 24 24" width="15" height="15"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          <span>Sil</span>
        </button>
      </div>`;

    const editBtn = wrapper.querySelector('.edit-list-btn');
    editBtn.onclick = (e) => {
        e.stopPropagation();
        showEditListModal(name); 
    };
    
    // TIKLAMA OLAYLARI
    const openList = () => renderSingleList(name);
    wrapper.querySelector('.list-folder').onclick = openList;
    wrapper.querySelector('.folder-info-area').onclick = openList; 

    // SİLME BUTONU
    const delBtn = wrapper.querySelector('.delete-list-btn');
    delBtn.onclick = (e) => {
       e.stopPropagation();
       if(confirm(`"${name}" koleksiyonunu silmek istiyor musunuz?`)) {
           delete state.lists[name];
           localStorage.setItem('cinevault_lists', JSON.stringify(state.lists));
           renderListsView();
       }
    };
    
    moviesGrid.appendChild(wrapper);
  });

  const addCard = document.createElement('div');
  addCard.className = 'folder-wrapper add-folder-wrapper';
  addCard.innerHTML = `
      <div class="list-folder add-new-folder-compact" style="cursor: pointer;">
        <div class="folder-overlay"></div>
        <div class="folder-content">
            <div class="plus-icon" style="pointer-events: none;">+</div>
        </div>
      </div>
      <div class="folder-info-area" style="cursor: pointer;">
         <h3 class="folder-title" style="font-size: 18px !important; color: var(--text-muted) !important;">Yeni Koleksiyon...</h3>
      </div>
      <div class="folder-actions" style="visibility: hidden;">
        <button class="edit-list-btn"><span>-</span></button>
      </div>
  `;
  
  const handleCreate = () => {
      if (typeof modalInner !== 'undefined' && typeof openModal === 'function') {
          modalInner.innerHTML = `
              <div class="list-modal-box edit-compact">
                  <h2 class="list-modal-title">Yeni Koleksiyon</h2>
                  <p class="edit-subtitle">Koleksiyonunuz için bir isim belirleyin.</p>
                  <input type="text" id="newListInputManual" class="list-modal-input" placeholder="Klasör adı..." maxlength="25">
                  <div class="list-modal-actions">
                      <button class="retry-btn" onclick="closeModal()">İptal</button>
                      <button class="search-btn" id="confirmCreateManual">Oluştur</button>
                  </div>
              </div>
          `;
          openModal();

          document.getElementById('confirmCreateManual').onclick = () => {
              const name = document.getElementById('newListInputManual').value.trim();
              if(!name) {
                  if(typeof showToast === 'function') showToast("Lütfen bir isim girin!");
                  else alert("Lütfen bir isim girin!");
                  return;
              }
              if(state.lists[name]) {
                  if(typeof showToast === 'function') showToast("Bu isimde bir klasör zaten var!");
                  else alert("Bu isimde bir klasör zaten var!");
                  return;
              }

              state.lists[name] = [];
              localStorage.setItem('cinevault_lists', JSON.stringify(state.lists));
              closeModal();
              renderListsView(); 
              if(typeof showToast === 'function') showToast(`"${name}" klasörü oluşturuldu.`);
          };
      } else {
          const name = prompt("Yeni klasör adı girin:");
          if(name && name.trim()) {
              state.lists[name.trim()] = [];
              localStorage.setItem('cinevault_lists', JSON.stringify(state.lists));
              renderListsView();
          }
      }
  };

  addCard.querySelector('.list-folder').onclick = handleCreate;
  addCard.querySelector('.folder-info-area').onclick = handleCreate;

  moviesGrid.appendChild(addCard);
  
  showState('results');
}

function renderSingleList(name) {
  moviesGrid.innerHTML = ''; 
  const listMovies = state.lists[name];
  
  
  resultsTitle.textContent = name; 
  resultsCount.textContent = `${listMovies.length} İçerik`;
  pagination.innerHTML = '';

  // GERİ DÖN BUTONU
  const backBtn = document.createElement('button');
  backBtn.className = 'back-to-lists-btn'; 
  backBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg> 
    Klasörlere Dön
  `;
  
  backBtn.onclick = () => {
    console.log("Klasörler listesine dönülüyor...");
    renderListsView();
  };

  const container = document.createElement('div'); 
  container.style.gridColumn = '1/-1'; 
  container.style.marginBottom = '20px'; // Filmlerle arasında boşluk olsun
  container.appendChild(backBtn);
  moviesGrid.appendChild(container);

  if(!listMovies || listMovies.length === 0) { 
    const emptyMsg = document.createElement('p');
    emptyMsg.style.cssText = 'grid-column:1/-1; text-align:center; padding:60px; color:var(--text-muted);';
    emptyMsg.textContent = 'Bu klasör henüz boş.';
    moviesGrid.appendChild(emptyMsg);
  } else { 
    
    listMovies.forEach((m, i) => {
      moviesGrid.appendChild(createCard(m, i, name));
    }); 
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── CARD FACTORY ─────────────────────────────
function renderResults(isShowcase = false) {
  moviesGrid.innerHTML = '';
  state.results.forEach((movie, i) => moviesGrid.appendChild(createCard(movie, i)));

  const total = state.totalResults;
  const pages = Math.ceil(total / 12);

  if (isShowcase) {
    resultsTitle.textContent = "Trendler ve Öne Çıkanlar";
    resultsCount.textContent = "Sizin için seçildi";
  } else {
    resultsTitle.textContent  = state.customDisplayTitle || "Sonuçlar";
    resultsCount.textContent  = `${total} sonuç bulundu`;
  }

  renderPagination(pages);
  showState('results');
}

function createCard(movie, index, currentListName = null) {
  const card = document.createElement('div'); card.className = 'movie-card';
  card.style.animationDelay = `${index * 0.05}s`;
  const isFav = state.favorites.some(f => f.imdbID === movie.imdbID);
  let actionBtn = currentListName ? `<button class="remove-movie-btn">✕</button>` : `<button class="add-list-btn">+</button>`;
  card.innerHTML = `
    <div class="card-poster">
      <button class="fav-btn ${isFav ? 'active' : ''}">❤</button>${actionBtn}
      <img src="${movie.Poster !== 'N/A' ? movie.Poster : ''}" loading="lazy" />
      <div class="card-overlay"></div>
    </div>
    <div class="card-info"><div class="card-title">${movie.Title}</div><div class="card-year">${movie.Year}</div></div>`;
  card.querySelector('.fav-btn').onclick = (e) => { e.stopPropagation(); toggleFavorite(movie, e.currentTarget); };
  const listBtn = card.querySelector('.add-list-btn') || card.querySelector('.remove-movie-btn');
  listBtn.onclick = (e) => {
    e.stopPropagation();
    if(currentListName) {
      state.lists[currentListName] = state.lists[currentListName].filter(m => m.imdbID !== movie.imdbID);
      localStorage.setItem('cinevault_lists', JSON.stringify(state.lists));
      renderSingleList(currentListName);
    } else { openListModal(movie); }
  };
  card.onclick = () => openDetail(movie.imdbID);
  return card;
}

async function goToPage(page) {
  state.page = parseInt(page, 10);
  
  const isCurrentlyShowcase = !!(state.customPlaylistIds && !state.query);
  
  await searchMovies(isCurrentlyShowcase); 

  // SCROLL HAREKETİ
  const targetTop = document.querySelector('.main-content').offsetTop - 80;
  window.scrollTo({ top: targetTop, behavior: 'smooth' });
}

// ─── PAGINATION ───────────────────────────────────────────────────
function renderPagination(totalPages) {
  pagination.innerHTML = ''; const safe = Math.min(totalPages, 100); if (safe <= 1) return;
  const prev = makePageBtn('‹', state.page - 1, state.page <= 1); pagination.appendChild(prev);
  for (let i = 1; i <= Math.min(safe, 5); i++) pagination.appendChild(makePageBtn(i, i, false, i === state.page));
  const next = makePageBtn('›', state.page + 1, state.page >= safe); pagination.appendChild(next);
}

function makePageBtn(label, page, disabled, active = false) {
  const btn = document.createElement('button');
  btn.className = `page-btn${active ? ' active' : ''}`;
  btn.textContent = label;
  btn.disabled = disabled;
  
  if (!disabled) btn.onclick = () => goToPage(page); 
  
  return btn;
}

async function openDetail(imdbID) {
  modalInner.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:300px;">
      <div class="loader-reel" style="width:50px;height:50px;"></div>
    </div>`;
  openModal();

  try {
    const res = await fetch(`${BASE_URL}?i=${imdbID}&plot=full`);
    const data = await res.json();

    if (data.Response === 'False') throw new Error(data.Error);

    const hasPoster = data.Poster && data.Poster !== 'N/A';
    const rating = parseFloat(data.imdbRating) || 0;
    const stars = '★'.repeat(Math.round(rating / 2)) + '☆'.repeat(5 - Math.round(rating / 2));

    modalInner.innerHTML = `
      <div class="modal-backdrop">
        ${hasPoster ? `<img class="modal-backdrop-img" src="${data.Poster}" alt="" />` : ''}
        <div class="modal-backdrop-overlay"></div>
        <div class="modal-poster">
          ${hasPoster ? `<img src="${data.Poster}" alt="${data.Title}" />` : `<div class="no-poster" style="height:160px;"></div>`}
        </div>
      </div>
      <div class="modal-body">
        <div class="modal-title">${data.Title}</div>
        ${data.Released && data.Released !== 'N/A' ? `<div class="modal-subtitle">${data.Released}</div>` : ''}
        
        <div class="modal-badges">
          <span class="modal-badge highlight">${data.Year}</span>
          ${data.Rated && data.Rated !== 'N/A' ? `<span class="modal-badge">${data.Rated}</span>` : ''}
          ${data.Runtime && data.Runtime !== 'N/A' ? `<span class="modal-badge">⏱ ${data.Runtime}</span>` : ''}
          ${data.Genre && data.Genre !== 'N/A' ? data.Genre.split(', ').map(g => `<span class="modal-badge">${g}</span>`).join('') : ''}
        </div>

        ${rating > 0 ? `
          <div class="modal-rating">
            <span class="stars">${stars}</span>
            <span class="rating-score">${data.imdbRating}</span>
            <span class="rating-sub">/ 10 — ${data.imdbVotes} oy</span>
          </div>` : ''}

        ${data.Plot && data.Plot !== 'N/A' ? `<div class="modal-plot">${data.Plot}</div>` : ''}

        <div class="modal-details">
          ${detail('Yönetmen', data.Director)}
          ${detail('Senaryo', data.Writer)}
          ${detail('Oyuncular', data.Actors)}
          ${detail('Dil', data.Language)}
          ${detail('Ülke', data.Country)}
          ${detail('Tür', data.Type === 'movie' ? 'Film' : data.Type === 'series' ? 'Dizi' : data.Type)}
        </div>
      </div>`;
  } catch (err) {
    modalInner.innerHTML = `
      <div style="padding:60px;text-align:center;">
        <p style="color:var(--accent2);margin-bottom:12px;">Detay yüklenemedi</p>
      </div>`;
  }
}

function detail(label, value) {
  if (!value || value === 'N/A') return '';
  return `
    <div class="detail-item">
      <span class="detail-label">${label}</span>
      <span class="detail-value">${value}</span>
    </div>`;
}

function openModal() { modalOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal() { modalOverlay.classList.remove('open'); document.body.style.overflow = ''; }
function showState(which) { [loadingState, errorState, resultsSection].forEach(el => el.classList.remove('visible')); if(which==='loading') loadingState.classList.add('visible'); else if(which==='error') errorState.classList.add('visible'); else resultsSection.classList.add('visible'); }
function showError(msg) { $('errorTitle').textContent = 'Hata'; showState('error'); }
function showToast(msg) { const t = $('toast'); if(!t) return; t.textContent = msg; t.classList.add('show'); if(toastTimer) clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3000); }
let toastTimer = null;

function showEditListModal(oldName) {
    
modalInner.innerHTML = `
    <div class="list-modal-box edit-compact">
        <h2 class="list-modal-title">Klasörü Düzenle</h2>
        <p class="edit-subtitle">"${oldName}" için yeni bir isim belirleyin.</p>
        <input type="text" id="editListInput" class="list-modal-input" 
               value="${oldName}" placeholder="Yeni klasör adı..." maxlength="25">
        <div class="list-modal-actions">
            <button class="retry-btn" onclick="closeModal()">İptal</button>
            <button class="search-btn" id="confirmEditBtn">Güncelle</button>
        </div>
    </div>
`;
    openModal();

    document.getElementById('confirmEditBtn').onclick = () => {
        const newName = document.getElementById('editListInput').value.trim();
        
        if (!newName) {
            showToast("Lütfen bir isim girin!");
            return;
        }
        if (state.lists[newName] && newName !== oldName) {
            showToast("Bu isimde bir klasör zaten var!");
            return;
        }

        if (newName !== oldName) {
            state.lists[newName] = state.lists[oldName];
            delete state.lists[oldName];
            localStorage.setItem('cinevault_lists', JSON.stringify(state.lists));
            renderListsView();
        }
        closeModal();
        showToast("Klasör adı güncellendi.");
    };

const initHeaderActions = () => {
    const nBtn = document.getElementById('notificationBtn');
    const pBtn = document.getElementById('profileAvatar');

    if (nBtn) {
        nBtn.onclick = (e) => {
            e.preventDefault();
            if (typeof showToast === 'function') {
                showToast("Şu an için okunmamış bir bildiriminiz bulunmuyor.");
            } else {
                alert("Yeni bildiriminiz yok.");
            }
        };
    }

    if (pBtn) {
        pBtn.onclick = (e) => {
            e.preventDefault();
            if (typeof showToast === 'function') {
                showToast("Profil yönetimi ve ayarlar yakında eklenecek!");
            } else {
                alert("Profil ayarları çok yakında!");
            }
        };
    }
};

initHeaderActions();

}

// Logo refresh
document.querySelector('.logo').addEventListener('click', () => {
    location.reload();
});

// Notification
document.getElementById('notificationBtn').addEventListener('click', () => {
    if (typeof showToast === 'function') {
        showToast('Bu özellik demo sürümünde devre dışıdır.');
    } else {
        alert('Yeni bildiriminiz yok.');
    }
});

// Profile
document.getElementById('profileBtn').addEventListener('click', () => {
    if (typeof showToast === 'function') {
        showToast('Profil ayarları çok yakında CineVault\'ta!');
    } else {
        alert('Profil ayarları yakında!');
    }
});

// Footer linklerinin çalışmasını sağlayan yardımcı fonksiyon
const setupFooterLinks = () => {
    const footerFavs = document.querySelector('a[onclick*="navFavorites"]');
    if (footerFavs) {
        footerFavs.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
};

setupFooterLinks();
