const ActivityView = {
    logs: [],

    init() {
        this.render();
    },

    render() {
        const container = document.getElementById('activity-log');
        if (!container) return;

        if (this.logs.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px; text-align: center; padding: 20px;">No recent activity</p>';
            return;
        }

        container.innerHTML = this.logs.map(log => `
            <div class="activity-item" style="padding: 12px 0; border-bottom: 1px solid var(--border); display: flex; gap: 12px;">
                <div class="user-avatar-mini" style="flex-shrink: 0;">${log.user.charAt(0)}</div>
                <div>
                    <div style="font-size: 13px; line-height: 1.4;">
                        <span style="font-weight: 600; color: var(--text-primary);">${log.user}</span> 
                        <span style="color: var(--text-secondary);">${log.action}</span> 
                        <span style="font-weight: 500; color: var(--accent-cyan);">${log.target}</span>
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${log.time}</div>
                </div>
            </div>
        `).join('');
    },

    addLog(user, action, target) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        this.logs.unshift({ user, action, target, time: timeStr });
        
        // Keep only last 20 logs
        if (this.logs.length > 20) this.logs.pop();
        
        this.render();
    }
};

// Global access for socket integration
window.ActivityView = ActivityView;
