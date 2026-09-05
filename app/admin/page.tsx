"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, MessageSquare, User, Settings, Upload, Lock, 
  FolderOpen, GraduationCap, Palette, FileText, Save, Plus,
  Edit2, Trash2, X, ChevronDown, ChevronUp, Image as ImageIcon,
  Eye, EyeOff
} from "lucide-react";
import { getAllSessions, clearAllSessions, deleteSession, type ChatSession } from "@/lib/chatLogger";
import type { AdminSettings, Project, Education } from "@/types/admin";


type TabType = 'dashboard' | 'profile' | 'cv' | 'password' | 'projects' | 'education' | 'colors' | 'content' | 'logo' | 'typography' | 'chatlogs';

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'security' | 'new'>('email');
  const [resetUsername, setResetUsername] = useState("");
  const [resetSecurityAnswer, setResetSecurityAnswer] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetSecurityQuestion, setResetSecurityQuestion] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loginLogo, setLoginLogo] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        // Update login logo when settings are loaded
        if (data.loginLogo?.url) {
          setLoginLogo(data.loginLogo.url);
        }
      }
    } catch {
      showNotification('error', 'Failed to load settings');
    }
  };

  useEffect(() => {
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

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: pwInput })
      });

      if (response.ok) {
        setAuthed(true);
        setPwError(false);
      } else {
        setPwError(true);
        setPwInput("");
      }
    } catch (error) {
      setPwError(true);
      setPwInput("");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    
    if (resetStep === 'email') {
      // Get security question
      try {
        const response = await fetch(`/api/admin/reset-password?username=${resetUsername}`);
        if (response.ok) {
          const data = await response.json();
          setResetSecurityQuestion(data.securityQuestion);
          setResetStep('security');
        } else {
          setResetError('Username not found');
        }
      } catch (error) {
        setResetError('Failed to verify username');
      }
    } else if (resetStep === 'security') {
      // Verify security answer
      try {
        const response = await fetch('/api/admin/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: resetUsername, securityAnswer: resetSecurityAnswer, newPassword: '' })
        });

        if (response.ok) {
          setResetStep('new');
        } else {
          const data = await response.json();
          setResetError(data.error || 'Incorrect security answer');
        }
      } catch (error) {
        setResetError('Failed to verify security answer');
      }
    } else if (resetStep === 'new') {
      // Set new password
      if (resetNewPassword !== resetConfirmPassword) {
        setResetError('Passwords do not match');
        return;
      }
      if (resetNewPassword.length < 6) {
        setResetError('Password must be at least 6 characters');
        return;
      }

      try {
        const response = await fetch('/api/admin/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: resetUsername, securityAnswer: resetSecurityAnswer, newPassword: resetNewPassword })
        });

        if (response.ok) {
          setResetMessage('Password reset successfully! You can now login with your new password.');
          setTimeout(() => {
            setShowForgotPassword(false);
            setResetStep('email');
            setResetUsername("");
            setResetSecurityAnswer("");
            setResetNewPassword("");
            setResetConfirmPassword("");
            setResetSecurityQuestion("");
            setResetMessage("");
            setResetError("");
          }, 3000);
        } else {
          setResetError('Failed to reset password');
        }
      } catch (error) {
        setResetError('Failed to reset password');
      }
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveSettings = async (updates: Partial<AdminSettings>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        showNotification('success', 'Settings saved successfully');
      } else {
        showNotification('error', 'Failed to save settings');
      }
    } catch (error) {
      showNotification('error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'profile' | 'cv' | 'about' | 'logo' | 'loginLogo') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (type === 'profile') {
          await handleSaveSettings({ profile: { ...settings!.profile, profileImage: data.url } });
        } else if (type === 'cv') {
          await handleSaveSettings({ cv: { ...settings!.cv, url: data.url, filename: data.filename, uploadDate: new Date().toISOString() } });
        } else if (type === 'about') {
          await handleSaveSettings({ siteContent: { ...settings!.siteContent, about: { ...settings!.siteContent.about, image: data.url } } });
        } else if (type === 'logo') {
          await handleSaveSettings({ logo: { ...settings!.logo, url: data.url } });
        } else if (type === 'loginLogo') {
          await handleSaveSettings({ loginLogo: { ...settings!.loginLogo, url: data.url } });
        }
        // Reload settings to get the updated data
        await loadSettings();
        showNotification('success', 'File uploaded successfully');
      } else {
        showNotification('error', 'Failed to upload file');
      }
    } catch (error) {
      showNotification('error', 'Failed to upload file');
    }
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string, newUsername: string, securityQuestion: string, securityAnswer: string) => {
    try {
      const response = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, newUsername, securityQuestion, securityAnswer })
      });

      if (response.ok) {
        showNotification('success', 'Credentials updated successfully');
      } else {
        showNotification('error', 'Failed to update credentials');
      }
    } catch (error) {
      showNotification('error', 'Failed to update credentials');
    }
  };

  const handleProjectSave = async (project: Project) => {
    try {
      const url = editingProject ? '/api/admin/projects' : '/api/admin/projects';
      const method = editingProject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });

      if (response.ok) {
        await loadSettings();
        setEditingProject(null);
        showNotification('success', 'Project saved successfully');
      } else {
        showNotification('error', 'Failed to save project');
      }
    } catch (error) {
      showNotification('error', 'Failed to save project');
    }
  };

  const handleProjectDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/projects?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadSettings();
        showNotification('success', 'Project deleted successfully');
      } else {
        showNotification('error', 'Failed to delete project');
      }
    } catch (error) {
      showNotification('error', 'Failed to delete project');
    }
  };

  const handleEducationSave = async (education: Education) => {
    try {
      const url = editingEducation ? '/api/admin/education' : '/api/admin/education';
      const method = editingEducation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(education)
      });

      if (response.ok) {
        await loadSettings();
        setEditingEducation(null);
        showNotification('success', 'Education saved successfully');
      } else {
        showNotification('error', 'Failed to save education');
      }
    } catch (error) {
      showNotification('error', 'Failed to save education');
    }
  };

  const handleEducationDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/education?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadSettings();
        showNotification('success', 'Education deleted successfully');
      } else {
        showNotification('error', 'Failed to delete education');
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
          
          {!showForgotPassword ? (
            <form onSubmit={login} className="space-y-4">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Username"
                autoFocus
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
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
              {pwError && <p className="text-red-400 text-xs">Invalid username or password.</p>}
              <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="w-full py-2 text-slate-400 hover:text-blue-400 text-xs transition-colors"
              >
                Forgot password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {resetStep === 'email' && (
                <>
                  <input
                    type="text"
                    value={resetUsername}
                    onChange={(e) => setResetUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoFocus
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
                  />
                  {resetError && <p className="text-red-400 text-xs">{resetError}</p>}
                  <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
                    Continue
                  </button>
                </>
              )}
              {resetStep === 'security' && (
                <>
                  <p className="text-slate-300 text-sm">Security Question: {resetSecurityQuestion}</p>
                  <input
                    type="text"
                    value={resetSecurityAnswer}
                    onChange={(e) => setResetSecurityAnswer(e.target.value)}
                    placeholder="Enter your answer"
                    autoFocus
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
                  />
                  {resetError && <p className="text-red-400 text-xs">{resetError}</p>}
                  <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
                    Verify Answer
                  </button>
                </>
              )}
              {resetStep === 'new' && (
                <>
                  <div className="relative">
                    <input
                      type={showResetPassword ? "text" : "password"}
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="New password"
                      autoFocus
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showResetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showResetConfirmPassword ? "text" : "password"}
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showResetConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {resetError && <p className="text-red-400 text-xs">{resetError}</p>}
                  {resetMessage && <p className="text-green-400 text-xs">{resetMessage}</p>}
                  <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
                    Reset Password
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetStep('email');
                  setResetUsername("");
                  setResetSecurityAnswer("");
                  setResetNewPassword("");
                  setResetConfirmPassword("");
                  setResetSecurityQuestion("");
                  setResetMessage("");
                  setResetError("");
                }}
                className="w-full py-2 text-slate-400 hover:text-blue-400 text-xs transition-colors"
              >
                Back to login
              </button>
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
    { id: 'logo' as TabType, label: 'Logo', icon: ImageIcon },
    { id: 'password' as TabType, label: 'Password', icon: Lock },
    { id: 'projects' as TabType, label: 'Projects', icon: FolderOpen },
    { id: 'education' as TabType, label: 'Education', icon: GraduationCap },
    { id: 'colors' as TabType, label: 'Colors', icon: Palette },
    { id: 'typography' as TabType, label: 'Typography', icon: Settings },
    { id: 'content' as TabType, label: 'Content', icon: Settings },
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
        <button onClick={() => setAuthed(false)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors flex-shrink-0">
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
                loading={loading}
              />
            )}
            {activeTab === 'chatlogs' && (
              <ChatLogsTab 
                key="chatlogs" 
                sessions={sessions}
                onClearAll={handleClearAllLogs}
                onDeleteSession={handleDeleteSession}
              />
            )}
          </AnimatePresence>
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
  const [profileData, setProfileData] = useState(settings?.profile || {});
  const [aboutImageData, setAboutImageData] = useState(settings?.siteContent?.about?.image || '');

  useEffect(() => {
    if (settings?.profile) {
      setProfileData(settings.profile);
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
            <input
              type="text"
              value={profileData.name?.split(' ')[0] || ''}
              onChange={(e) => setProfileData({ ...profileData, name: `${e.target.value} ${profileData.name?.split(' ').slice(1).join(' ') || ''}` })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
            <input
              type="text"
              value={profileData.name?.split(' ').slice(1).join(' ') || ''}
              onChange={(e) => setProfileData({ ...profileData, name: `${profileData.name?.split(' ')[0] || ''} ${e.target.value}` })}
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
              accept="image/*"
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
              <p className="text-xs text-slate-400">PNG, JPG, SVG files</p>
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
              accept="image/*"
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
              <p className="text-xs text-slate-400">PNG, JPG, SVG files</p>
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

// Password Tab
function PasswordTab({ onChangePassword, settings }: any) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings?.security) {
      setSecurityQuestion(settings.security.securityQuestion || '');
      setSecurityAnswer(settings.security.securityAnswer || '');
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    onChangePassword(currentPassword, newPassword, newUsername, securityQuestion, securityAnswer);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setNewUsername('');
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
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
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
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Leave blank to keep current"
            />
          </div>
          {newPassword && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                required={!!newPassword}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Security Question</label>
            <input
              type="text"
              value={securityQuestion}
              onChange={(e) => setSecurityQuestion(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="e.g., What is your mother's maiden name?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Security Answer</label>
            <input
              type="text"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Your answer"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Lock size={16} />
            Update Credentials
          </button>
        </form>
      </div>
    </motion.div>
  );
}

// Projects Tab
function ProjectsTab({ settings, editingProject, setEditingProject, onSaveProject, onDeleteProject }: any) {
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    image: '',
    technologies: [],
    category: 'fullstack',
    demo: '',
    featured: false,
    finished: true
  });

  const handleSave = () => {
    if (editingProject) {
      onSaveProject(editingProject);
    } else if (newProject.title && newProject.description) {
      onSaveProject({
        ...newProject,
        id: 0,
        technologies: newProject.technologies || []
      } as Project);
      setNewProject({
        title: '',
        description: '',
        image: '',
        technologies: [],
        category: 'fullstack',
        demo: '',
        featured: false,
        finished: true
      });
    }
  };

  const handleTechnologiesChange = (value: string) => {
    const technologies = value.split(',').map(t => t.trim()).filter(t => t);
    if (editingProject) {
      setEditingProject({ ...editingProject, technologies });
    } else {
      setNewProject({ ...newProject, technologies });
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
              value={editingProject?.title || newProject.title}
              onChange={(e) => {
                if (editingProject) {
                  setEditingProject({ ...editingProject, title: e.target.value });
                } else {
                  setNewProject({ ...newProject, title: e.target.value });
                }
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={editingProject?.description || newProject.description}
              onChange={(e) => {
                if (editingProject) {
                  setEditingProject({ ...editingProject, description: e.target.value });
                } else {
                  setNewProject({ ...newProject, description: e.target.value });
                }
              }}
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
            <input
              type="text"
              value={editingProject?.image || newProject.image}
              onChange={(e) => {
                if (editingProject) {
                  setEditingProject({ ...editingProject, image: e.target.value });
                } else {
                  setNewProject({ ...newProject, image: e.target.value });
                }
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={editingProject?.category || newProject.category}
              onChange={(e) => {
                if (editingProject) {
                  setEditingProject({ ...editingProject, category: e.target.value as any });
                } else {
                  setNewProject({ ...newProject, category: e.target.value as any });
                }
              }}
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
              value={(editingProject?.technologies || newProject.technologies || []).join(', ')}
              onChange={(e) => handleTechnologiesChange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Demo URL</label>
            <input
              type="text"
              value={editingProject?.demo || newProject.demo}
              onChange={(e) => {
                if (editingProject) {
                  setEditingProject({ ...editingProject, demo: e.target.value });
                } else {
                  setNewProject({ ...newProject, demo: e.target.value });
                }
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">GitHub URL (optional)</label>
            <input
              type="text"
              value={editingProject?.github || ''}
              onChange={(e) => {
                if (editingProject) {
                  setEditingProject({ ...editingProject, github: e.target.value });
                }
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editingProject?.featured || newProject.featured}
                onChange={(e) => {
                  if (editingProject) {
                    setEditingProject({ ...editingProject, featured: e.target.checked });
                  } else {
                    setNewProject({ ...newProject, featured: e.target.checked });
                  }
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editingProject?.finished !== undefined ? editingProject.finished : newProject.finished}
                onChange={(e) => {
                  if (editingProject) {
                    setEditingProject({ ...editingProject, finished: e.target.checked });
                  } else {
                    setNewProject({ ...newProject, finished: e.target.checked });
                  }
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Finished</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Save size={16} />
            {editingProject ? 'Update Project' : 'Add Project'}
          </button>
          {editingProject && (
            <button
              onClick={() => setEditingProject(null)}
              className="flex items-center gap-2 px-6 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {settings.projects?.map((project: Project) => (
          <div key={project.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">{project.title}</h3>
                  {project.featured && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Featured</span>}
                  {project.finished ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Finished</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">In Progress</span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-2 line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-1">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
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
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Education Tab
function EducationTab({ settings, editingEducation, setEditingEducation, onSaveEducation, onDeleteEducation }: any) {
  const [newEducation, setNewEducation] = useState<Partial<Education>>({
    degree: '',
    institution: '',
    location: '',
    period: '',
    status: 'In Progress',
    description: '',
    icon: 'GraduationCap'
  });

  const handleSave = () => {
    if (editingEducation) {
      onSaveEducation(editingEducation);
    } else if (newEducation.degree && newEducation.institution) {
      onSaveEducation({
        ...newEducation,
        id: 0
      } as Education);
      setNewEducation({
        degree: '',
        institution: '',
        location: '',
        period: '',
        status: 'In Progress',
        description: '',
        icon: 'GraduationCap'
      });
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
              value={editingEducation?.degree || newEducation.degree}
              onChange={(e) => {
                if (editingEducation) {
                  setEditingEducation({ ...editingEducation, degree: e.target.value });
                } else {
                  setNewEducation({ ...newEducation, degree: e.target.value });
                }
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Institution</label>
            <input
              type="text"
              value={editingEducation?.institution || newEducation.institution}
              onChange={(e) => {
                if (editingEducation) {
                  setEditingEducation({ ...editingEducation, institution: e.target.value });
                } else {
                  setNewEducation({ ...newEducation, institution: e.target.value });
                }
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
            <input
              type="text"
              value={editingEducation?.location || newEducation.location}
              onChange={(e) => {
                if (editingEducation) {
                  setEditingEducation({ ...editingEducation, location: e.target.value });
                } else {
                  setNewEducation({ ...newEducation, location: e.target.value });
                }
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Period</label>
            <input
              type="text"
              value={editingEducation?.period || newEducation.period}
              onChange={(e) => {
                if (editingEducation) {
                  setEditingEducation({ ...editingEducation, period: e.target.value });
                } else {
                  setNewEducation({ ...newEducation, period: e.target.value });
                }
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="e.g., 2020 - 2024 or Current"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={editingEducation?.status || newEducation.status}
              onChange={(e) => {
                if (editingEducation) {
                  setEditingEducation({ ...editingEducation, status: e.target.value as any });
                } else {
                  setNewEducation({ ...newEducation, status: e.target.value as any });
                }
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={editingEducation?.description || newEducation.description}
              onChange={(e) => {
                if (editingEducation) {
                  setEditingEducation({ ...editingEducation, description: e.target.value });
                } else {
                  setNewEducation({ ...newEducation, description: e.target.value });
                }
              }}
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
            <select
              value={editingEducation?.icon || newEducation.icon}
              onChange={(e) => {
                if (editingEducation) {
                  setEditingEducation({ ...editingEducation, icon: e.target.value as any });
                } else {
                  setNewEducation({ ...newEducation, icon: e.target.value as any });
                }
              }}
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
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Save size={16} />
            {editingEducation ? 'Update Education' : 'Add Education'}
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
      <div className="space-y-3">
        {settings.education?.map((edu: Education) => (
          <div key={edu.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">{edu.degree}</h3>
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
  const [content, setContent] = useState(settings?.siteContent || {});

  useEffect(() => {
    if (settings?.siteContent) {
      setContent(settings.siteContent);
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