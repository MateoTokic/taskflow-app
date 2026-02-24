import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { api } from "../api/axios";
import axios from "axios";

type Project={
    id: string,
    name: string,
    description?:string | null;
};

type TaskItem={
    id: string,
    title: string,
    description?: string | null;
    isCompleted: boolean,
    projectId:string;
};

export default function Dashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [tasks, setTasks] = useState<TaskItem[]>([]);

    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [error, setError] = useState("");

    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [showProjectForm, setShowProjectForm] = useState(false);

    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const isLoggedIn = Boolean(token);
    const [menuOpen, setMenuOpen] = useState(false);

    const goLogin = () => navigate("/login");
    const goRegister = () => navigate("/register");

    const logout = () => {
        localStorage.removeItem("token");
        setMenuOpen(false);
        setProjects([]);
        setSelectedProjectId(null);
        setTasks([]);
    };

    const selectedProject = useMemo(
        () => projects.find((p) => p.id === selectedProjectId) || null,
        [projects, selectedProjectId]
    );

    useEffect(() => {
        if (isLoggedIn) {
            loadProjects();
        } else {
            setProjects([]);
            setSelectedProjectId(null);
            setTasks([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn) {
            setTasks([]);
            return;
        }
        if (selectedProjectId) loadTasks(selectedProjectId);
        else setTasks([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProjectId, isLoggedIn]);

    const loadProjects = async () => {
        setError("");
        setLoadingProjects(true);
        try {
            const res = await api.get<Project[]>(`/projects`);
            setProjects(res.data);
            setSelectedProjectId((prev) => prev ?? (res.data.length ? res.data[0].id : null));
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError((err?.response?.data as { message?: string })?.message || "Failed to load projects");
            } else {
                setError("An unexpected error occured");
            }
        } finally {
            setLoadingProjects(false);
        }
    };

    const loadTasks = async (projectId: string) => {
        setError("");
        setLoadingTasks(true);
        try {
            const res = await api.get<TaskItem[]>(`/projects/${projectId}/tasks`);
            setTasks(res.data);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError((err?.response?.data as { message?: string })?.message || "Failed to load tasks");
            } else {
                setError("An unexpected error occured");
            }
        } finally {
            setLoadingTasks(false);
        }
    };

    const startCreateProject = () => {
        setEditingProjectId(null);
        setProjectName("");
        setProjectDescription("");
        setShowProjectForm(true);
    };

    const startEditProject = (p: Project) => {
        setEditingProjectId(p.id);
        setProjectName(p.name);
        setProjectDescription(p.description ?? "");
        setShowProjectForm(true);
    };

    const submitProject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!isLoggedIn) {
            setError("Please log in to manage projects and tasks.");
            return;
        }       

        if (!projectName.trim()) {
            setError("Project name is required");
            return;
        }
        
        try {
            if (editingProjectId) {
                await api.put(`/projects/${editingProjectId}`, {
                    name: projectName.trim(),
                    description: projectDescription.trim() || null,
                });
            } else {
                await api.post(`/projects`, {
                    name: projectName.trim(),
                    description: projectDescription.trim() || null,
                });
            }

            await loadProjects();

            setShowProjectForm(false);
            setEditingProjectId(null);
            setProjectName("");
            setProjectDescription("");
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError((err?.response?.data as { message?: string })?.message || "Failed to save project");
            } else {
                setError("An unexpected error occured");
            }
        }
    };

    const deleteProject = async (projectId: string) => {
        if (!isLoggedIn) {
            setError("Please log in to manage projects and tasks.");
            return;
        }

        if (!confirm("Delete this project? This will delete its tasks too.")) return;
        setError("");

        try {
            await api.delete(`/projects/${projectId}`);
            const remaining = projects.filter((p) => p.id !== projectId);
            setProjects(remaining);

            if (selectedProjectId === projectId) {
                setSelectedProjectId(remaining.length ? remaining[0].id : null);
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError((err?.response?.data as { message?: string })?.message || "Failed to delete project");
            } else {
                setError("An unexpected error occured");
            }
        }
    };

    const submitTask = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!isLoggedIn) {
            setError("Please log in to manage projects and tasks.");
            return;
        }

        if (!selectedProjectId) {
            setError("Selecte a project first");
            return;
        }
        if (!taskTitle.trim()) {
            setError("Task title is required");
            return;
        }

        try {
            await api.post(`/tasks`, {
                title: taskTitle.trim(),
                description: taskDescription.trim() || null,
                projectId: selectedProjectId,
            });

            setTaskTitle("");
            setTaskDescription("");
            await loadTasks(selectedProjectId);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError((err?.response?.data as { message?: string })?.message || "Failed to create task");
            } else {
                setError("An unexpected error occured");
            }
        }
    };

    const toggelTask = async (taskId: string) => {
        if (!selectedProjectId) return;
        setError("");

        if (!isLoggedIn) {
            setError("Please log in to manage projects and tasks.");
            return;
        }

        setTasks((prev) => 
            prev.map((t) => (t.id === taskId ? {...t, isCompleted: !t.isCompleted } : t))
        );

        try {
            await api.put(`/tasks/${taskId}`);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError((err.response?.data as { message?: string })?.message || "Failed to update task");
                await loadTasks(selectedProjectId);
            } else {
                setError("An unexpected error occured");
            }
        }
    };

    return (
        <div className="page">
            <header className="header">
                <div>
                    <div className="title">TaskFlow</div>
                    <div className="subtitle">Projects & Tasks</div>
                </div>
                <div className="header-actions">
                    <button
                        className="btn-secondary"
                        onClick={() => isLoggedIn && loadProjects()}
                        disabled={!isLoggedIn || loadingProjects}
                        type="button"
                    >
                        Refresh
                    </button>

                    <div className="user-menu">
                        <button
                            className="user-icon-btn"
                            onClick={() => setMenuOpen((v) => !v)}
                            aria-label="User menu"
                            type="button"
                        >
                            👤
                        </button>

                        {menuOpen && (
                            <div className="user-dropdown">
                                {!isLoggedIn ? (
                                    <>
                                        <button className="dropdown-item" type="button" onClick={goLogin}>
                                            Login
                                        </button>
                                        <button className="dropdown-item" type="button" onClick={goRegister}>
                                                Register
                                        </button>
                                    </>
                                ) : (
                                    <button className="dropdown-item" type="button" onClick={logout}>
                                        Logout
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {!isLoggedIn && (
                <div className="info">
                    You are not logged in. Use the 👤 menu to login or register to see your projects and tasks.
                </div>
            )}

            {error && <div className="error">{error}</div>}

            <div className="layout">
                <aside className="sidebar">
                    <div className="section-header">
                        <div className="section-title">Projects</div>
                        <button className="btn-small" onClick={startCreateProject} disabled={!isLoggedIn} type="button">
                            + New
                        </button>
                    </div>

                    {loadingProjects ? (
                        <div className="muted">Loading projects...</div>
                    ) : !isLoggedIn ? (
                        <div className="muted">Login to view and manage your projects.</div>
                    ) : projects.length === 0 ? (
                        <div className="muted">No projects yet. Create one.</div>
                    ) : (
                        <div className="project-list">
                            {projects.map((p) => {
                                const active = p.id === selectedProjectId;

                                return (
                                    <div
                                        key={p.id}
                                        className={`project-item ${active ? "active" : ""}`}
                                    >
                                        <div
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setSelectedProjectId(p.id)}
                                        >
                                            <div className="project-name">{p.name}</div>
                                        {p.description && (
                                            <div className="project-desc">{p.description}</div>
                                        )}
                                        </div>

                                        <button
                                            className="btn-small"
                                            onClick={() => startEditProject(p)}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="divider" />

                    {showProjectForm && (
                        <>
                            <div className="divider" />

                            <div className="section-title">
                            {editingProjectId ? "Edit Project" : "Create Project"}
                            </div>

                            <form onSubmit={submitProject} className="form">
                            <label className="label" htmlFor="project-name">
                                Name
                            </label>
                            <input
                                id="project-name"
                                className="input"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Project Name"
                            />

                            <label className="label" htmlFor="project-desc">
                                Description (Optional)
                            </label>
                            <input
                                id="project-desc"
                                className="input"
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                placeholder="Short description"
                            />

                            <button className="btn-primary" type="submit">
                                {editingProjectId ? "Update Project" : "Create Project"}
                            </button>

                            <button
                                type="button"
                                className="btn-secondary-full"
                                onClick={() => setShowProjectForm(false)}
                            >
                                Cancel
                            </button>
                            </form>
                        </>
                        )}

                    {selectedProject && (
                        <button 
                            className="btn-danger-full"
                            onClick={() => deleteProject(selectedProject.id)}
                        >
                            Delete selected project
                        </button>
                    )}
                </aside>

                <main className="main">
                    <div className="section-header">
                        <div>
                            <div className="section-title">Tasks</div>
                            <div className="muted">
                                {selectedProject ? `Project: ${selectedProject.name}` : "Select a project"}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submitTask} className="task-form">
                        <input
                            className="input"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="New task title"
                            disabled={!isLoggedIn || !selectedProjectId}
                        />
                        <input 
                            className="input"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            placeholder="Description (optional)"
                            disabled={!isLoggedIn || !selectedProjectId}
                        />
                        <button className="btn-primary" type="submit" disabled={!isLoggedIn || !selectedProjectId}>
                            Add task
                        </button>
                    </form>

                    {loadingTasks ? (
                        <div className="muted">Loading tasks...</div>
                    ) : !selectedProjectId ? (
                        <div className="muted">Select a project to view tasks.</div>
                    ) : tasks.length === 0 ? (
                        <div className="muted">No tasks yet. Add your first one.</div>
                    ) : (
                        <div className="task-list">
                            {tasks.map((t) => (
                                <div key={t.id} className="task-row">
                                    <label className="checkbox-row">
                                        <input 
                                            type="checkbox"
                                            checked={t.isCompleted}
                                            onChange={() => toggelTask(t.id)}
                                        />
                                        <span
                                            className={`task-title ${t.isCompleted ? "completed" : ""}`}
                                        >
                                            {t.title}
                                        </span>    
                                    </label>
                                    {t.description ? <div className="task-desc">{t.description}</div> : null}
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}