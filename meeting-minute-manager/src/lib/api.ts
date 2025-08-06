// Obtener tareas por minuta
export const getTasksByMinute = (minuteId: string) => request(`/minutes/${minuteId}/tasks`);
// API client for all entities

export const BASE_URL = "https://portland-be-production.up.railway.app/api"; // URL real del backend en Railway

async function request(path: string, options: RequestInit = {}) {
  // Obtener el token JWT del localStorage (o de contexto si lo prefieres)
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Permitir que options.headers sobrescriba si es necesario
  const mergedHeaders = { ...headers, ...(options.headers || {}) };
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: mergedHeaders,
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


// Tags
export const getTags = () => request("/tags");
export const getTag = (id: string) => request(`/tags/${id}`);
export const createTag = (data: any) => request("/tags", { method: "POST", body: JSON.stringify(data) });
export const updateTag = (id: string, data: any) => request(`/tags/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteTag = (id: string) => request(`/tags/${id}`, { method: "DELETE" });


// Templates
export const getTemplates = () => request("/templates");
export const getTemplate = (id: string) => request(`/templates/${id}`);
export const createTemplate = (data: any) => request("/templates", { method: "POST", body: JSON.stringify(data) });
export const updateTemplate = (id: string, data: any) => request(`/templates/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteTemplate = (id: string) => request(`/templates/${id}`, { method: "DELETE" });

// Global Topic Groups
export const getGlobalTopicGroups = () => request("/globalTopicGroups");
export const getGlobalTopicGroup = (id: string) => request(`/globalTopicGroups/${id}`);
export const createGlobalTopicGroup = (data: any) => request("/globalTopicGroups", { method: "POST", body: JSON.stringify(data) });
export const updateGlobalTopicGroup = (id: string, data: any) => request(`/globalTopicGroups/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteGlobalTopicGroup = (id: string) => request(`/globalTopicGroups/${id}`, { method: "DELETE" });
