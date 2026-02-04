import './storage';
import './App.css';
import React, { useState, useEffect } from 'react';
import { Check, X, Plus, Trash2, Moon, Sun, StickyNote, BarChart3, Flame, Calendar, Palette, Menu, X as CloseIcon, Clock, ChevronRight, User, LogOut, Link as LinkIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [dailyData, setDailyData] = useState({});
  const [notes, setNotes] = useState({});
  const [studySessions, setStudySessions] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState('purple');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showStudyLogger, setShowStudyLogger] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteDate, setCurrentNoteDate] = useState(null);
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitType, setNewHabitType] = useState('check');
  const [loading, setLoading] = useState(true);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionIsStudy, setNewSessionIsStudy] = useState(false);
  const [newSessionHours, setNewSessionHours] = useState('');
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [goalTimeLogs, setGoalTimeLogs] = useState({});
  const [showEditGoals, setShowEditGoals] = useState(false);
  
  // New state for onboarding and user profile
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showTourGuide, setShowTourGuide] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [onboardingStep, setOnboardingStep] = useState('welcome'); // welcome, signup, name-gender, theme, tour
  const [tempUserData, setTempUserData] = useState({ name: '', gender: '', authType: 'guest' });
  const [googleUser, setGoogleUser] = useState(null);

  const themes = {
    purple: { from: 'from-purple-500', to: 'to-purple-700', bg: 'bg-purple-600', hover: 'hover:bg-purple-700', light: 'bg-purple-100', text: 'text-purple-600' },
    blue: { from: 'from-blue-500', to: 'to-blue-700', bg: 'bg-blue-600', hover: 'hover:bg-blue-700', light: 'bg-blue-100', text: 'text-blue-600' },
    green: { from: 'from-green-500', to: 'to-green-700', bg: 'bg-green-600', hover: 'hover:bg-green-700', light: 'bg-green-100', text: 'text-green-600' },
    pink: { from: 'from-pink-500', to: 'to-pink-700', bg: 'bg-pink-600', hover: 'hover:bg-pink-700', light: 'bg-pink-100', text: 'text-pink-600' },
    orange: { from: 'from-orange-500', to: 'to-orange-700', bg: 'bg-orange-600', hover: 'hover:bg-orange-700', light: 'bg-orange-100', text: 'text-orange-600' },
    indigo: { from: 'from-indigo-500', to: 'to-indigo-700', bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', light: 'bg-indigo-100', text: 'text-indigo-600' },
    red: { from: 'from-red-500', to: 'to-red-700', bg: 'bg-red-600', hover: 'hover:bg-red-700', light: 'bg-red-100', text: 'text-red-600' },
    cyan: { from: 'from-cyan-500', to: 'to-cyan-700', bg: 'bg-cyan-600', hover: 'hover:bg-cyan-700', light: 'bg-cyan-100', text: 'text-cyan-600' },
    lime: { from: 'from-lime-500', to: 'to-lime-700', bg: 'bg-lime-600', hover: 'hover:bg-lime-700', light: 'bg-lime-100', text: 'text-lime-600' },
    rose: { from: 'from-rose-500', to: 'to-rose-700', bg: 'bg-rose-600', hover: 'hover:bg-rose-700', light: 'bg-rose-100', text: 'text-rose-600' },
    fuchsia: { from: 'from-fuchsia-500', to: 'to-fuchsia-700', bg: 'bg-fuchsia-600', hover: 'hover:bg-fuchsia-700', light: 'bg-fuchsia-100', text: 'text-fuchsia-600' },
    sky: { from: 'from-sky-500', to: 'to-sky-700', bg: 'bg-sky-600', hover: 'hover:bg-sky-700', light: 'bg-sky-100', text: 'text-sky-600' },
  };

  const genderColorRecommendations = {
    male: ['blue', 'sky', 'indigo', 'cyan', 'purple'],
    female: ['pink', 'rose', 'fuchsia', 'red', 'purple'],
    other: ['green', 'lime', 'orange', 'purple', 'indigo'],
  };

  const currentTheme = themes[themeColor];

  useEffect(() => {
    loadData();
  }, []);

  // Timer effect for active goal
  useEffect(() => {
    let interval;
    if (activeGoalId) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeGoalId]);

  const loadData = async () => {
    try {
      const habitsResult = await window.storage.get('habits-list');
      const dataResult = await window.storage.get('daily-data');
      const notesResult = await window.storage.get('notes-data');
      const themeResult = await window.storage.get('theme-color');
      const darkModeResult = await window.storage.get('dark-mode');
      const studySessionsResult = await window.storage.get('study-sessions');
      const goalTimeLogsResult = await window.storage.get('goal-time-logs');
      const userResult = await window.storage.get('user-profile');
      
      if (habitsResult?.value) setHabits(JSON.parse(habitsResult.value));
      else setHabits([
        { id: '1', name: 'Morning Exercise', type: 'check' },
        { id: '2', name: 'Meditation', type: 'check' },
        { id: '3', name: 'Read Book', type: 'check' },
        { id: '4', name: 'Study Time', type: 'hours' }
      ]);
      
      if (dataResult?.value) setDailyData(JSON.parse(dataResult.value));
      if (notesResult?.value) setNotes(JSON.parse(notesResult.value));
      if (themeResult?.value) setThemeColor(themeResult.value);
      if (darkModeResult?.value) setDarkMode(JSON.parse(darkModeResult.value));
      if (studySessionsResult?.value) setStudySessions(JSON.parse(studySessionsResult.value));
      if (goalTimeLogsResult?.value) setGoalTimeLogs(JSON.parse(goalTimeLogsResult.value));
      
      if (userResult?.value) {
        const userData = JSON.parse(userResult.value);
        setUser(userData);
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
        setOnboardingStep('welcome');
      }
    } catch (error) {
      setHabits([
        { id: '1', name: 'Morning Exercise', type: 'check' },
        { id: '2', name: 'Meditation', type: 'check' },
        { id: '3', name: 'Read Book', type: 'check' },
        { id: '4', name: 'Study Time', type: 'hours' }
      ]);
      setShowOnboarding(true);
      setOnboardingStep('welcome');
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = async (h) => {
    await window.storage.set('habits-list', JSON.stringify(h));
    localStorage.setItem('unsynced', 'true');
    localStorage.setItem('lastLocalUpdate', Date.now().toString());
  };

  const saveUserProfile = async (userData) => {
    const withId = { ...userData, id: userData.id || 'u_' + Date.now().toString() };
    await window.storage.set('user-profile', JSON.stringify(withId));
    setUser(withId);
    // mark local data as having unsynced changes
    localStorage.setItem('unsynced', 'true');
    localStorage.setItem('lastLocalUpdate', Date.now().toString());
    setShowOnboarding(false);
  };

  const linkGoogleAccount = (googleData) => {
    if (user) {
      const updatedUser = {
        ...user,
        authType: 'google',
        googleInfo: {
          email: googleData.email,
          name: googleData.name,
          picture: googleData.picture
        }
      };
      saveUserProfile(updatedUser);
      setGoogleUser(null);
    }
  };

  const logout = async () => {
    setUser(null);
    await window.storage.delete('user-profile');
    setShowOnboarding(true);
    setOnboardingStep('welcome');
    setShowAccountMenu(false);
    // Reload page to clear in-memory state and ensure a fresh start
    window.location.reload();
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    // Decode JWT token to get user info
    const token = credentialResponse.credential;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const googleData = JSON.parse(jsonPayload);
    
    setGoogleUser(googleData);
    setTempUserData({ name: googleData.name, gender: '', authType: 'google' });
    setOnboardingStep('name-gender');
  };

  const saveDailyData = async (data) => {
    await window.storage.set('daily-data', JSON.stringify(data));
    localStorage.setItem('unsynced', 'true');
    localStorage.setItem('lastLocalUpdate', Date.now().toString());
  };

  const saveNotes = async (n) => {
    await window.storage.set('notes-data', JSON.stringify(n));
    localStorage.setItem('unsynced', 'true');
    localStorage.setItem('lastLocalUpdate', Date.now().toString());
  };

  const saveStudySessions = async (sessions) => {
    await window.storage.set('study-sessions', JSON.stringify(sessions));
    localStorage.setItem('unsynced', 'true');
    localStorage.setItem('lastLocalUpdate', Date.now().toString());
  };

  // ----------------------
  // Sync helpers (client)
  // ----------------------
  const collectUserPayload = () => {
    return {
      user: user || JSON.parse(window.localStorage.getItem('user-profile') || '{}'),
      habits: JSON.parse(window.localStorage.getItem('habits-list') || '[]'),
      dailyData: JSON.parse(window.localStorage.getItem('daily-data') || '{}'),
      notes: JSON.parse(window.localStorage.getItem('notes-data') || '{}'),
      studySessions: JSON.parse(window.localStorage.getItem('study-sessions') || '[]'),
      theme: window.localStorage.getItem('theme-color') || null
    };
  };

  const uploadDataToServer = async (requestId) => {
    if (!user || !user.id) return { ok: false, message: 'No user' };
    const payload = collectUserPayload();
    try {
      const res = await fetch('/api/upload-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, requestId, payload })
      });

      if (!res.ok) {
        const txt = await res.text();
        return { ok: false, message: txt };
      }

      // mark synced locally
      localStorage.setItem('unsynced', 'false');
      localStorage.setItem('lastSyncedAt', Date.now().toString());
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  };

  const checkForSyncRequests = async () => {
    if (!user || !user.id) return;
    try {
      const res = await fetch(`/api/check-sync?userId=${encodeURIComponent(user.id)}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.requested && json.requestId) {
        // perform upload
        const r = await uploadDataToServer(json.requestId);
        if (r.ok) {
          // inform server to mark processed (upload endpoint already marks it)
          console.log('Data uploaded for sync request', json.requestId);
        } else {
          console.warn('Upload failed', r.message);
        }
      }
    } catch (err) {
      // silent
    }
  };

  // Poll server for sync requests when a user is present
  useEffect(() => {
    let timer;
    if (user && user.id) {
      checkForSyncRequests();
      timer = setInterval(checkForSyncRequests, 60 * 1000); // every minute
    }
    return () => timer && clearInterval(timer);
  }, [user]);

  const saveTheme = async (theme) => {
    await window.storage.set('theme-color', theme);
    setThemeColor(theme);
  };

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    await window.storage.set('dark-mode', JSON.stringify(newMode));
  };

  const addStudySession = () => {
    if (!newSessionName.trim() || !newSessionHours) return;
    const today = new Date();
    const key = getDateKey(today);
    const updated = { ...studySessions };
    if (!updated[key]) updated[key] = [];
    
    const newSession = {
      id: Date.now().toString(),
      name: newSessionName,
      isStudy: newSessionIsStudy,
      hours: parseFloat(newSessionHours)
    };
    
    updated[key] = [...updated[key], newSession];
    setStudySessions(updated);
    saveStudySessions(updated);
    
    // Auto-update Study Time habit if marked as study
    if (newSessionIsStudy) {
      updateStudyHoursFromSessions(key, updated);
    }
    
    setNewSessionName('');
    setNewSessionHours('');
    setNewSessionIsStudy(false);
  };

  const removeStudySession = (date, sessionId) => {
    const key = getDateKey(date);
    const updated = { ...studySessions };
    if (updated[key]) {
      updated[key] = updated[key].filter(s => s.id !== sessionId);
      if (updated[key].length === 0) delete updated[key];
    }
    setStudySessions(updated);
    saveStudySessions(updated);
    updateStudyHoursFromSessions(key, updated);
  };

  const updateStudyHoursFromSessions = (dateKey, sessions) => {
    const total = sessions[dateKey]?.reduce((sum, s) => sum + s.hours, 0) || 0;
    const date = new Date(dateKey);
    updateHabitHours(date, '4', total.toString());
  };

  const getTodayStudySessions = () => {
    const today = new Date();
    const key = getDateKey(today);
    return studySessions[key] || [];
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startGoal = (goalId) => {
    setActiveGoalId(goalId);
    setElapsedTime(0);
  };

  const stopGoal = (goalId) => {
    setActiveGoalId(null);
    const today = new Date();
    const key = getDateKey(today);
    
    // Add elapsed time to goal's time log
    const updated = { ...goalTimeLogs };
    if (!updated[key]) updated[key] = {};
    if (!updated[key][goalId]) updated[key][goalId] = 0;
    updated[key][goalId] += elapsedTime;
    
    setGoalTimeLogs(updated);
    saveGoalTimeLogs(updated);
    setElapsedTime(0);
  };

  const saveGoalTimeLogs = async (logs) => {
    await window.storage.set('goal-time-logs', JSON.stringify(logs));
  };

  const getGoalTotalTime = (goalId) => {
    const today = new Date();
    const key = getDateKey(today);
    const logsForToday = goalTimeLogs[key] || {};
    return logsForToday[goalId] || 0;
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const updateHabitStatus = (date, habitId, status) => {
    const key = getDateKey(date);
    const updated = { ...dailyData };
    if (!updated[key]) updated[key] = {};
    updated[key][habitId] = status;
    setDailyData(updated);
    saveDailyData(updated);
  };

  const updateHabitHours = (date, habitId, hours) => {
    const key = getDateKey(date);
    const value = Math.max(0, Math.min(24, parseFloat(hours) || 0));
    const updated = { ...dailyData };
    if (!updated[key]) updated[key] = {};
    updated[key][habitId] = value;
    setDailyData(updated);
    saveDailyData(updated);
  };

  const openNoteModal = (date) => {
    const key = getDateKey(date);
    setCurrentNoteDate(date);
    setCurrentNoteText(notes[key] || '');
    setShowNoteModal(true);
  };

  const saveNote = () => {
    const key = getDateKey(currentNoteDate);
    const updated = { ...notes };
    if (currentNoteText.trim()) updated[key] = currentNoteText;
    else delete updated[key];
    setNotes(updated);
    saveNotes(updated);
    setShowNoteModal(false);
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit = {
      id: Date.now().toString(),
      name: newHabitName,
      type: newHabitType
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    saveHabits(updated);
    setNewHabitName('');
    setShowAddHabit(false);
  };

  const removeHabit = (id) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    saveHabits(updated);
  };

  const calculateStreak = (habitId) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = getDateKey(date);
      const value = dailyData[key]?.[habitId];
      
      if (value === 'check' || (typeof value === 'number' && value > 0)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const getChartData = () => {
    const days = getDaysInMonth();
    return days.map(date => {
      const key = getDateKey(date);
      const checkHabits = habits.filter(h => h.type === 'check');
      const completed = checkHabits.filter(h => dailyData[key]?.[h.id] === 'check').length;
      const totalHours = habits
        .filter(h => h.type === 'hours')
        .reduce((sum, h) => sum + (dailyData[key]?.[h.id] || 0), 0);
      
      return {
        date: date.getDate(),
        completion: checkHabits.length > 0 ? Math.round((completed / checkHabits.length) * 100) : 0,
        hours: parseFloat(totalHours.toFixed(1))
      };
    });
  };

  const getMonthlyStats = () => {
    const days = getDaysInMonth();
    const checkHabits = habits.filter(h => h.type === 'check');
    let totalCompleted = 0;
    let totalPossible = days.length * checkHabits.length;
    let totalHours = 0;
    let bestDay = { date: null, score: 0 };
    
    days.forEach(date => {
      const key = getDateKey(date);
      const completed = checkHabits.filter(h => dailyData[key]?.[h.id] === 'check').length;
      totalCompleted += completed;
      
      const dayHours = habits
        .filter(h => h.type === 'hours')
        .reduce((sum, h) => sum + (dailyData[key]?.[h.id] || 0), 0);
      totalHours += dayHours;
      
      const score = checkHabits.length > 0 ? (completed / checkHabits.length) * 100 : 0;
      if (score > bestDay.score) {
        bestDay = { date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), score };
      }
    });

    const habitStats = habits.map(habit => {
      const completed = days.filter(date => {
        const key = getDateKey(date);
        const val = dailyData[key]?.[habit.id];
        return val === 'check' || (typeof val === 'number' && val > 0);
      }).length;
      return { ...habit, completion: Math.round((completed / days.length) * 100) };
    });

    return {
      overallCompletion: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
      totalHours: totalHours.toFixed(1),
      bestDay,
      habitStats
    };
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'} flex items-center justify-center`}>
        <div className={`text-2xl ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} animate-pulse`}>Loading...</div>
      </div>
    );
  }

  // Study Logger View
  if (showStudyLogger) {
    const getColorForIndex = (index) => {
      const colors = [
        { bg: 'bg-red-500', hex: '#ef4444' },
        { bg: 'bg-cyan-500', hex: '#06b6d4' },
        { bg: 'bg-green-500', hex: '#22c55e' },
        { bg: 'bg-purple-500', hex: '#a855f7' },
        { bg: 'bg-blue-500', hex: '#3b82f6' },
        { bg: 'bg-pink-500', hex: '#ec4899' },
      ];
      return colors[index % colors.length];
    };

    return (
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'} transition-colors`}>
        {/* Header */}
        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} backdrop-blur-sm p-4`}>
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Study Timer
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditGoals(!showEditGoals)}
                className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${
                  showEditGoals
                    ? `${currentTheme.bg} text-white`
                    : `${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`
                }`}
              >
                ✎ Edit
              </button>
              <button
                onClick={() => setShowStudyLogger(false)}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                ✕ Back
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full">
          {/* Timer Display */}
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className={`text-center mb-12`}>
              <div className={`text-8xl font-black font-mono tracking-tighter ${
                activeGoalId
                  ? `${currentTheme.from.replace('from-', 'text-')}`
                  : darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {activeGoalId ? formatTime(elapsedTime) : '00:00:00'}
              </div>
              <div className={`text-sm mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {activeGoalId ? `${getTodayStudySessions().find(s => s.id === activeGoalId)?.name} in progress` : 'No session running'}
              </div>
            </div>

            {/* Goals Grid */}
            <div className="w-full max-w-2xl">
              {getTodayStudySessions().length === 0 ? (
                <div className={`text-center py-12 rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No sessions yet. Click "✎ Edit" to add one!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getTodayStudySessions().map((session, index) => {
                    const color = getColorForIndex(index);
                    const totalSeconds = getGoalTotalTime(session.id);
                    const isActive = activeGoalId === session.id;

                    return (
                      <div
                        key={session.id}
                        className={`rounded-xl p-6 transition-all ${
                          isActive
                            ? `${darkMode ? 'bg-gray-700/50' : 'bg-white/80'} ring-2 ring-offset-2 ${color.bg}`
                            : `${darkMode ? 'bg-gray-800/50' : 'bg-white/60'}`
                        } backdrop-blur-sm`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Play Button */}
                          <button
                            onClick={() => isActive ? stopGoal(session.id) : startGoal(session.id)}
                            className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                              isActive
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : `${color.bg} hover:opacity-90 text-white`
                            }`}
                          >
                            {isActive ? (
                              <div className="w-5 h-5 bg-white flex items-center justify-center rounded-sm">
                                <div className="w-3 h-3 bg-red-500 rounded-xs" />
                              </div>
                            ) : (
                              <div className="w-0 h-0 border-l-[6px] border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1" />
                            )}
                          </button>

                          {/* Session Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold truncate text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {session.name}
                            </h4>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Goal: {session.hours}h
                            </p>
                          </div>

                          {/* Time Logged */}
                          <div className="text-right flex-shrink-0">
                            <div className={`font-mono font-bold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {formatTime(totalSeconds)}
                            </div>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              logged
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Edit Mode Section */}
          {showEditGoals && (
            <div className={`mt-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'} pt-8`}>
              <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Manage Sessions
              </h3>

              {/* Add Session Form */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 mb-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Add New Session
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="Session name..."
                      className={`px-4 py-2 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-200 text-gray-800 placeholder-gray-500'} focus:outline-none focus:border-${currentTheme.from.split('-')[1]}-500`}
                    />
                    <input
                      type="number"
                      value={newSessionHours}
                      onChange={(e) => setNewSessionHours(e.target.value)}
                      placeholder="Goal hours..."
                      step="0.5"
                      min="0"
                      max="24"
                      className={`px-4 py-2 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-200 text-gray-800 placeholder-gray-500'} focus:outline-none focus:border-${currentTheme.from.split('-')[1]}-500`}
                    />
                  </div>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSessionIsStudy}
                      onChange={(e) => setNewSessionIsStudy(e.target.checked)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      Count as Study Time
                    </span>
                  </label>

                  <button
                    onClick={addStudySession}
                    className={`w-full px-6 py-3 ${currentTheme.bg} text-white rounded-lg ${currentTheme.hover} transition-colors shadow-md font-medium flex items-center justify-center gap-2`}
                  >
                    <Plus className="w-5 h-5" />
                    Add Session
                  </button>
                </div>
              </div>

              {/* Existing Sessions for Deletion */}
              {getTodayStudySessions().length > 0 && (
                <div>
                  <h4 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Today's Sessions
                  </h4>
                  <div className="space-y-2">
                    {getTodayStudySessions().map(session => (
                      <div
                        key={session.id}
                        className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}
                      >
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {session.name}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {session.hours}h goal • {formatTime(getGoalTotalTime(session.id))} logged
                            {session.isStudy && <span className="ml-2">📚 Study</span>}
                          </p>
                        </div>
                        <button
                          onClick={() => removeStudySession(new Date(), session.id)}
                          className="text-red-500 hover:text-red-600 transition-colors p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const days = getDaysInMonth();

  // Onboarding Component
  if (showOnboarding) {
    return (
      <GoogleOAuthProvider clientId="1029255211355-03djpqsk30613d0i3sqaji2oll1dsks1.apps.googleusercontent.com">
        <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
          <div className={`max-w-md w-full rounded-2xl shadow-2xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            
            {/* Welcome Step */}
            {onboardingStep === 'welcome' && (
              <div className="text-center space-y-6">
                <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Welcome! 👋
                </h1>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Start tracking your habits and achieve your goals
                </p>
                
                <div className="flex flex-col items-center gap-4 w-full">
                  <div style={{ width: 320, maxWidth: '100%' }} className="mx-auto">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => console.log('Login Failed')}
                      text="signin"
                      width="320"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setTempUserData({ name: '', gender: '', authType: 'guest' });
                      setOnboardingStep('name-gender');
                    }}
                    className={`w-full px-6 py-4 rounded-xl font-semibold text-xl transition-colors ${
                      darkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    Continue as Guest
                  </button>
                </div>
              </div>
            )}

            {/* Name & Gender Step */}
            {onboardingStep === 'name-gender' && (
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tell us about you
                </h2>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={tempUserData.name}
                    onChange={(e) => setTempUserData({ ...tempUserData, name: e.target.value })}
                    placeholder="Enter your name"
                    className={`w-full px-4 py-2 rounded-lg border-2 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'border-gray-200 text-gray-800 placeholder-gray-500'
                    } focus:outline-none focus:border-purple-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['male', 'female', 'other'].map((gender) => (
                      <button
                        key={gender}
                        onClick={() => setTempUserData({ ...tempUserData, gender })}
                        className={`py-2 rounded-lg font-semibold transition-all capitalize ${
                          tempUserData.gender === gender
                            ? 'bg-purple-600 text-white scale-105'
                            : darkMode
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (tempUserData.name.trim() && tempUserData.gender) {
                      setOnboardingStep('theme');
                    }
                  }}
                  disabled={!tempUserData.name.trim() || !tempUserData.gender}
                  className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition-colors ${
                    tempUserData.name.trim() && tempUserData.gender
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : darkMode
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next <ChevronRight className="inline w-5 h-5" />
                </button>
              </div>
            )}

            {/* Theme Step */}
            {onboardingStep === 'theme' && (
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Choose Your Theme
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {tempUserData.gender ? `Recommended colors for ${tempUserData.gender}:` : 'Select your favorite color'}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {(tempUserData.gender ? genderColorRecommendations[tempUserData.gender] : Object.keys(themes)).map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setThemeColor(color);
                        setTempUserData({ ...tempUserData, theme: color });
                      }}
                      className={`p-4 rounded-lg font-semibold text-white transition-all capitalize ${
                        themeColor === color ? 'ring-4 ring-offset-2 scale-110' : 'hover:opacity-90'
                      } ${themes[color].bg}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setOnboardingStep('name-gender')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      darkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setOnboardingStep('tour')}
                    className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${currentTheme.bg} ${currentTheme.hover}`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Tour Step */}
            {onboardingStep === 'tour' && (
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Quick Tour 🎯
                </h2>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-purple-50'}`}>
                  {tourStep === 0 && (
                    <div className="space-y-3">
                      <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>📊 Dashboard</h3>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Track all your daily habits at a glance. Mark habits as complete or track hours for activities like study time.
                      </p>
                    </div>
                  )}
                  {tourStep === 1 && (
                    <div className="space-y-3">
                      <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>🌙 Dark Mode & Colors</h3>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Toggle dark mode for comfortable viewing. Switch theme colors anytime from the menu.
                      </p>
                    </div>
                  )}
                  {tourStep === 2 && (
                    <div className="space-y-3">
                      <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>⏱️ Study Logger</h3>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Track study sessions with a real-time timer. Start/stop sessions and log hours automatically.
                      </p>
                    </div>
                  )}
                  {tourStep === 3 && (
                    <div className="space-y-3">
                      <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>📈 Charts & Reports</h3>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        View beautiful charts and monthly reports of your progress to stay motivated.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        tourStep === i ? currentTheme.bg : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTourStep(Math.max(0, tourStep - 1))}
                    disabled={tourStep === 0}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      tourStep === 0
                        ? darkMode
                          ? 'bg-gray-700/50 text-gray-500'
                          : 'bg-gray-200/50 text-gray-500'
                        : darkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (tourStep < 3) {
                        setTourStep(tourStep + 1);
                      } else {
                        // Complete onboarding
                        const newUser = {
                          ...tempUserData,
                          theme: themeColor,
                          createdAt: new Date().toISOString(),
                          googleInfo: googleUser || null
                        };
                        saveUserProfile(newUser);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${currentTheme.bg} ${currentTheme.hover}`}
                  >
                    {tourStep === 3 ? 'Get Started!' : 'Next'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </GoogleOAuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId="1029255211355-03djpqsk30613d0i3sqaji2oll1dsks1.apps.googleusercontent.com">
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'} p-4 transition-colors`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r ' + currentTheme.from + ' ' + currentTheme.to}`}>
              Habit Tracker
            </h1>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => setShowStudyLogger(true)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-800 text-gray-100 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 text-gray-700'} transition-colors shadow-md`}
            >
              <Clock className="w-4 h-4" />
              Study Logger
            </button>
            <button
              onClick={() => {
                setShowCharts(!showCharts);
                if (!showCharts) setShowMonthlyReport(false);
              }}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-800 text-gray-100 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 text-gray-700'} transition-colors shadow-md`}
            >
              <BarChart3 className="w-4 h-4" />
              Charts
            </button>
            <button
              onClick={() => {
                setShowMonthlyReport(!showMonthlyReport);
                if (!showMonthlyReport) setShowCharts(false);
              }}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-800 text-gray-100 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 text-gray-700'} transition-colors shadow-md`}
            >
              <Calendar className="w-4 h-4" />
              Report
            </button>
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-800 text-gray-100 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 text-gray-700'} transition-colors shadow-md`}
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 text-gray-700'} transition-colors shadow-md`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className={`p-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-800 text-gray-100 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 text-gray-700'} transition-colors shadow-md`}
              >
                <User className="w-5 h-5" />
              </button>
              
              {/* Account Dropdown Menu */}
              {showAccountMenu && (
                <div className={`absolute right-0 mt-2 w-72 rounded-lg shadow-2xl z-50 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  {/* User Info */}
                  <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Account
                    </h3>
                    <p className={`text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="font-semibold">Name:</span> {user?.name}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="font-semibold">Gender:</span> {user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not set'}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="font-semibold">Status:</span> {user?.authType === 'google' ? '✓ Google Account' : 'Guest'}
                    </p>
                  </div>

                  {/* Link Google Account Option */}
                  {user?.authType === 'guest' && (
                    <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h4 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Connect Google Account
                      </h4>
                      <GoogleLogin
                        onSuccess={(credentialResponse) => {
                          const token = credentialResponse.credential;
                          const base64Url = token.split('.')[1];
                          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                          const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                          }).join(''));
                          const googleData = JSON.parse(jsonPayload);
                          linkGoogleAccount(googleData);
                        }}
                        onError={() => console.log('Login Failed')}
                        text="signin_with"
                        width="250"
                      />
                    </div>
                  )}

                  {/* Admin Panel (visible if you are the configured admin) */}
                  {user?.googleInfo?.email === process.env.REACT_APP_ADMIN_EMAIL && (
                    <div className="p-4 border-b">
                      <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Admin</h4>
                      <div className="flex gap-2">
                        <input
                          value={adminTargetUserId || ''}
                          onChange={(e) => setAdminTargetUserId(e.target.value)}
                          placeholder="target user id"
                          className="flex-1 px-3 py-2 rounded-lg border"
                        />
                        <button
                          onClick={async () => {
                            if (!adminTargetUserId) return setAdminStatus('Enter user id');
                            setAdminStatus('Requesting...');
                            try {
                              const res = await fetch('/api/request-sync', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'x-admin-secret': process.env.REACT_APP_ADMIN_SECRET || ''
                                },
                                body: JSON.stringify({ userId: adminTargetUserId })
                              });
                              const txt = await res.text();
                              if (res.ok) setAdminStatus('Requested'); else setAdminStatus('Failed: ' + txt);
                            } catch (err) {
                              setAdminStatus('Error');
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
                        >
                          Request Sync
                        </button>
                      </div>
                      {adminStatus && <div className="mt-2 text-sm text-gray-500">{adminStatus}</div>}
                    </div>
                  )}

                  {/* Logout Button */}
                  <div className="p-4">
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-100 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 text-gray-700'} transition-colors shadow-md`}
          >
            {menuOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {menuOpen && (
          <div className={`md:hidden mb-6 rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button
              onClick={() => {
                setShowStudyLogger(true);
                setMenuOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-2 border-b ${darkMode ? 'border-gray-700 text-gray-100 hover:bg-gray-700' : 'border-gray-100 text-gray-700 hover:bg-gray-50'} transition-colors text-left`}
            >
              <Clock className="w-4 h-4" />
              Study Logger
            </button>
            <button
              onClick={() => {
                setShowCharts(!showCharts);
                setShowMonthlyReport(false);
                setMenuOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-2 border-b ${darkMode ? 'border-gray-700 text-gray-100 hover:bg-gray-700' : 'border-gray-100 text-gray-700 hover:bg-gray-50'} transition-colors text-left`}
            >
              <BarChart3 className="w-4 h-4" />
              Charts
            </button>
            <button
              onClick={() => {
                setShowMonthlyReport(!showMonthlyReport);
                setShowCharts(false);
                setMenuOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-2 border-b ${darkMode ? 'border-gray-700 text-gray-100 hover:bg-gray-700' : 'border-gray-100 text-gray-700 hover:bg-gray-50'} transition-colors text-left`}
            >
              <Calendar className="w-4 h-4" />
              Report
            </button>
            <button
              onClick={() => {
                setShowThemePicker(!showThemePicker);
                setMenuOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-2 border-b ${darkMode ? 'border-gray-700 text-gray-100 hover:bg-gray-700' : 'border-gray-100 text-gray-700 hover:bg-gray-50'} transition-colors text-left`}
            >
              <Palette className="w-4 h-4" />
              Theme
            </button>
            <button
              onClick={() => {
                toggleDarkMode();
                setMenuOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-2 ${darkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors text-left`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        )}

        {/* Theme Picker */}
        {showThemePicker && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6 border-2`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Choose Theme Color</h3>
            <div className="flex gap-3">
              {Object.keys(themes).map(theme => (
                <button
                  key={theme}
                  onClick={() => saveTheme(theme)}
                  className={`w-16 h-16 rounded-lg bg-gradient-to-br ${themes[theme].from} ${themes[theme].to} hover:scale-110 transition-transform ${themeColor === theme ? 'ring-4 ring-offset-2 ' + (darkMode ? 'ring-offset-gray-800' : 'ring-offset-white') : ''}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Month Navigation */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-4 mb-6 border`}>
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() - 1);
                setCurrentMonth(newMonth);
              }}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-100' : 'hover:bg-gray-100 text-gray-700'} transition-colors font-medium`}
            >
              ← Previous
            </button>
            <span className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() + 1);
                setCurrentMonth(newMonth);
              }}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-100' : 'hover:bg-gray-100 text-gray-700'} transition-colors font-medium`}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Charts */}
        {showCharts && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6 border`}>
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Progress Charts</h2>
            <div className="space-y-8">
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Daily Completion Rate</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="date" stroke={darkMode ? '#d1d5db' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#d1d5db' : '#6b7280'} />
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: '8px', color: darkMode ? '#fff' : '#000' }} />
                    <Legend />
                    <Line type="monotone" dataKey="completion" stroke="#8b5cf6" strokeWidth={2} name="Completion %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Daily Hours Logged</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="date" stroke={darkMode ? '#d1d5db' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#d1d5db' : '#6b7280'} />
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: '8px', color: darkMode ? '#fff' : '#000' }} />
                    <Legend />
                    <Bar dataKey="hours" fill="#3b82f6" name="Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Report */}
        {showMonthlyReport && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6 border`}>
            <h2 className={`text-3xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              📊 Monthly Report
            </h2>
            {(() => {
              const stats = getMonthlyStats();
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`bg-gradient-to-br ${currentTheme.from} ${currentTheme.to} rounded-xl p-6 text-white shadow-lg`}>
                      <div className="text-sm opacity-90 font-medium">Overall Completion</div>
                      <div className="text-4xl font-bold mt-2">{stats.overallCompletion}%</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                      <div className="text-sm opacity-90 font-medium">Total Hours</div>
                      <div className="text-4xl font-bold mt-2">{stats.totalHours}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white shadow-lg">
                      <div className="text-sm opacity-90 font-medium">Best Day</div>
                      <div className="text-2xl font-bold mt-2">{stats.bestDay.date || 'N/A'}</div>
                      <div className="text-sm opacity-90">{stats.bestDay.score.toFixed(0)}% complete</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Habit Performance</h3>
                    <div className="space-y-3">
                      {stats.habitStats.map(habit => (
                        <div key={habit.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{habit.name}</span>
                            <span className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>{habit.completion}%</span>
                          </div>
                          <div className={`h-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                            <div
                              className={`h-full bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} transition-all`}
                              style={{ width: `${habit.completion}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Add Habit Form */}
        {showAddHabit && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6 border`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Add New Habit</h3>
            <div className="flex gap-4">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Habit name..."
                className={`flex-1 px-4 py-2 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-200 text-gray-800 placeholder-gray-500'} focus:border-${themeColor}-500 focus:outline-none`}
              />
              <select
                value={newHabitType}
                onChange={(e) => setNewHabitType(e.target.value)}
                className={`px-4 py-2 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200 text-gray-800'} focus:border-${themeColor}-500 focus:outline-none`}
              >
                <option value="check">✓/✗ Type</option>
                <option value="hours">Hours Type</option>
              </select>
              <button
                onClick={addHabit}
                className={`px-6 py-2 ${currentTheme.bg} text-white rounded-lg ${currentTheme.hover} transition-colors shadow-md`}
              >
                Add
              </button>
              <button
                onClick={() => setShowAddHabit(false)}
                className={`px-6 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Note Modal */}
        {showNoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-2xl p-6 max-w-lg w-full border`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Note for {currentNoteDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </h3>
              <textarea
                value={currentNoteText}
                onChange={(e) => setCurrentNoteText(e.target.value)}
                placeholder="Add your note here..."
                className={`w-full px-4 py-3 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-200 text-gray-800 placeholder-gray-500'} focus:border-${themeColor}-500 focus:outline-none`}
                rows="6"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={saveNote}
                  className={`flex-1 px-6 py-2 ${currentTheme.bg} text-white rounded-lg ${currentTheme.hover} transition-colors shadow-md`}
                >
                  Save Note
                </button>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className={`flex-1 px-6 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Tracker Grid */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 overflow-x-auto border`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Habits Tracker</h2>
            <button
              onClick={() => setShowAddHabit(true)}
              className={`px-4 py-2 ${currentTheme.bg} text-white rounded-lg ${currentTheme.hover} transition-colors flex items-center gap-2 shadow-md`}
            >
              <Plus className="w-4 h-4" />
              Add Habit
            </button>
          </div>

          <div className="min-w-max">
            <table className="w-full">
              <thead>
                <tr className={darkMode ? 'border-b-2 border-gray-700' : 'border-b-2 border-gray-200'}>
                  <th className={`text-left p-3 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <span className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Date / Day</span>
                  </th>
                  {habits.map(habit => (
                    <th key={habit.id} className="p-3 text-center min-w-[100px]">
                      <div className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                        {habit.name}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-xs text-orange-500 mt-1">
                        <Flame className="w-3 h-3" />
                        {calculateStreak(habit.id)}
                      </div>
                      <button
                        onClick={() => removeHabit(habit.id)}
                        className="mt-1 text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 mx-auto" />
                      </button>
                    </th>
                  ))}
                  <th className="p-3 text-center min-w-[80px]">
                    <span className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>Notes</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {days.map(day => {
                  const key = getDateKey(day);
                  const hasNote = notes[key];
                  return (
                    <tr key={day} className={`${darkMode ? 'border-b border-gray-700 hover:bg-gray-750' : 'border-b border-gray-100 hover:bg-gray-50'} transition-colors group`}>
                    
                    {/* Date Column */}
                    <td className={`p-3 ${darkMode ? 'bg-gray-800 group-hover:bg-gray-700' : 'bg-white group-hover:bg-gray-50'} transition-colors`}>
                      <div className="flex flex-col">
                        <span className={`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {day.getDate()}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    </td>

                    {/* Habit Columns */}
                    {habits.map(habit => {
                      const status = dailyData[key]?.[habit.id];
                      
                      return (
                        <td key={habit.id} className="p-3 text-center align-middle">
                          {habit.type === 'check' ? (
                            <button
                              onClick={() => {
                                // Cycle: Empty -> Check -> Fail -> Empty
                                const newStatus = status === 'check' ? 'fail' : status === 'fail' ? undefined : 'check';
                                updateHabitStatus(day, habit.id, newStatus);
                              }}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 mx-auto ${
                                status === 'check'
                                  ? `${currentTheme.bg} text-white shadow-md transform scale-105`
                                  : status === 'fail'
                                  ? 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400'
                                  : `${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} text-gray-300`
                              }`}
                            >
                              {status === 'check' && <Check className="w-5 h-5" />}
                              {status === 'fail' && <X className="w-5 h-5" />}
                            </button>
                          ) : (
                            <div className="relative flex items-center justify-center">
                              <input
                                type="number"
                                min="0"
                                max="24"
                                step="0.5"
                                value={status || ''}
                                onChange={(e) => updateHabitHours(day, habit.id, e.target.value)}
                                className={`w-16 text-center bg-transparent border-b-2 focus:outline-none transition-colors font-medium ${
                                  status > 0 ? currentTheme.text : darkMode ? 'text-gray-400' : 'text-gray-600'
                                } ${
                                  darkMode 
                                    ? 'border-gray-600 focus:border-gray-400' 
                                    : 'border-gray-300 focus:border-gray-500'
                                }`}
                                placeholder="-"
                              />
                              {status > 0 && (
                                <span className={`text-[10px] absolute -top-2 right-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>h</span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    
                    {/* Note Column */}
                    <td className="p-3 text-center align-middle">
                      <button
                        onClick={() => openNoteModal(day)}
                        className={`p-2 rounded-md transition-colors mx-auto ${
                          hasNote 
                            ? `${currentTheme.text} bg-opacity-10` 
                            : `${darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-300 hover:text-gray-500'}`
                        }`}
                      >
                        <StickyNote className={`w-4 h-4 ${hasNote ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
    </GoogleOAuthProvider>
  );
};

export default HabitTracker;