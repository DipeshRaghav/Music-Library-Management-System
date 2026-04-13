export function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function savePlaylist(data) {
  localStorage.setItem("playlist", JSON.stringify(data));
}

export function loadPlaylist() {
  return JSON.parse(localStorage.getItem("playlist")) || [];
}