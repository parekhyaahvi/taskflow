const TasksView = {
    async render() {
        const viewContent = document.getElementById('view-content');
        viewContent.innerHTML = `
            <div class="tasks-header">
                <div>
                    <h1>Tasks</h1>
                    <p style="color: var(--text-secondary);">Manage and track your project tasks.</p>
                </div>
                <button id="add-task-btn" class="btn btn-primary">
                    <i data-lucide="plus"></i> Add Task
                </button>
            </div>

            <div class="tasks-toolbar card" style="padding: 12px;">
                <input type="text" id="task-search" class="form-input" placeholder="Search tasks..." style="max-width: 300px;">
                <select id="filter-priority" class="form-input" style="max-width: 150px;">
                    <option value="">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                <select id="filter-status" class="form-input" style="max-width: 150px;">
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            <div id="task-list-container" class="task-list card" style="padding: 0;">
                <!-- Tasks will be loaded here -->
                <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                    Loading tasks...
                </div>
            </div>

            <!-- Add Task Modal -->
            <div id="task-modal" class="modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 1000; align-items: center; justify-content: center;">
                <div class="card auth-card" style="max-width: 500px;">
                    <h2 style="margin-bottom: 24px;">Create New Task</h2>
                    <form id="task-form">
                        <div class="form-group">
                            <label class="form-label">Task Title</label>
                            <input type="text" id="task-title" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea id="task-desc" class="form-input" rows="3"></textarea>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label class="form-label">Priority</label>
                                <select id="task-priority" class="form-input">
                                    <option value="Low">Low</option>
                                    <option value="Medium" selected>Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Category</label>
                                <select id="task-category" class="form-input">
                                    <option value="Development">Development</option>
                                    <option value="Design">Design</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Others" selected>Others</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Due Date</label>
                            <input type="date" id="task-date" class="form-input">
                        </div>
                        <div style="display: flex; gap: 12px; margin-top: 24px;">
                            <button type="button" id="close-modal" class="btn btn-secondary" style="flex: 1;">Cancel</button>
                            <button type="submit" class="btn btn-primary" style="flex: 1;">Create Task</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        lucide.createIcons();
        this.attachEventListeners();
        this.loadTasks();
    },

    attachEventListeners() {
        const addBtn = document.getElementById('add-task-btn');
        const modal = document.getElementById('task-modal');
        const closeBtn = document.getElementById('close-modal');
        const form = document.getElementById('task-form');

        if (addBtn) addBtn.addEventListener('click', () => modal.style.display = 'flex');
        if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
        
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const taskData = {
                    title: document.getElementById('task-title').value,
                    description: document.getElementById('task-desc').value,
                    priority: document.getElementById('task-priority').value,
                    category: document.getElementById('task-category').value,
                    dueDate: document.getElementById('task-date').value || null
                };

                const res = await API.post('/api/tasks', taskData);
                if (res && res.success) {
                    Utils.showToast('Task created successfully', 'success');
                    modal.style.display = 'none';
                    form.reset();
                    this.loadTasks();
                }
            });
        }

        // Filters
        document.getElementById('task-search').addEventListener('input', (e) => this.loadTasks({ search: e.target.value }));
        document.getElementById('filter-priority').addEventListener('change', (e) => this.loadTasks({ priority: e.target.value }));
        document.getElementById('filter-status').addEventListener('change', (e) => this.loadTasks({ status: e.target.value }));
    },

    async loadTasks(filters = {}) {
        let url = '/api/tasks?';
        if (filters.search) url += `search=${filters.search}&`;
        if (filters.priority) url += `priority=${filters.priority}&`;
        if (filters.status) url += `status=${filters.status}&`;

        const res = await API.get(url);
        const container = document.getElementById('task-list-container');
        
        if (res && res.success) {
            if (res.data.length === 0) {
                container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-secondary);">No tasks found.</div>';
                return;
            }

            container.innerHTML = res.data.map(task => `
                <div class="task-row ${task.status === 'Completed' ? 'completed' : ''}" data-id="${task._id}">
                    <div class="task-checkbox" onclick="TasksView.toggleStatus('${task._id}', '${task.status}')">
                        ${task.status === 'Completed' ? '<i data-lucide="check" style="width: 14px; color: var(--success);"></i>' : ''}
                    </div>
                    <div class="task-info">
                        <div class="task-title">${task.title}</div>
                        <div class="task-meta">
                            <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
                            <span><i data-lucide="tag" style="width: 12px;"></i> ${task.category}</span>
                            ${task.dueDate ? `<span><i data-lucide="calendar" style="width: 12px;"></i> ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                        </div>
                    </div>
                    <div class="task-actions">
                        <button onclick="TasksView.deleteTask('${task._id}')" class="btn btn-ghost" style="color: var(--danger); padding: 4px;">
                            <i data-lucide="trash-2" style="width: 18px;"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
        }
    },

    async toggleStatus(id, currentStatus) {
        const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
        const res = await API.patch(`/api/tasks/${id}`, { status: newStatus });
        if (res && res.success) {
            this.loadTasks();
        }
    },

    async deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            const res = await API.delete(`/api/tasks/${id}`);
            if (res && res.success) {
                Utils.showToast('Task deleted', 'success');
                this.loadTasks();
            }
        }
    }
};
