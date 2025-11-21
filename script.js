// Peningkatan StudyFocusApp dengan fitur baru
class EnhancedStudyFocusApp {
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
        this.isFullscreen = false;
        this.user = null;
        
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
        this.setupPWA();
        
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
        
        if (this.currentPage === 'index.html') {
            this.initHomePage();
        }
    }
    
    // PWA Setup
    setupPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
        
        // Install prompt
        let deferredPrompt;
        const installPrompt = document.getElementById('installPrompt');
        const installConfirm = document.getElementById('installConfirm');
        const installCancel = document.getElementById('installCancel');
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install prompt
            setTimeout(() => {
                if (installPrompt && installConfirm && installCancel) {
                    installPrompt.classList.add('active');
                    
                    installConfirm.addEventListener('click', () => {
                        installPrompt.classList.remove('active');
                        deferredPrompt.prompt();
                        deferredPrompt.userChoice.then((choiceResult) => {
                            if (choiceResult.outcome === 'accepted') {
                                console.log('User accepted the install prompt');
                            } else {
                                console.log('User dismissed the install prompt');
                            }
                            deferredPrompt = null;
                        });
                    });
                    
                    installCancel.addEventListener('click', () => {
                        installPrompt.classList.remove('active');
                    });
                }
            }, 3000);
        });
    }
    
    // Fullscreen functionality
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
            this.isFullscreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                this.isFullscreen = false;
            }
        }
        
        this.updateFullscreenButton();
    }
    
    updateFullscreenButton() {
        const fullscreenBtn = document.getElementById('fullscreenToggle');
        if (fullscreenBtn) {
            const icon = fullscreenBtn.querySelector('i');
            if (icon) {
                icon.className = this.isFullscreen ? 'fas fa-compress' : 'fas fa-expand';
            }
        }
    }
    
    // Home page initialization
    initHomePage() {
        // Demo tabs functionality
        const demoTabs = document.querySelectorAll('.demo-tab');
        const demoPanels = document.querySelectorAll('.demo-panel');
        
        demoTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                
                // Update active tab
                demoTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active panel
                demoPanels.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.id === `${target}-demo`) {
                        panel.classList.add('active');
                    }
                });
            });
        });
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Enhanced navigation with user state
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
        
        // Update user state in navigation
        this.updateUserNavigation();
    }
    
    updateUserNavigation() {
        const navUser = document.getElementById('navUser');
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (this.user) {
            // User is logged in
            if (navUser) {
                navUser.innerHTML = `
                    <div class="user-dropdown">
                        <button class="user-btn">
                            <img src="${this.user.avatar || 'https://i.pravatar.cc/100'}" alt="${this.user.name}">
                            <span>${this.user.name}</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="user-menu">
                            <a href="profile.html" class="user-menu-item">
                                <i class="fas fa-user"></i>
                                <span>Profil</span>
                            </a>
                            <a href="settings.html" class="user-menu-item">
                                <i class="fas fa-cog"></i>
                                <span>Pengaturan</span>
                            </a>
                            <div class="user-menu-divider"></div>
                            <a href="#" class="user-menu-item" id="logoutBtn">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>Keluar</span>
                            </a>
                        </div>
                    </div>
                `;
                
                // Add logout functionality
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.logout();
                    });
                }
                
                // User dropdown functionality
                const userBtn = document.querySelector('.user-btn');
                const userMenu = document.querySelector('.user-menu');
                
                if (userBtn && userMenu) {
                    userBtn.addEventListener('click', () => {
                        userMenu.classList.toggle('active');
                    });
                    
                    // Close dropdown when clicking outside
                    document.addEventListener('click', (e) => {
                        if (!userBtn.contains(e.target) && !userMenu.contains(e.target)) {
                            userMenu.classList.remove('active');
                        }
                    });
                }
            }
        } else {
            // User is not logged in
            if (navUser && loginBtn && registerBtn) {
                navUser.innerHTML = `
                    <a href="login.html" class="btn btn-outline btn-small" id="loginBtn">Masuk</a>
                    <a href="register.html" class="btn btn-primary btn-small" id="registerBtn">Daftar</a>
                `;
            }
        }
    }
    
    // User authentication methods
    login(email, password) {
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate a successful login
        this.user = {
            id: 1,
            name: 'John Doe',
            email: email,
            avatar: 'https://i.pravatar.cc/100',
            plan: 'free' // free, pro, team
        };
        
        this.saveUserData();
        this.updateUserNavigation();
        this.showNotification('Berhasil masuk!');
    }
    
    logout() {
        this.user = null;
        localStorage.removeItem('studyFocusUser');
        this.updateUserNavigation();
        this.showNotification('Anda telah keluar.');
        
        // Redirect to home page if on a protected page
        const protectedPages = ['dashboard.html', 'profile.html', 'settings.html'];
        if (protectedPages.includes(this.currentPage)) {
            window.location.href = 'index.html';
        }
    }
    
    saveUserData() {
        if (this.user) {
            localStorage.setItem('studyFocusUser', JSON.stringify(this.user));
        }
    }
    
    loadUserData() {
        const savedUser = localStorage.getItem('studyFocusUser');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
        }
    }
    
    // Enhanced notification system
    showNotification(message, type = 'success', duration = 5000) {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <p>${message}</p>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
        }
        
        // Remove notification after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }
    
    // Enhanced event listeners
    setupEventListeners() {
        // Fullscreen toggle
        const fullscreenToggle = document.getElementById('fullscreenToggle');
        if (fullscreenToggle) {
            fullscreenToggle.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
        
        // Existing event listeners from base class
        // ... (previous event listener code)
        
        // Document fullscreen change event
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            this.updateFullscreenButton();
        });
    }
    
    // Load data with user-specific data
    loadData() {
        this.loadUserData();
        
        // Load todos with user-specific prefix if logged in
        const todoKey = this.user ? `studyFocusTodos_${this.user.id}` : 'studyFocusTodos';
        const savedTodos = localStorage.getItem(todoKey);
        if (savedTodos) {
            this.todos = JSON.parse(savedTodos);
        }
        
        // Load pomodoro stats with user-specific prefix if logged in
        const statsKey = this.user ? `studyFocusStats_${this.user.id}` : 'studyFocusStats';
        const savedStats = localStorage.getItem(statsKey);
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
        
        // Load quick notes with user-specific prefix if logged in
        const notesKey = this.user ? `studyFocusNotes_${this.user.id}` : 'studyFocusNotes';
        const savedNotes = localStorage.getItem(notesKey);
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
    
    // Save data with user-specific prefix if logged in
    saveTodos() {
        const todoKey = this.user ? `studyFocusTodos_${this.user.id}` : 'studyFocusTodos';
        localStorage.setItem(todoKey, JSON.stringify(this.todos));
    }
    
    savePomodoroStats() {
        const statsKey = this.user ? `studyFocusStats_${this.user.id}` : 'studyFocusStats';
        localStorage.setItem(statsKey, JSON.stringify(this.pomodoroStats));
    }
    
    saveQuickNotes() {
        const notesKey = this.user ? `studyFocusNotes_${this.user.id}` : 'studyFocusNotes';
        localStorage.setItem(notesKey, this.quickNotes);
    }
    
    // Other methods remain largely the same but with enhanced functionality
    // ... (previous methods with potential enhancements)
}

// Initialize the enhanced app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studyFocusApp = new EnhancedStudyFocusApp();
});

// Pomodoro Timer Functionality
class PomodoroTimer {
    constructor() {
        this.minutes = 25;
        this.seconds = 0;
        this.isRunning = false;
        this.mode = 'focus'; // focus, shortBreak, longBreak
        this.interval = null;
        this.completedSessions = 0;
        this.totalSessions = 0;
        this.totalMinutes = 0;
        
        this.modeDurations = {
            focus: 25,
            shortBreak: 5,
            longBreak: 15
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.loadStats();
    }
    
    setupEventListeners() {
        // Timer controls
        document.getElementById('startTimer').addEventListener('click', () => this.start());
        document.getElementById('pauseTimer').addEventListener('click', () => this.pause());
        document.getElementById('resetTimer').addEventListener('click', () => this.reset());
        
        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.switchMode(mode);
            });
        });
        
        // Task integration
        document.getElementById('startTask').addEventListener('click', () => {
            this.startWithTask();
        });
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        document.getElementById('startTimer').disabled = true;
        document.getElementById('pauseTimer').disabled = false;
        
        this.interval = setInterval(() => {
            this.tick();
        }, 1000);
        
        this.updateButtonStates();
    }
    
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        document.getElementById('startTimer').disabled = false;
        document.getElementById('pauseTimer').disabled = true;
        
        clearInterval(this.interval);
        this.updateButtonStates();
    }
    
    reset() {
        this.pause();
        this.minutes = this.modeDurations[this.mode];
        this.seconds = 0;
        this.updateDisplay();
        this.updateProgressRing();
    }
    
    tick() {
        if (this.seconds > 0) {
            this.seconds--;
        } else if (this.minutes > 0) {
            this.minutes--;
            this.seconds = 59;
        } else {
            // Timer completed
            this.completeSession();
            return;
        }
        
        this.updateDisplay();
        this.updateProgressRing();
    }
    
    completeSession() {
        this.pause();
        
        // Update stats
        if (this.mode === 'focus') {
            this.completedSessions++;
            this.totalSessions++;
            this.totalMinutes += this.modeDurations.focus;
            
            // Update UI
            document.getElementById('todayPomodoroSessions').textContent = this.totalSessions;
            document.getElementById('todayPomodoroMinutes').textContent = this.totalMinutes;
            
            // Show notification
            this.showNotification('Sesi fokus selesai! Waktu untuk istirahat.', 'success');
            
            // Switch to break after focus session
            if (this.completedSessions % 4 === 0) {
                this.switchMode('longBreak');
            } else {
                this.switchMode('shortBreak');
            }
        } else {
            // Break completed, switch back to focus
            this.switchMode('focus');
            this.showNotification('Istirahat selesai! Siap untuk fokus kembali.', 'info');
        }
        
        this.saveStats();
        this.updateSessionCounter();
    }
    
    switchMode(mode) {
        this.mode = mode;
        this.minutes = this.modeDurations[mode];
        this.seconds = 0;
        
        // Update active mode button
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        // Update timer status
        const statusMap = {
            focus: 'Mode Fokus',
            shortBreak: 'Istirahat Pendek',
            longBreak: 'Istirahat Panjang'
        };
        document.getElementById('timerStatus').textContent = statusMap[mode];
        
        this.updateDisplay();
        this.updateProgressRing();
        this.updateButtonStates();
    }
    
    updateDisplay() {
        const timerElement = document.getElementById('timer');
        const minutesStr = this.minutes.toString().padStart(2, '0');
        const secondsStr = this.seconds.toString().padStart(2, '0');
        timerElement.textContent = `${minutesStr}:${secondsStr}`;
    }
    
    updateProgressRing() {
        const totalSeconds = this.modeDurations[this.mode] * 60;
        const remainingSeconds = this.minutes * 60 + this.seconds;
        const progress = (totalSeconds - remainingSeconds) / totalSeconds;
        
        const circle = document.querySelector('.progress-ring-circle');
        const radius = 140;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress * circumference);
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
    }
    
    updateSessionCounter() {
        const sessionCounter = document.getElementById('sessionCounter');
        sessionCounter.textContent = `Sesi: ${this.completedSessions}/4`;
    }
    
    updateButtonStates() {
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        
        if (this.isRunning) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }
    
    startWithTask() {
        const taskSelect = document.getElementById('taskSelect');
        const selectedTask = taskSelect.value;
        
        if (!selectedTask) {
            this.showNotification('Pilih tugas terlebih dahulu!', 'warning');
            return;
        }
        
        // Update current task display
        const taskDisplay = document.getElementById('currentTaskDisplay');
        const taskText = taskSelect.options[taskSelect.selectedIndex].text;
        
        taskDisplay.innerHTML = `
            <div class="active-task">
                <div class="task-header">
                    <i class="fas fa-tasks"></i>
                    <h4>Tugas Aktif</h4>
                </div>
                <p class="task-name">${taskText}</p>
                <div class="task-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <span class="progress-text">0%</span>
                </div>
            </div>
        `;
        
        this.showNotification(`Memulai sesi Pomodoro untuk: ${taskText}`, 'success');
        this.start();
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <p>${message}</p>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    loadStats() {
        const savedStats = localStorage.getItem('pomodoroStats');
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            this.totalSessions = stats.totalSessions || 0;
            this.totalMinutes = stats.totalMinutes || 0;
            
            // Update UI
            document.getElementById('todayPomodoroSessions').textContent = this.totalSessions;
            document.getElementById('todayPomodoroMinutes').textContent = this.totalMinutes;
            
            // Calculate streak (simplified)
            const lastUsed = localStorage.getItem('pomodoroLastUsed');
            const today = new Date().toDateString();
            
            if (lastUsed === today) {
                const currentStreak = parseInt(localStorage.getItem('pomodoroStreak') || '0');
                document.getElementById('currentStreak').textContent = currentStreak;
            }
        }
    }
    
    saveStats() {
        const stats = {
            totalSessions: this.totalSessions,
            totalMinutes: this.totalMinutes
        };
        
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
        
        // Update streak
        const today = new Date().toDateString();
        const lastUsed = localStorage.getItem('pomodoroLastUsed');
        
        if (lastUsed !== today) {
            let streak = parseInt(localStorage.getItem('pomodoroStreak') || '0');
            
            // Check if yesterday was also used
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            
            if (lastUsed === yesterdayStr) {
                streak++;
            } else {
                streak = 1;
            }
            
            localStorage.setItem('pomodoroStreak', streak.toString());
            localStorage.setItem('pomodoroLastUsed', today);
            
            document.getElementById('currentStreak').textContent = streak;
        }
    }
}

// Initialize Pomodoro Timer when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.pomodoro-page')) {
        window.pomodoroTimer = new PomodoroTimer();
    }
});

// Enhanced To-Do List Functionality
class EnhancedTodoList {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.editingId = null;
        this.init();
    }
    
    init() {
        this.loadTodos();
        this.setupEventListeners();
        this.renderTodos();
        this.updateStats();
    }
    
    setupEventListeners() {
        // Add todo
        document.getElementById('addTodo').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.setFilter(filter);
            });
        });
        
        // Clear completed
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());
        
        // Modal events
        document.getElementById('saveEdit').addEventListener('click', () => this.saveEdit());
        document.getElementById('cancelEdit').addEventListener('click', () => this.closeEditModal());
        
        // Close modal when clicking outside
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') this.closeEditModal();
        });
    }
    
    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        
        if (text === '') {
            this.showNotification('Masukkan teks tugas terlebih dahulu!', 'warning');
            return;
        }
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.push(todo);
        input.value = '';
        
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        this.showNotification('Tugas berhasil ditambahkan!', 'success');
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        this.renderTodos();
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
        }
    }
    
    togglePriority(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.priority = !todo.priority;
            this.saveTodos();
            this.renderTodos();
        }
    }
    
    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            this.editingId = id;
            document.getElementById('editTodoInput').value = todo.text;
            document.getElementById('editModal').classList.add('active');
        }
    }
    
    saveEdit() {
        if (this.editingId === null) return;
        
        const input = document.getElementById('editTodoInput');
        const text = input.value.trim();
        
        if (text === '') {
            this.showNotification('Teks tugas tidak boleh kosong!', 'warning');
            return;
        }
        
        const todo = this.todos.find(t => t.id === this.editingId);
        if (todo) {
            todo.text = text;
            this.saveTodos();
            this.renderTodos();
            this.closeEditModal();
            this.showNotification('Tugas berhasil diperbarui!', 'success');
        }
    }
    
    closeEditModal() {
        this.editingId = null;
        document.getElementById('editModal').classList.remove('active');
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        this.showNotification('Tugas berhasil dihapus!', 'success');
    }
    
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            this.showNotification('Tidak ada tugas yang selesai untuk dihapus!', 'info');
            return;
        }
        
        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        this.showNotification(`${completedCount} tugas selesai telah dihapus!`, 'success');
    }
    
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            case 'priority':
                return this.todos.filter(t => t.priority);
            default:
                return this.todos;
        }
    }
    
    renderTodos() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            let message = '';
            switch (this.currentFilter) {
                case 'active':
                    message = 'Tidak ada tugas aktif. Semua tugas sudah selesai!';
                    break;
                case 'completed':
                    message = 'Belum ada tugas yang selesai. Tetap semangat!';
                    break;
                case 'priority':
                    message = 'Tidak ada tugas berprioritas. Tambahkan prioritas pada tugas penting!';
                    break;
                default:
                    message = 'Belum ada tugas. Tambahkan tugas pertama Anda!';
            }
            
            todoList.innerHTML = `
                <li class="empty-message">
                    <i class="fas fa-clipboard-list"></i>
                    <p>${message}</p>
                </li>
            `;
            return;
        }
        
        todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item-revamped ${todo.priority ? 'priority' : ''}">
                <input type="checkbox" class="todo-checkbox-revamped" ${todo.completed ? 'checked' : ''} 
                    onchange="window.todoApp.toggleTodo(${todo.id})">
                <span class="todo-text-revamped ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                <div class="todo-actions-revamped">
                    <button class="todo-action-btn priority-btn" onclick="window.todoApp.togglePriority(${todo.id})" 
                        title="${todo.priority ? 'Hapus prioritas' : 'Tandai prioritas'}">
                        <i class="fas ${todo.priority ? 'fa-star' : 'fa-star'}"></i>
                    </button>
                    <button class="todo-action-btn edit" onclick="window.todoApp.editTodo(${todo.id})" title="Edit tugas">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="todo-action-btn delete" onclick="window.todoApp.deleteTodo(${todo.id})" title="Hapus tugas">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');
    }
    
    updateStats() {
        const totalTasks = this.todos.length;
        const completedTasks = this.todos.filter(t => t.completed).length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('todoProgressFill').style.width = `${progress}%`;
        document.getElementById('todoProgressText').textContent = `${progress}%`;
    }
    
    saveTodos() {
        const todoKey = window.studyFocusApp?.user ? 
            `studyFocusTodos_${window.studyFocusApp.user.id}` : 'studyFocusTodos';
        localStorage.setItem(todoKey, JSON.stringify(this.todos));
    }
    
    loadTodos() {
        const todoKey = window.studyFocusApp?.user ? 
            `studyFocusTodos_${window.studyFocusApp.user.id}` : 'studyFocusTodos';
        const savedTodos = localStorage.getItem(todoKey);
        
        if (savedTodos) {
            this.todos = JSON.parse(savedTodos);
        }
    }
    
    showNotification(message, type = 'success') {
        if (window.studyFocusApp) {
            window.studyFocusApp.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                    <p>${message}</p>
                </div>
                <button class="notification-close" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
        }
    }
}

// Initialize Todo App when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.todo-page')) {
        window.todoApp = new EnhancedTodoList();
    }
});

// Floating Navbar Functionality
class FloatingNavbar {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupNavigation();
    }
    
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('floatingThemeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Mobile menu toggle
        const navToggle = document.getElementById('floatingNavToggle');
        const navMenu = document.getElementById('floatingNavMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
            
            // Close mobile menu when clicking on a link
            document.querySelectorAll('.floating-nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        }
    }
    
    setupNavigation() {
        // Highlight current page in navigation
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.floating-nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('studyFocusTheme', newTheme);
        
        // Update theme button icon
        const themeBtn = document.getElementById('floatingThemeToggle');
        if (themeBtn) {
            const icon = themeBtn.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
        
        // Update main theme toggle if exists
        const mainThemeBtn = document.getElementById('themeToggle');
        if (mainThemeBtn) {
            const mainIcon = mainThemeBtn.querySelector('i');
            if (mainIcon) {
                mainIcon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }
}

// Initialize Floating Navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.floatingNavbar = new FloatingNavbar();
    
    // Initialize charts if on stats page
    if (document.querySelector('.stats-page')) {
        // Chart initialization code would go here
        // This is already handled in the stats.html file
    }
});