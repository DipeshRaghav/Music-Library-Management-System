const tracks = [
  { title: "Tum Hi Ho", artist: "Arijit Singh" },
  { title: "Raabta", artist: "Shreya Ghoshal" },
  { title: "Doorie", artist: "Atif Aslam" },
  { title: "Jeene Laga Hoon", artist: "Arijit Singh" }
];

function loadTracks(data = tracks) {
  const list = document.getElementById("tracks");
  list.innerHTML = "";

  data.forEach(t => {
    const li = document.createElement("li");
    li.innerText = `${t.title} - ${t.artist}`;
    list.appendChild(li);
  });
}

function search() {
  const value = document.getElementById("search").value.toLowerCase();

  const filtered = tracks.filter(t =>
    t.title.toLowerCase().includes(value) ||
    t.artist.toLowerCase().includes(value)
  );

  loadTracks(filtered);
}

loadTracks();
