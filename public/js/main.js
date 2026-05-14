document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Check
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token && window.location.pathname === '/dashboard') {
        window.location.href = '/login';
        return;
    }

    // 2. Initialize Utils
    Utils.initTheme();

    // 3. UI Elements
    const themeToggle = document.getElementById('theme-toggle');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameGreeting = document.getElementById('user-name-greeting');
    const userAvatarTop = document.getElementById('user-avatar-top');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => Utils.toggleTheme());
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        });
    }

    // Initialize activity log
    const initActivity = () => {
        const script = document.createElement('script');
        script.src = '/js/views/activity.js';
        script.onload = () => ActivityView.init();
        document.body.appendChild(script);
    };
    initActivity();

    if (user) {
        if (userNameGreeting) userNameGreeting.textContent = user.fullName.split(' ')[0];
        if (userAvatarTop) userAvatarTop.textContent = user.fullName.charAt(0).toUpperCase();
    }

    // 4. Routing
    const handleRoute = () => {
        const hash = window.location.hash || '#dashboard';
        const view = hash.substring(1);
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === hash) {
                link.classList.add('active');
            }
        });

        loadView(view);
    };

    const loadView = (view) => {
        const viewContent = document.getElementById('view-content');
        if (!viewContent) return;

        // Notify socket of view change for presence tracking
        if (typeof SocketClient !== 'undefined') {
            SocketClient.updateView(view);
        }

        // Cleanup previous view
        viewContent.innerHTML = '';
        
        // Remove old view-specific CSS
        const oldStyle = document.getElementById('view-style');
        if (oldStyle) oldStyle.remove();

        // Load new view-specific CSS
        const link = document.createElement('link');
        link.id = 'view-style';
        link.rel = 'stylesheet';
        link.href = `/css/pages/${view}.css`;
        document.head.appendChild(link);

        if (view === 'tasks') {
            if (typeof TasksView !== 'undefined') {
                TasksView.render();
            } else {
                const script = document.createElement('script');
                script.src = '/js/views/tasks.js';
                script.onload = () => TasksView.render();
                document.body.appendChild(script);
            }
        } else if (view === 'board') {
            if (typeof BoardView !== 'undefined') {
                BoardView.render();
            } else {
                const script = document.createElement('script');
                script.src = '/js/views/board.js';
                script.onload = () => BoardView.render();
                document.body.appendChild(script);
            }
        } else if (view === 'calendar') {
            if (typeof CalendarView !== 'undefined') {
                CalendarView.render();
            } else {
                const script = document.createElement('script');
                script.src = '/js/views/calendar.js';
                script.onload = () => CalendarView.render();
                document.body.appendChild(script);
            }
        } else if (view === 'dashboard') {
            if (typeof DashboardView !== 'undefined') {
                DashboardView.render();
            } else {
                const script = document.createElement('script');
                script.src = '/js/views/dashboard.js';
                script.onload = () => DashboardView.render();
                document.body.appendChild(script);
            }
        } else if (view === 'settings') {
            if (typeof SettingsView !== 'undefined') {
                SettingsView.render();
            } else {
                const script = document.createElement('script');
                script.src = '/js/views/settings.js';
                script.onload = () => SettingsView.render();
                document.body.appendChild(script);
            }
        } else {
            viewContent.innerHTML = `<h1>${view.charAt(0).toUpperCase() + view.slice(1)}</h1><p>Coming soon...</p>`;
        }
    };

    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // Initialize on load
});
