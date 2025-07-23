"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import * as api from "../lib/api"
import type { User, Project, Minute, MinuteTemplate, AuthUser, Tag, GlobalTopicGroup } from "@/types"

import type { Task } from "@/types"

interface DataContextType {
  user: AuthUser | null
  users: User[]
  projects: Project[]
  minutes: Minute[]
  templates: MinuteTemplate[]
  tags: Tag[]
  globalTopicGroups: GlobalTopicGroup[]
  minuteTasks: Record<string, Task[]>
  getTasksForMinute: (minuteId: string) => Task[]
  login: (user: AuthUser) => void
  logout: () => void
  addMinute: (minute: Omit<Minute, "id">) => Promise<Minute>
  updateMinute: (id: string, updates: Partial<Minute>) => void
  deleteMinute: (id: string) => void
  addProject: (project: Omit<Project, "id">) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  addUser: (user: Omit<User, "id">) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  addTemplate: (template: Omit<MinuteTemplate, "id">) => void
  updateTemplate: (id: string, updates: Partial<MinuteTemplate>) => void
  deleteTemplate: (id: string) => void
  addTag: (tag: Omit<Tag, "id">) => void
  updateTag: (id: string, updates: Partial<Tag>) => void
  deleteTag: (id: string) => void
  addGlobalTopicGroup: (group: Omit<GlobalTopicGroup, "id">) => void
  updateGlobalTopicGroup: (id: string, updates: Partial<GlobalTopicGroup>) => void
  deleteGlobalTopicGroup: (id: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Helper function to safely ensure arrays (global, single definition)
function safeArray<T>(arr: any): T[] {
  return Array.isArray(arr) ? (arr as T[]) : []
}

// Helper function to safely ensure object with arrays
function safeArrayObject(obj: any, arrayKeys: string[]) {
  if (!obj || typeof obj !== "object") return obj
  const result = { ...obj }
  arrayKeys.forEach((key) => {
    result[key] = safeArray(result[key])
  })
  return result
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [minutes, setMinutes] = useState<Minute[]>([])
  const [templates, setTemplates] = useState<MinuteTemplate[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [globalTopicGroups, setGlobalTopicGroups] = useState<GlobalTopicGroup[]>([])
  const [minuteTasks, setMinuteTasks] = useState<Record<string, Task[]>>({})

  // Normalizes arrays in minute objects and topic groups
  function normalizeMinute(minute: any): Minute {
    if (!minute) return minute
    // Recursivo y exhaustivo: asegura que todos los arrays y subarrays estén definidos
    const safe = (arr: any) => (Array.isArray(arr) ? arr : [])
    const norm = { ...minute }
    norm.topicGroups = safe(norm.topicGroups).map((g: any) => ({
      ...g,
      topicsDiscussed: safe(g.topicsDiscussed).map((t: any) => ({
        ...t,
        mentions: safe(t.mentions),
        projectIds: safe(t.projectIds),
      })),
      decisions: safe(g.decisions).map((d: any) => ({
        ...d,
        mentions: safe(d.mentions),
        projectIds: safe(d.projectIds),
      })),
      pendingTasks: safe(g.pendingTasks).map((t: any) => ({
        ...t,
        mentions: safe(t.mentions),
        projectIds: safe(t.projectIds),
      })),
    }))
    norm.topicsDiscussed = safe(norm.topicsDiscussed).map((t: any) => ({
      ...t,
      mentions: safe(t.mentions),
      projectIds: safe(t.projectIds),
    }))
    norm.decisions = safe(norm.decisions).map((d: any) => ({
      ...d,
      mentions: safe(d.mentions),
      projectIds: safe(d.projectIds),
    }))
    norm.pendingTasks = safe(norm.pendingTasks).map((t: any) => ({
      ...t,
      mentions: safe(t.mentions),
      projectIds: safe(t.projectIds),
    }))
    norm.participants = safe(norm.participants)
    norm.occasionalParticipants = safe(norm.occasionalParticipants)
    norm.informedPersons = safe(norm.informedPersons)
    norm.tags = safe(norm.tags)
    norm.files = safe(norm.files)
    norm.projectIds = safe(norm.projectIds)
    norm.participantIds = safe(norm.participantIds)
    norm.externalMentions = safe(norm.externalMentions)
    return norm
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, projectsData, minutesData, templatesData, tagsData, topicGroupsData] = await Promise.all([
          api.getUsers(),
          api.getProjects(),
          api.getMinutes(),
          api.getTemplates(),
          api.getTags(),
          api.getGlobalTopicGroups(),
        ])

        setUsers(safeArray(usersData))
        setProjects(safeArray(projectsData))
        const normalizedMinutes = safeArray(minutesData).map(normalizeMinute)
        setMinutes(normalizedMinutes)
        setTemplates(safeArray(templatesData))
        setTags(safeArray(tagsData))
        setGlobalTopicGroups(safeArray(topicGroupsData))

        // Fetch tasks for each minute and store in minuteTasks
        const tasksByMinute: Record<string, Task[]> = {}
        await Promise.all(
          normalizedMinutes.map(async (minute) => {
            try {
              const tasks = await api.getTasksByMinute(minute.id)
              tasksByMinute[minute.id] = safeArray(tasks)
            } catch (e) {
              tasksByMinute[minute.id] = []
            }
          })
        )
        setMinuteTasks(tasksByMinute)
      } catch (error) {
        console.error("Error loading data:", error)
        // Set empty arrays as fallback
        setUsers([])
        setProjects([])
        setMinutes([])
        setTemplates([])
        setTags([])
        setGlobalTopicGroups([])
        setMinuteTasks({})
      }
    }

    loadData()
  }, [])
  // Helper to get tasks for a minute
  const getTasksForMinute = (minuteId: string) => {
    return minuteTasks[minuteId] || []
  }

  const login = (user: AuthUser) => {
    setUser(user)
  }

  const logout = () => {
    setUser(null)
  }

  // MINUTES CRUD
  // Devuelve el minuto creado (con id)
  const addMinute = async (minute: Omit<Minute, "id">) => {
    try {
      // Ensure all arrays are properly initialized
      const safeMinute = {
        ...minute,
        topicGroups: safeArray(minute.topicGroups),
        topicsDiscussed: safeArray(minute.topicsDiscussed),
        decisions: safeArray(minute.decisions),
        pendingTasks: safeArray(minute.pendingTasks),
        participants: safeArray(minute.participants),
        occasionalParticipants: safeArray(minute.occasionalParticipants),
        informedPersons: safeArray(minute.informedPersons),
        tags: safeArray(minute.tags),
        files: safeArray(minute.files),
        projectIds: safeArray(minute.projectIds),
        participantIds: safeArray(minute.participantIds),
        externalMentions: safeArray(minute.externalMentions),
        createdBy: user?.id || "",
      }

      const created = await api.createMinute(safeMinute)
      setMinutes((prev) => [...safeArray<Minute>(prev), normalizeMinute(created)])
      return created;
    } catch (error) {
      console.error("Error adding minute:", error)
      throw error
    }
  }

  const updateMinute = async (id: string, updates: Partial<Minute>) => {
    try {
      const updated = await api.updateMinute(id, updates)
      setMinutes((prev) => safeArray<Minute>(prev).map((m) => (m.id === id ? normalizeMinute(updated) : m)))
    } catch (error) {
      console.error("Error updating minute:", error)
      throw error
    }
  }

  const deleteMinute = async (id: string) => {
    try {
      await api.deleteMinute(id)
      setMinutes((prev) => safeArray<Minute>(prev).filter((m) => m.id !== id))
    } catch (error) {
      console.error("Error deleting minute:", error)
      throw error
    }
  }

  // PROJECTS CRUD
  const addProject = async (project: Omit<Project, "id">) => {
    try {
      const created = await api.createProject(project)
      setProjects((prev) => [...safeArray(prev), created])
    } catch (error) {
      console.error("Error adding project:", error)
      throw error
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updated = await api.updateProject(id, updates)
      setProjects((prev) => safeArray<Project>(prev).map((p) => (p.id === id ? updated : p)))
    } catch (error) {
      console.error("Error updating project:", error)
      throw error
    }
  }

  const deleteProject = async (id: string) => {
    try {
      await api.deleteProject(id)
      setProjects((prev) => safeArray<Project>(prev).filter((p) => p.id !== id))
    } catch (error) {
      console.error("Error deleting project:", error)
      throw error
    }
  }

  // USERS CRUD
  const addUser = async (user: Omit<User, "id">) => {
    try {
      const created = await api.createUser(user)
      setUsers((prev) => [...safeArray(prev), created])
    } catch (error) {
      console.error("Error adding user:", error)
      throw error
    }
  }

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const updated = await api.updateUser(id, updates)
      setUsers((prev) => safeArray<User>(prev).map((u) => (u.id === id ? updated : u)))
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  }

  const deleteUser = async (id: string) => {
    try {
      await api.deleteUser(id)
      setUsers((prev) => safeArray<User>(prev).filter((u) => u.id !== id))
    } catch (error) {
      console.error("Error deleting user:", error)
      throw error
    }
  }

  // TEMPLATES CRUD
  const addTemplate = async (template: Omit<MinuteTemplate, "id">) => {
    try {
      const created = await api.createTemplate(template)
      setTemplates((prev) => [...safeArray(prev), created])
    } catch (error) {
      console.error("Error adding template:", error)
      throw error
    }
  }

  const updateTemplate = async (id: string, updates: Partial<MinuteTemplate>) => {
    try {
      const updated = await api.updateTemplate(id, updates)
      setTemplates((prev) => safeArray<MinuteTemplate>(prev).map((t) => (t.id === id ? updated : t)))
    } catch (error) {
      console.error("Error updating template:", error)
      throw error
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      await api.deleteTemplate(id)
      setTemplates((prev) => safeArray<MinuteTemplate>(prev).filter((t) => t.id !== id))
    } catch (error) {
      console.error("Error deleting template:", error)
      throw error
    }
  }

  // TAGS CRUD
  const addTag = async (tag: Omit<Tag, "id">) => {
    try {
      const created = await api.createTag(tag)
      setTags((prev) => [...safeArray(prev), created])
    } catch (error) {
      console.error("Error adding tag:", error)
      throw error
    }
  }

  const updateTag = async (id: string, updates: Partial<Tag>) => {
    try {
      const updated = await api.updateTag(id, updates)
      setTags((prev) => safeArray<Tag>(prev).map((t) => (t.id === id ? updated : t)))
    } catch (error) {
      console.error("Error updating tag:", error)
      throw error
    }
  }

  const deleteTag = async (id: string) => {
    try {
      await api.deleteTag(id)
      setTags((prev) => safeArray<Tag>(prev).filter((t) => t.id !== id))
    } catch (error) {
      console.error("Error deleting tag:", error)
      throw error
    }
  }

  // GLOBAL TOPIC GROUPS CRUD
  const addGlobalTopicGroup = async (group: Omit<GlobalTopicGroup, "id">) => {
    try {
      const created = await api.createGlobalTopicGroup({ ...group, createdBy: user?.id || "" })
      setGlobalTopicGroups((prev) => [...safeArray(prev), created])
    } catch (error) {
      console.error("Error adding global topic group:", error)
      throw error
    }
  }

  const updateGlobalTopicGroup = async (id: string, updates: Partial<GlobalTopicGroup>) => {
    try {
      const updated = await api.updateGlobalTopicGroup(id, updates)
      setGlobalTopicGroups((prev) => safeArray<GlobalTopicGroup>(prev).map((g) => (g.id === id ? updated : g)))
    } catch (error) {
      console.error("Error updating global topic group:", error)
      throw error
    }
  }

  const deleteGlobalTopicGroup = async (id: string) => {
    try {
      await api.deleteGlobalTopicGroup(id)
      setGlobalTopicGroups((prev) => safeArray<GlobalTopicGroup>(prev).filter((g) => g.id !== id))
    } catch (error) {
      console.error("Error deleting global topic group:", error)
      throw error
    }
  }

  const value: DataContextType = {
    user,
    users,
    projects,
    minutes,
    templates,
    tags,
    globalTopicGroups,
    minuteTasks,
    getTasksForMinute,
    login,
    logout,
    addMinute,
    updateMinute,
    deleteMinute,
    addProject,
    updateProject,
    deleteProject,
    addUser,
    updateUser,
    deleteUser,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addTag,
    updateTag,
    deleteTag,
    addGlobalTopicGroup,
    updateGlobalTopicGroup,
    deleteGlobalTopicGroup,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
