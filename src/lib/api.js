const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const { headers: customHeaders = {}, ...restOptions } = options;
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...customHeaders,
      },
      ...restOptions,
    });
  } catch {
    throw new Error("Cannot reach backend server. Start API server and MongoDB.");
  }

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    const detail = data.message || text || `HTTP ${response.status}`;
    throw new Error(detail);
  }

  return data;
}

export function register(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getNotes(token) {
  return request("/notes", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createNote(token, payload) {
  return request("/notes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateNote(token, noteId, payload) {
  return request(`/notes/${noteId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function deleteNote(token, noteId) {
  return request(`/notes/${noteId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function runCode(token, payload) {
  return request("/run", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
