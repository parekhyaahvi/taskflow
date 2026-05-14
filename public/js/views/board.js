const BoardView = {
    async render() {
        const viewContent = document.getElementById('view-content');
        viewContent.innerHTML = `
            <div class="tasks-header">
                <div>
                    <h1>Kanban Board</h1>
                    <p style="color: var(--text-secondary);">Visualize your workflow and drag tasks between stages.</p>
                </div>
            </div>

            <div id="kanban-board" class="kanban-board">
                <!-- Columns: Pending, In Progress, Completed -->
                <div class="kanban-column column-pending" data-status="Pending">
                    <div class="column-header">
                        <span class="column-title">Pending</span>
                        <span class="task-count" id="count-pending">0</span>
                    </div>
                    <div class="column-cards" id="cards-pending"></div>
                </div>

                <div class="kanban-column column-progress" data-status="In Progress">
                    <div class="column-header">
                        <span class="column-title">In Progress</span>
                        <span class="task-count" id="count-progress">0</span>
                    </div>
                    <div class="column-cards" id="cards-progress"></div>
                </div>

                <div class="kanban-column column-completed" data-status="Completed">
                    <div class="column-header">
                        <span class="column-title">Completed</span>
                        <span class="task-count" id="count-completed">0</span>
                    </div>
                    <div class="column-cards" id="cards-completed"></div>
                </div>
            </div>
        `;

        this.loadBoardData();
    },

    async loadBoardData() {
        const res = await API.get('/api/tasks');
        if (res && res.success) {
            this.renderCards(res.data);
            this.initDragAndDrop();
        }
    },

    renderCards(tasks) {
        const columns = {
            'Pending': document.getElementById('cards-pending'),
            'In Progress': document.getElementById('cards-progress'),
            'Completed': document.getElementById('cards-completed')
        };

        const counts = {
            'Pending': document.getElementById('count-pending'),
            'In Progress': document.getElementById('count-progress'),
            'Completed': document.getElementById('count-completed')
        };

        // Clear columns
        Object.values(columns).forEach(col => col.innerHTML = '');

        const taskCounts = { 'Pending': 0, 'In Progress': 0, 'Completed': 0 };

        tasks.forEach(task => {
            const col = columns[task.status];
            if (col) {
                taskCounts[task.status]++;
                const card = document.createElement('div');
                card.className = 'kanban-card';
                card.draggable = true;
                card.dataset.id = task._id;
                card.innerHTML = `
                    <div class="kanban-card-title">${task.title}</div>
                    <div class="kanban-card-desc">${task.description || 'No description'}</div>
                    <div class="kanban-card-footer">
                        <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
                        <div class="assignee-avatar">U</div>
                    </div>
                `;
                col.appendChild(card);
            }
        });

        // Update counts
        Object.keys(taskCounts).forEach(status => {
            if (counts[status]) counts[status].textContent = taskCounts[status];
        });
    },

    initDragAndDrop() {
        const cards = document.querySelectorAll('.kanban-card');
        const columnContainers = document.querySelectorAll('.column-cards');

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', card.dataset.id);
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });

        columnContainers.forEach(column => {
            column.addEventListener('dragover', e => {
                e.preventDefault();
                const draggingCard = document.querySelector('.dragging');
                if (draggingCard) {
                    column.appendChild(draggingCard);
                }
            });

            column.addEventListener('drop', async (e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('text/plain');
                const newStatus = column.parentElement.dataset.status;

                // Optimistic UI was already handled by appending in dragover
                // Now persist to backend
                try {
                    const res = await API.patch(`/api/tasks/${taskId}`, { status: newStatus });
                    if (res && res.success) {
                        Utils.showToast(`Task moved to ${newStatus}`, 'success');
                        // Update counts
                        this.loadBoardData();
                    }
                } catch (err) {
                    Utils.showToast('Failed to update task status', 'error');
                    this.loadBoardData(); // Revert on failure
                }
            });
        });
    }
};
