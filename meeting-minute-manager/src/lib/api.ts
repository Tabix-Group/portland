// API client for all entities

const BASE_URL = "https://portland-production.up.railway.app/"; // URL real del backend en Railway

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Users
export const getUsers = () => request("/users");
export const getUser = (id: string) => request(`/users/${id}`);
export const createUser = (data: any) => request("/users", { method: "POST", body: JSON.stringify(data) });
export const updateUser = (id: string, data: any) => request(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteUser = (id: string) => request(`/users/${id}`, { method: "DELETE" });

// Projects
export const getProjects = () => request("/projects");
export const getProject = (id: string) => request(`/projects/${id}`);
export const createProject = (data: any) => request("/projects", { method: "POST", body: JSON.stringify(data) });
export const updateProject = (id: string, data: any) => request(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProject = (id: string) => request(`/projects/${id}`, { method: "DELETE" });

// Minutes
export const getMinutes = () => request("/minutes");
export const getMinute = (id: string) => request(`/minutes/${id}`);
export const createMinute = (data: any) => request("/minutes", { method: "POST", body: JSON.stringify(data) });
export const updateMinute = (id: string, data: any) => request(`/minutes/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteMinute = (id: string) => request(`/minutes/${id}`, { method: "DELETE" });

// Tasks
export const getTasks = () => request("/tasks");
export const getTask = (id: string) => request(`/tasks/${id}`);
export const createTask = (data: any) => request("/tasks", { method: "POST", body: JSON.stringify(data) });
export const updateTask = (id: string, data: any) => request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteTask = (id: string) => request(`/tasks/${id}`, { method: "DELETE" });

// Attachments
export const getAttachments = () => request("/attachments");
export const getAttachment = (id: string) => request(`/attachments/${id}`);
export const createAttachment = (data: any) => request("/attachments", { method: "POST", body: JSON.stringify(data) });
export const updateAttachment = (id: string, data: any) => request(`/attachments/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteAttachment = (id: string) => request(`/attachments/${id}`, { method: "DELETE" });

// Tags
export const getTags = () => request("/tags");
export const getTag = (id: string) => request(`/tags/${id}`);
export const createTag = (data: any) => request("/tags", { method: "POST", body: JSON.stringify(data) });
export const updateTag = (id: string, data: any) => request(`/tags/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteTag = (id: string) => request(`/tags/${id}`, { method: "DELETE" });
