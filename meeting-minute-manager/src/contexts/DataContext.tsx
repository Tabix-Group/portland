"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import * as api from "../lib/api"
import type { User, Project, Minute, MinuteTemplate, AuthUser, Tag, GlobalTopicGroup } from "@/types"

interface DataContextType {
  user: AuthUser | null
  users: User[]
  projects: Project[]
  minutes: Minute[]
  templates: MinuteTemplate[]
  tags: Tag[]
  globalTopicGroups: GlobalTopicGroup[]
  login: (user: AuthUser) => void
  logout: () => void
  addMinute: (minute: Omit<Minute, "id">) => void
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

// Helper function to safely ensure arrays
const safeArray = (arr: any): any[] => (Array.isArray(arr) ? arr : [])

// Helper function to safely ensure object with arrays
const safeArrayObject = (obj: any, arrayKeys: string[]) => {
  if (!obj || typeof obj !== "object") return obj

  const result = { ...obj }
  arrayKeys.forEach((key) => {
    result[key] = safeArray(obj[key])
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

  // Normalizes arrays in minute objects and topic groups
  function normalizeMinute(minute: any): Minute {
    if (!minute) return minute

    return {
      ...minute,
      topicGroups: safeArray(minute.topicGroups).map((g) => ({
        ...g,
        topicsDiscussed: safeArray(g.topicsDiscussed).map((t) => ({
          ...t,
          mentions: safeArray(t.mentions),
          projectIds: safeArray(t.projectIds),
        })),
        decisions: safeArray(g.decisions).map((d) => ({
          ...d,
          mentions: safeArray(d.mentions),
          projectIds: safeArray(d.projectIds),
        })),
        pendingTasks: safeArray(g.pendingTasks).map((t) => ({
          ...t,
          mentions: safeArray(t.mentions),
          projectIds: safeArray(t.projectIds),
        })),
      })),
      topicsDiscussed: safeArray(minute.topicsDiscussed).map((t) => ({
        ...t,
        mentions: safeArray(t.mentions),
        projectIds: safeArray(t.projectIds),
      })),
      decisions: safeArray(minute.decisions).map((d) => ({
        ...d,
        mentions: safeArray(d.mentions),
        projectIds: safeArray(d.projectIds),
      })),
      pendingTasks: safeArray(minute.pendingTasks).map((t) => ({
        ...t,
        mentions: safeArray(t.mentions),
        projectIds: safeArray(t.projectIds),
      })),
      participants: safeArray(minute.participants),
      occasionalParticipants: safeArray(minute.occasionalParticipants),
      informedPersons: safeArray(minute.informedPersons),
      tags: safeArray(minute.tags),
      files: safeArray(minute.files),
      projectIds: safeArray(minute.projectIds),
      participantIds: safeArray(minute.participantIds),
      externalMentions: safeArray(minute.externalMentions),
    }
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
        setMinutes(safeArray(minutesData).map(normalizeMinute))
        setTemplates(safeArray(templatesData))
        setTags(safeArray(tagsData))
        setGlobalTopicGroups(safeArray(topicGroupsData))
      } catch (error) {
        console.error("Error loading data:", error)
        // Set empty arrays as fallback
        setUsers([])
        setProjects([])
        setMinutes([])
        setTemplates([])
        setTags([])
        setGlobalTopicGroups([])
      }
    }

    loadData()
  }, [])

  const login = (user: AuthUser) => {
    setUser(user)
  }

  const logout = () => {
    setUser(null)
  }

  // MINUTES CRUD
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
      setMinutes((prev) => [...safeArray(prev), normalizeMinute(created)])
    } catch (error) {
      console.error("Error adding minute:", error)
      throw error
    }
  }

  const updateMinute = async (id: string, updates: Partial<Minute>) => {
    try {
      const updated = await api.updateMinute(id, updates)
      setMinutes((prev) => safeArray(prev).map((m) => (m.id === id ? normalizeMinute(updated) : m)))
    } catch (error) {
      console.error("Error updating minute:", error)
      throw error
    }
  }

  const deleteMinute = async (id: string) => {
    try {
      await api.deleteMinute(id)
      setMinutes((prev) => safeArray(prev).filter((m) => m.id !== id))
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
      setProjects((prev) => safeArray(prev).map((p) => (p.id === id ? updated : p)))
    } catch (error) {
      console.error("Error updating project:", error)
      throw error
    }
  }

  const deleteProject = async (id: string) => {
    try {
      await api.deleteProject(id)
      setProjects((prev) => safeArray(prev).filter((p) => p.id !== id))
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
      setUsers((prev) => safeArray(prev).map((u) => (u.id === id ? updated : u)))
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  }

  const deleteUser = async (id: string) => {
    try {
      await api.deleteUser(id)
      setUsers((prev) => safeArray(prev).filter((u) => u.id !== id))
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
      setTemplates((prev) => safeArray(prev).map((t) => (t.id === id ? updated : t)))
    } catch (error) {
      console.error("Error updating template:", error)
      throw error
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      await api.deleteTemplate(id)
      setTemplates((prev) => safeArray(prev).filter((t) => t.id !== id))
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
      setTags((prev) => safeArray(prev).map((t) => (t.id === id ? updated : t)))
    } catch (error) {
      console.error("Error updating tag:", error)
      throw error
    }
  }

  const deleteTag = async (id: string) => {
    try {
      await api.deleteTag(id)
      setTags((prev) => safeArray(prev).filter((t) => t.id !== id))
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
      setGlobalTopicGroups((prev) => safeArray(prev).map((g) => (g.id === id ? updated : g)))
    } catch (error) {
      console.error("Error updating global topic group:", error)
      throw error
    }
  }

  const deleteGlobalTopicGroup = async (id: string) => {
    try {
      await api.deleteGlobalTopicGroup(id)
      setGlobalTopicGroups((prev) => safeArray(prev).filter((g) => g.id !== id))
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
