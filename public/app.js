const statusEl = document.getElementById("status");
const artistsEl = document.getElementById("artists");
const albumsEl = document.getElementById("albums");
const tracksEl = document.getElementById("tracks");
const searchEl = document.getElementById("search");
const genreEl = document.getElementById("genre");
const playlistTracksEl = document.getElementById("playlist-tracks");
const playlistFormEl = document.getElementById("playlist-form");
const playlistNameInput = document.getElementById("playlist-name-input");
const playlistSelect = document.getElementById("playlist-select");
const deletePlaylistBtn = document.getElementById("delete-playlist-btn");
const playlistChartEl = document.getElementById("playlist-chart");

const artistFormEl = document.getElementById("artist-form");
const artistNameInput = document.getElementById("artist-name-input");
const artistCountryInput = document.getElementById("artist-country-input");
const artistSaveBtn = document.getElementById("artist-save-btn");
const artistCancelBtn = document.getElementById("artist-cancel-btn");

const albumFormEl = document.getElementById("album-form");
const albumTitleInput = document.getElementById("album-title-input");
const albumYearInput = document.getElementById("album-year-input");
const albumArtistSelect = document.getElementById("album-artist-select");
const albumSaveBtn = document.getElementById("album-save-btn");
const albumCancelBtn = document.getElementById("album-cancel-btn");

const formEl = document.getElementById("track-form");
const titleInput = document.getElementById("title-input");
const durationInput = document.getElementById("duration-input");
const artistSelect = document.getElementById("artist-select");
const albumSelect = document.getElementById("album-select");
const genreSelect = document.getElementById("genre-select");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");

let debounceTimer;
let allArtists = [];
let allAlbums = [];
let allTracks = [];
let allPlaylists = [];
let editTrackId = null;
let editArtistId = null;
let editAlbumId = null;
let playlistChart = null;

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

async function api(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || payload.message || "Request failed");
  }
  return response.json();
}

function renderTracks(tracks) {
  allTracks = tracks;
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
      <p>Duration: ${track.duration}s</p>
      <div class="card-actions">
        <button data-add-playlist-track-id="${track.id}">Add to Playlist</button>
        <button data-edit-id="${track.id}">Edit</button>
        <button class="danger" data-delete-id="${track.id}">Delete</button>
      </div>
    `;
    tracksEl.appendChild(card);
  });
}

function renderPlaylistTracks(tracks) {
  playlistTracksEl.innerHTML = "";

  if (!tracks.length) {
    playlistTracksEl.innerHTML = "<p>No tracks in selected playlist.</p>";
    return;
  }

  tracks.forEach((track) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${track.title}</h3>
      <p>Artist: ${track.artist}</p>
      <p>Genre: ${track.genre}</p>
      <div class="card-actions">
        <button class="danger" data-remove-playlist-track-id="${track.id}">Remove</button>
      </div>
    `;
    playlistTracksEl.appendChild(card);
  });
}

function renderPlaylistChart(stats) {
  const labels = stats.map((item) => item.genre);
  const values = stats.map((item) => Number(item.total));

  if (playlistChart) playlistChart.destroy();

  playlistChart = new Chart(playlistChartEl.getContext("2d"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Tracks by Genre",
          data: values,
          backgroundColor: "#1db954",
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: { color: "#ffffff" },
        },
      },
      scales: {
        x: { ticks: { color: "#ffffff" } },
        y: { ticks: { color: "#ffffff" }, beginAtZero: true },
      },
    },
  });
}

function renderArtists(artists) {
  artistsEl.innerHTML = "";
  if (!artists.length) {
    artistsEl.innerHTML = "<p>No artists found.</p>";
    return;
  }

  artists.forEach((artist) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${artist.name}</h3>
      <p>Country: ${artist.country || "N/A"}</p>
      <div class="card-actions">
        <button data-edit-artist-id="${artist.artist_id}">Edit</button>
        <button class="danger" data-delete-artist-id="${artist.artist_id}">Delete</button>
      </div>
    `;
    artistsEl.appendChild(card);
  });
}

function renderAlbums(albums) {
  albumsEl.innerHTML = "";
  if (!albums.length) {
    albumsEl.innerHTML = "<p>No albums found.</p>";
    return;
  }

  albums.forEach((album) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${album.title}</h3>
      <p>Artist: ${album.artist_name}</p>
      <p>Year: ${album.release_year || "N/A"}</p>
      <div class="card-actions">
        <button data-edit-album-id="${album.album_id}">Edit</button>
        <button class="danger" data-delete-album-id="${album.album_id}">Delete</button>
      </div>
    `;
    albumsEl.appendChild(card);
  });
}

async function loadGenres() {
  const genres = await api("/api/genres");

  genreEl.innerHTML = '<option value="All">All Genres</option>';
  genreSelect.innerHTML = '<option value="">Select genre</option>';

  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre.genre_name;
    option.textContent = genre.genre_name;
    genreEl.appendChild(option);

    const optionForForm = document.createElement("option");
    optionForForm.value = String(genre.genre_id);
    optionForForm.textContent = genre.genre_name;
    genreSelect.appendChild(optionForForm);
  });
}

async function loadArtists() {
  allArtists = await api("/api/artists");
  renderArtists(allArtists);

  artistSelect.innerHTML = '<option value="">Select artist</option>';
  albumArtistSelect.innerHTML = '<option value="">Select artist</option>';

  allArtists.forEach((artist) => {
    const option = document.createElement("option");
    option.value = String(artist.artist_id);
    option.textContent = artist.name;
    artistSelect.appendChild(option);

    const albumArtistOption = document.createElement("option");
    albumArtistOption.value = String(artist.artist_id);
    albumArtistOption.textContent = artist.name;
    albumArtistSelect.appendChild(albumArtistOption);
  });
}

async function loadAlbums(artistId = "") {
  const params = new URLSearchParams();
  if (artistId) params.set("artistId", artistId);

  const url = `/api/albums${params.toString() ? `?${params.toString()}` : ""}`;
  const albums = await api(url);
  allAlbums = artistId ? allAlbums : albums;
  if (!artistId) renderAlbums(albums);

  albumSelect.innerHTML = '<option value="">Select album</option>';
  albums.forEach((album) => {
    const option = document.createElement("option");
    option.value = String(album.album_id);
    option.textContent = album.title;
    albumSelect.appendChild(option);
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

async function loadPlaylists() {
  allPlaylists = await api("/api/playlists");
  playlistSelect.innerHTML = '<option value="">Select playlist</option>';
  allPlaylists.forEach((playlist) => {
    const option = document.createElement("option");
    option.value = String(playlist.playlist_id);
    option.textContent = playlist.name;
    playlistSelect.appendChild(option);
  });
}

async function loadSelectedPlaylistDetails() {
  const playlistId = playlistSelect.value;
  if (!playlistId) {
    playlistTracksEl.innerHTML = "<p>Select a playlist to view tracks.</p>";
    if (playlistChart) playlistChart.destroy();
    return;
  }

  const [tracks, stats] = await Promise.all([
    api(`/api/playlists/${playlistId}/tracks`),
    api(`/api/playlists/${playlistId}/stats`),
  ]);

  renderPlaylistTracks(tracks);
  renderPlaylistChart(stats);
}

function resetArtistForm() {
  editArtistId = null;
  artistFormEl.reset();
  artistSaveBtn.textContent = "Add Artist";
  artistCancelBtn.classList.add("hidden");
}

function resetAlbumForm() {
  editAlbumId = null;
  albumFormEl.reset();
  albumSaveBtn.textContent = "Add Album";
  albumCancelBtn.classList.add("hidden");
}

function resetForm() {
  editTrackId = null;
  formEl.reset();
  saveBtn.textContent = "Add Track";
  cancelBtn.classList.add("hidden");
  albumSelect.innerHTML = '<option value="">Select album</option>';
}

async function submitArtistForm(event) {
  event.preventDefault();

  const payload = {
    name: artistNameInput.value.trim(),
    country: artistCountryInput.value.trim(),
  };

  if (!payload.name) {
    setStatus("Artist name is required.", true);
    return;
  }

  const isEdit = editArtistId !== null;
  const url = isEdit ? `/api/artists/${editArtistId}` : "/api/artists";
  const method = isEdit ? "PUT" : "POST";

  try {
    await api(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setStatus(isEdit ? "Artist updated." : "Artist created.");
    resetArtistForm();
    await Promise.all([loadArtists(), loadAlbums(), loadTracks()]);
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function submitAlbumForm(event) {
  event.preventDefault();

  const payload = {
    title: albumTitleInput.value.trim(),
    releaseYear: albumYearInput.value ? Number(albumYearInput.value) : null,
    artistId: Number(albumArtistSelect.value),
  };

  if (!payload.title || !payload.artistId) {
    setStatus("Album title and artist are required.", true);
    return;
  }

  const isEdit = editAlbumId !== null;
  const url = isEdit ? `/api/albums/${editAlbumId}` : "/api/albums";
  const method = isEdit ? "PUT" : "POST";

  try {
    await api(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setStatus(isEdit ? "Album updated." : "Album created.");
    resetAlbumForm();
    await Promise.all([loadAlbums(), loadTracks()]);
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function startEditTrack(trackId) {
  const tracks = await api("/api/tracks");
  const track = tracks.find((item) => item.id === Number(trackId));
  if (!track) return;

  editTrackId = track.id;
  titleInput.value = track.title;
  durationInput.value = track.duration;
  artistSelect.value = String(track.artistId);
  await loadAlbums(String(track.artistId));
  albumSelect.value = String(track.albumId);
  genreSelect.value = String(track.genreId);
  saveBtn.textContent = "Update Track";
  cancelBtn.classList.remove("hidden");
}

function startEditArtist(artistId) {
  const artist = allArtists.find((item) => item.artist_id === Number(artistId));
  if (!artist) return;

  editArtistId = artist.artist_id;
  artistNameInput.value = artist.name;
  artistCountryInput.value = artist.country || "";
  artistSaveBtn.textContent = "Update Artist";
  artistCancelBtn.classList.remove("hidden");
}

function startEditAlbum(albumId) {
  const album = allAlbums.find((item) => item.album_id === Number(albumId));
  if (!album) return;

  editAlbumId = album.album_id;
  albumTitleInput.value = album.title;
  albumYearInput.value = album.release_year || "";
  albumArtistSelect.value = String(album.artist_id);
  albumSaveBtn.textContent = "Update Album";
  albumCancelBtn.classList.remove("hidden");
}

async function submitTrackForm(event) {
  event.preventDefault();

  const payload = {
    title: titleInput.value.trim(),
    duration: Number(durationInput.value),
    albumId: Number(albumSelect.value),
    genreId: Number(genreSelect.value),
  };

  if (!payload.title || !payload.duration || !payload.albumId || !payload.genreId) {
    setStatus("All track form fields are required.", true);
    return;
  }

  const isEdit = editTrackId !== null;
  const url = isEdit ? `/api/tracks/${editTrackId}` : "/api/tracks";
  const method = isEdit ? "PUT" : "POST";

  try {
    await api(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setStatus(isEdit ? "Track updated." : "Track created.");
    resetForm();
    await loadTracks();
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function onArtistActionClick(event) {
  const editId = event.target.dataset.editArtistId;
  const deleteId = event.target.dataset.deleteArtistId;

  if (editId) {
    startEditArtist(editId);
    return;
  }

  if (deleteId) {
    try {
      await api(`/api/artists/${deleteId}`, { method: "DELETE" });
      setStatus("Artist deleted.");
      if (editArtistId === Number(deleteId)) resetArtistForm();
      await Promise.all([loadArtists(), loadAlbums(), loadTracks()]);
    } catch (error) {
      setStatus(error.message, true);
    }
  }
}

async function onAlbumActionClick(event) {
  const editId = event.target.dataset.editAlbumId;
  const deleteId = event.target.dataset.deleteAlbumId;

  if (editId) {
    startEditAlbum(editId);
    return;
  }

  if (deleteId) {
    try {
      await api(`/api/albums/${deleteId}`, { method: "DELETE" });
      setStatus("Album deleted.");
      if (editAlbumId === Number(deleteId)) resetAlbumForm();
      await Promise.all([loadAlbums(), loadTracks()]);
    } catch (error) {
      setStatus(error.message, true);
    }
  }
}

async function onTrackActionClick(event) {
  const addPlaylistTrackId = event.target.dataset.addPlaylistTrackId;
  const editId = event.target.dataset.editId;
  const deleteId = event.target.dataset.deleteId;

  if (addPlaylistTrackId) {
    const playlistId = playlistSelect.value;
    if (!playlistId) {
      setStatus("Select a playlist first.", true);
      return;
    }
    try {
      await api(`/api/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: Number(addPlaylistTrackId) }),
      });
      setStatus("Track added to playlist.");
      await loadSelectedPlaylistDetails();
    } catch (error) {
      setStatus(error.message, true);
    }
    return;
  }

  if (editId) {
    await startEditTrack(editId);
    return;
  }

  if (deleteId) {
    try {
      await api(`/api/tracks/${deleteId}`, { method: "DELETE" });
      setStatus("Track deleted.");
      if (editTrackId === Number(deleteId)) resetForm();
      await loadTracks();
    } catch (error) {
      setStatus(error.message, true);
    }
  }
}

async function onPlaylistTrackActionClick(event) {
  const removeTrackId = event.target.dataset.removePlaylistTrackId;
  const playlistId = playlistSelect.value;

  if (!removeTrackId || !playlistId) return;

  try {
    await api(`/api/playlists/${playlistId}/tracks/${removeTrackId}`, { method: "DELETE" });
    setStatus("Track removed from playlist.");
    await loadSelectedPlaylistDetails();
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function submitPlaylistForm(event) {
  event.preventDefault();
  const name = playlistNameInput.value.trim();
  if (!name) {
    setStatus("Playlist name is required.", true);
    return;
  }

  try {
    await api("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setStatus("Playlist created.");
    playlistFormEl.reset();
    await loadPlaylists();
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function deleteSelectedPlaylist() {
  const playlistId = playlistSelect.value;
  if (!playlistId) {
    setStatus("Select a playlist to delete.", true);
    return;
  }

  try {
    await api(`/api/playlists/${playlistId}`, { method: "DELETE" });
    setStatus("Playlist deleted.");
    await loadPlaylists();
    await loadSelectedPlaylistDetails();
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function init() {
  try {
    setStatus("Connecting...");
    await api("/api/health");
    await Promise.all([loadGenres(), loadArtists(), loadAlbums(), loadPlaylists()]);
    await loadAlbums();
    await loadTracks();
    await loadSelectedPlaylistDetails();
    setStatus("Connected");
  } catch (error) {
    setStatus(error.message, true);
  }
}

searchEl.addEventListener("input", debounce(loadTracks));
genreEl.addEventListener("change", loadTracks);
artistSelect.addEventListener("change", async () => {
  await loadAlbums(artistSelect.value);
});
artistFormEl.addEventListener("submit", submitArtistForm);
albumFormEl.addEventListener("submit", submitAlbumForm);
formEl.addEventListener("submit", submitTrackForm);
playlistFormEl.addEventListener("submit", submitPlaylistForm);
artistsEl.addEventListener("click", onArtistActionClick);
albumsEl.addEventListener("click", onAlbumActionClick);
tracksEl.addEventListener("click", onTrackActionClick);
playlistTracksEl.addEventListener("click", onPlaylistTrackActionClick);
playlistSelect.addEventListener("change", loadSelectedPlaylistDetails);
deletePlaylistBtn.addEventListener("click", deleteSelectedPlaylist);
artistCancelBtn.addEventListener("click", resetArtistForm);
albumCancelBtn.addEventListener("click", resetAlbumForm);
cancelBtn.addEventListener("click", resetForm);

init();
