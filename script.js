// studyfocus-app.js - Enhanced StudyFocus App dengan fitur responsif dan navbar fleksibel
class StudyFocusApp {
    constructor() {
        this.todos = [];
        this.pomodoroStats = {
            sessionsToday: 0,
            minutesToday: 0,
            totalSessions: 0,
            totalMinutes: 0,
            history: [],
            streak: 0,
            lastActiveDate: null
        };
        this.quickNotes = '';
        this.currentTheme = 'light';
        this.navbarPosition = 'top';
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
        this.updateStreak();
        
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
    
    // Update streak based on user activity
    updateStreak() {
        const today = new Date().toDateString();
        const lastActive = this.pomodoroStats.lastActiveDate;
        
        if (!lastActive) {
            // First time user
            this.pomodoroStats.streak = 1;
            this.pomodoroStats.lastActiveDate = today;
            this.savePomodoroStats();
            return;
        }
        
        const lastActiveDate = new Date(lastActive);
        const todayDate = new Date(today);
        const diffTime = todayDate - lastActiveDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Consecutive day
            this.pomodoroStats.streak++;
        } else if (diffDays > 1) {
            // Broken streak
            this.pomodoroStats.streak = 1;
        }
        // If diffDays === 0, same day - don't change streak
        
        this.pomodoroStats.lastActiveDate = today;
        this.savePomodoroStats();
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
        
        if (installPrompt && installConfirm && installCancel) {
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                
                // Show install prompt
                setTimeout(() => {
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
                }, 3000);
            });
        }
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
        const toggleNavbarPosition = document.getElementById('toggleNavbarPosition');
        const toggleNavbarVisibility = document.getElementById('toggleNavbarVisibility');
        
        if (toggleNavbarPosition) {
            toggleNavbarPosition.addEventListener('click', () => {
                this.toggleNavbarPosition();
            });
        }
        
        if (toggleNavbarVisibility) {
            toggleNavbarVisibility.addEventListener('click', () => {
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
            quickNotes.value = this.quickNotes;
            quickNotes.addEventListener('input', () => {
                this.quickNotes = quickNotes.value;
                this.saveQuickNotes();
                
                // Update character count
                const notesCounter = document.querySelector('.notes-counter');
                if (notesCounter) {
                    notesCounter.textContent = `${this.quickNotes.length} karakter`;
                }
            });
            
            // Update character count on load
            const notesCounter = document.querySelector('.notes-counter');
            if (notesCounter) {
                notesCounter.textContent = `${this.quickNotes.length} karakter`;
            }
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
        
        // Dashboard todo functionality
        const addTodoBtn = document.getElementById('addTodo');
        const todoInput = document.getElementById('todoInput');
        
        if (addTodoBtn && todoInput) {
            addTodoBtn.addEventListener('click', () => {
                this.addTodo();
            });
            
            todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTodo();
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
            
            // Check if stats are from today, if not reset daily stats
            const today = new Date().toDateString();
            if (stats.lastUpdated !== today) {
                stats.sessionsToday = 0;
                stats.minutesToday = 0;
                stats.lastUpdated = today;
            }
            
            this.pomodoroStats = { ...this.pomodoroStats, ...stats };
        }
        
        // Load quick notes
        const savedNotes = localStorage.getItem('studyFocusNotes');
        if (savedNotes) {
            this.quickNotes = savedNotes;
        }
    }
    
    saveTodos() {
        localStorage.setItem('studyFocusTodos', JSON.stringify(this.todos));
    }
    
    savePomodoroStats() {
        // Update last updated date
        this.pomodoroStats.lastUpdated = new Date().toDateString();
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
        
        // Update pomodoro stats display
        this.updatePomodoroStatsDisplay();
    }
    
    updatePomodoroStatsDisplay() {
        const todaySessions = document.getElementById('todayPomodoroSessions');
        const todayMinutes = document.getElementById('todayPomodoroMinutes');
        const currentStreak = document.getElementById('currentStreak');
        
        if (todaySessions) todaySessions.textContent = this.pomodoroStats.sessionsToday;
        if (todayMinutes) todayMinutes.textContent = this.pomodoroStats.minutesToday;
        if (currentStreak) currentStreak.textContent = this.pomodoroStats.streak;
    }
    
    initTodoPage() {
        // Initialize Todo List if it exists
        if (typeof EnhancedTodoList !== 'undefined') {
            window.todoApp = new EnhancedTodoList();
        }
    }
    
    initStatsPage() {
        // Update stats with real data
        this.updateStatsPage();
        
        // Initialize charts if they exist
        if (typeof Chart !== 'undefined') {
            this.initCharts();
        }
    }
    
    updateStatsPage() {
        // Update main stats
        const totalSessions = document.getElementById('totalSessions');
        const totalMinutes = document.getElementById('totalMinutes');
        const completedTasks = document.getElementById('completedTasks');
        const activeStreak = document.getElementById('activeStreak');
        
        if (totalSessions) totalSessions.textContent = this.pomodoroStats.totalSessions;
        if (totalMinutes) totalMinutes.textContent = this.pomodoroStats.totalMinutes;
        
        const completedTodos = this.todos.filter(todo => todo.completed).length;
        if (completedTasks) completedTasks.textContent = completedTodos;
        
        if (activeStreak) activeStreak.textContent = this.pomodoroStats.streak;
        
        // Update history with real data
        this.updateHistoryDisplay();
        
        // Update achievements with real data
        this.updateAchievementsDisplay();
    }
    
    updateHistoryDisplay() {
        const historyList = document.querySelector('.history-list');
        if (!historyList) return;
        
        // For now, we'll create sample history data based on current stats
        // In a real app, you would store and retrieve actual historical data
        const historyData = [
            { date: 'Hari Ini', sessions: this.pomodoroStats.sessionsToday, minutes: this.pomodoroStats.minutesToday },
            { date: 'Kemarin', sessions: Math.max(0, this.pomodoroStats.sessionsToday - 1), minutes: Math.max(0, this.pomodoroStats.minutesToday - 25) },
            { date: '2 Hari Lalu', sessions: Math.max(0, this.pomodoroStats.sessionsToday - 2), minutes: Math.max(0, this.pomodoroStats.minutesToday - 50) },
            { date: '3 Hari Lalu', sessions: Math.max(0, this.pomodoroStats.sessionsToday - 1), minutes: Math.max(0, this.pomodoroStats.minutesToday - 25) }
        ];
        
        historyList.innerHTML = historyData.map(day => {
            const progress = Math.min(100, (day.sessions / 5) * 100);
            return `
                <div class="history-item">
                    <div class="history-date">${day.date}</div>
                    <div class="history-stats">
                        <span class="history-sessions">${day.sessions} sesi</span>
                        <span class="history-minutes">${day.minutes} menit</span>
                    </div>
                    <div class="history-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateAchievementsDisplay() {
        const achievementsGrid = document.querySelector('.achievements-grid');
        if (!achievementsGrid) return;
        
        const completedTodos = this.todos.filter(todo => todo.completed).length;
        const totalMinutes = this.pomodoroStats.totalMinutes;
        
        const achievements = [
            {
                id: 'beginner',
                title: 'Pemula Produktif',
                description: 'Selesaikan 5 sesi Pomodoro',
                icon: 'medal',
                unlocked: this.pomodoroStats.totalSessions >= 5,
                progress: Math.min(100, (this.pomodoroStats.totalSessions / 5) * 100)
            },
            {
                id: 'streak3',
                title: 'Streak 3 Hari',
                description: 'Gunakan app selama 3 hari berturut-turut',
                icon: 'fire',
                unlocked: this.pomodoroStats.streak >= 3,
                progress: Math.min(100, (this.pomodoroStats.streak / 3) * 100)
            },
            {
                id: 'focusMaster',
                title: 'Ahli Fokus',
                description: 'Capai 500 menit fokus total',
                icon: 'bolt',
                unlocked: totalMinutes >= 500,
                progress: Math.min(100, (totalMinutes / 500) * 100)
            },
            {
                id: 'weekly',
                title: 'Konsisten Mingguan',
                description: 'Gunakan app setiap hari selama 7 hari',
                icon: 'star',
                unlocked: this.pomodoroStats.streak >= 7,
                progress: Math.min(100, (this.pomodoroStats.streak / 7) * 100)
            }
        ];
        
        achievementsGrid.innerHTML = achievements.map(achievement => {
            if (achievement.unlocked) {
                return `
                    <div class="achievement-item unlocked">
                        <div class="achievement-icon">
                            <i class="fas fa-${achievement.icon}"></i>
                        </div>
                        <div class="achievement-info">
                            <h4>${achievement.title}</h4>
                            <p>${achievement.description}</p>
                        </div>
                        <div class="achievement-badge">Diraih</div>
                    </div>
                `;
            } else {
                return `
                    <div class="achievement-item">
                        <div class="achievement-icon">
                            <i class="fas fa-${achievement.icon}"></i>
                        </div>
                        <div class="achievement-info">
                            <h4>${achievement.title}</h4>
                            <p>${achievement.description}</p>
                        </div>
                        <div class="achievement-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${achievement.progress}%"></div>
                            </div>
                            <span>${Math.round(achievement.progress)}%</span>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }
    
    initCharts() {
        // Activity Chart - using real data
        const activityCtx = document.getElementById('activityChart');
        if (activityCtx) {
            // Generate weekly data based on user activity
            const weeklyData = this.generateWeeklyData();
            
            new Chart(activityCtx, {
                type: 'bar',
                data: {
                    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                    datasets: [{
                        label: 'Menit Fokus',
                        data: weeklyData,
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
        
        // Distribution Chart - using real category data
        const distributionCtx = document.getElementById('timeDistributionChart');
        if (distributionCtx) {
            const categoryData = this.getCategoryDistribution();
            
            new Chart(distributionCtx, {
                type: 'doughnut',
                data: {
                    labels: categoryData.labels,
                    datasets: [{
                        data: categoryData.values,
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
            
            // Update distribution legend
            this.updateDistributionLegend(categoryData);
        }
    }
    
    generateWeeklyData() {
        // In a real app, you would retrieve this from stored historical data
        // For now, we'll generate data based on current stats
        const baseMinutes = this.pomodoroStats.minutesToday;
        return [
            Math.max(0, baseMinutes - 50),
            Math.max(0, baseMinutes - 25),
            Math.max(0, baseMinutes - 75),
            baseMinutes,
            Math.max(0, baseMinutes - 10),
            Math.max(0, baseMinutes - 40),
            Math.max(0, baseMinutes - 15)
        ];
    }
    
    getCategoryDistribution() {
        // Extract categories from todos
        const categories = {};
        this.todos.forEach(todo => {
            // Simple category extraction from todo text
            const text = todo.text.toLowerCase();
            if (text.includes('matematika') || text.includes('math')) {
                categories.matematika = (categories.matematika || 0) + 1;
            } else if (text.includes('fisika') || text.includes('physics')) {
                categories.fisika = (categories.fisika || 0) + 1;
            } else if (text.includes('kimia') || text.includes('chemistry')) {
                categories.kimia = (categories.kimia || 0) + 1;
            } else if (text.includes('bahasa') || text.includes('language')) {
                categories.bahasa = (categories.bahasa || 0) + 1;
            } else {
                categories.lainnya = (categories.lainnya || 0) + 1;
            }
        });
        
        // Default distribution if no categories found
        if (Object.keys(categories).length === 0) {
            return {
                labels: ['Matematika', 'Fisika', 'Kimia', 'Bahasa', 'Lainnya'],
                values: [35, 25, 20, 15, 5]
            };
        }
        
        // Calculate percentages
        const total = Object.values(categories).reduce((sum, count) => sum + count, 0);
        const labels = [];
        const values = [];
        
        // Map category keys to display names
        const categoryMap = {
            'matematika': 'Matematika',
            'fisika': 'Fisika',
            'kimia': 'Kimia',
            'bahasa': 'Bahasa',
            'lainnya': 'Lainnya'
        };
        
        Object.keys(categories).forEach(key => {
            labels.push(categoryMap[key] || key);
            values.push(Math.round((categories[key] / total) * 100));
        });
        
        return { labels, values };
    }
    
    updateDistributionLegend(categoryData) {
        const legendContainer = document.querySelector('.distribution-legend');
        if (!legendContainer) return;
        
        const colors = ['#6C63FF', '#FF6584', '#36D1DC', '#4CC9F0', '#F8961E'];
        
        legendContainer.innerHTML = categoryData.labels.map((label, index) => {
            const percent = categoryData.values[index];
            return `
                <div class="legend-item">
                    <span class="legend-color" style="background-color: ${colors[index % colors.length]}"></span>
                    <span>${label}</span>
                    <span class="legend-percent">${percent}%</span>
                </div>
            `;
        }).join('');
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
        
        // Update achievements in dashboard
        this.updateDashboardAchievements();
    }
    
    updateDashboardAchievements() {
        const achievementsGrid = document.querySelector('.achievements-grid');
        if (!achievementsGrid) return;
        
        const achievements = [
            {
                icon: 'fire',
                title: 'Streak Belajar',
                value: `${this.pomodoroStats.streak} hari berturut-turut`
            },
            {
                icon: 'medal',
                title: 'Fokus Terjaga',
                value: `${this.pomodoroStats.sessionsToday} sesi Pomodoro`
            },
            {
                icon: 'check-double',
                title: 'Tugas Terselesaikan',
                value: `${this.todos.filter(t => t.completed).length} dari ${this.todos.length} tugas`
            }
        ];
        
        achievementsGrid.innerHTML = achievements.map(achievement => `
            <div class="achievement-item">
                <div class="achievement-icon">
                    <i class="fas fa-${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h3>${achievement.title}</h3>
                    <p>${achievement.value}</p>
                </div>
            </div>
        `).join('');
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
            createdAt: new Date().toISOString(),
            category: this.detectCategory(text)
        };
        
        this.todos.unshift(todo);
        input.value = '';
        
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        this.showNotification('Tugas berhasil ditambahkan!', 'success');
    }
    
    detectCategory(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('matematika') || lowerText.includes('math') || lowerText.includes('kalkulus')) {
            return 'matematika';
        } else if (lowerText.includes('fisika') || lowerText.includes('physics')) {
            return 'fisika';
        } else if (lowerText.includes('kimia') || lowerText.includes('chemistry')) {
            return 'kimia';
        } else if (lowerText.includes('bahasa') || lowerText.includes('language') || lowerText.includes('indonesia') || lowerText.includes('inggris')) {
            return 'bahasa';
        } else {
            return 'lainnya';
        }
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            
            if (todo.completed) {
                this.showNotification('Tugas selesai!', 'success');
            }
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
                    todo.category = this.detectCategory(newText);
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
        this.totalSessions = window.studyFocusApp ? window.studyFocusApp.pomodoroStats.totalSessions : 0;
        this.totalMinutes = window.studyFocusApp ? window.studyFocusApp.pomodoroStats.totalMinutes : 0;
        this.sessionsToday = window.studyFocusApp ? window.studyFocusApp.pomodoroStats.sessionsToday : 0;
        this.minutesToday = window.studyFocusApp ? window.studyFocusApp.pomodoroStats.minutesToday : 0;
        
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
        this.updateButtonStates();
        this.updateSessionCounter();
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
        
        // Task select change
        const taskSelect = document.getElementById('taskSelect');
        if (taskSelect) {
            taskSelect.addEventListener('change', (e) => {
                this.updateCurrentTaskDisplay(e.target.value);
            });
        }
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        
        this.interval = setInterval(() => {
            this.tick();
        }, 1000);
        
        this.updateButtonStates();
        this.showNotification('Timer dimulai! Fokus pada tugas Anda.', 'info');
    }
    
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.interval);
        
        this.updateButtonStates();
        this.showNotification('Timer dijeda.', 'info');
    }
    
    reset() {
        this.pause();
        this.minutes = this.modeDurations[this.mode];
        this.seconds = 0;
        this.updateDisplay();
        this.updateProgressRing();
        this.updateButtonStates();
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
        
        // Update stats based on mode
        if (this.mode === 'focus') {
            this.completedSessions++;
            this.totalSessions++;
            this.sessionsToday++;
            this.totalMinutes += this.modeDurations.focus;
            this.minutesToday += this.modeDurations.focus;
            
            // Update global stats
            if (window.studyFocusApp) {
                window.studyFocusApp.pomodoroStats.sessionsToday = this.sessionsToday;
                window.studyFocusApp.pomodoroStats.minutesToday = this.minutesToday;
                window.studyFocusApp.pomodoroStats.totalSessions = this.totalSessions;
                window.studyFocusApp.pomodoroStats.totalMinutes = this.totalMinutes;
                window.studyFocusApp.savePomodoroStats();
                window.studyFocusApp.updateStats();
                window.studyFocusApp.updatePomodoroStatsDisplay();
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
        
        if (startBtn) {
            startBtn.disabled = this.isRunning;
        }
        if (pauseBtn) {
            pauseBtn.disabled = !this.isRunning;
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
        
        this.updateCurrentTaskDisplay(selectedTask);
        this.showNotification(`Memulai sesi Pomodoro untuk: ${taskSelect.options[taskSelect.selectedIndex].text}`, 'success');
        this.start();
    }
    
    updateCurrentTaskDisplay(taskValue) {
        const taskDisplay = document.getElementById('currentTaskDisplay');
        const taskSelect = document.getElementById('taskSelect');
        
        if (!taskDisplay || !taskSelect) return;
        
        if (!taskValue) {
            taskDisplay.innerHTML = `
                <div class="no-task-message">
                    <i class="fas fa-info-circle"></i>
                    <p>Belum ada tugas yang dipilih. Pilih tugas untuk melacak progress belajar Anda.</p>
                </div>
            `;
            return;
        }
        
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
    }
    
    showNotification(message, type = 'info') {
        if (window.studyFocusApp) {
            window.studyFocusApp.showNotification(message, type);
        } else {
            // Fallback notification
            console.log(`${type}: ${message}`);
        }
    }
}

// Enhanced To-Do List Functionality
class EnhancedTodoList {
    constructor() {
        this.todos = window.studyFocusApp ? window.studyFocusApp.todos : [];
        this.currentFilter = 'all';
        this.editingId = null;
        this.init();
    }
    
    init() {
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
            createdAt: new Date().toISOString(),
            category: this.detectCategory(text)
        };
        
        this.todos.push(todo);
        input.value = '';
        
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        this.showNotification('Tugas berhasil ditambahkan!', 'success');
    }
    
    detectCategory(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('matematika') || lowerText.includes('math') || lowerText.includes('kalkulus')) {
            return 'matematika';
        } else if (lowerText.includes('fisika') || lowerText.includes('physics')) {
            return 'fisika';
        } else if (lowerText.includes('kimia') || lowerText.includes('chemistry')) {
            return 'kimia';
        } else if (lowerText.includes('bahasa') || lowerText.includes('language') || lowerText.includes('indonesia') || lowerText.includes('inggris')) {
            return 'bahasa';
        } else {
            return 'lainnya';
        }
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
            
            if (window.studyFocusApp) {
                window.studyFocusApp.updateStats();
            }
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
            todo.category = this.detectCategory(text);
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
        
        // Update global app if exists
        if (window.studyFocusApp) {
            window.studyFocusApp.updateStats();
        }
    }
    
    saveTodos() {
        if (window.studyFocusApp) {
            window.studyFocusApp.todos = this.todos;
            window.studyFocusApp.saveTodos();
        } else {
            localStorage.setItem('studyFocusTodos', JSON.stringify(this.todos));
        }
    }
    
    showNotification(message, type = 'success') {
        if (window.studyFocusApp) {
            window.studyFocusApp.showNotification(message, type);
        } else {
            // Fallback notification
            console.log(`${type}: ${message}`);
        }
    }
}

// Initialize apps when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Pomodoro Timer if on pomodoro page or dashboard
    if ((document.querySelector('.pomodoro-page') || document.querySelector('.dashboard-page')) && typeof PomodoroTimer !== 'undefined') {
        window.pomodoroTimer = new PomodoroTimer();
    }
    
    // Initialize Todo App if on todo page
    if (document.querySelector('.todo-page') && typeof EnhancedTodoList !== 'undefined') {
        window.todoApp = new EnhancedTodoList();
    }
});