const onlineUsers = new Map(); // socket.id -> { userId, fullName, currentView }

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`New WebSocket Connection: ${socket.id}`);

        socket.on('authenticate', (userData) => {
            if (userData && userData.userId) {
                onlineUsers.set(socket.id, {
                    ...userData,
                    currentView: 'dashboard'
                });
                io.emit('presenceUpdate', Array.from(onlineUsers.values()));
            }
        });

        socket.on('joinRoom', ({ taskId }) => {
            socket.join(`task:${taskId}`);
            console.log(`User joined task room: ${taskId}`);
        });

        socket.on('leaveRoom', ({ taskId }) => {
            socket.leave(`task:${taskId}`);
            console.log(`User left task room: ${taskId}`);
        });

        socket.on('updateView', (view) => {
            const user = onlineUsers.get(socket.id);
            if (user) {
                user.currentView = view;
                io.emit('presenceUpdate', Array.from(onlineUsers.values()));
            }
        });

        socket.on('taskUpdate', ({ taskId, field, value, updatedBy }) => {
            socket.to(`task:${taskId}`).emit('taskUpdated', { taskId, field, value, updatedBy });
            // Also broadcast globally for list/board updates
            socket.broadcast.emit('taskUpdatedGlobal', { taskId, field, value, updatedBy });
        });

        socket.on('disconnect', () => {
            onlineUsers.delete(socket.id);
            io.emit('presenceUpdate', Array.from(onlineUsers.values()));
            console.log('User has left');
        });
    });
};
