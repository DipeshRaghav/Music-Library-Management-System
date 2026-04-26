const statusEl = document.getElementById("status");
const tracksEl = document.getElementById("tracks");
const searchEl = document.getElementById("search");
const genreEl = document.getElementById("genre");

let debounceTimer;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#ff7b7b" : "#9ecbff";
}

function debounce(fn, delay = 350) {
  return (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn(...args), delay);
  };
}

async function api(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || payload.message || "Request failed");
  }
  return response.json();
}

function renderTracks(tracks) {
  tracksEl.innerHTML = "";

  if (!tracks.length) {
    tracksEl.innerHTML = "<p>No tracks found.</p>";
    return;
  }

  tracks.forEach((track) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${track.title}</h3>
      <p>Artist: ${track.artist}</p>
      <p>Album: ${track.album}</p>
      <p>Genre: ${track.genre}</p>
    `;
    tracksEl.appendChild(card);
  });
}

async function loadGenres() {
  const genres = await api("/api/genres");
  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre.genre_name;
    option.textContent = genre.genre_name;
    genreEl.appendChild(option);
  });
}

async function loadTracks() {
  const params = new URLSearchParams();
  const search = searchEl.value.trim();
  const genre = genreEl.value;

  if (search) params.set("search", search);
  if (genre && genre !== "All") params.set("genre", genre);

  const url = `/api/tracks${params.toString() ? `?${params.toString()}` : ""}`;
  const tracks = await api(url);
  renderTracks(tracks);
}

async function init() {
  try {
    setStatus("Connecting...");
    await api("/api/health");
    await loadGenres();
    await loadTracks();
    setStatus("Connected");
  } catch (error) {
    setStatus(error.message, true);
  }
}

searchEl.addEventListener("input", debounce(loadTracks));
genreEl.addEventListener("change", loadTracks);

init();
