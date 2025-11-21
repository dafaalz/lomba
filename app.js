// Aplikasi Produktivitas Belajar
class StudyFocusApp {
    constructor() {
        this.todos = [];
        this.pomodoroStats = {
            sessionsToday: 0,
            minutesToday: 0,
            totalSessions: 0,
            totalMinutes: 0
        };
        this.quickNotes = '';
        this.currentTheme = 'light';
        
        // Pomodoro Timer
        this.timer = {
            minutes: 25,
            seconds: 0,
            isRunning: false,
            mode: 'focus', // focus, shortBreak, longBreak
            interval: null,
            completedSessions: 0
        };
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderTodos();
        this.updateStats();
        this.updateTimerDisplay();
        this.applyTheme();
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
            this.pomodoroStats = JSON.parse(savedStats);
            
            // Reset daily stats if it's a new day
            const today = new Date().toDateString();
            const lastSavedDate = localStorage.getItem('studyFocusLastDate');
            if (lastSavedDate !== today) {
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
            document.getElementById('quickNotes').value = this.quickNotes;
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
        if (text.trim() === '') return;
        
        const newTodo = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.push(newTodo);
        this.saveTodos();
        this.renderTodos();
        
        // Clear input
        document.getElementById('todoInput').value = '';
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
        }
    }
    
    editTodo(id, newText) {
        if (newText.trim() === '') return;
        
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = newText.trim();
            this.saveTodos();
            this.renderTodos();
        }
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.renderTodos();
    }
    
    renderTodos() {
        const todoList = document.getElementById('todoList');
        todoList.innerHTML = '';
        
        if (this.todos.length === 0) {
            todoList.innerHTML = '<p class="empty-message">Tidak ada tugas. Tambahkan tugas baru!</p>';
            return;
        }
        
        this.todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                <div class="todo-actions">
                    <button class="todo-action-btn edit" data-id="${todo.id}">✏️</button>
                    <button class="todo-action-btn delete" data-id="${todo.id}">🗑️</button>
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
        
        input.value = currentText;
        modal.classList.add('active');
        
        // Set up event listeners for modal buttons
        document.getElementById('saveEdit').onclick = () => {
            this.editTodo(id, input.value);
            modal.classList.remove('active');
        };
        
        document.getElementById('cancelEdit').onclick = () => {
            modal.classList.remove('active');
        };
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
    
    // Pomodoro Timer Functions
    startTimer() {
        if (this.timer.isRunning) return;
        
        this.timer.isRunning = true;
        this.timer.interval = setInterval(() => {
            this.tickTimer();
        }, 1000);
        
        document.getElementById('startTimer').disabled = true;
        document.getElementById('pauseTimer').disabled = false;
    }
    
    pauseTimer() {
        if (!this.timer.isRunning) return;
        
        this.timer.isRunning = false;
        clearInterval(this.timer.interval);
        
        document.getElementById('startTimer').disabled = false;
        document.getElementById('pauseTimer').disabled = true;
    }
    
    resetTimer() {
        this.pauseTimer();
        this.setTimerMode(this.timer.mode);
        
        document.getElementById('startTimer').disabled = false;
        document.getElementById('pauseTimer').disabled = true;
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
        
        // Play notification sound (if browser allows)
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
            this.showNotification('Sesi fokus selesai! Waktunya istirahat.');
            
            // Auto-start short break after focus session
            if (this.timer.completedSessions % 4 === 0) {
                this.setTimerMode('longBreak');
            } else {
                this.setTimerMode('shortBreak');
            }
            
            this.startTimer();
        } else {
            // Break finished, auto-start focus session
            this.showNotification('Istirahat selesai! Waktunya fokus kembali.');
            this.setTimerMode('focus');
        }
    }
    
    playNotification() {
        // Try to play a simple beep sound
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
    
    showNotification(message) {
        // Create a simple notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('StudyFocus', { body: message });
        } else {
            // Fallback to alert
            alert(message);
        }
    }
    
    setTimerMode(mode) {
        this.timer.mode = mode;
        
        // Update active button
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.mode-btn[data-mode="${mode}"]`).classList.add('active');
        
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
        document.getElementById('sessionCounter').textContent = `Sesi: ${this.timer.completedSessions}`;
    }
    
    updateTimerDisplay() {
        const minutes = this.timer.minutes.toString().padStart(2, '0');
        const seconds = this.timer.seconds.toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${minutes}:${seconds}`;
    }
    
    // Stats Functions
    updateStats() {
        document.getElementById('todaySessions').textContent = this.pomodoroStats.sessionsToday;
        document.getElementById('todayMinutes').textContent = this.pomodoroStats.minutesToday;
        
        // Calculate progress (assuming 8 sessions per day is the goal)
        const progress = Math.min((this.pomodoroStats.sessionsToday / 8) * 100, 100);
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${Math.round(progress)}%`;
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
        const themeIcon = themeBtn.querySelector('.theme-icon');
        const themeText = themeBtn.querySelector('.theme-text');
        
        if (this.currentTheme === 'dark') {
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Mode Terang';
        } else {
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Mode Gelap';
        }
    }
    
    // Quick Notes Functions
    updateQuickNotes(text) {
        this.quickNotes = text;
        this.saveQuickNotes();
    }
    
    // Event Listeners
    setupEventListeners() {
        // Todo List
        document.getElementById('addTodo').addEventListener('click', () => {
            const input = document.getElementById('todoInput');
            this.addTodo(input.value);
        });
        
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo(e.target.value);
            }
        });
        
        // Pomodoro Timer
        document.getElementById('startTimer').addEventListener('click', () => this.startTimer());
        document.getElementById('pauseTimer').addEventListener('click', () => this.pauseTimer());
        document.getElementById('resetTimer').addEventListener('click', () => this.resetTimer());
        
        // Timer modes
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTimerMode(e.target.dataset.mode);
            });
        });
        
        // Quick Notes
        document.getElementById('quickNotes').addEventListener('input', (e) => {
            this.updateQuickNotes(e.target.value);
        });
        
        // Theme Toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StudyFocusApp();
});