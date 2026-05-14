const CalendarView = {
    currentDate: new Date(),

    async render() {
        const viewContent = document.getElementById('view-content');
        viewContent.innerHTML = `
            <div class="tasks-header calendar-page-header">
                <div>
                    <h1>Calendar</h1>
                    <p style="color: var(--text-secondary);">Track your deadlines across the month.</p>
                </div>
            </div>

            <div class="calendar-container card">
                <div class="calendar-header">
                    <h2 id="calendar-month-year" style="font-size: 18px;">Month Year</h2>
                    <div style="display: flex; gap: 8px;">
                        <button id="prev-month" class="btn btn-secondary" style="padding: 6px 12px;"><i data-lucide="chevron-left"></i></button>
                        <button id="today-btn" class="btn btn-secondary" style="padding: 6px 12px;">Today</button>
                        <button id="next-month" class="btn btn-secondary" style="padding: 6px 12px;"><i data-lucide="chevron-right"></i></button>
                    </div>
                </div>

                <div class="calendar-grid" id="calendar-grid">
                    <!-- Days will be injected here -->
                </div>
            </div>
        `;

        lucide.createIcons();
        this.attachEventListeners();
        this.renderCalendar();
    },

    attachEventListeners() {
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });
        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
        document.getElementById('today-btn').addEventListener('click', () => {
            this.currentDate = new Date();
            this.renderCalendar();
        });
    },

    async renderCalendar() {
        const grid = document.getElementById('calendar-grid');
        const monthYear = document.getElementById('calendar-month-year');
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        monthYear.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(this.currentDate);

        // Get tasks for this month range
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        const res = await API.get(`/api/tasks?startDate=${firstDayOfMonth.toISOString()}&endDate=${lastDayOfMonth.toISOString()}`);
        const tasks = res && res.success ? res.data : [];

        // Setup grid headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        grid.innerHTML = days.map(day => `<div class="calendar-day-label">${day}</div>`).join('');

        // Calculate layout
        const startDay = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();
        const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;

        for (let i = 0; i < totalCells; i++) {
            const dayNum = i - startDay + 1;
            const cellDate = new Date(year, month, dayNum);
            const isOtherMonth = dayNum <= 0 || dayNum > daysInMonth;
            const isToday = cellDate.toDateString() === new Date().toDateString();

            const cell = document.createElement('div');
            cell.className = `calendar-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;
            
            cell.innerHTML = `
                <div class="calendar-date-num">${cellDate.getDate()}</div>
                <div class="calendar-tasks-container" style="display: flex; flex-direction: column; gap: 2px;">
                    ${this.getTasksForDate(tasks, cellDate).map(task => `
                        <div class="calendar-task-bar task-bar-${task.status === 'Completed' ? 'completed' : task.priority.toLowerCase()}">
                            ${task.title}
                        </div>
                    `).join('')}
                </div>
            `;
            grid.appendChild(cell);
        }
    },

    getTasksForDate(tasks, date) {
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate.toDateString() === date.toDateString();
        });
    }
};
