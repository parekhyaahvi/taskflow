const SettingsView = {
    async render() {
        const user = JSON.parse(localStorage.getItem('user'));
        const viewContent = document.getElementById('view-content');
        
        viewContent.innerHTML = `
            <div class="tasks-header">
                <div>
                    <h1>Settings</h1>
                    <p style="color: var(--text-secondary);">Manage your account preferences and profile.</p>
                </div>
            </div>

            <div class="settings-grid">
                <div class="settings-nav">
                    <div class="settings-nav-item active" data-tab="profile">Profile</div>
                    <div class="settings-nav-item" data-tab="appearance">Appearance</div>
                    <div class="settings-nav-item" data-tab="security">Security</div>
                </div>

                <div class="settings-content" id="settings-tab-content">
                    <!-- Tab content injected here -->
                </div>
            </div>
        `;

        this.attachTabListeners();
        this.loadTab('profile');
    },

    attachTabListeners() {
        const items = document.querySelectorAll('.settings-nav-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                items.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.loadTab(item.dataset.tab);
            });
        });
    },

    loadTab(tab) {
        const content = document.getElementById('settings-tab-content');
        const user = JSON.parse(localStorage.getItem('user'));

        if (tab === 'profile') {
            content.innerHTML = `
                <div class="settings-section">
                    <h2>Public Profile</h2>
                    <form id="profile-form">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" class="form-control" name="fullName" value="${user.fullName}">
                        </div>
                        <div class="form-group">
                            <label>Username</label>
                            <input type="text" class="form-control" name="username" value="${user.username}">
                        </div>
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" class="form-control" value="${user.email}" disabled>
                            <small style="color: var(--text-secondary);">Email cannot be changed.</small>
                        </div>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </form>
                </div>
            `;
            this.attachProfileListener();
        } else if (tab === 'appearance') {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            content.innerHTML = `
                <div class="settings-section">
                    <h2>Appearance</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 24px;">Customize how TaskFlow looks on your screen.</p>
                    
                    <div class="appearance-toggle">
                        <div>
                            <div style="font-weight: 600;">Dark Mode</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Reduce eye strain in low-light environments.</div>
                        </div>
                        <button id="theme-toggle-settings" class="btn btn-secondary">
                            ${currentTheme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                        </button>
                    </div>
                </div>
            `;
            
            document.getElementById('theme-toggle-settings').addEventListener('click', () => {
                Utils.toggleTheme();
                this.loadTab('appearance'); // Re-render tab
            });
        } else if (tab === 'security') {
            content.innerHTML = `
                <div class="settings-section">
                    <h2>Security</h2>
                    <div class="form-group">
                        <label>New Password</label>
                        <input type="password" class="form-control" placeholder="Leave blank to keep current">
                    </div>
                    <button class="btn btn-primary" disabled>Update Password</button>
                    <p style="margin-top: 16px; font-size: 13px; color: var(--text-secondary);">2-Factor Authentication is currently in beta.</p>
                </div>
                <div class="settings-section" style="border-top: 1px solid var(--danger); padding-top: 24px; margin-top: 40px;">
                    <h2 style="color: var(--danger); border: none;">Danger Zone</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 16px;">Once you delete your account, there is no going back. Please be certain.</p>
                    <button class="btn btn-danger">Delete Account</button>
                </div>
            `;
        }
    },

    attachProfileListener() {
        const form = document.getElementById('profile-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = {
                fullName: formData.get('fullName'),
                username: formData.get('username')
            };

            const res = await API.put('/api/auth/update', data);
            if (res && res.success) {
                localStorage.setItem('user', JSON.stringify(res.data));
                Utils.showToast('Profile updated successfully', 'success');
                
                // Update sidebar name if it exists
                const nameEl = document.querySelector('.user-name');
                if (nameEl) nameEl.textContent = res.data.fullName;
            } else {
                Utils.showToast(res.error || 'Failed to update profile', 'error');
            }
        });
    }
};
