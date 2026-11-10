"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, MessageSquare, User, Settings, Upload, Lock, 
  FolderOpen, GraduationCap, Palette, FileText, Save, Plus,
  Edit2, Trash2, X, Check, ChevronDown, ChevronUp, Image as ImageIcon, Video,
  Eye, EyeOff, Code2, Globe, Handshake, Phone
} from "lucide-react";
import { getAllSessions, clearAllSessions, deleteSession, type ChatSession } from "@/lib/chatLogger";
import { UPLOAD_LIMITS, formatLimit } from "@/lib/uploadLimits";
import type { AdminSettings, Project, Education } from "@/types/admin";
import en from "@/locales/en";
import { projects as builtinProjectsData } from "@/data/projects";
import { educationData as builtinEducationData } from "@/data/education";
import { SkillsTab, CommunicationTab, LanguagesTab, WorkTogetherTab, ContactChannelsTab } from "./sections";

// Effective English values the public site shows when no admin override exists.
// Used to prefill admin forms so editing starts from what visitors see.
const BUILTIN_SITE_CONTENT = {
  hero: { ...en.hero },
  about: {
    sectionLabel: en.about.sectionLabel,
    sectionTitle: en.about.sectionTitle,
    bio1: "I am a Liberian Junior Software Engineer currently based in Kigali, Rwanda. I am passionate about building scalable software solutions and solving real-world problems through technology.",
    bio2: en.about.bio2,
    bio3: "I specialize in full-stack development, working across the entire stack with React.js on the frontend, Java and Spring Boot on the backend, and MySQL and PostgreSQL for data management. I am committed to writing clean, maintainable code that delivers real value.",
    bio4: en.about.bio4,
    tags: en.about.tags,
    getInTouch: en.about.getInTouch,
    downloadCV: en.about.downloadCV,
    image: "",
    highlights: en.about.highlights,
  },
  contact: {
    email: "quelemineisaacl@gmail.com",
    phone: "+250 793 148 624",
    address: "Kigali, Rwanda",
  },
  social: {
    github: "https://github.com/quelemine",
    linkedin: "https://www.linkedin.com/in/isaac-l-quelemine-873633132",
    twitter: "https://x.com/",
  },
};

const BUILTIN_PROFILE = {
  name: "Isaac L. Quelemine",
  title: "Quelemine",
  subtitle: "Junior Software Engineer · Full Stack Developer",
  description: "Building modern web applications and software solutions with strong foundations in frontend development, backend engineering, databases, and software architecture.",
  location: "Kigali, Rwanda",
  availableForWork: true,
  profileImage: "/images/profile/isaac-profile.jpg",
};

const BUILTIN_PROJECTS = builtinProjectsData.map((p) => ({ ...p, finished: true })) as unknown as Project[];
const BUILTIN_EDUCATION = builtinEducationData as unknown as Education[];

// Deep-merge admin values over built-in defaults: non-empty admin strings,
// non-empty arrays and objects win; everything else falls back to built-in.
function mergeEffective<T>(admin: any, builtin: T): T {
  if (admin === undefined || admin === null) return builtin;
  if (typeof admin === "string") return (admin.trim() ? admin : builtin) as T;
  if (Array.isArray(admin)) return (admin.length ? admin : builtin) as T;
  if (typeof admin === "object" && builtin !== null && typeof builtin === "object" && !Array.isArray(builtin)) {
    const out: any = { ...(builtin as any) };
    for (const key of Object.keys(admin)) {
      out[key] = mergeEffective(admin[key], (builtin as any)?.[key]);
    }
    return out;
  }
  return admin as T;
}

type TabType = 'dashboard' | 'profile' | 'cv' | 'videos' | 'password' | 'projects' | 'education' | 'colors' | 'content' | 'logo' | 'typography' | 'chatlogs' | 'skills' | 'communication' | 'languages' | 'worktogether' | 'channels';

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [usernameInput, setUsernameInput] = useState("");
  const [pwInput, setPwInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState<"none" | "lookup" | "answer" | "reset">("none");
  const [forgotUser, setForgotUser] = useState("");
  const [forgotQuestion, setForgotQuestion] = useState("");
  const [forgotAnswer, setForgotAnswer] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [forgotNewPw, setForgotNewPw] = useState("");
  const [forgotNewPw2, setForgotNewPw2] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loginLogo, setLoginLogo] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [settingsError, setSettingsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notificationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Check for an existing session so refresh keeps you logged in
    fetch('/api/admin/session')
      .then(res => res.json())
      .then(data => { if (data.authed) setAuthed(true); })
      .catch(() => {})
      .finally(() => setChecking(false));

    // Fetch login logo on component mount (before authentication)
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.loginLogo?.url) {
          setLoginLogo(data.loginLogo.url);
        }
      })
      .catch(err => console.error('Failed to fetch login logo:', err));
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadSettings();
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    if (activeTab === 'chatlogs') {
      setSessions(getAllSessions());
    }
  }, [authed, activeTab]);

  const loadSettings = async (): Promise<boolean> => {
    try {
      const response = await adminFetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setSettingsError(false);
        // Update login logo when settings are loaded
        if (data.loginLogo?.url) {
          setLoginLogo(data.loginLogo.url);
        }
        return true;
      }
      setSettingsError(true);
      return false;
    } catch (error) {
      setSettingsError(true);
      showNotification('error', 'Failed to load settings');
      return false;
    }
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: pwInput })
      });

      if (response.ok) {
        setAuthed(true);
        setPwInput("");
      } else {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          setLoginError('Invalid username or password.');
        } else if (response.status === 429) {
          setLoginError('Too many attempts. Please try again later.');
        } else {
          setLoginError(data.error || 'Server error. Please try again.');
        }
        setPwInput("");
      }
    } catch (error) {
      setLoginError('Server error. Please try again.');
      setPwInput("");
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (error) {
      // Ignore errors; clear local state regardless
    }
    setAuthed(false);
  };

  const adminFetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const response = await fetch(input, init);
    if (response.status === 401) {
      setAuthed(false);
      showNotification('error', 'Session expired, please sign in again');
    }
    return response;
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current);
    }
    notificationTimer.current = setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveSettings = async (updates: Partial<AdminSettings>): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSettings(data);
        showNotification('success', 'Settings saved successfully');
        return true;
      }
      showNotification('error', data.error || 'Failed to save settings');
      return false;
    } catch (error) {
      showNotification('error', 'Failed to save settings');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'profile' | 'cv' | 'about' | 'logo' | 'loginLogo' | 'video'): Promise<boolean> => {
    const limit = type === 'cv' ? UPLOAD_LIMITS.pdf : type === 'video' ? UPLOAD_LIMITS.video : UPLOAD_LIMITS.image;
    if (file.size > limit) {
      showNotification('error', `File must be ${formatLimit(limit)} or smaller`);
      return false;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await adminFetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        showNotification('error', data.error || 'Failed to upload file');
        return false;
      }

      let saved = true;
      if (type === 'profile') {
        saved = await handleSaveSettings({ profile: { ...settings!.profile, profileImage: data.url } });
      } else if (type === 'cv') {
        saved = await handleSaveSettings({ cv: { ...settings!.cv, url: data.url, filename: data.filename, uploadDate: new Date().toISOString() } });
      } else if (type === 'about') {
        saved = await handleSaveSettings({ siteContent: { ...settings!.siteContent, about: { ...settings!.siteContent.about, image: data.url } } });
      } else if (type === 'logo') {
        saved = await handleSaveSettings({ logo: { ...settings!.logo, url: data.url } });
      } else if (type === 'loginLogo') {
        saved = await handleSaveSettings({ loginLogo: { ...settings!.loginLogo, url: data.url } });
      } else if (type === 'video') {
        saved = await handleSaveSettings({ featuredVideo: { ...(settings!.featuredVideo ?? {}), url: data.url, filename: data.filename } });
      }

      if (!saved) {
        // handleSaveSettings already showed the server's error message
        return false;
      }

      // Reload settings to get the updated data
      await loadSettings();
      showNotification('success', 'File uploaded successfully');
      return true;
    } catch (error) {
      showNotification('error', 'Failed to upload file');
      return false;
    }
  };

  // Uploads an image asset (e.g. project image) and returns its public URL
  const handleAssetUpload = async (file: File): Promise<string | null> => {
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      showNotification('error', 'Only JPG, JPEG, PNG and WEBP images are allowed');
      return null;
    }
    if (file.size > UPLOAD_LIMITS.image) {
      showNotification('error', `Image must be ${formatLimit(UPLOAD_LIMITS.image)} or smaller`);
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'project');

    try {
      const response = await adminFetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        showNotification('error', data.error || 'Failed to upload image');
        return null;
      }
      return data.url as string;
    } catch (error) {
      showNotification('error', 'Failed to upload image');
      return null;
    }
  };

  // Deletes an uploaded /api/files/<id> asset; the server refuses if still referenced
  const cleanupUploadedImage = (url?: string) => {
    if (!url || !url.startsWith('/api/files/')) return;
    const id = url.slice('/api/files/'.length);
    adminFetch(`/api/admin/files?id=${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string, newUsername: string, security?: { question?: string; answer?: string }): Promise<boolean> => {
    try {
      const response = await adminFetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, newUsername, ...(security?.question !== undefined ? { securityQuestion: security.question, securityAnswer: security.answer } : {}) })
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        showNotification('success', 'Credentials updated successfully');
        return true;
      }
      showNotification('error', data.error || 'Failed to update credentials');
      return false;
    } catch (error) {
      showNotification('error', 'Failed to update credentials');
      return false;
    }
  };

  const handleProjectSave = async (project: Project): Promise<boolean> => {
    if (!project.title?.trim() || !project.description?.trim()) {
      showNotification('error', 'Title and description are required');
      return false;
    }
    try {
      const method = editingProject ? 'PUT' : 'POST';
      const previous = editingProject
        ? settings?.projects?.find((p: Project) => p.id === project.id)
        : null;

      const response = await adminFetch('/api/admin/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        // Clean up the replaced image if it is an uploaded file no longer referenced
        if (previous?.image && previous.image !== project.image) {
          cleanupUploadedImage(previous.image);
        }
        await loadSettings();
        setEditingProject(null);
        showNotification('success', 'Project saved successfully');
        return true;
      }
      showNotification('error', data.error || 'Failed to save project');
      return false;
    } catch (error) {
      showNotification('error', 'Failed to save project');
      return false;
    }
  };

  const handleProjectDelete = async (id: number) => {
    if (!confirm('Delete this project?')) return;
    const doomed = settings?.projects?.find((p: Project) => p.id === id);
    try {
      const response = await adminFetch(`/api/admin/projects?id=${id}`, {
        method: 'DELETE'
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        cleanupUploadedImage(doomed?.image);
        await loadSettings();
        showNotification('success', 'Project deleted successfully');
      } else {
        showNotification('error', data.error || 'Failed to delete project');
      }
    } catch (error) {
      showNotification('error', 'Failed to delete project');
    }
  };

  const handleEducationSave = async (education: Education): Promise<boolean> => {
    if (!education.degree?.trim() || !education.institution?.trim()) {
      showNotification('error', 'Degree and institution are required');
      return false;
    }
    try {
      const method = editingEducation ? 'PUT' : 'POST';

      const response = await adminFetch('/api/admin/education', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(education)
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        await loadSettings();
        setEditingEducation(null);
        showNotification('success', 'Education saved successfully');
        return true;
      }
      showNotification('error', data.error || 'Failed to save education');
      return false;
    } catch (error) {
      showNotification('error', 'Failed to save education');
      return false;
    }
  };

  const handleEducationDelete = async (id: number) => {
    if (!confirm('Delete this education entry?')) return;
    try {
      const response = await adminFetch(`/api/admin/education?id=${id}`, {
        method: 'DELETE'
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        await loadSettings();
        showNotification('success', 'Education deleted successfully');
      } else {
        showNotification('error', data.error || 'Failed to delete education');
      }
    } catch (error) {
      showNotification('error', 'Failed to delete education');
    }
  };

  const handleClearAllLogs = () => {
    if (confirm('Are you sure you want to clear all chat logs? This action cannot be undone.')) {
      clearAllSessions();
      setSessions([]);
      showNotification('success', 'All chat logs cleared');
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this chat session?')) {
      deleteSession(sessionId);
      setSessions(getAllSessions());
      showNotification('success', 'Chat session deleted');
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0B1F3A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0B1F3A] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-[#0f2847] border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            {loginLogo ? (
              <img src={loginLogo} alt="Login Logo" className="w-20 h-20 mx-auto mb-4 object-cover rounded-full" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                <Settings size={26} className="text-blue-400" />
              </div>
            )}
            <h1 className="text-white font-bold text-xl">Admin Panel</h1>
            <p className="text-slate-400 text-sm mt-1">Quelemine's website</p>
          </div>
          
          {forgotMode === "none" ? (
          <form onSubmit={login} className="space-y-4">
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Username"
                autoFocus
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={pwInput}
                  onChange={(e) => setPwInput(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {loginError && <p className="text-red-400 text-xs">{loginError}</p>}
              <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setForgotMode("lookup");
                  setLoginError("");
                  setForgotUser(usernameInput.trim());
                  setForgotQuestion("");
                  setForgotAnswer("");
                }}
                className="w-full text-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </button>
            </form>
          ) : forgotMode === "lookup" ? (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoginError("");
                if (!forgotUser.trim()) { setLoginError("Username is required"); return; }
                setForgotBusy(true);
                try {
                  // Send the email OTP first; fall back to security question if email isn't configured
                  const sendRes = await fetch('/api/admin/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'send', username: forgotUser.trim() })
                  });
                  const sendData = await sendRes.json().catch(() => ({}));
                  if (sendRes.ok) {
                    setForgotMode("answer");
                    setLoginError("");
                  } else {
                    // Email not configured — try security question fallback
                    const res = await fetch(`/api/admin/reset-password?username=${encodeURIComponent(forgotUser.trim())}`);
                    const data = await res.json().catch(() => ({}));
                    if (res.ok && data.securityQuestion) {
                      setForgotQuestion(data.securityQuestion);
                      setForgotMode("answer");
                    } else {
                      setLoginError(sendData.error || "Password recovery is not available for this account.");
                    }
                  }
                } catch { setLoginError("Could not start password recovery. Try again."); }
                finally { setForgotBusy(false); }
              }}
            >
              <p className="text-white text-sm font-semibold text-center">Reset Password</p>
              <p className="text-slate-400 text-xs text-center">Enter your username to continue.</p>
              <input type="text" value={forgotUser} onChange={(e) => setForgotUser(e.target.value)} placeholder="Username" autoComplete="username" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60" />
              {loginError && <p className="text-red-400 text-xs">{loginError}</p>}
              <button type="submit" disabled={forgotBusy} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                {forgotBusy ? 'Loading...' : 'Continue'}
              </button>
              <button type="button" onClick={() => { setForgotMode('none'); setLoginError(''); }} className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors">Back to sign in</button>
            </form>
          ) : forgotMode === "answer" ? (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoginError("");
                if (!forgotAnswer.trim()) { setLoginError("Security answer is required"); return; }
                setForgotBusy(true);
                try {
                  const res = await fetch('/api/admin/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'verify', username: forgotUser.trim(), answer: forgotAnswer.trim() })
                  });
                  const data = await res.json().catch(() => ({}));
                  if (res.ok && data.resetToken) {
                    setResetToken(data.resetToken);
                    setForgotMode('reset');
                  } else {
                    setLoginError(data.error || 'Verification failed');
                  }
                } catch { setLoginError('Verification failed'); }
                finally { setForgotBusy(false); }
              }}
            >
              <p className="text-white text-sm font-semibold text-center">Reset Password</p>
              <p className="text-slate-300 text-xs text-center">
                {forgotQuestion
                  ? forgotQuestion
                  : "We sent a 6-digit code to your account email. Enter it below (or your security answer if configured)."}
              </p>
              <input type="text" value={forgotAnswer} onChange={(e) => setForgotAnswer(e.target.value)} placeholder="Verification code or security answer" autoFocus className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60" />
              {loginError && <p className="text-red-400 text-xs">{loginError}</p>}
              <button type="submit" disabled={forgotBusy} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                {forgotBusy ? 'Verifying...' : 'Verify & Continue'}
              </button>
              <button type="button" onClick={() => { setForgotMode('lookup'); setLoginError(''); }} className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors">Back</button>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoginError("");
                if (forgotNewPw.length < 12) { setLoginError('Password must be at least 12 characters'); return; }
                if (forgotNewPw !== forgotNewPw2) { setLoginError('Passwords do not match'); return; }
                setForgotBusy(true);
                try {
                  const res = await fetch('/api/admin/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'reset', token: resetToken, newPassword: forgotNewPw })
                  });
                  const data = await res.json().catch(() => ({}));
                  if (res.ok) {
                    setForgotMode('none'); setLoginError(''); setPwInput('');
                    alert('Password updated. Please sign in.');
                  } else {
                    setLoginError(data.error || 'Reset failed');
                  }
                } catch { setLoginError('Reset failed'); }
                finally { setForgotBusy(false); }
              }}
            >
              <p className="text-white text-sm font-semibold text-center">Choose New Password</p>
              <input type="password" value={forgotNewPw} onChange={(e) => setForgotNewPw(e.target.value)} placeholder="New password (min 12 chars)" autoComplete="new-password" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60" />
              <input type="password" value={forgotNewPw2} onChange={(e) => setForgotNewPw2(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60" />
              {loginError && <p className="text-red-400 text-xs">{loginError}</p>}
              <button type="submit" disabled={forgotBusy} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                {forgotBusy ? 'Updating...' : 'Update Password'}
              </button>
              <button type="button" onClick={() => { setForgotMode('answer'); setLoginError(''); }} className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors">Back</button>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: MessageSquare },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'cv' as TabType, label: 'CV', icon: FileText },
    { id: 'videos' as TabType, label: 'Videos', icon: Video },
    { id: 'logo' as TabType, label: 'Logo', icon: ImageIcon },
    { id: 'password' as TabType, label: 'Password', icon: Lock },
    { id: 'projects' as TabType, label: 'Projects', icon: FolderOpen },
    { id: 'education' as TabType, label: 'Education', icon: GraduationCap },
    { id: 'colors' as TabType, label: 'Colors', icon: Palette },
    { id: 'typography' as TabType, label: 'Typography', icon: Settings },
    { id: 'content' as TabType, label: 'Content', icon: Settings },
    { id: 'skills' as TabType, label: 'Skills', icon: Code2 },
    { id: 'communication' as TabType, label: 'Communication', icon: MessageSquare },
    { id: 'languages' as TabType, label: 'Languages', icon: Globe },
    { id: 'worktogether' as TabType, label: 'Work Together', icon: Handshake },
    { id: 'channels' as TabType, label: 'WhatsApp & Map', icon: Phone },
    { id: 'chatlogs' as TabType, label: 'Chat Logs', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Top bar */}
      <div className="bg-[#0B1F3A] px-4 sm:px-6 py-4 flex items-center justify-between overflow-x-hidden">
        <div className="min-w-0">
          <h1 className="text-white font-bold text-lg truncate">Admin Panel</h1>
          <p className="text-slate-400 text-xs truncate">Quelemine Website · Admin View</p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors flex-shrink-0">
          <LogOut size={15} /> Sign out
        </button>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] overflow-x-hidden">
        {/* Sidebar */}
        <div className="lg:w-64 bg-white border-r border-slate-200 p-4 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={18} className="flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden min-w-0">
          {settingsError && !settings ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm max-w-lg mx-auto mt-10">
              <p className="text-slate-700 font-medium mb-2">Failed to load settings</p>
              <p className="text-slate-500 text-sm mb-6">The admin settings could not be loaded from the server.</p>
              <button
                onClick={() => { setSettingsError(false); loadSettings(); }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <DashboardTab key="dashboard" sessions={sessions} />
            )}
            {activeTab === 'profile' && (
              <ProfileTab 
                key="profile" 
                settings={settings} 
                onFileUpload={handleFileUpload}
                onSave={handleSaveSettings}
                loading={loading}
              />
            )}
            {activeTab === 'cv' && (
              <CVTab 
                key="cv" 
                settings={settings} 
                onFileUpload={handleFileUpload}
                onSave={handleSaveSettings}
                loading={loading}
              />
            )}
            {activeTab === 'videos' && (
              <VideoTab
                key="videos"
                settings={settings}
                onFileUpload={handleFileUpload}
                onSave={handleSaveSettings}
                loading={loading}
              />
            )}
            {activeTab === 'logo' && (
              <LogoTab 
                key="logo" 
                settings={settings} 
                onFileUpload={handleFileUpload}
                onSave={handleSaveSettings}
                loading={loading}
              />
            )}
            {activeTab === 'password' && (
              <PasswordTab 
                key="password" 
                onChangePassword={handlePasswordChange}
                settings={settings}
              />
            )}
            {activeTab === 'projects' && (
              <ProjectsTab 
                key="projects" 
                settings={settings}
                editingProject={editingProject}
                setEditingProject={setEditingProject}
                onSaveProject={handleProjectSave}
                onDeleteProject={handleProjectDelete}
                onLoadSiteItems={() => handleSaveSettings({ projects: BUILTIN_PROJECTS })}
                onUploadImage={handleAssetUpload}
                onDeleteImage={cleanupUploadedImage}
              />
            )}
            {activeTab === 'education' && (
              <EducationTab 
                key="education" 
                settings={settings}
                editingEducation={editingEducation}
                setEditingEducation={setEditingEducation}
                onSaveEducation={handleEducationSave}
                onDeleteEducation={handleEducationDelete}
                onLoadSiteItems={() => handleSaveSettings({ education: BUILTIN_EDUCATION })}
              />
            )}
            {activeTab === 'colors' && (
              <ColorsTab 
                key="colors" 
                settings={settings} 
                onSave={handleSaveSettings}
                loading={loading}
              />
            )}
            {activeTab === 'typography' && (
              <TypographyTab 
                key="typography" 
                settings={settings} 
                onSave={handleSaveSettings}
                loading={loading}
              />
            )}
            {activeTab === 'content' && (
              <ContentTab 
                key="content" 
                settings={settings} 
                onSave={handleSaveSettings}
                onFileUpload={handleFileUpload}
                loading={loading}
              />
            )}
            {activeTab === 'skills' && <SkillsTab key="skills" settings={settings} onSave={handleSaveSettings} loading={loading} />}
            {activeTab === 'communication' && <CommunicationTab key="communication" settings={settings} onSave={handleSaveSettings} />}
            {activeTab === 'languages' && <LanguagesTab key="languages" settings={settings} onSave={handleSaveSettings} />}
            {activeTab === 'worktogether' && <WorkTogetherTab key="worktogether" settings={settings} onSave={handleSaveSettings} />}
            {activeTab === 'channels' && <ContactChannelsTab key="channels" settings={settings} onSave={handleSaveSettings} />}
            {activeTab === 'chatlogs' && (
              <ChatLogsTab 
                key="chatlogs" 
                sessions={sessions}
                onClearAll={handleClearAllLogs}
                onDeleteSession={handleDeleteSession}
              />
            )}
          </AnimatePresence>
          )}
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg text-sm font-medium ${
              notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Dashboard Tab
function DashboardTab({ sessions }: { sessions: ChatSession[] }) {
  const [health, setHealth] = useState<{ storage: string; writable: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/admin/health')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setHealth(data); })
      .catch(() => {});
  }, []);

  const totalMessages = sessions.reduce((acc, s) => acc + s.messages.length, 0);
  const recentCount = sessions.filter((s) => Date.now() - new Date(s.lastActiveAt).getTime() < 86400000).length;
  const errorCount = sessions.reduce((acc, s) => acc + s.messages.filter((m) => m.status === "error").length, 0);

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear all cache? This will clear all localStorage data except chat logs. This action cannot be undone.')) {
      // Preserve chat logs before clearing
      const chatLogs = localStorage.getItem('iq_chat_logs');
      localStorage.clear();
      // Restore chat logs after clearing
      if (chatLogs) {
        localStorage.setItem('iq_chat_logs', chatLogs);
      }
      window.location.reload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <button
          onClick={handleClearCache}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Trash2 size={16} /> Clear Cache
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: sessions.length, color: "text-blue-600" },
          { label: "Total Messages", value: totalMessages, color: "text-indigo-600" },
          { label: "Active (24h)", value: recentCount, color: "text-green-600" },
          { label: "Errors", value: errorCount, color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-slate-500 text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Storage status */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Storage Status</h3>
        {!health ? (
          <p className="text-slate-400 text-sm">Checking storage...</p>
        ) : !health.writable ? (
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
            <p className="text-sm font-medium text-red-600">Cannot save on this server</p>
          </div>
        ) : health.storage === "mysql" ? (
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
            <p className="text-sm font-medium text-slate-900">Saved to database</p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-900">Saved to local files</p>
              <p className="text-xs text-slate-500">Changes may be lost on redeploy.</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
        {sessions.length === 0 ? (
          <p className="text-slate-400 text-sm">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <div key={session.sessionId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User size={14} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{session.userName}</p>
                  <p className="text-xs text-slate-500">{session.messages.length} messages</p>
                </div>
                <p className="text-xs text-slate-400">
                  {Math.floor((Date.now() - new Date(session.lastActiveAt).getTime()) / 60000)}m ago
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Chat Logs Tab
function ChatLogsTab({ sessions, onClearAll, onDeleteSession }: { sessions: ChatSession[]; onClearAll: () => void; onDeleteSession: (id: string) => void }) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Chat Logs</h2>
        {sessions.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Trash2 size={16} /> Clear All Logs
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No chat logs available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.sessionId} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedSession(expandedSession === session.sessionId ? null : session.sessionId)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{session.userName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(session.startedAt).toLocaleDateString()} · {session.messages.length} messages
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteSession(session.sessionId); }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  {expandedSession === session.sessionId ? (
                    <ChevronUp size={20} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-400" />
                  )}
                </div>
              </div>

              {expandedSession === session.sessionId && (
                <div className="border-t border-slate-200 p-4 bg-slate-50 max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {session.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}>
                          <p className="break-words">{msg.text}</p>
                          <p className="text-[10px] opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Profile Tab
function ProfileTab({ settings, onFileUpload, onSave, loading }: any) {
  const [profileData, setProfileData] = useState(() => mergeEffective(settings?.profile, BUILTIN_PROFILE));
  const [aboutImageData, setAboutImageData] = useState(settings?.siteContent?.about?.image || '');
  const profileInitialized = useRef(false);

  // Only hydrate the form once so later settings reloads don't wipe unsaved edits
  useEffect(() => {
    if (!profileInitialized.current && settings?.profile) {
      setProfileData(mergeEffective(settings.profile, BUILTIN_PROFILE));
      profileInitialized.current = true;
    }
    if (settings?.siteContent?.about?.image) {
      setAboutImageData(settings.siteContent.about.image);
    }
  }, [settings]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file, 'profile');
    }
  };

  const handleAboutImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file, 'about');
    }
  };

  // Update aboutImageData when settings change (after upload)
  useEffect(() => {
    if (settings?.siteContent?.about?.image) {
      setAboutImageData(settings.siteContent.about.image);
    }
  }, [settings]);

  const handleSave = () => {
    onSave({ 
      profile: profileData,
      siteContent: { 
        ...settings?.siteContent, 
        about: { 
          ...settings?.siteContent?.about, 
          image: aboutImageData 
        } 
      } 
    });
  };

  if (!settings) return <div className="text-slate-500">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
      
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 overflow-x-hidden">
        {/* Home Profile Image */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Home Profile Image (Hero Section)</label>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex-shrink-0">
              {profileData.profileImage ? (
                <img src={profileData.profileImage} alt="Home Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={32} className="text-slate-400" />
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profile-image-upload"
              />
              <label
                htmlFor="profile-image-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Upload size={16} />
                Upload Home Profile Image
              </label>
              <p className="text-xs text-slate-500 mt-2">Recommended: Square image, at least 400x400px</p>
            </div>
          </div>
        </div>

        {/* About Profile Image */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">About Profile Image (About Section)</label>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex-shrink-0">
              {aboutImageData ? (
                <img src={aboutImageData} alt="About Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={32} className="text-slate-400" />
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <input
                type="file"
                accept="image/*"
                onChange={handleAboutImageChange}
                className="hidden"
                id="about-image-upload"
              />
              <label
                htmlFor="about-image-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Upload size={16} />
                Upload About Profile Image
              </label>
              <p className="text-xs text-slate-500 mt-2">Recommended: Square image, at least 400x400px</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              value={profileData.name || ''}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input
              type="text"
              value={profileData.title || ''}
              onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Subtitle</label>
            <input
              type="text"
              value={profileData.subtitle || ''}
              onChange={(e) => setProfileData({ ...profileData, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={profileData.description || ''}
              onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
            <input
              type="text"
              value={profileData.location || ''}
              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profileData.availableForWork || false}
                onChange={(e) => setProfileData({ ...profileData, availableForWork: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Available for Work</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Save size={16} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </motion.div>
  );
}

// CV Tab
function CVTab({ settings, onFileUpload, onSave, loading }: any) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file, 'cv');
    }
  };

  if (!settings) return <div className="text-slate-500">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-slate-900">CV Management</h2>
      
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Upload CV</label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="cv-upload"
            />
            <label
              htmlFor="cv-upload"
              className="cursor-pointer"
            >
              <Upload size={32} className="mx-auto text-slate-400 mb-3" />
              <p className="text-sm text-slate-600 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-400">PDF files only</p>
            </label>
          </div>
        </div>

        {settings?.cv?.url && (
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Current CV</p>
                <p className="text-xs text-slate-500">{settings.cv.filename}</p>
              </div>
              <a
                href={settings.cv.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline"
              >
                View CV
              </a>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Logo Tab
function LogoTab({ settings, onFileUpload, onSave, loading }: any) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file, 'logo');
    }
  };

  const handleLoginLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file, 'loginLogo');
    }
  };

  if (!settings) return <div className="text-slate-500">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-slate-900">Logo Management</h2>
      
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        {/* Website Logo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Website Logo (Navbar)</label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
              onChange={handleFileChange}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="cursor-pointer"
            >
              <Upload size={32} className="mx-auto text-slate-400 mb-3" />
              <p className="text-sm text-slate-600 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-400">JPG, PNG, GIF, WebP or BMP · Maximum {formatLimit(UPLOAD_LIMITS.image)}</p>
            </label>
          </div>
        </div>

        {settings?.logo?.url && (
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Current Website Logo</p>
              </div>
              <div className="flex items-center gap-4">
                <img 
                  src={settings.logo.url} 
                  alt="Logo" 
                  className="w-16 h-16 object-contain rounded-lg border border-slate-200"
                />
                <a
                  href={settings.logo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline"
                >
                  View Logo
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Login Page Logo */}
        <div className="pt-6 border-t border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-3">Login Page Logo</label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
              onChange={handleLoginLogoChange}
              className="hidden"
              id="login-logo-upload"
            />
            <label
              htmlFor="login-logo-upload"
              className="cursor-pointer"
            >
              <Upload size={32} className="mx-auto text-slate-400 mb-3" />
              <p className="text-sm text-slate-600 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-400">JPG, PNG, GIF, WebP or BMP · Maximum {formatLimit(UPLOAD_LIMITS.image)}</p>
            </label>
          </div>
        </div>

        {settings?.loginLogo?.url && (
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Current Login Logo</p>
              </div>
              <div className="flex items-center gap-4">
                <img 
                  src={settings.loginLogo.url} 
                  alt="Login Logo" 
                  className="w-16 h-16 object-contain rounded-lg border border-slate-200"
                />
                <a
                  href={settings.loginLogo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline"
                >
                  View Logo
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Typography Tab
function TypographyTab({ settings, onSave, loading }: any) {
  const [typography, setTypography] = useState(settings?.typography || {
    fontFamily: "Inter, sans-serif",
    fontSize: {
      base: "16px",
      h1: "48px",
      h2: "36px",
      h3: "24px",
      small: "14px"
    },
    lineHeight: {
      normal: "1.5",
      relaxed: "1.75"
    },
    textAlign: "left",
    fontWeight: {
      normal: "400",
      medium: "500",
      bold: "700"
    }
  });

  useEffect(() => {
    if (settings?.typography) {
      setTypography(settings.typography);
    }
  }, [settings]);

  const handleSave = () => {
    onSave({ typography });
  };

  if (!settings) return <div className="text-slate-500">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-slate-900">Typography Settings</h2>
      
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Font Family</label>
          <select
            value={typography.fontFamily}
            onChange={(e) => setTypography({ ...typography, fontFamily: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="Inter, sans-serif">Inter, sans-serif</option>
            <option value="system-ui, sans-serif">System UI, sans-serif</option>
            <option value="Arial, sans-serif">Arial, sans-serif</option>
            <option value="Georgia, serif">Georgia, serif</option>
            <option value="'Times New Roman', serif">Times New Roman, serif</option>
            <option value="'Courier New', monospace">Courier New, monospace</option>
            <option value="Roboto, sans-serif">Roboto, sans-serif</option>
            <option value="'Open Sans', sans-serif">Open Sans, sans-serif</option>
            <option value="Lato, sans-serif">Lato, sans-serif</option>
            <option value="'Helvetica Neue', sans-serif">Helvetica Neue, sans-serif</option>
          </select>
        </div>

        {/* Font Sizes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Font Sizes</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Base (16px)</label>
              <select
                value={typography.fontSize.base}
                onChange={(e) => setTypography({ ...typography, fontSize: { ...typography.fontSize, base: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">H1 (48px)</label>
              <select
                value={typography.fontSize.h1}
                onChange={(e) => setTypography({ ...typography, fontSize: { ...typography.fontSize, h1: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="32px">32px</option>
                <option value="36px">36px</option>
                <option value="42px">42px</option>
                <option value="48px">48px</option>
                <option value="56px">56px</option>
                <option value="64px">64px</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">H2 (36px)</label>
              <select
                value={typography.fontSize.h2}
                onChange={(e) => setTypography({ ...typography, fontSize: { ...typography.fontSize, h2: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="24px">24px</option>
                <option value="28px">28px</option>
                <option value="32px">32px</option>
                <option value="36px">36px</option>
                <option value="42px">42px</option>
                <option value="48px">48px</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">H3 (24px)</label>
              <select
                value={typography.fontSize.h3}
                onChange={(e) => setTypography({ ...typography, fontSize: { ...typography.fontSize, h3: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="28px">28px</option>
                <option value="32px">32px</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Small (14px)</label>
              <select
                value={typography.fontSize.small}
                onChange={(e) => setTypography({ ...typography, fontSize: { ...typography.fontSize, small: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="10px">10px</option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
              </select>
            </div>
          </div>
        </div>

        {/* Line Height */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Line Height</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Normal (1.5)</label>
              <select
                value={typography.lineHeight.normal}
                onChange={(e) => setTypography({ ...typography, lineHeight: { ...typography.lineHeight, normal: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="1.2">1.2</option>
                <option value="1.3">1.3</option>
                <option value="1.4">1.4</option>
                <option value="1.5">1.5</option>
                <option value="1.6">1.6</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Relaxed (1.75)</label>
              <select
                value={typography.lineHeight.relaxed}
                onChange={(e) => setTypography({ ...typography, lineHeight: { ...typography.lineHeight, relaxed: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="1.5">1.5</option>
                <option value="1.6">1.6</option>
                <option value="1.75">1.75</option>
                <option value="1.8">1.8</option>
                <option value="2.0">2.0</option>
              </select>
            </div>
          </div>
        </div>

        {/* Text Alignment */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Text Alignment</label>
          <select
            value={typography.textAlign}
            onChange={(e) => setTypography({ ...typography, textAlign: e.target.value as "left" | "center" | "right" })}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>

        {/* Font Weights */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Font Weights</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Normal (400)</label>
              <select
                value={typography.fontWeight.normal}
                onChange={(e) => setTypography({ ...typography, fontWeight: { ...typography.fontWeight, normal: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="300">300 (Light)</option>
                <option value="400">400 (Normal)</option>
                <option value="500">500 (Medium)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Medium (500)</label>
              <select
                value={typography.fontWeight.medium}
                onChange={(e) => setTypography({ ...typography, fontWeight: { ...typography.fontWeight, medium: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="400">400 (Normal)</option>
                <option value="500">500 (Medium)</option>
                <option value="600">600 (Semi-bold)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Bold (700)</label>
              <select
                value={typography.fontWeight.bold}
                onChange={(e) => setTypography({ ...typography, fontWeight: { ...typography.fontWeight, bold: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="600">600 (Semi-bold)</option>
                <option value="700">700 (Bold)</option>
                <option value="800">800 (Extra-bold)</option>
                <option value="900">900 (Black)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Typography Settings'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Video Tab
function VideoTab({ settings, onFileUpload, onSave, loading }: any) {
  const [title, setTitle] = useState(settings?.featuredVideo?.title || '');
  const [description, setDescription] = useState(settings?.featuredVideo?.description || '');

  // Sync title/description when settings load or change
  useEffect(() => {
    setTitle(settings?.featuredVideo?.title || '');
    setDescription(settings?.featuredVideo?.description || '');
  }, [settings?.featuredVideo?.title, settings?.featuredVideo?.description]);

  if (!settings) return <div className="text-slate-500">Loading...</div>;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onFileUpload(file, 'video');
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({
      featuredVideo: {
        ...(settings.featuredVideo ?? { url: '', filename: '' }),
        title,
        description,
      },
    });
  };

  const video = settings.featuredVideo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Featured Video</h2>
        <p className="text-sm text-slate-500 mt-1">Upload a video to display in a dedicated section on your homepage.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 max-w-3xl">
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept=".mp4"
            onChange={handleFileChange}
            className="hidden"
            id="featured-video-upload"
          />
          <label htmlFor="featured-video-upload" className="cursor-pointer">
            <Video size={32} className="mx-auto text-slate-400 mb-3" />
            <p className="text-sm text-slate-600 mb-1">Click to upload a video</p>
            <p className="text-xs text-slate-400">MP4 only · Maximum {formatLimit(UPLOAD_LIMITS.video)}</p>
          </label>
        </div>

        {video?.url && (
          <div className="space-y-3">
            <video controls preload="metadata" className="w-full rounded-xl bg-slate-900">
              <source src={video.url} />
              Your browser does not support video playback.
            </video>
            <p className="text-xs text-slate-500 truncate">{video.filename}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Video Title</label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g., My portfolio introduction"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Briefly describe the video"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !video?.url}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} />
            Save Video Details
          </button>
        </form>
      </div>
    </motion.div>
  );
}

// Password Tab
function PasswordTab({ onChangePassword }: any) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [secQuestion, setSecQuestion] = useState('');
  const [secAnswer, setSecAnswer] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }

    setSaving(true);
    try {
      const hasSecurity = secQuestion.trim().length > 0 || secAnswer.trim().length > 0;
      const ok = await onChangePassword(currentPassword, newPassword, newUsername,
        hasSecurity ? { question: secQuestion.trim(), answer: secAnswer } : undefined);
      if (ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setNewUsername('');
        setSecQuestion('');
        setSecAnswer('');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-slate-900">Change Credentials</h2>
      
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 pr-11 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700"
                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">New Username (optional)</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Leave blank to keep current"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">New Password (optional)</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 pr-11 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Leave blank to keep current"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {newPassword && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-11 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  required={!!newPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700"
                  aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}
          <div className="pt-2 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-1">Password Recovery (optional 2FA)</p>
            <p className="text-xs text-slate-500 mb-3">Set a security question so you can reset a forgotten password from the login page. Leave blank to disable recovery.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Security Question</label>
                <input
                  type="text"
                  value={secQuestion}
                  onChange={(e) => setSecQuestion(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="e.g. What is your first school's name?"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Security Answer</label>
                <input
                  type="text"
                  value={secAnswer}
                  onChange={(e) => setSecAnswer(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Answer (stored hashed, never shown)"
                />
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Lock size={16} />
            {saving ? 'Updating...' : 'Update Credentials'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

// Projects Tab
function ProjectsTab({ settings, editingProject, setEditingProject, onSaveProject, onDeleteProject, onLoadSiteItems, onUploadImage, onDeleteImage }: any) {
  const isSiteDefault = !settings?.projects?.length;
  const items: Project[] = isSiteDefault ? BUILTIN_PROJECTS : settings.projects;
  const [imageUploading, setImageUploading] = useState(false);
  const projectImageInputRef = useRef<HTMLInputElement>(null);
  const sessionUploadRef = useRef<string | null>(null);
  const emptyProject: Partial<Project> = {
    title: '',
    description: '',
    image: '',
    technologies: [],
    category: 'fullstack',
    github: '',
    demo: '',
    featured: false,
    finished: true
  };
  const [newProject, setNewProject] = useState<Partial<Project>>(emptyProject);
  const [saving, setSaving] = useState(false);

  const form = (editingProject ?? newProject) as Project;
  const updateForm = (patch: Partial<Project>) => {
    if (editingProject) {
      setEditingProject({ ...editingProject, ...patch });
    } else {
      setNewProject({ ...newProject, ...patch });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = editingProject
        ? form
        : { ...form, id: 0, technologies: form.technologies ?? [] } as Project;
      const ok = await onSaveProject(payload);
      if (ok) {
        sessionUploadRef.current = null;
        if (!editingProject) {
          setNewProject({ ...emptyProject });
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTechnologiesChange = (value: string) => {
    const technologies = value.split(',').map(t => t.trim()).filter(t => t);
    updateForm({ technologies });
  };

  if (!settings) return <div className="text-slate-500">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
        <button
          onClick={() => setEditingProject(null)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Project
        </button>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-x-hidden">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {editingProject ? 'Edit Project' : 'Add New Project'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input
              type="text"
              value={form.title ?? ''}
              onChange={(e) => updateForm({ title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => updateForm({ description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Project Image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              ref={projectImageInputRef}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                setImageUploading(true);
                try {
                  const url = await onUploadImage(file);
                  if (url) {
                    updateForm({ image: url });
                    sessionUploadRef.current = url;
                  }
                } finally {
                  setImageUploading(false);
                }
              }}
            />
            <div className="flex items-start gap-4">
              <div className="w-28 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                {form.image ? (
                  <img src={form.image} alt="Project preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={24} className="text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => projectImageInputRef.current?.click()}
                  disabled={imageUploading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors w-fit"
                >
                  <Upload size={16} />
                  {imageUploading ? 'Uploading...' : form.image ? 'Replace Image' : 'Upload Image'}
                </button>
                {form.image && (
                  <button
                    type="button"
                    onClick={() => updateForm({ image: '' })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors w-fit"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
                <p className="text-xs text-slate-500">JPG, PNG or WEBP, up to {formatLimit(UPLOAD_LIMITS.image)}</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={form.category ?? 'fullstack'}
              onChange={(e) => updateForm({ category: e.target.value as any })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="fullstack">Full Stack</option>
              <option value="database">Database</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Technologies (comma-separated)</label>
            <input
              type="text"
              value={(form.technologies ?? []).join(', ')}
              onChange={(e) => handleTechnologiesChange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Demo URL</label>
            <input
              type="text"
              value={form.demo ?? ''}
              onChange={(e) => updateForm({ demo: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">GitHub URL (optional)</label>
            <input
              type="text"
              value={form.github ?? ''}
              onChange={(e) => updateForm({ github: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured ?? false}
                onChange={(e) => updateForm({ featured: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.finished ?? true}
                onChange={(e) => updateForm({ finished: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Finished</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            {saving ? 'Saving...' : editingProject ? 'Update Project' : 'Add Project'}
          </button>
          {editingProject && (
            <button
              onClick={() => {
                // Image uploaded during this edit session was never saved — clean it up
                if (sessionUploadRef.current && sessionUploadRef.current !== editingProject.image) {
                  onDeleteImage?.(sessionUploadRef.current);
                }
                sessionUploadRef.current = null;
                setEditingProject(null);
              }}
              className="flex items-center gap-2 px-6 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Projects List */}
      {isSiteDefault && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-blue-800">Showing the projects currently on the public site. Load them to edit or delete.</p>
          <button
            onClick={onLoadSiteItems}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            Load current site items
          </button>
        </div>
      )}
      <div className="space-y-3">
        {items.map((project: Project) => (
          <div key={project.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">{project.title}</h3>
                  {project.featured && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Featured</span>}
                  {isSiteDefault && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">Site default</span>}
                  {project.finished ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Finished</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">In Progress</span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-2 line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-1">
                  {(project.technologies ?? []).map((tech) => (
                    <span key={tech} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              {!isSiteDefault && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingProject(project)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDeleteProject(project.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Education Tab
function EducationTab({ settings, editingEducation, setEditingEducation, onSaveEducation, onDeleteEducation, onLoadSiteItems }: any) {
  const isSiteDefault = !settings?.education?.length;
  const items: Education[] = isSiteDefault ? BUILTIN_EDUCATION : settings.education;
  const emptyEducation: Partial<Education> = {
    degree: '',
    institution: '',
    location: '',
    period: '',
    status: 'In Progress',
    description: '',
    icon: 'GraduationCap'
  };
  const [newEducation, setNewEducation] = useState<Partial<Education>>(emptyEducation);
  const [saving, setSaving] = useState(false);

  const form = (editingEducation ?? newEducation) as Education;
  const updateForm = (patch: Partial<Education>) => {
    if (editingEducation) {
      setEditingEducation({ ...editingEducation, ...patch });
    } else {
      setNewEducation({ ...newEducation, ...patch });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ok = await onSaveEducation(editingEducation ? form : { ...form, id: 0 } as Education);
      if (ok && !editingEducation) {
        setNewEducation({ ...emptyEducation });
      }
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="text-slate-500">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Education</h2>
        <button
          onClick={() => setEditingEducation(null)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Education
        </button>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-x-hidden">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {editingEducation ? 'Edit Education' : 'Add New Education'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Degree</label>
            <input
              type="text"
              value={form.degree ?? ''}
              onChange={(e) => updateForm({ degree: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Institution</label>
            <input
              type="text"
              value={form.institution ?? ''}
              onChange={(e) => updateForm({ institution: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
            <input
              type="text"
              value={form.location ?? ''}
              onChange={(e) => updateForm({ location: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Period</label>
            <input
              type="text"
              value={form.period ?? ''}
              onChange={(e) => updateForm({ period: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="e.g., 2020 - 2024 or Current"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={form.status ?? 'In Progress'}
              onChange={(e) => updateForm({ status: e.target.value as any })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => updateForm({ description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
            <select
              value={form.icon ?? 'GraduationCap'}
              onChange={(e) => updateForm({ icon: e.target.value as any })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="GraduationCap">Graduation Cap</option>
              <option value="BookOpen">Book Open</option>
              <option value="Award">Award</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            {saving ? 'Saving...' : editingEducation ? 'Update Education' : 'Add Education'}
          </button>
          {editingEducation && (
            <button
              onClick={() => setEditingEducation(null)}
              className="flex items-center gap-2 px-6 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Education List */}
      {isSiteDefault && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-blue-800">Showing the education entries currently on the public site. Load them to edit or delete.</p>
          <button
            onClick={onLoadSiteItems}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            Load current site items
          </button>
        </div>
      )}
      <div className="space-y-3">
        {items.map((edu: Education) => (
          <div key={edu.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">{edu.degree}</h3>
                  {isSiteDefault && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">Site default</span>}
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    edu.status === 'Completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {edu.status}
                  </span>
                </div>
                <p className="text-sm text-blue-600 font-medium mb-1">{edu.institution}</p>
                <p className="text-sm text-slate-600 mb-2">{edu.location} · {edu.period}</p>
                <p className="text-sm text-slate-500 line-clamp-2">{edu.description}</p>
              </div>
              {!isSiteDefault && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingEducation(edu)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDeleteEducation(edu.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Colors Tab
function ColorsTab({ settings, onSave, loading }: any) {
  const [colors, setColors] = useState(settings?.colors || {});

  useEffect(() => {
    if (settings?.colors) {
      setColors(settings.colors);
    }
  }, [settings]);

  const handleSave = () => {
    onSave({ colors });
  };

  if (!settings) return <div className="text-slate-500">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-slate-900">Color Customization</h2>
      
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 overflow-x-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Object.entries(colors).map(([key, value]: [string, any]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                  className="w-12 h-12 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Save size={16} />
          {loading ? 'Saving...' : 'Save Colors'}
        </button>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Preview</h3>
        <div 
          className="p-6 rounded-xl"
          style={{ 
            backgroundColor: colors.background || '#ffffff',
            color: colors.text || '#1e293b'
          }}
        >
          <h4 
            className="text-xl font-bold mb-2"
            style={{ color: colors.primary || '#2563eb' }}
          >
            Sample Heading
          </h4>
          <p className="mb-4">This is a preview of how your color choices will look on the website.</p>
          <button
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: colors.primary || '#2563eb' }}
          >
            Sample Button
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Content Tab
function ContentTab({ settings, onSave, onFileUpload, loading }: any) {
  const [content, setContent] = useState(() => mergeEffective(settings?.siteContent, BUILTIN_SITE_CONTENT));

  useEffect(() => {
    if (settings?.siteContent) {
      setContent(mergeEffective(settings.siteContent, BUILTIN_SITE_CONTENT));
    }
  }, [settings]);

  const handleSave = () => {
    onSave({ siteContent: content });
  };

  const handleAboutImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file, 'about');
    }
  };

  if (!settings) return <div className="text-slate-500">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-slate-900">Site Content</h2>
      
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        {/* Hero Section */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Hero Section</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Badge</label>
              <input
                type="text"
                value={content.hero?.badge || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, badge: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <input
                type="text"
                value={content.hero?.title || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title Accent</label>
              <input
                type="text"
                value={content.hero?.titleAccent || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, titleAccent: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Subtitle</label>
              <input
                type="text"
                value={content.hero?.subtitle || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                value={content.hero?.description || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">View Projects Button</label>
              <input
                type="text"
                value={content.hero?.viewProjects || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, viewProjects: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Download CV Button</label>
              <input
                type="text"
                value={content.hero?.downloadCV || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, downloadCV: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contact Me Button</label>
              <input
                type="text"
                value={content.hero?.contactMe || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, contactMe: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Available for Work Text</label>
              <input
                type="text"
                value={content.hero?.availableForWork || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, availableForWork: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">About Section</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Section Label</label>
              <input
                type="text"
                value={content.about?.sectionLabel || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, sectionLabel: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Section Title</label>
              <input
                type="text"
                value={content.about?.sectionTitle || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, sectionTitle: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Bio 1</label>
              <textarea
                value={content.about?.bio1 || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, bio1: e.target.value } })}
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Bio 2</label>
              <textarea
                value={content.about?.bio2 || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, bio2: e.target.value } })}
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Bio 3</label>
              <textarea
                value={content.about?.bio3 || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, bio3: e.target.value } })}
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Bio 4</label>
              <textarea
                value={content.about?.bio4 || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, bio4: e.target.value } })}
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Get In Touch Button</label>
              <input
                type="text"
                value={content.about?.getInTouch || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, getInTouch: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Download CV Button</label>
              <input
                type="text"
                value={content.about?.downloadCV || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, downloadCV: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">About Section Image</label>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200 flex-shrink-0">
                  {content.about?.image ? (
                    <img src={content.about.image} alt="About" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAboutImageChange}
                    className="hidden"
                    id="about-image-upload"
                  />
                  <label
                    htmlFor="about-image-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    <Upload size={16} />
                    Upload Image
                  </label>
                  <p className="text-xs text-slate-500 mt-2">Recommended: Image that represents you or your work</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={content.contact?.email || ''}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input
                type="text"
                value={content.contact?.phone || ''}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, phone: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
              <input
                type="text"
                value={content.contact?.address || ''}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, address: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Social Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">GitHub</label>
              <input
                type="url"
                value={content.social?.github || ''}
                onChange={(e) => setContent({ ...content, social: { ...content.social, github: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn</label>
              <input
                type="url"
                value={content.social?.linkedin || ''}
                onChange={(e) => setContent({ ...content, social: { ...content.social, linkedin: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Twitter</label>
              <input
                type="url"
                value={content.social?.twitter || ''}
                onChange={(e) => setContent({ ...content, social: { ...content.social, twitter: e.target.value } })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Save size={16} />
          {loading ? 'Saving...' : 'Save Content'}
        </button>
      </div>
    </motion.div>
  );
}
