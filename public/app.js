import { tracks } from "./data.js";
import { debounce, savePlaylist, loadPlaylist } from "./utils.js";

let playlist = loadPlaylist();

const trackList = document.getElementById("tracks");
const playlistEl = document.getElementById("playlist");
const searchInput = document.getElementById("search");
const genreFilter = document.getElementById("genre");

function renderTracks(data) {
  trackList.innerHTML = "";

  data.forEach(t => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${t.title}</h3>
      <p>${t.artist}</p>
      <span>${t.genre}</span>
      <button onclick="addToPlaylist(${t.id})">Add</button>
    `;

    trackList.appendChild(card);
  });
}

function renderPlaylist() {
  playlistEl.innerHTML = "";

  playlist.forEach(t => {
    const li = document.createElement("li");

    li.innerHTML = `
      ${t.title}
      <button onclick="removeFromPlaylist(${t.id})">❌</button>
    `;

    playlistEl.appendChild(li);
  });

  savePlaylist(playlist);
  updateChart();
}

window.addToPlaylist = (id) => {
  const song = tracks.find(t => t.id === id);
  if (!playlist.some(t => t.id === id)) {
    playlist.push(song);
    renderPlaylist();
  }
};

window.removeFromPlaylist = (id) => {
  playlist = playlist.filter(t => t.id !== id);
  renderPlaylist();
};

function filterTracks() {
  let filtered = [...tracks];

  const search = searchInput.value.toLowerCase();
  const genre = genreFilter.value;

  if (search) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(search) ||
      t.artist.toLowerCase().includes(search)
    );
  }

  if (genre !== "All") {
    filtered = filtered.filter(t => t.genre === genre);
  }

  renderTracks(filtered);
}

searchInput.addEventListener("input", debounce(filterTracks));
genreFilter.addEventListener("change", filterTracks);

function updateChart() {
  const ctx = document.getElementById("chart").getContext("2d");

  const stats = {};
  playlist.forEach(t => {
    stats[t.genre] = (stats[t.genre] || 0) + 1;
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(stats),
      datasets: [{
        label: "Genre Distribution",
        data: Object.values(stats)
      }]
    }
  });
}

renderTracks(tracks);
renderPlaylist();