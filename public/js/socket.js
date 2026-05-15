const socket = typeof io !== 'undefined' ? io() : null;

const SocketClient = {
    init() {
        if (!socket) {
            console.warn('Real-time server (Socket.io) not available. This is expected on Vercel.');
            return;
        }
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
        if (!socket) return;
        socket.emit('authenticate', {
            userId: user._id,
            fullName: user.fullName,
            username: user.username
        });
    },

    updateView(view) {
        if (!socket) return;
        socket.emit('updateView', view);
    },

    joinTask(taskId) {
        if (!socket) return;
        socket.emit('joinRoom', { taskId });
    },

    leaveTask(taskId) {
        if (!socket) return;
        socket.emit('leaveRoom', { taskId });
    },

    emitUpdate(taskId, field, value) {
        if (!socket) return;
        const user = JSON.parse(localStorage.getItem('user'));
        socket.emit('taskUpdate', { 
            taskId, 
            field, 
            value, 
            updatedBy: user ? user.fullName : 'System' 
        });
    },

    updatePresenceUI(users) {
        // Presence UI removed as per user request
    }
};

SocketClient.init();
