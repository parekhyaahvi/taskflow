const DashboardView = {
    async render() {
        const user = JSON.parse(localStorage.getItem('user'));
        const viewContent = document.getElementById('view-content');
        
        viewContent.innerHTML = `
            <div class="dashboard-header">
                <h1>Welcome back, ${user ? user.fullName.split(' ')[0] : 'User'}</h1>
                <p style="color: var(--text-secondary);">Here's a summary of your workspace.</p>
            </div>

            <div class="stats-grid" id="dashboard-stats">
                <div class="card stat-card">
                    <span class="stat-label">Total Tasks</span>
                    <span class="stat-value" id="stat-total" style="color: var(--accent-cyan);">0</span>
                </div>
                <div class="card stat-card">
                    <span class="stat-label">Completed</span>
                    <span class="stat-value" id="stat-completed" style="color: var(--success);">0</span>
                </div>
                <div class="card stat-card">
                    <span class="stat-label">In Progress</span>
                    <span class="stat-value" id="stat-pending" style="color: var(--accent-purple);">0</span>
                </div>
                <div class="card stat-card">
                    <span class="stat-label">High Priority</span>
                    <span class="stat-value" id="stat-high" style="color: var(--danger);">0</span>
                </div>
            </div>

            <div class="chart-container card">
                <h3 style="margin-bottom: 24px;">Weekly Productivity</h3>
                <div style="height: 300px;">
                    <canvas id="productivity-chart"></canvas>
                </div>
            </div>
        `;

        this.loadStats();
    },

    async loadStats() {
        const res = await API.get('/api/tasks');
        if (res && res.success) {
            const tasks = res.data;
            
            document.getElementById('stat-total').textContent = tasks.length;
            document.getElementById('stat-completed').textContent = tasks.filter(t => t.status === 'Completed').length;
            document.getElementById('stat-pending').textContent = tasks.filter(t => t.status === 'In Progress').length;
            document.getElementById('stat-high').textContent = tasks.filter(t => t.priority === 'High').length;

            this.renderChart(tasks);
        }
    },

    renderChart(tasks) {
        const ctx = document.getElementById('productivity-chart').getContext('2d');
        
        // Mock data for weekly productivity (tasks completed in the last 7 days)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = [12, 19, 3, 5, 2, 3, 7]; // Example data

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Completed Tasks',
                    data: data,
                    borderColor: '#00E5FF',
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#30363D' },
                        ticks: { color: '#8B949E' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#8B949E' }
                    }
                }
            }
        });
    }
};
