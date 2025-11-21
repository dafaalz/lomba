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