"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, LogOut, Loader2, Folder, ArrowRight } from "lucide-react";
import axios from "axios";

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectPrompt, setNewProjectPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchProjects();
    }
  }, [status, router]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/projects");
      setProjects(response.data.projects);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCreating(true);

    try {
      await axios.post("/api/projects", {
        name: newProjectName,
        prompt: newProjectPrompt
      });

      localStorage.setItem("prompt", newProjectPrompt);

      router.push("/builder");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create project");
      setIsCreating(false);
    }
  };

  const openProject = (project: Project) => {
    localStorage.setItem("prompt", project.description);
    router.push("/builder");
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Vision Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400 text-sm hidden md:block">
              Hello, {session?.user?.name.split(" ")[0]}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Projects</h1>
            <p className="text-zinc-400">
              Manage your generated applications ({projects.length}/2 projects used)
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={projects.length >= 2}
            className={`
              flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer
              ${projects.length >= 2 
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700" 
                : "bg-white text-black hover:bg-zinc-200 border border-transparent"}
            `}
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id}
              onClick={() => openProject(project)}
              className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 text-blue-400">
                <Folder className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
              <p className="text-zinc-400 text-sm line-clamp-2 mb-4">
                {project.description}
              </p>
              <div className="text-xs text-zinc-500">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
              <Folder className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg">No projects yet</p>
              <p className="text-sm">Create your first project to get started</p>
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-xl font-bold mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Awesome App"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">What do you want to build?</label>
                <textarea
                  required
                  value={newProjectPrompt}
                  onChange={(e) => setNewProjectPrompt(e.target.value)}
                  placeholder="A todo list app with React and Tailwind..."
                  className="w-full h-32 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white resize-none focus:outline-none focus:border-blue-500"
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}