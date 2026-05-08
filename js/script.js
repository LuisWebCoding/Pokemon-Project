// =========================================================
//  POKÉDEX — app.js (Atualizado para PWA)
//  Consome a PokéAPI e exibe os dados no HTML.
// =========================================================

// ── 1. CONFIGURAÇÃO ───────────────────────────────────────
const API_BASE = 'https://pokeapi.co/api/v2/pokemon/';

const STAT_NAMES = {
  hp:              'HP',
  attack:          'Ataque',
  defense:         'Defesa',
  'special-attack':'Atq. Esp.',
  'special-defense':'Def. Esp.',
  speed:           'Velocidade',
};

// ── 2. SELEÇÃO DOS ELEMENTOS DO HTML ──────────────────────
const searchInput = document.getElementById('searchInput');
const searchBtn   = document.getElementById('searchBtn');
const card        = document.getElementById('card');
const errorMsg    = document.getElementById('errorMsg');
const loading     = document.getElementById('loading');

const pokeName     = document.getElementById('pokeName');
const pokeId       = document.getElementById('pokeId');
const pokeImg      = document.getElementById('pokeImg');
const pokeTypes    = document.getElementById('pokeTypes');
const pokeStats    = document.getElementById('pokeStats');
const pokeHeight   = document.getElementById('pokeHeight');
const pokeWeight   = document.getElementById('pokeWeight');
const pokeExp      = document.getElementById('pokeExp');
const pokeAbilities = document.getElementById('pokeAbilities');

// ── 3. EVENTOS ────────────────────────────────────────────
searchBtn.addEventListener('click', handleSearch);

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') handleSearch();
});

// ── 4. FUNÇÃO PRINCIPAL: ORQUESTRA A BUSCA ────────────────
async function handleSearch() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) return;

  showLoading();

  try {
    const data = await fetchPokemon(query);
    renderCard(data);
    showCard();
    
    // Sucesso: Vibra duas vezes rápido e narra os dados
    triggerVibration([100, 50, 100]);
    speakPokedexData(data);

  } catch (error) {
    showError();
    // Erro: Vibra longo
    triggerVibration([400]);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance("Pokémon não encontrado."));
    }
  }
}

// ── 5. BUSCA NA API ───────────────────────────────────────
async function fetchPokemon(nameOrId) {
  const url = API_BASE + nameOrId;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Pokémon não encontrado: ${nameOrId}`);
  }

  const data = await response.json();
  return data;
}

// ── 6. RENDERIZA O CARD COM OS DADOS ──────────────────────
function renderCard(data) {
  pokeName.textContent = capitalize(data.name);
  pokeId.textContent   = `#${String(data.id).padStart(3, '0')}`;

  const imgUrl =
    data.sprites.other?.['official-artwork']?.front_default ||
    data.sprites.front_default;
  pokeImg.src = imgUrl;
  pokeImg.alt = `Imagem de ${data.name}`;

  renderTypes(data.types);
  pokeHeight.textContent = `${data.height / 10} m`;
  pokeWeight.textContent = `${data.weight / 10} kg`;
  pokeExp.textContent    = data.base_experience ?? '—';
  renderStats(data.stats);
  renderAbilities(data.abilities);
}

// ── 7. RENDERIZA OS TIPOS ─────────────────────────────────
function renderTypes(types) {
  pokeTypes.innerHTML = ''; 
  types.forEach(({ type }) => {
    const badge = document.createElement('span');
    badge.classList.add('type-badge', `type-${type.name}`);
    badge.textContent = type.name;
    pokeTypes.appendChild(badge);
  });
}

// ── 8. RENDERIZA OS ATRIBUTOS (stats) ────────────────────
function renderStats(stats) {
  pokeStats.innerHTML = ''; 
  stats.forEach(({ stat, base_stat }) => {
    const label = STAT_NAMES[stat.name] || stat.name;
    const percent = Math.min((base_stat / 200) * 100, 100);

    const li = document.createElement('li');
    li.innerHTML = `
      <span class="stat-label">${label}</span>
      <div class="stat-bar-bg">
        <div class="stat-bar-fill" style="width: ${percent}%"></div>
      </div>
      <span class="stat-value">${base_stat}</span>
    `;
    pokeStats.appendChild(li);
  });
}

// ── 9. RENDERIZA AS HABILIDADES ───────────────────────────
function renderAbilities(abilities) {
  pokeAbilities.innerHTML = '';
  const list = document.createElement('div');
  list.classList.add('ability-list');

  abilities.forEach(({ ability, is_hidden }) => {
    const badge = document.createElement('span');
    badge.classList.add('ability-badge');
    if (is_hidden) badge.classList.add('hidden-ability');
    badge.textContent = ability.name + (is_hidden ? ' (oculta)' : '');
    list.appendChild(badge);
  });

  pokeAbilities.appendChild(list);
}

// ── 10. CONTROLE DE VISIBILIDADE ─────────────────────────
function showLoading() {
  card.classList.add('hidden');
  errorMsg.classList.add('hidden');
  loading.classList.remove('hidden');
}

function showCard() {
  loading.classList.add('hidden');
  errorMsg.classList.add('hidden');
  card.classList.remove('hidden');
}

function showError() {
  loading.classList.add('hidden');
  card.classList.add('hidden');
  errorMsg.classList.remove('hidden');
}

// ── 11. UTILITÁRIO ────────────────────────────────────────
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── 12. PWA E RECURSOS DE HARDWARE ────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('Falha ao registrar o Service Worker:', err);
    });
  });
}

function triggerVibration(pattern) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

function speakPokedexData(data) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); 
    
    const types = data.types.map(t => t.type.name).join(' e ');
    const text = `${data.name}. Tipo: ${types}. Este Pokémon pesa ${data.weight / 10} quilos e tem ${data.height / 10} metros de altura.`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1; 
    
    window.speechSynthesis.speak(utterance);
  }
}