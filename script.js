/**
 * Corporate Task Dashboard - Application Logic
 * Implements Module Pattern for strict encapsulation and clean context.
 */

const DashboardApp = (() => {
    // --- State Structure ---
    let state = {
        tasks: [],
        currentFilter: 'all' // 'all' | 'pending' | 'completed'
    };

    // --- DOM Elements ---
    const DOM = {
        tasksContainer: document.getElementById('tasks-container'),
        statTotal: document.getElementById('stat-total'),
        statPending: document.getElementById('stat-pending'),
        statCompleted: document.getElementById('stat-completed'),
        modal: document.getElementById('task-modal'),
        taskForm: document.getElementById('task-form'),
        openModalBtn: document.getElementById('open-modal-btn'),
        closeModalBtn: document.getElementById('close-modal-btn'),
        cancelBtn: document.getElementById('cancel-btn'),
        filterBtns: document.querySelectorAll('.filter-btn'),
        titleInput: document.getElementById('task-title'),
        descInput: document.getElementById('task-desc')
    };

    // --- Persistence (Local Storage) ---
    const STORAGE_KEY = 'corporate_tasks';

    const loadData = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                state.tasks = JSON.parse(stored);
            } catch (e) {
                console.error("Local storage parsing error:", e);
                state.tasks = [];
            }
        }
    };

    const saveData = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
    };

    // --- Logic & Data Manipulation ---
    
    /**
     * Adds a newly structured task into state
     * @param {string} title 
     * @param {string} description 
     */
    const addTask = (title, description) => {
        const newTask = {
            id: Date.now().toString(),
            title: title.trim(),
            description: description.trim(),
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        state.tasks.unshift(newTask); // Add to beginning
        saveData();
        updateUI();
    };

    /**
     * Toggles the status of a specific task
     * @param {string} id 
     */
    const toggleTaskStatus = (id) => {
        state.tasks = state.tasks.map(task => {
            if (task.id === id) {
                return { ...task, status: task.status === 'pending' ? 'completed' : 'pending' };
            }
            return task;
        });
        saveData();
        updateUI();
    };

    /**
     * Deletes a given task by ID
     * @param {string} id 
     */
    const deleteTask = (id) => {
        state.tasks = state.tasks.filter(task => task.id !== id);
        saveData();
        updateUI();
    };

    /**
     * Formats timestamp into an easily readable format
     * @param {string} isoString 
     * @returns {string} Formatted Date
     */
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    };

    // --- UI Rendering ---

    /**
     * Calculates array lengths using filter() to update view cards dynamically
     */
    const updateStats = () => {
        const total = state.tasks.length;
        const completed = state.tasks.filter(t => t.status === 'completed').length;
        const pending = total - completed;

        DOM.statTotal.textContent = total;
        DOM.statCompleted.textContent = completed;
        DOM.statPending.textContent = pending;
    };

    /**
     * Re-renders the tasks array depending on the current filter selection
     */
    const renderTasks = () => {
        DOM.tasksContainer.innerHTML = '';

        // Apply filters
        const visibleTasks = state.tasks.filter(task => {
            if (state.currentFilter === 'all') return true;
            return task.status === state.currentFilter;
        });

        if (visibleTasks.length === 0) {
            DOM.tasksContainer.innerHTML = `
                <div class="empty-state">
                    <p>Bu kategoride gösterilecek görev bulunamadı.</p>
                </div>`;
            return;
        }

        const fragment = document.createDocumentFragment();

        visibleTasks.forEach(task => {
            const isCompleted = task.status === 'completed';
            const card = document.createElement('div');
            card.className = `task-card ${isCompleted ? 'completed' : ''}`;
            
            card.innerHTML = `
                <div class="task-content">
                    <h3>${escapeHTML(task.title)}</h3>
                    <p class="task-desc">${escapeHTML(task.description)}</p>
                    <div class="task-meta">
                        <span class="badge ${task.status}">${isCompleted ? 'Tamamlandı' : 'Devam Ediyor'}</span>
                        <span>Oluşturulma: ${formatDate(task.timestamp)}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-icon" onclick="DashboardApp.toggleStatus('${task.id}')" aria-label="${isCompleted ? 'Geri Al' : 'Tamamla'}" title="${isCompleted ? 'Devam Ediyor İşaretle' : 'Tamamlandı İşaretle'}">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
                            ${isCompleted 
                                ? '<polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>'
                                : '<polyline points="20 6 9 17 4 12"></polyline>'}
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="DashboardApp.removeTask('${task.id}')" aria-label="Sil" title="Görevi Sil">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
            fragment.appendChild(card);
        });

        DOM.tasksContainer.appendChild(fragment);
    };

    /**
     * Master update trigger
     */
    const updateUI = () => {
        updateStats();
        renderTasks();
    };

    // --- Modal & Form Event Handlers ---
    const openModal = () => {
        DOM.modal.classList.add('active');
        DOM.titleInput.focus();
    };

    const closeModal = () => {
        DOM.modal.classList.remove('active');
        DOM.taskForm.reset();
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        addTask(DOM.titleInput.value, DOM.descInput.value);
        closeModal();
    };

    const setFilter = (filterVal, btnEvent) => {
        state.currentFilter = filterVal;
        
        // Update active class on buttons
        DOM.filterBtns.forEach(btn => btn.classList.remove('active'));
        btnEvent.target.classList.add('active');
        
        renderTasks();
    };

    /**
     * Security Utility against basic XSS
     * @param {string} str 
     */
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // --- Initialization & Event Binding ---
    const init = () => {
        loadData();
        updateUI();

        // Bindings
        DOM.openModalBtn.addEventListener('click', openModal);
        DOM.closeModalBtn.addEventListener('click', closeModal);
        DOM.cancelBtn.addEventListener('click', closeModal);
        DOM.taskForm.addEventListener('submit', handleFormSubmit);

        DOM.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                setFilter(e.target.dataset.filter, e);
            });
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target === DOM.modal) {
                closeModal();
            }
        });
    };

    // Public API
    return {
        init,
        toggleStatus: toggleTaskStatus,
        removeTask: deleteTask
    };
})();

// Bootstrap
document.addEventListener('DOMContentLoaded', DashboardApp.init);
