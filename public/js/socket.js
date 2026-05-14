const socket = io();

const SocketClient = {
    init() {
        const user = JSON.parse(localStorage.getItem('user'));

        socket.on('connect', () => {
            console.log('Connected to real-time server');
            if (user) {
                this.authenticate(user);
            }
        });

        socket.on('presenceUpdate', (users) => {
            console.log('Online users updated:', users);
            this.updatePresenceUI(users);
        });

        socket.on('taskUpdated', (data) => {
            console.log('Task updated via socket:', data);
            Utils.showToast(`Task updated by ${data.updatedBy || 'someone'}`, 'info');
            
            // This is for detailed view updates (Phase 6)
            if (window.onTaskRemoteUpdate) {
                window.onTaskRemoteUpdate(data);
            }
        });

        socket.on('taskUpdatedGlobal', (data) => {
            console.log('Global task update:', data);
            
            if (typeof ActivityView !== 'undefined') {
                ActivityView.addLog(data.updatedBy || 'Someone', 'updated task', data.taskId);
            }

            // Refresh list or board if the updated task is visible
            if (window.location.hash === '#tasks' && typeof TasksView !== 'undefined') {
                TasksView.loadTasks();
            }
            if (window.location.hash === '#board' && typeof BoardView !== 'undefined') {
                BoardView.loadBoardData();
            }
        });
    },

    authenticate(user) {
        socket.emit('authenticate', {
            userId: user._id,
            fullName: user.fullName,
            username: user.username
        });
    },

    updateView(view) {
        socket.emit('updateView', view);
    },

    joinTask(taskId) {
        socket.emit('joinRoom', { taskId });
    },

    leaveTask(taskId) {
        socket.emit('leaveRoom', { taskId });
    },

    emitUpdate(taskId, field, value) {
        const user = JSON.parse(localStorage.getItem('user'));
        socket.emit('taskUpdate', { 
            taskId, 
            field, 
            value, 
            updatedBy: user ? user.fullName : 'System' 
        });
    },

    updatePresenceUI(users) {
        // Find or create presence container in sidebar footer
        let container = document.getElementById('online-users');
        if (!container) {
            const sidebarFooter = document.querySelector('.sidebar-footer');
            if (sidebarFooter) {
                container = document.createElement('div');
                container.id = 'online-users';
                container.className = 'online-users-container';
                sidebarFooter.prepend(container);
            }
        }

        if (container) {
            container.innerHTML = `
                <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Online Now (${users.length})</div>
                <div class="user-avatars" style="display: flex; gap: 4px; flex-wrap: wrap;">
                    ${users.map(u => `
                        <div class="user-avatar-mini" title="${u.fullName} (${u.currentView})">
                            ${u.fullName.charAt(0)}
                            <span class="status-indicator"></span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
};

SocketClient.init();
