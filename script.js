class ZenithApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.activeFilters = new Set();
        this.sidebarOpen = false;
        this.searchQuery = '';
        this.currentEditingTask = null;
        
        this.init();
    }
    
    init() {
        this.cacheDom();
        this.bindEvents();
        this.initTheme();
        this.loadCustomCategories();
        this.render();
        this.updateStats();
        this.updateSidebarStats();
        this.taskInput.focus();
    }

    loadCustomCategories() {
        try {
            const customCategories = JSON.parse(localStorage.getItem('zenithCustomCategories') || '{}');
            
            // Add custom categories to the modal dropdown
            Object.entries(customCategories).forEach(([key, name]) => {
                const existingOption = this.modalCategory.querySelector(`option[value="${key}"]`);
                if (!existingOption) {
                    const newOption = document.createElement('option');
                    newOption.value = key;
                    newOption.textContent = name;
                    
                    // Insert before the "Add new category" option
                    const addNewOption = this.modalCategory.querySelector('option[value="new-category"]');
                    this.modalCategory.insertBefore(newOption, addNewOption);
                }
            });
        } catch (e) {
            console.warn('Failed to load custom categories:', e);
        }
    }

    cacheDom() {
        // Main elements
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        
        // Search elements
        this.searchWrapper = document.getElementById('searchWrapper');
        this.searchInput = document.getElementById('searchInput');
        this.searchClear = document.getElementById('searchClear');
        
        // Modal elements
        this.modalOverlay = document.getElementById('modalOverlay');
        this.modalTaskInput = document.getElementById('modalTaskInput');
        this.modalPriority = document.getElementById('modalPriority');
        this.modalCategory = document.getElementById('modalCategory');
        this.modalNewCategory = document.getElementById('modalNewCategory');
        this.newCategoryField = document.getElementById('newCategoryField');
        this.modalDueDate = document.getElementById('modalDueDate');
        this.modalCustomDate = document.getElementById('modalCustomDate');
        this.customDateField = document.getElementById('customDateField');
        this.modalNotes = document.getElementById('modalNotes');
        this.modalCancel = document.getElementById('modalCancel');
        this.modalSave = document.getElementById('modalSave');
        
        // Theme toggle
        this.themeToggle = document.getElementById('themeToggle');
        
        // Stats
        this.todayCount = document.getElementById('todayCount');
        this.completedCount = document.getElementById('completedCount');
        this.progressPercent = document.getElementById('progressPercent');
        
        // Filters
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.quickBtns = document.querySelectorAll('.quick-btn');
        this.allCount = document.getElementById('allCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCountFilter = document.getElementById('completedCountFilter');
        
        // Sidebar
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebar = document.getElementById('sidebar');
        this.main = document.getElementById('main');
        this.navItems = document.querySelectorAll('.nav-item');
    }

    bindEvents() {
        // Task input
        this.taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.addTask();
            }
        });

        this.addTaskBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Search
        this.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.trim();
            this.searchWrapper.classList.toggle('has-text', this.searchQuery.length > 0);
            this.render();
        });

        this.searchClear.addEventListener('click', () => {
            this.searchInput.value = '';
            this.searchQuery = '';
            this.searchWrapper.classList.remove('has-text');
            this.render();
            this.searchInput.focus();
        });

        // Quick actions
        this.quickBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = e.target.dataset.quick;
                this.toggleQuickFilter(filterType);
            });
        });

        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.closest('.filter-btn').dataset.filter;
                this.setFilter(filter);
            });
        });

        // Modal events
        this.modalCancel.addEventListener('click', () => this.closeModal());
        this.modalSave.addEventListener('click', () => this.saveModal());
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) this.closeModal();
        });

        this.modalDueDate.addEventListener('change', (e) => {
            this.customDateField.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });

        this.modalCategory.addEventListener('change', (e) => {
            this.newCategoryField.style.display = e.target.value === 'new-category' ? 'block' : 'none';
            if (e.target.value === 'new-category') {
                setTimeout(() => this.modalNewCategory.focus(), 100);
            }
        });

        this.modalTaskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.saveModal();
            }
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Sidebar
        this.menuToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navItems.forEach(ni => ni.classList.remove('active'));
                item.classList.add('active');
                
                const label = item.querySelector('.nav-item-label').textContent;
                this.handleSidebarNavigation(label);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                e.preventDefault();
                this.taskInput.focus();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
                e.preventDefault();
                this.toggleSidebar();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault();
                this.searchInput.focus();
            }
            if (e.key === 'Escape') {
                if (this.modalOverlay.classList.contains('active')) {
                    this.closeModal();
                }
            }
        });
    }

    // Theme Management
    initTheme() {
        try {
            const savedTheme = localStorage.getItem('zenithTheme') || 'light';
            document.body.setAttribute('data-theme', savedTheme);
        } catch (e) {
            console.warn('Failed to load theme:', e);
        }
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        
        try {
            localStorage.setItem('zenithTheme', newTheme);
        } catch (e) {
            console.warn('Failed to save theme:', e);
        }
    }

    // Task Management
    loadTasks() {
        try {
            const tasks = JSON.parse(localStorage.getItem('zenithTasks') || '[]');
            return Array.isArray(tasks) ? tasks.map(task => ({
                ...task,
                notes: task.notes || ''
            })) : [];
        } catch (e) {
            console.warn('Failed to load tasks:', e);
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('zenithTasks', JSON.stringify(this.tasks));
        } catch (e) {
            console.warn('Failed to save tasks:', e);
        }
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;

        const task = {
            id: Date.now(),
            text: this.parseTaskText(text),
            completed: false,
            priority: this.parseTaskPriority(text),
            dueDate: this.parseTaskDueDate(text),
            category: this.parseTaskCategory(text),
            createdAt: new Date().toISOString(),
            notes: ''
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.taskInput.value = '';
        this.render();
        this.updateStats();
        this.updateSidebarStats();
        this.taskInput.focus();
    }

    parseTaskText(text) {
        return text
            .replace(/!(high|medium|low)/gi, '')
            .replace(/\b(today|tomorrow)\b/gi, '')
            .replace(/#\w+/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    parseTaskPriority(text) {
        if (/!high|!!!/i.test(text)) return 'high';
        if (/!low/i.test(text)) return 'low';
        return 'medium';
    }

    parseTaskDueDate(text) {
        if (/\btoday\b/i.test(text)) return 'today';
        if (/\btomorrow\b/i.test(text)) return 'tomorrow';
        return null;
    }

    parseTaskCategory(text) {
        if (/#work/i.test(text)) return 'work';
        if (/#health/i.test(text)) return 'health';
        if (/#finance/i.test(text)) return 'finance';
        return 'personal';
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.render();
            this.updateStats();
            this.updateSidebarStats();
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.currentEditingTask = task;
            this.modalTaskInput.value = task.text;
            this.modalPriority.value = task.priority;
            this.modalCategory.value = task.category;
            this.modalNotes.value = task.notes || '';
            
            if (['today', 'tomorrow', 'next-week'].includes(task.dueDate)) {
                this.modalDueDate.value = task.dueDate;
                this.customDateField.style.display = 'none';
            } else if (task.dueDate) {
                this.modalDueDate.value = 'custom';
                this.modalCustomDate.value = task.dueDate;
                this.customDateField.style.display = 'block';
            } else {
                this.modalDueDate.value = '';
                this.customDateField.style.display = 'none';
            }
            
            this.openModal();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
        this.updateStats();
        this.updateSidebarStats();
    }

    // Additional methods would continue here...
    // (The rest of the JavaScript methods from the original file)

    // Utility Functions
    formatDueDate(dueDate) {
        if (!dueDate) return '';
        if (dueDate === 'today') return 'Today';
        if (dueDate === 'tomorrow') return 'Tomorrow';
        if (dueDate === 'next-week') return 'Next week';
        
        try {
            const date = new Date(dueDate);
            if (!isNaN(date.getTime())) {
                const now = new Date();
                const diffTime = date - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) return 'Today';
                if (diffDays === 1) return 'Tomorrow';
                if (diffDays === -1) return 'Yesterday';
                if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
                if (diffDays <= 7) return `In ${diffDays} days`;
                
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
        } catch (e) {
            console.warn('Invalid date:', dueDate);
        }
        
        return dueDate;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.zenithApp = new ZenithApp();
});