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
                    <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 24px; color: var(--text-primary);">Public Profile</h2>
                    
                    <div style="display: flex; gap: 48px; align-items: flex-start; margin-bottom: 32px;">
                        <!-- Avatar Section -->
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
                            <div style="position: relative;">
                                <img src="${user.avatarUrl || 'https://ui-avatars.com/api/?background=random&name=' + user.fullName}" 
                                     id="profile-avatar-preview" 
                                     style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid var(--bg-primary); box-shadow: 0 0 0 2px var(--accent-cyan);">
                                <button class="btn btn-secondary" 
                                        style="position: absolute; bottom: 4px; right: 4px; width: 36px; height: 36px; padding: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--bg-elevated); border: 1px solid var(--border);" 
                                        onclick="document.getElementById('avatar-upload').click()">
                                    <i data-lucide="camera" style="width: 16px; height: 16px;"></i>
                                </button>
                                <input type="file" id="avatar-upload" style="display: none;" accept="image/*">
                            </div>
                            <div style="text-align: center;">
                                <div style="font-weight: 600; font-size: 13px;">Profile Picture</div>
                                <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">JPG, PNG up to 2MB</div>
                            </div>
                        </div>

                        <!-- Form Section -->
                        <form id="profile-form" style="flex: 1; max-width: 450px;">
                            <div class="form-group" style="margin-bottom: 16px;">
                                <label class="form-label" style="margin-bottom: 6px; font-size: 12px; font-weight: 600; color: var(--text-secondary);">Full Name</label>
                                <input type="text" class="form-input" name="fullName" value="${user.fullName}" placeholder="Enter your full name" style="height: 42px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 16px;">
                                <label class="form-label" style="margin-bottom: 6px; font-size: 12px; font-weight: 600; color: var(--text-secondary);">Username</label>
                                <input type="text" class="form-input" name="username" value="${user.username}" placeholder="Choose a username" style="height: 42px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 32px;">
                                <label class="form-label" style="margin-bottom: 6px; font-size: 12px; font-weight: 600; color: var(--text-secondary);">Email Address</label>
                                <div style="display: flex; flex-direction: column; gap: 6px;">
                                    <input type="email" class="form-input" value="${user.email}" disabled style="opacity: 0.5; cursor: not-allowed; background: var(--bg-primary); height: 42px;">
                                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 11px;">
                                        <i data-lucide="info" style="width: 12px; height: 12px;"></i>
                                        <span>Linked email cannot be changed.</span>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" id="profile-save-btn" class="btn btn-primary">Save Changes</button>
                        </form>
                    </div>
                </div>
            `;
            lucide.createIcons();
            this.attachProfileListener();
            this.attachAvatarListener();
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
                    <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 24px; color: var(--text-primary);">Security & Privacy</h2>
                    
                    <!-- Password Section -->
                    <form id="password-form" style="background: rgba(255, 255, 255, 0.02); padding: 24px; border-radius: 20px; border: 1px solid var(--glass-border); margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                            <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(250, 204, 21, 0.1); display: flex; align-items: center; justify-content: center; color: var(--accent-cyan);">
                                <i data-lucide="lock" style="width: 22px; height: 22px;"></i>
                            </div>
                            <div>
                                <div style="font-weight: 600; font-size: 15px;">Change Password</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Choose a strong password to protect your account.</div>
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px; max-width: 450px;">
                            <label class="form-label" style="margin-bottom: 8px; font-size: 12px; font-weight: 600; color: var(--text-secondary);">New Password</label>
                            <input type="password" name="password" class="form-input" placeholder="Enter new password" style="height: 42px;">
                        </div>
                        <button type="submit" class="btn btn-primary">Update Password</button>
                    </form>

                    <!-- 2FA Section -->
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 24px; background: rgba(255, 255, 255, 0.02); border-radius: 20px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(74, 222, 128, 0.1); display: flex; align-items: center; justify-content: center; color: var(--success);">
                                <i data-lucide="shield-check" style="width: 22px; height: 22px;"></i>
                            </div>
                            <div>
                                <div style="font-weight: 600; font-size: 15px;">Two-Factor Authentication</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Enhanced protection for your account access.</div>
                            </div>
                        </div>
                        <div style="padding: 4px 12px; background: var(--accent-cyan); color: #000; border-radius: 99px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">BETA</div>
                    </div>
                </div>

                <div class="settings-section" style="margin-top: 48px; padding-top: 32px; border-top: 1px solid rgba(248, 113, 113, 0.15);">
                    <h2 style="color: var(--danger); font-size: 18px; margin-bottom: 12px;">Danger Zone</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 13px;">Once you delete your account, there is no going back. All data will be wiped.</p>
                    <button class="btn btn-danger" style="background: transparent; border: 1.5px solid var(--danger); color: var(--danger); font-weight: 600; padding: 10px 24px;">Delete Account</button>
                </div>
            `;
            lucide.createIcons();
            this.attachPasswordListener();
        }
    },

    attachPasswordListener() {
        const form = document.getElementById('password-form');
        if (!form) return;
        
        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const password = formData.get('password');

            if (!password) {
                Utils.showToast('Please enter a new password', 'warning');
                return;
            }

            const res = await API.put('/api/auth/update', { password });
            if (res && res.success) {
                Utils.showToast('Password updated successfully', 'success');
                form.reset();
            } else {
                Utils.showToast(res.error || 'Failed to update password', 'error');
            }
        };
    },

    attachAvatarListener() {
        const uploadInput = document.getElementById('avatar-upload');
        const preview = document.getElementById('profile-avatar-preview');
        if (!uploadInput || !preview) return;

        uploadInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    Utils.showToast('Image size must be less than 2MB', 'warning');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    preview.src = event.target.result;
                    this.pendingAvatar = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
    },

    attachProfileListener() {
        const form = document.getElementById('profile-form');
        if (!form) return;

        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = {
                fullName: formData.get('fullName'),
                username: formData.get('username')
            };

            if (this.pendingAvatar) {
                data.avatarUrl = this.pendingAvatar;
            }

            const res = await API.put('/api/auth/update', data);
            if (res && res.success) {
                localStorage.setItem('user', JSON.stringify(res.data));
                Utils.showToast('Profile updated successfully', 'success');
                
                // Update sidebar name and avatar if they exist
                const nameEl = document.querySelector('.user-name');
                if (nameEl) nameEl.textContent = res.data.fullName;
                
                const avatarEl = document.querySelector('.user-avatar img');
                if (avatarEl && res.data.avatarUrl) avatarEl.src = res.data.avatarUrl;

                // Update top bar avatar
                const topAvatarEl = document.getElementById('user-avatar-top');
                if (topAvatarEl && res.data.avatarUrl) {
                    topAvatarEl.innerHTML = `<img src="${res.data.avatarUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                }

                this.pendingAvatar = null;
            } else {
                Utils.showToast(res.error || 'Failed to update profile', 'error');
            }
        };
    }
};
