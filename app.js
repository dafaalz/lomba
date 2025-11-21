// Aplikasi Produktivitas Belajar Modern
class StudyFocusApp {
    constructor() {
        this.todos = [];
        this.pomodoroStats = {
            sessionsToday: 0,
            minutesToday: 0,
            totalSessions: 0,
            totalMinutes: 0,
            history: []
        };
        this.quickNotes = '';
        this.currentTheme = 'light';
        
        // Pomodoro Timer
        this.timer = {
            minutes: 25,
            seconds: 0,
            isRunning: false,
            mode: 'focus',
            interval: null,
            completedSessions: 0
        };
        
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupNavigation();
        this.applyTheme();
        
        // Page-specific initialization
        if (this.currentPage === 'dashboard.html' || this.currentPage === 'index.html') {
            this.renderTodos();
            this.updateStats();
            this.updateTimerDisplay();
        }
        
        if (this.currentPage === 'pomodoro.html') {
            this.initPomodoroPage();
        }
        
        if (this.currentPage === 'todo.html') {
            this.initTodoPage();
        }
        
        if (this.currentPage === 'stats.html') {
            this.initStatsPage();
        }
    }
    
    // Navigation
    setupNavigation() {
        // Highlight current page in navigation
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Mobile menu toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
    
    // LocalStorage Operations
    loadData() {
        // Load todos
        const savedTodos = localStorage.getItem('studyFocusTodos');
        if (savedTodos) {
            this.todos = JSON.parse(savedTodos);
        }
        
        // Load pomodoro stats
        const savedStats = localStorage.getItem('studyFocusStats');
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            this.pomodoroStats = { ...this.pomodoroStats, ...stats };
            
            // Reset daily stats if it's a new day
            const today = new Date().toDateString();
            const lastSavedDate = localStorage.getItem('studyFocusLastDate');
            if (lastSavedDate !== today) {
                // Save yesterday's data to history
                if (lastSavedDate && (this.pomodoroStats.sessionsToday > 0 || this.pomodoroStats.minutesToday > 0)) {
                    this.pomodoroStats.history.unshift({
                        date: lastSavedDate,
                        sessions: this.pomodoroStats.sessionsToday,
                        minutes: this.pomodoroStats.minutesToday
                    });
                    
                    // Keep only last 30 days of history
                    if (this.pomodoroStats.history.length > 30) {
                        this.pomodoroStats.history = this.pomodoroStats.history.slice(0, 30);
                    }
                }
                
                this.pomodoroStats.sessionsToday = 0;
                this.pomodoroStats.minutesToday = 0;
                localStorage.setItem('studyFocusLastDate', today);
                this.savePomodoroStats();
            }
        }
        
        // Load quick notes
        const savedNotes = localStorage.getItem('studyFocusNotes');
        if (savedNotes) {
            this.quickNotes = savedNotes;
            const notesTextarea = document.getElementById('quickNotes');
            if (notesTextarea) {
                notesTextarea.value = this.quickNotes;
            }
        }
        
        // Load theme
        const savedTheme = localStorage.getItem('studyFocusTheme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        }
    }
    
    saveTodos() {
        localStorage.setItem('studyFocusTodos', JSON.stringify(this.todos));
    }
    
    savePomodoroStats() {
        localStorage.setItem('studyFocusStats', JSON.stringify(this.pomodoroStats));
    }
    
    saveQuickNotes() {
        localStorage.setItem('studyFocusNotes', this.quickNotes);
    }
    
    saveTheme() {
        localStorage.setItem('studyFocusTheme', this.currentTheme);
    }
    
    // Todo List Functions
    addTodo(text) {
        if (text.trim() === '') {
            this.showNotification('Masukkan teks tugas terlebih dahulu', 'error');
            return;
        }
        
        const newTodo = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.unshift(newTodo);
        this.saveTodos();
        this.renderTodos();
        
        // Clear input
        const todoInput = document.getElementById('todoInput');
        if (todoInput) {
            todoInput.value = '';
            todoInput.focus();
        }
        
        this.showNotification('Tugas berhasil ditambahkan');
        this.updateStats();
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            
            if (todo.completed) {
                this.showNotification('Tugas ditandai selesai');
            }
        }
    }
    
    editTodo(id, newText) {
        if (newText.trim() === '') {
            this.showNotification('Teks tugas tidak boleh kosong', 'error');
            return;
        }
        
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = newText.trim();
            this.saveTodos();
            this.renderTodos();
            this.showNotification('Tugas berhasil diperbarui');
        }
    }
    
    deleteTodo(id) {
        const todoIndex = this.todos.findIndex(t => t.id === id);
        if (todoIndex !== -1) {
            this.todos.splice(todoIndex, 1);
            this.saveTodos();
            this.renderTodos();
            this.showNotification('Tugas berhasil dihapus');
            this.updateStats();
        }
    }
    
    renderTodos() {
        const todoList = document.getElementById('todoList');
        if (!todoList) return;
        
        todoList.innerHTML = '';
        
        // Filter todos based on current page
        let displayTodos = this.todos;
        if (this.currentPage === 'dashboard.html') {
            displayTodos = this.todos.slice(0, 5); // Show only 5 todos in dashboard
        }
        
        if (displayTodos.length === 0) {
            todoList.innerHTML = '<li class="empty-message">Tidak ada tugas. Tambahkan tugas baru!</li>';
            return;
        }
        
        displayTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="todo-action-btn edit" data-id="${todo.id}" title="Edit tugas">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="todo-action-btn delete" data-id="${todo.id}" title="Hapus tugas">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            todoList.appendChild(li);
            
            // Add event listeners
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
            
            const editBtn = li.querySelector('.edit');
            editBtn.addEventListener('click', () => this.openEditModal(todo.id, todo.text));
            
            const deleteBtn = li.querySelector('.delete');
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
        });
    }
    
    openEditModal(id, currentText) {
        const modal = document.getElementById('editModal');
        const input = document.getElementById('editTodoInput');
        
        if (!modal || !input) return;
        
        input.value = currentText;
        modal.classList.add('active');
        input.focus();
        
        // Set up event listeners for modal buttons
        const saveEdit = document.getElementById('saveEdit');
        const cancelEdit = document.getElementById('cancelEdit');
        
        if (saveEdit) {
            saveEdit.onclick = () => {
                this.editTodo(id, input.value);
                modal.classList.remove('active');
            };
        }
        
        if (cancelEdit) {
            cancelEdit.onclick = () => {
                modal.classList.remove('active');
            };
        }
        
        // Close modal when clicking outside or pressing Escape
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.classList.remove('active');
            }
        });
        
        // Save on Enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.editTodo(id, input.value);
                modal.classList.remove('active');
            }
        });
    }
    
    // Pomodoro Timer Functions
    initPomodoroPage() {
        this.updateTimerDisplay();
        this.updateSessionCounter();
    }
    
    startTimer() {
        if (this.timer.isRunning) return;
        
        this.timer.isRunning = true;
        this.timer.interval = setInterval(() => {
            this.tickTimer();
        }, 1000);
        
        this.updateTimerButtons();
        this.showNotification('Timer dimulai! Fokus dan selamat belajar!');
    }
    
    pauseTimer() {
        if (!this.timer.isRunning) return;
        
        this.timer.isRunning = false;
        clearInterval(this.timer.interval);
        
        this.updateTimerButtons();
        this.showNotification('Timer dijeda');
    }
    
    resetTimer() {
        this.pauseTimer();
        this.setTimerMode(this.timer.mode);
        
        this.updateTimerButtons();
        this.showNotification('Timer direset');
    }
    
    tickTimer() {
        if (this.timer.seconds > 0) {
            this.timer.seconds--;
        } else if (this.timer.minutes > 0) {
            this.timer.minutes--;
            this.timer.seconds = 59;
        } else {
            // Timer finished
            this.timerFinished();
            return;
        }
        
        this.updateTimerDisplay();
    }
    
    timerFinished() {
        this.pauseTimer();
        
        // Play notification sound
        this.playNotification();
        
        // Update stats based on timer mode
        if (this.timer.mode === 'focus') {
            this.pomodoroStats.sessionsToday++;
            this.pomodoroStats.minutesToday += 25;
            this.pomodoroStats.totalSessions++;
            this.pomodoroStats.totalMinutes += 25;
            this.timer.completedSessions++;
            
            this.savePomodoroStats();
            this.updateStats();
            
            // Show notification
            this.showNotification('Sesi fokus selesai! 🎉 Waktunya istirahat.', 'success');
            
            // Auto-start break after focus session
            setTimeout(() => {
                if (this.timer.completedSessions % 4 === 0) {
                    this.setTimerMode('longBreak');
                    this.showNotification('Istirahat panjang dimulai (15 menit)');
                } else {
                    this.setTimerMode('shortBreak');
                    this.showNotification('Istirahat pendek dimulai (5 menit)');
                }
                this.startTimer();
            }, 2000);
        } else {
            // Break finished, show notification to start focus session
            this.showNotification('Istirahat selesai! Waktunya fokus kembali.', 'success');
            
            // Auto-start focus session after break
            setTimeout(() => {
                this.setTimerMode('focus');
                this.showNotification('Sesi fokus dimulai!');
                this.startTimer();
            }, 3000);
        }
        
        this.updateSessionCounter();
    }
    
    playNotification() {
        // Create a simple beep using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (e) {
            console.log('Audio notification not supported');
        }
    }
    
    setTimerMode(mode) {
        this.timer.mode = mode;
        
        // Update active button
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Set timer values based on mode
        switch (mode) {
            case 'focus':
                this.timer.minutes = 25;
                break;
            case 'shortBreak':
                this.timer.minutes = 5;
                break;
            case 'longBreak':
                this.timer.minutes = 15;
                break;
        }
        
        this.timer.seconds = 0;
        this.updateTimerDisplay();
        this.updateSessionCounter();
    }
    
    updateTimerDisplay() {
        const timerDisplay = document.getElementById('timer');
        if (timerDisplay) {
            const minutes = this.timer.minutes.toString().padStart(2, '0');
            const seconds = this.timer.seconds.toString().padStart(2, '0');
            timerDisplay.textContent = `${minutes}:${seconds}`;
        }
    }
    
    updateSessionCounter() {
        const sessionCounter = document.getElementById('sessionCounter');
        if (sessionCounter) {
            sessionCounter.textContent = `Sesi: ${this.timer.completedSessions}`;
        }
    }
    
    updateTimerButtons() {
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        
        if (startBtn && pauseBtn) {
            startBtn.disabled = this.timer.isRunning;
            pauseBtn.disabled = !this.timer.isRunning;
        }
    }
    
    // Stats Functions
    updateStats() {
        const todaySessions = document.getElementById('todaySessions');
        const todayMinutes = document.getElementById('todayMinutes');
        const completedTasks = document.getElementById('completedTasks');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (todaySessions) {
            todaySessions.textContent = this.pomodoroStats.sessionsToday;
        }
        
        if (todayMinutes) {
            todayMinutes.textContent = this.pomodoroStats.minutesToday;
        }
        
        if (completedTasks) {
            const completedCount = this.todos.filter(todo => todo.completed).length;
            completedTasks.textContent = completedCount;
        }
        
        if (progressFill && progressText) {
            // Calculate progress (assuming 8 sessions per day is the goal)
            const progress = Math.min((this.pomodoroStats.sessionsToday / 8) * 100, 100);
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }
    }
    
    initStatsPage() {
        this.updateStats();
        this.renderStatsHistory();
        this.renderCharts();
    }
    
    renderStatsHistory() {
        const historyList = document.getElementById('statsHistory');
        if (!historyList) return;
        
        historyList.innerHTML = '';
        
        if (this.pomodoroStats.history.length === 0) {
            historyList.innerHTML = '<div class="empty-message">Belum ada data sejarah</div>';
            return;
        }
        
        this.pomodoroStats.history.slice(0, 7).forEach(day => {
            const li = document.createElement('li');
            li.className = 'history-item';
            
            const date = new Date(day.date);
            const formattedDate = date.toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });
            
            li.innerHTML = `
                <span class="history-date">${formattedDate}</span>
                <div class="history-stats">
                    <span class="history-value">${day.sessions} sesi</span>
                    <span class="history-value">${day.minutes} menit</span>
                </div>
            `;
            
            historyList.appendChild(li);
        });
    }
    
    renderCharts() {
        // This is a placeholder for chart implementation
        // In a real application, you would use a library like Chart.js
        console.log('Charts would be rendered here with data:', this.pomodoroStats);
    }
    
    // Theme Functions
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
    }
    
    applyTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            const icon = themeBtn.querySelector('i');
            if (icon) {
                icon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }
    
    // Quick Notes Functions
    updateQuickNotes(text) {
        this.quickNotes = text;
        this.saveQuickNotes();
    }
    
    // Utility Functions
    showNotification(message, type = 'success') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Event Listeners
    setupEventListeners() {
        // Todo List
        const addTodoBtn = document.getElementById('addTodo');
        const todoInput = document.getElementById('todoInput');
        
        if (addTodoBtn && todoInput) {
            addTodoBtn.addEventListener('click', () => {
                this.addTodo(todoInput.value);
            });
            
            todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTodo(e.target.value);
                }
            });
        }
        
        // Pomodoro Timer
        const startTimerBtn = document.getElementById('startTimer');
        const pauseTimerBtn = document.getElementById('pauseTimer');
        const resetTimerBtn = document.getElementById('resetTimer');
        
        if (startTimerBtn) {
            startTimerBtn.addEventListener('click', () => this.startTimer());
        }
        
        if (pauseTimerBtn) {
            pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
        }
        
        if (resetTimerBtn) {
            resetTimerBtn.addEventListener('click', () => this.resetTimer());
        }
        
        // Timer modes
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTimerMode(e.currentTarget.dataset.mode);
            });
        });
        
        // Quick Notes
        const quickNotes = document.getElementById('quickNotes');
        if (quickNotes) {
            quickNotes.addEventListener('input', (e) => {
                this.updateQuickNotes(e.target.value);
            });
        }
        
        // Theme Toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studyFocusApp = new StudyFocusApp();
});