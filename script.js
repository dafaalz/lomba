// studyfocus-app.js - Enhanced StudyFocus App dengan fitur responsif dan navbar fleksibel
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
        this.navbarPosition = 'top'; // 'top' or 'bottom'
        this.navbarVisible = true;
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupNavigation();
        this.applyTheme();
        this.applyNavbarSettings();
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
    
    // Navbar Controls
    setupNavigation() {
        // Highlight current page in navigation
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link, .floating-nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Mobile menu toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        const floatingNavToggle = document.getElementById('floatingNavToggle');
        const floatingNavMenu = document.getElementById('floatingNavMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
        
        if (floatingNavToggle && floatingNavMenu) {
            floatingNavToggle.addEventListener('click', () => {
                floatingNavMenu.classList.toggle('active');
                floatingNavToggle.classList.toggle('active');
            });
        }
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link, .floating-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu) navMenu.classList.remove('active');
                if (navToggle) navToggle.classList.remove('active');
                if (floatingNavMenu) floatingNavMenu.classList.remove('active');
                if (floatingNavToggle) floatingNavToggle.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu && navToggle && !navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
            
            if (floatingNavMenu && floatingNavToggle && !floatingNavToggle.contains(e.target) && !floatingNavMenu.contains(e.target)) {
                floatingNavMenu.classList.remove('active');
                floatingNavToggle.classList.remove('active');
            }
        });
    }
    
    // Navbar Position and Visibility Controls
    setupNavbarControls() {
        // Create navbar controls if they don't exist
        if (!document.getElementById('navbarControls')) {
            const controls = document.createElement('div');
            controls.id = 'navbarControls';
            controls.className = 'navbar-controls';
            controls.innerHTML = `
                <button id="toggleNavbarPosition" class="navbar-control-btn" title="Pindah Posisi Navbar">
                    <i class="fas fa-arrows-alt-v"></i>
                </button>
                <button id="toggleNavbarVisibility" class="navbar-control-btn" title="Sembunyikan/Tampilkan Navbar">
                    <i class="fas fa-eye"></i>
                </button>
            `;
            
            // Add to navbar actions or create a new container
            const navActions = document.querySelector('.nav-actions') || document.querySelector('.floating-nav-actions');
            if (navActions) {
                navActions.appendChild(controls);
            } else {
                document.body.appendChild(controls);
            }
            
            // Add event listeners
            document.getElementById('toggleNavbarPosition').addEventListener('click', () => {
                this.toggleNavbarPosition();
            });
            
            document.getElementById('toggleNavbarVisibility').addEventListener('click', () => {
                this.toggleNavbarVisibility();
            });
        }
    }
    
    toggleNavbarPosition() {
        this.navbarPosition = this.navbarPosition === 'top' ? 'bottom' : 'top';
        localStorage.setItem('navbarPosition', this.navbarPosition);
        this.applyNavbarSettings();
        this.showNotification(`Navbar dipindah ke ${this.navbarPosition === 'top' ? 'atas' : 'bawah'}`, 'info');
    }
    
    toggleNavbarVisibility() {
        this.navbarVisible = !this.navbarVisible;
        localStorage.setItem('navbarVisible', this.navbarVisible);
        this.applyNavbarSettings();
        this.showNotification(`Navbar ${this.navbarVisible ? 'ditampilkan' : 'disembunyikan'}`, 'info');
    }
    
    applyNavbarSettings() {
        const navbars = document.querySelectorAll('.navbar, .floating-navbar');
        
        navbars.forEach(navbar => {
            // Apply position
            navbar.classList.remove('navbar-top', 'navbar-bottom');
            navbar.classList.add(`navbar-${this.navbarPosition}`);
            
            // Apply visibility
            if (this.navbarVisible) {
                navbar.classList.remove('navbar-hidden');
            } else {
                navbar.classList.add('navbar-hidden');
            }
        });
        
        // Update main content padding based on navbar position and visibility
        this.adjustContentPadding();
        
        // Update control button icons
        const positionBtn = document.getElementById('toggleNavbarPosition');
        const visibilityBtn = document.getElementById('toggleNavbarVisibility');
        
        if (positionBtn) {
            const icon = positionBtn.querySelector('i');
            if (icon) {
                icon.className = this.navbarPosition === 'top' ? 'fas fa-arrow-down' : 'fas fa-arrow-up';
            }
        }
        
        if (visibilityBtn) {
            const icon = visibilityBtn.querySelector('i');
            if (icon) {
                icon.className = this.navbarVisible ? 'fas fa-eye-slash' : 'fas fa-eye';
            }
        }
    }
    
    adjustContentPadding() {
        const mainContent = document.querySelector('main');
        if (!mainContent) return;
        
        // Reset padding
        mainContent.style.paddingTop = '';
        mainContent.style.paddingBottom = '';
        
        if (this.navbarVisible) {
            if (this.navbarPosition === 'top') {
                mainContent.style.paddingTop = '80px';
            } else {
                mainContent.style.paddingBottom = '80px';
            }
        }
    }
    
    // Theme functionality
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        const floatingThemeToggle = document.getElementById('floatingThemeToggle');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        if (floatingThemeToggle) {
            floatingThemeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Navbar controls
        this.setupNavbarControls();
        
        // Quick notes auto-save
        const quickNotes = document.getElementById('quickNotes');
        if (quickNotes) {
            quickNotes.addEventListener('input', () => {
                this.quickNotes = quickNotes.value;
                this.saveQuickNotes();
                
                // Update character count
                const notesCounter = document.querySelector('.notes-counter');
                if (notesCounter) {
                    notesCounter.textContent = `${this.quickNotes.length} karakter`;
                }
            });
        }
        
        // Clear notes button
        const clearNotes = document.getElementById('clearNotes');
        if (clearNotes) {
            clearNotes.addEventListener('click', () => {
                if (confirm('Hapus semua catatan?')) {
                    this.quickNotes = '';
                    if (quickNotes) quickNotes.value = '';
                    this.saveQuickNotes();
                    
                    const notesCounter = document.querySelector('.notes-counter');
                    if (notesCounter) {
                        notesCounter.textContent = '0 karakter';
                    }
                    
                    this.showNotification('Catatan berhasil dihapus', 'success');
                }
            });
        }
        
        // Window resize handler for responsiveness
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Initial resize handling
        this.handleResize();
    }
    
    handleResize() {
        // Close mobile menus on resize to larger screens
        if (window.innerWidth > 768) {
            const navMenu = document.getElementById('navMenu');
            const floatingNavMenu = document.getElementById('floatingNavMenu');
            const navToggle = document.getElementById('navToggle');
            const floatingNavToggle = document.getElementById('floatingNavToggle');
            
            if (navMenu) navMenu.classList.remove('active');
            if (floatingNavMenu) floatingNavMenu.classList.remove('active');
            if (navToggle) navToggle.classList.remove('active');
            if (floatingNavToggle) floatingNavToggle.classList.remove('active');
        }
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('studyFocusTheme', this.currentTheme);
        
        // Update theme button icons
        const themeBtns = document.querySelectorAll('#themeToggle, #floatingThemeToggle');
        themeBtns.forEach(btn => {
            if (btn) {
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
                }
            }
        });
        
        this.showNotification(`Mode ${this.currentTheme === 'light' ? 'terang' : 'gelap'} diaktifkan`, 'info');
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Update theme button icons
        const themeBtns = document.querySelectorAll('#themeToggle, #floatingThemeToggle');
        themeBtns.forEach(btn => {
            if (btn) {
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
                }
            }
        });
    }
    
    // Data management
    loadData() {
        // Load theme
        const savedTheme = localStorage.getItem('studyFocusTheme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        }
        
        // Load navbar settings
        const savedNavbarPosition = localStorage.getItem('navbarPosition');
        if (savedNavbarPosition) {
            this.navbarPosition = savedNavbarPosition;
        }
        
        const savedNavbarVisible = localStorage.getItem('navbarVisible');
        if (savedNavbarVisible !== null) {
            this.navbarVisible = JSON.parse(savedNavbarVisible);
        }
        
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
        }
        
        // Load quick notes
        const savedNotes = localStorage.getItem('studyFocusNotes');
        if (savedNotes) {
            this.quickNotes = savedNotes;
            const notesTextarea = document.getElementById('quickNotes');
            if (notesTextarea) {
                notesTextarea.value = this.quickNotes;
                
                // Update character count
                const notesCounter = document.querySelector('.notes-counter');
                if (notesCounter) {
                    notesCounter.textContent = `${this.quickNotes.length} karakter`;
                }
            }
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
    
    // Notification system
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
    
    // Page-specific initializations
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
    
    initPomodoroPage() {
        // Initialize Pomodoro Timer if it exists
        if (typeof PomodoroTimer !== 'undefined') {
            window.pomodoroTimer = new PomodoroTimer();
        }
    }
    
    initTodoPage() {
        // Initialize Todo List if it exists
        if (typeof EnhancedTodoList !== 'undefined') {
            window.todoApp = new EnhancedTodoList();
        }
    }
    
    initStatsPage() {
        // Initialize charts if they exist
        if (typeof Chart !== 'undefined') {
            this.initCharts();
        }
    }
    
    initCharts() {
        // Activity Chart
        const activityCtx = document.getElementById('activityChart');
        if (activityCtx) {
            new Chart(activityCtx, {
                type: 'bar',
                data: {
                    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                    datasets: [{
                        label: 'Menit Fokus',
                        data: [75, 100, 50, 125, 90, 60, 100],
                        backgroundColor: 'rgba(108, 99, 255, 0.7)',
                        borderColor: 'rgba(108, 99, 255, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Menit'
                            }
                        }
                    }
                }
            });
        }
        
        // Distribution Chart
        const distributionCtx = document.getElementById('timeDistributionChart');
        if (distributionCtx) {
            new Chart(distributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Matematika', 'Fisika', 'Kimia', 'Bahasa', 'Lainnya'],
                    datasets: [{
                        data: [35, 25, 20, 15, 5],
                        backgroundColor: [
                            '#6C63FF',
                            '#FF6584',
                            '#36D1DC',
                            '#4CC9F0',
                            '#F8961E'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }
    
    // Dashboard functionality
    renderTodos() {
        const todoList = document.getElementById('todoList');
        if (!todoList) return;
        
        if (this.todos.length === 0) {
            todoList.innerHTML = '<li class="empty-message">Belum ada tugas. Tambahkan tugas pertama Anda!</li>';
            return;
        }
        
        // Only show first 5 todos in dashboard
        const todosToShow = this.todos.slice(0, 5);
        
        todoList.innerHTML = todosToShow.map(todo => `
            <li class="todo-item-revamped ${todo.priority ? 'priority' : ''}">
                <input type="checkbox" class="todo-checkbox-revamped" ${todo.completed ? 'checked' : ''} 
                    onchange="window.studyFocusApp.toggleTodo(${todo.id})">
                <span class="todo-text-revamped ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                <div class="todo-actions-revamped">
                    <button class="todo-action-btn edit" onclick="window.studyFocusApp.editTodo(${todo.id})" title="Edit tugas">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="todo-action-btn delete" onclick="window.studyFocusApp.deleteTodo(${todo.id})" title="Hapus tugas">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');
        
        // Update remaining tasks count
        const remainingTasks = document.getElementById('remainingTasks');
        if (remainingTasks) {
            const activeTodos = this.todos.filter(todo => !todo.completed).length;
            remainingTasks.textContent = `${activeTodos} tugas tersisa`;
        }
    }
    
    updateStats() {
        // Update today's sessions
        const todaySessions = document.getElementById('todaySessions');
        if (todaySessions) {
            todaySessions.textContent = this.pomodoroStats.sessionsToday;
        }
        
        // Update today's minutes
        const todayMinutes = document.getElementById('todayMinutes');
        if (todayMinutes) {
            todayMinutes.textContent = this.pomodoroStats.minutesToday;
        }
        
        // Update completed tasks
        const completedTasks = document.getElementById('completedTasks');
        if (completedTasks) {
            const completed = this.todos.filter(todo => todo.completed).length;
            completedTasks.textContent = completed;
        }
        
        // Update progress
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        if (progressFill && progressText) {
            const targetSessions = 5;
            const progress = Math.min(100, (this.pomodoroStats.sessionsToday / targetSessions) * 100);
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }
    }
    
    updateTimerDisplay() {
        const timer = document.getElementById('timer');
        const sessionCounter = document.getElementById('sessionCounter');
        
        if (timer) {
            timer.textContent = '25:00';
        }
        
        if (sessionCounter) {
            sessionCounter.textContent = 'Sesi: 0';
        }
    }
    
    // Todo functionality for dashboard
    addTodo() {
        const input = document.getElementById('todoInput');
        if (!input) return;
        
        const text = input.value.trim();
        if (text === '') {
            this.showNotification('Masukkan teks tugas terlebih dahulu!', 'warning');
            return;
        }
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.unshift(todo);
        input.value = '';
        
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        this.showNotification('Tugas berhasil ditambahkan!', 'success');
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
    
    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            const editModal = document.getElementById('editModal');
            const editInput = document.getElementById('editTodoInput');
            const saveEdit = document.getElementById('saveEdit');
            const cancelEdit = document.getElementById('cancelEdit');
            
            if (editModal && editInput) {
                editInput.value = todo.text;
                editModal.classList.add('active');
                
                // Save edit
                const saveHandler = () => {
                    const newText = editInput.value.trim();
                    if (newText === '') {
                        this.showNotification('Teks tugas tidak boleh kosong!', 'warning');
                        return;
                    }
                    
                    todo.text = newText;
                    this.saveTodos();
                    this.renderTodos();
                    editModal.classList.remove('active');
                    this.showNotification('Tugas berhasil diperbarui!', 'success');
                    
                    // Remove event listeners
                    saveEdit.removeEventListener('click', saveHandler);
                    cancelEdit.removeEventListener('click', cancelHandler);
                };
                
                // Cancel edit
                const cancelHandler = () => {
                    editModal.classList.remove('active');
                    
                    // Remove event listeners
                    saveEdit.removeEventListener('click', saveHandler);
                    cancelEdit.removeEventListener('click', cancelHandler);
                };
                
                saveEdit.addEventListener('click', saveHandler);
                cancelEdit.addEventListener('click', cancelHandler);
                
                // Close modal when clicking outside
                const modalClickHandler = (e) => {
                    if (e.target === editModal) {
                        cancelHandler();
                    }
                };
                
                editModal.addEventListener('click', modalClickHandler);
            }
        }
    }
    
    deleteTodo(id) {
        if (confirm('Hapus tugas ini?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            this.showNotification('Tugas berhasil dihapus!', 'success');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studyFocusApp = new StudyFocusApp();
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
        const startTimer = document.getElementById('startTimer');
        const pauseTimer = document.getElementById('pauseTimer');
        const resetTimer = document.getElementById('resetTimer');
        
        if (startTimer) startTimer.addEventListener('click', () => this.start());
        if (pauseTimer) pauseTimer.addEventListener('click', () => this.pause());
        if (resetTimer) resetTimer.addEventListener('click', () => this.reset());
        
        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.switchMode(mode);
            });
        });
        
        // Task integration
        const startTask = document.getElementById('startTask');
        if (startTask) {
            startTask.addEventListener('click', () => {
                this.startWithTask();
            });
        }
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        
        if (startBtn) startBtn.disabled = true;
        if (pauseBtn) pauseBtn.disabled = false;
        
        this.interval = setInterval(() => {
            this.tick();
        }, 1000);
        
        this.updateButtonStates();
    }
    
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
        
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
            const todaySessions = document.getElementById('todayPomodoroSessions');
            const todayMinutes = document.getElementById('todayPomodoroMinutes');
            
            if (todaySessions) todaySessions.textContent = this.totalSessions;
            if (todayMinutes) todayMinutes.textContent = this.totalMinutes;
            
            // Update global stats
            if (window.studyFocusApp) {
                window.studyFocusApp.pomodoroStats.sessionsToday = this.totalSessions;
                window.studyFocusApp.pomodoroStats.minutesToday = this.totalMinutes;
                window.studyFocusApp.savePomodoroStats();
                window.studyFocusApp.updateStats();
            }
            
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
        const timerStatus = document.getElementById('timerStatus');
        if (timerStatus) {
            timerStatus.textContent = statusMap[mode];
        }
        
        this.updateDisplay();
        this.updateProgressRing();
        this.updateButtonStates();
    }
    
    updateDisplay() {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            const minutesStr = this.minutes.toString().padStart(2, '0');
            const secondsStr = this.seconds.toString().padStart(2, '0');
            timerElement.textContent = `${minutesStr}:${secondsStr}`;
        }
    }
    
    updateProgressRing() {
        const circle = document.querySelector('.progress-ring-circle');
        if (!circle) return;
        
        const totalSeconds = this.modeDurations[this.mode] * 60;
        const remainingSeconds = this.minutes * 60 + this.seconds;
        const progress = (totalSeconds - remainingSeconds) / totalSeconds;
        
        const radius = 140;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress * circumference);
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
    }
    
    updateSessionCounter() {
        const sessionCounter = document.getElementById('sessionCounter');
        if (sessionCounter) {
            sessionCounter.textContent = `Sesi: ${this.completedSessions}/4`;
        }
    }
    
    updateButtonStates() {
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        
        if (this.isRunning) {
            if (startBtn) startBtn.disabled = true;
            if (pauseBtn) pauseBtn.disabled = false;
        } else {
            if (startBtn) startBtn.disabled = false;
            if (pauseBtn) pauseBtn.disabled = true;
        }
    }
    
    startWithTask() {
        const taskSelect = document.getElementById('taskSelect');
        if (!taskSelect) return;
        
        const selectedTask = taskSelect.value;
        
        if (!selectedTask) {
            this.showNotification('Pilih tugas terlebih dahulu!', 'warning');
            return;
        }
        
        // Update current task display
        const taskDisplay = document.getElementById('currentTaskDisplay');
        const taskText = taskSelect.options[taskSelect.selectedIndex].text;
        
        if (taskDisplay) {
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
        }
        
        this.showNotification(`Memulai sesi Pomodoro untuk: ${taskText}`, 'success');
        this.start();
    }
    
    showNotification(message, type = 'info') {
        if (window.studyFocusApp) {
            window.studyFocusApp.showNotification(message, type);
        }
    }
    
    loadStats() {
        const savedStats = localStorage.getItem('pomodoroStats');
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            this.totalSessions = stats.totalSessions || 0;
            this.totalMinutes = stats.totalMinutes || 0;
            
            // Update UI
            const todaySessions = document.getElementById('todayPomodoroSessions');
            const todayMinutes = document.getElementById('todayPomodoroMinutes');
            
            if (todaySessions) todaySessions.textContent = this.totalSessions;
            if (todayMinutes) todayMinutes.textContent = this.totalMinutes;
            
            // Calculate streak (simplified)
            const lastUsed = localStorage.getItem('pomodoroLastUsed');
            const today = new Date().toDateString();
            
            if (lastUsed === today) {
                const currentStreak = parseInt(localStorage.getItem('pomodoroStreak') || '0');
                const streakElement = document.getElementById('currentStreak');
                if (streakElement) {
                    streakElement.textContent = currentStreak;
                }
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
            
            const streakElement = document.getElementById('currentStreak');
            if (streakElement) {
                streakElement.textContent = streak;
            }
        }
    }
}

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
        const addTodo = document.getElementById('addTodo');
        const todoInput = document.getElementById('todoInput');
        
        if (addTodo) addTodo.addEventListener('click', () => this.addTodo());
        if (todoInput) {
            todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addTodo();
            });
        }
        
        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.setFilter(filter);
            });
        });
        
        // Clear completed
        const clearCompleted = document.getElementById('clearCompleted');
        if (clearCompleted) {
            clearCompleted.addEventListener('click', () => this.clearCompleted());
        }
        
        // Modal events
        const saveEdit = document.getElementById('saveEdit');
        const cancelEdit = document.getElementById('cancelEdit');
        const editModal = document.getElementById('editModal');
        
        if (saveEdit) saveEdit.addEventListener('click', () => this.saveEdit());
        if (cancelEdit) cancelEdit.addEventListener('click', () => this.closeEditModal());
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target.id === 'editModal') this.closeEditModal();
            });
        }
    }
    
    addTodo() {
        const input = document.getElementById('todoInput');
        if (!input) return;
        
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
            const editInput = document.getElementById('editTodoInput');
            const editModal = document.getElementById('editModal');
            
            if (editInput) editInput.value = todo.text;
            if (editModal) editModal.classList.add('active');
        }
    }
    
    saveEdit() {
        if (this.editingId === null) return;
        
        const input = document.getElementById('editTodoInput');
        if (!input) return;
        
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
        const editModal = document.getElementById('editModal');
        if (editModal) editModal.classList.remove('active');
    }
    
    deleteTodo(id) {
        if (confirm('Hapus tugas ini?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            this.showNotification('Tugas berhasil dihapus!', 'success');
        }
    }
    
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            this.showNotification('Tidak ada tugas yang selesai untuk dihapus!', 'info');
            return;
        }
        
        if (confirm(`Hapus ${completedCount} tugas yang sudah selesai?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            this.showNotification(`${completedCount} tugas selesai telah dihapus!`, 'success');
        }
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
        if (!todoList) return;
        
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
        
        const totalTasksElement = document.getElementById('totalTasks');
        const completedTasksElement = document.getElementById('completedTasks');
        const progressFill = document.getElementById('todoProgressFill');
        const progressText = document.getElementById('todoProgressText');
        
        if (totalTasksElement) totalTasksElement.textContent = totalTasks;
        if (completedTasksElement) completedTasksElement.textContent = completedTasks;
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${progress}%`;
    }
    
    saveTodos() {
        localStorage.setItem('studyFocusTodos', JSON.stringify(this.todos));
        
        // Update global app if exists
        if (window.studyFocusApp) {
            window.studyFocusApp.todos = this.todos;
            window.studyFocusApp.saveTodos();
        }
    }
    
    loadTodos() {
        const savedTodos = localStorage.getItem('studyFocusTodos');
        
        if (savedTodos) {
            this.todos = JSON.parse(savedTodos);
        }
    }
    
    showNotification(message, type = 'success') {
        if (window.studyFocusApp) {
            window.studyFocusApp.showNotification(message, type);
        }
    }
}

// Initialize apps when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Pomodoro Timer if on pomodoro page
    if (document.querySelector('.pomodoro-page') && typeof PomodoroTimer !== 'undefined') {
        window.pomodoroTimer = new PomodoroTimer();
    }
    
    // Initialize Todo App if on todo page
    if (document.querySelector('.todo-page') && typeof EnhancedTodoList !== 'undefined') {
        window.todoApp = new EnhancedTodoList();
    }
});