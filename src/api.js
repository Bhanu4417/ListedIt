const API_BASE = '/api';

export async function searchTracks(query) {
  const res = await fetch(`${API_BASE}/search?s=${encodeURIComponent(query)}`);
  return res.json();
}

export async function searchArtists(query) {
  const res = await fetch(`${API_BASE}/search?a=${encodeURIComponent(query)}`);
  return res.json();
}

export async function searchAlbums(query) {
  const res = await fetch(`${API_BASE}/search?al=${encodeURIComponent(query)}`);
  return res.json();
}

export async function getTrackInfo(id) {
  const res = await fetch(`${API_BASE}/info?id=${id}`);
  return res.json();
}

export async function getTrackStream(id, quality = 'HIGH') {
  const res = await fetch(`${API_BASE}/track?id=${id}&quality=${quality}`);
  return res.json();
}

export async function getAlbum(id) {
  const res = await fetch(`${API_BASE}/album?id=${id}`);
  return res.json();
}

export async function getArtist(id) {
  const res = await fetch(`${API_BASE}/artist?id=${id}`);
  return res.json();
}

export async function getArtistFull(id) {
  const res = await fetch(`${API_BASE}/artist?f=${id}`);
  return res.json();
}

export async function getCover(id) {
  const res = await fetch(`${API_BASE}/cover?id=${id}`);
  return res.json();
}

export async function getCoverByQuery(query) {
  const res = await fetch(`${API_BASE}/cover?q=${encodeURIComponent(query)}`);
  return res.json();
}

export async function getRecommendations(id) {
  const res = await fetch(`${API_BASE}/recommendations?id=${id}`);
  return res.json();
}

export async function getLyrics(id) {
  const res = await fetch(`${API_BASE}/lyrics?id=${id}`);
  return res.json();
}

export async function getMix(id) {
  const res = await fetch(`${API_BASE}/mix?id=${id}`);
  return res.json();
}

// Helpers
export function getCoverUrl(coverId, size = 640) {
  if (!coverId) return null;
  const parts = coverId.replace(/-/g, '/');
  return `https://resources.tidal.com/images/${parts}/${size}x${size}.jpg`;
}

export function getArtistPictureUrl(pictureId, size = 750) {
  if (!pictureId) return null;
  const parts = pictureId.replace(/-/g, '/');
  return `https://resources.tidal.com/images/${parts}/${size}x${size}.jpg`;
}

export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function decodeManifest(manifestBase64) {
  try {
    const decoded = atob(manifestBase64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
