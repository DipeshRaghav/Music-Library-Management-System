const API_BASE = "/api";
const DEFAULT_PLAYLIST_ID = 1;

const trackList = document.getElementById("tracks");
const playlistEl = document.getElementById("playlist");
const searchInput = document.getElementById("search");
const genreFilter = document.getElementById("genre");
const statusEl = document.getElementById("status");

let chart;
let debounceTimer;
let tracks = [];
let playlist = [];

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#ff6b6b" : "#9ecbff";
}

function debounce(fn, delay = 350) {
  return (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn(...args), delay);
  };
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Request failed");
  }
  return response.json();
}

function renderTracks(data) {
  trackList.innerHTML = "";

  if (data.length === 0) {
    trackList.innerHTML = "<p>No tracks match your filters.</p>";
    return;
  }

  data.forEach((t) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${t.title}</h3>
      <p>${t.artist}</p>
      <p><small>${t.album || "Unknown Album"}</small></p>
      <span>${t.genre}</span>
      <button onclick="addToPlaylist(${t.id})">Add</button>
    `;

    trackList.appendChild(card);
  });
}

function renderPlaylist() {
  playlistEl.innerHTML = "";

  if (playlist.length === 0) {
    playlistEl.innerHTML = "<li>Playlist is empty.</li>";
  } else {
    playlist.forEach((t) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${t.title}</strong> - ${t.artist}
        <button onclick="removeFromPlaylist(${t.id})">❌</button>
      `;
      playlistEl.appendChild(li);
    });
  }

  updateChart();
}

function updateChart() {
  const ctx = document.getElementById("chart").getContext("2d");
  const stats = {};

  playlist.forEach((t) => {
    stats[t.genre] = (stats[t.genre] || 0) + 1;
  });

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(stats),
      datasets: [
        {
          label: "Genre Distribution",
          data: Object.values(stats),
          backgroundColor: "#1db954",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#ffffff" },
        },
      },
      scales: {
        x: { ticks: { color: "#ffffff" } },
        y: { ticks: { color: "#ffffff" } },
      },
    },
  });
}

async function loadGenres() {
  const genres = await request(`${API_BASE}/genres`);
  genres.forEach((g) => {
    const option = document.createElement("option");
    option.value = g.genre_name;
    option.textContent = g.genre_name;
    genreFilter.appendChild(option);
  });
}

async function loadTracks() {
  const params = new URLSearchParams();
  const search = searchInput.value.trim();
  const genre = genreFilter.value;

  if (search) params.set("search", search);
  if (genre && genre !== "All") params.set("genre", genre);

  const endpoint = `${API_BASE}/tracks${params.toString() ? `?${params}` : ""}`;
  tracks = await request(endpoint);
  renderTracks(tracks);
}

async function loadPlaylist() {
  playlist = await request(`${API_BASE}/playlists/${DEFAULT_PLAYLIST_ID}/tracks`);
  renderPlaylist();
}

window.addToPlaylist = async (id) => {
  try {
    await request(`${API_BASE}/playlists/${DEFAULT_PLAYLIST_ID}/tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId: id }),
    });
    setStatus("Track added to playlist.");
    await loadPlaylist();
  } catch (error) {
    setStatus(error.message, true);
  }
};

window.removeFromPlaylist = async (id) => {
  try {
    await request(`${API_BASE}/playlists/${DEFAULT_PLAYLIST_ID}/tracks/${id}`, {
      method: "DELETE",
    });
    setStatus("Track removed from playlist.");
    await loadPlaylist();
  } catch (error) {
    setStatus(error.message, true);
  }
};

searchInput.addEventListener(
  "input",
  debounce(async () => {
    try {
      await loadTracks();
    } catch (error) {
      setStatus(error.message, true);
    }
  })
);

genreFilter.addEventListener("change", async () => {
  try {
    await loadTracks();
  } catch (error) {
    setStatus(error.message, true);
  }
});

async function init() {
  try {
    setStatus("Connecting to API...");
    await request(`${API_BASE}/health`);
    await loadGenres();
    await Promise.all([loadTracks(), loadPlaylist()]);
    setStatus("Connected to MySQL successfully.");
  } catch (error) {
    setStatus(`Startup failed: ${error.message}`, true);
  }
}

init();