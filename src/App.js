import './storage';
import './App.css';
import React, { useState, useEffect } from 'react';
import { Check, X, Plus, Trash2, Moon, Sun, StickyNote, BarChart3, Flame, Calendar, Palette } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [dailyData, setDailyData] = useState({});
  const [notes, setNotes] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState('purple');
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

  const themes = {
    purple: { from: 'from-purple-500', to: 'to-purple-700', bg: 'bg-purple-600', hover: 'hover:bg-purple-700', light: 'bg-purple-100', text: 'text-purple-600' },
    blue: { from: 'from-blue-500', to: 'to-blue-700', bg: 'bg-blue-600', hover: 'hover:bg-blue-700', light: 'bg-blue-100', text: 'text-blue-600' },
    green: { from: 'from-green-500', to: 'to-green-700', bg: 'bg-green-600', hover: 'hover:bg-green-700', light: 'bg-green-100', text: 'text-green-600' },
    pink: { from: 'from-pink-500', to: 'to-pink-700', bg: 'bg-pink-600', hover: 'hover:bg-pink-700', light: 'bg-pink-100', text: 'text-pink-600' },
    orange: { from: 'from-orange-500', to: 'to-orange-700', bg: 'bg-orange-600', hover: 'hover:bg-orange-700', light: 'bg-orange-100', text: 'text-orange-600' },
    indigo: { from: 'from-indigo-500', to: 'to-indigo-700', bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', light: 'bg-indigo-100', text: 'text-indigo-600' },
  };

  const currentTheme = themes[themeColor];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const habitsResult = await window.storage.get('habits-list');
      const dataResult = await window.storage.get('daily-data');
      const notesResult = await window.storage.get('notes-data');
      const themeResult = await window.storage.get('theme-color');
      const darkModeResult = await window.storage.get('dark-mode');
      
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
    } catch (error) {
      setHabits([
        { id: '1', name: 'Morning Exercise', type: 'check' },
        { id: '2', name: 'Meditation', type: 'check' },
        { id: '3', name: 'Read Book', type: 'check' },
        { id: '4', name: 'Study Time', type: 'hours' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = async (h) => {
    await window.storage.set('habits-list', JSON.stringify(h));
  };

  const saveDailyData = async (data) => {
    await window.storage.set('daily-data', JSON.stringify(data));
  };

  const saveNotes = async (n) => {
    await window.storage.set('notes-data', JSON.stringify(n));
  };

  const saveTheme = async (theme) => {
    await window.storage.set('theme-color', theme);
    setThemeColor(theme);
  };

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    await window.storage.set('dark-mode', JSON.stringify(newMode));
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

  const days = getDaysInMonth();

  return (
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
          <div className="flex gap-2">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-800 text-gray-100 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 text-gray-700'} transition-colors shadow-md`}
            >
              <BarChart3 className="w-4 h-4" />
              Charts
            </button>
            <button
              onClick={() => setShowMonthlyReport(!showMonthlyReport)}
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
          </div>
        </div>

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
                  <th className={`text-left p-3 sticky left-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} z-10`}>
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
                </tr>
              </thead>
              <tbody>
                {days.map(day => {
                  const key = getDateKey(day);
                  const hasNote = notes[key];
                  return (
                    <tr key={day} className={`${darkMode ? 'border-b border-gray-700 hover:bg-gray-750' : 'border-b border-gray-100 hover:bg-gray-50'} transition-colors group`}>
                    
                    {/* Date & Note Column */}
                    <td className={`p-3 sticky left-0 ${darkMode ? 'bg-gray-800 group-hover:bg-gray-700' : 'bg-white group-hover:bg-gray-50'} z-10 border-r ${darkMode ? 'border-gray-700' : 'border-gray-100'} transition-colors`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-col">
                          <span className={`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {day.getDate()}
                          </span>
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>
                        <button
                          onClick={() => openNoteModal(day)}
                          className={`p-1 rounded-md transition-colors ${
                            hasNote 
                              ? `${currentTheme.text} bg-opacity-10` 
                              : `${darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-300 hover:text-gray-500'}`
                          }`}
                        >
                          <StickyNote className={`w-4 h-4 ${hasNote ? 'fill-current' : ''}`} />
                        </button>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  );
};

export default HabitTracker;