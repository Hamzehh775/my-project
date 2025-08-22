const BASE = import.meta.env.VITE_API_URL;

async function http(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  listUsers: () => http('/users/with-counts'),
  addUser: (data) => http('/users', { method: 'POST', body: JSON.stringify(data) }),
  deleteUser: (id) => http(`/users/${id}`, { method: 'DELETE' }),

  listPostsEnriched: () => http('/posts'),
  listUserPosts: (userId) => http(`/posts/user/${userId}`),
  addPost: (userId, data) => http(`/posts/user/${userId}`, { method: 'POST', body: JSON.stringify(data) }),
  deletePost: (id) => http(`/posts/${id}`, { method: 'DELETE' }),
};
