document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---

    // Editor Elements
    const nameInput = document.getElementById('profile-name');
    const usernameInput = document.getElementById('profile-username');
    const bioInput = document.getElementById('profile-bio');
    const linksContainer = document.getElementById('links-container');
    const socialInputs = document.querySelectorAll('.social-input'); // New: Select all social inputs
    const addLinkBtn = document.getElementById('add-link-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const bgColorPicker = document.getElementById('bg-color-picker');
    const accentColorPicker = document.getElementById('accent-color-picker');
    const exportBtn = document.getElementById('export-btn');
    const shareBtn = document.getElementById('share-btn');
    const saveStatus = document.getElementById('save-status');
    const urlPrefixDisplay = document.getElementById('url-prefix-display');

    // Modal Elements
    const shareModal = document.getElementById('share-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const finalShareLink = document.getElementById('final-share-link');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const copyStatus = document.getElementById('copy-status');

    // Preview Elements
    const previewName = document.getElementById('preview-name');
    const previewBio = document.getElementById('preview-bio');
    const previewLinksContainer = document.getElementById('preview-links-container');
    const previewSocialIcons = document.getElementById('preview-social-icons'); // New: Social icons container
    const deviceScreen = document.getElementById('preview-screen');
    const profileImageFrame = document.querySelector('.profile-image');

    // Auth & Image Elements
    const authTriggerBtn = document.getElementById('auth-trigger-btn');
    const authTriggerText = document.getElementById('auth-trigger-text');
    const authModal = document.getElementById('auth-modal');
    const closeAuthBtn = document.getElementById('close-auth-btn');
    const authTitle = document.getElementById('auth-title');
    const authNameGroup = document.getElementById('auth-name-group');
    const authActionBtn = document.getElementById('auth-action-btn');
    const authSwitchText = document.getElementById('auth-switch-text');
    const authSwitchBtn = document.getElementById('auth-switch-btn');
    const profileImageUpload = document.getElementById('profile-image-upload');
    const removeImageBtn = document.getElementById('remove-image-btn');

    // --- State ---
    let appData = {
        profileUsername: 'benim-ismim',
        profileName: 'Hoşgeldin 👋',
        profileBio: 'Bu benim yeni dijital kartvizitim!',
        profileImage: '', // Base64 string for image
        theme: 'dark', // editor theme
        bgColor: '#0f172a', // preview background
        accentColor: '#3b82f6', // preview accent
        links: [
            { id: Date.now().toString(), title: 'Instagram', url: 'https://instagram.com/' },
            { id: (Date.now() + 1).toString(), title: 'Portfolio', url: 'https://myportfolio.com' }
        ],
        socials: {
            instagram: '', // e.g. https://instagram.com/...
            twitter: '',
            linkedin: '',
            github: '',
            youtube: ''
        }
    };

    // --- Initialization ---
    init();

    function init() {
        // Handle View Mode vs Editor Mode
        const params = new URLSearchParams(window.location.search);
        const viewUser = params.get('u');

        if (viewUser) {
            document.body.classList.add('view-mode');
            // In a real app we would fetch the user 'viewUser' data from a DB here.
            // For this local tech demo, we'll just display whatever is in localStorage
            // to simulate that the profile page has loaded.
        }

        loadData();
        renderEditorLinks();
        updatePreview();
        applyEditorTheme();
        bindEvents();
    }

    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // --- Core Functions ---

    function bindEvents() {
        // Profile Inputs
        usernameInput.addEventListener('input', (e) => {
            // Sanitize username (alphanumeric and dashes only)
            let val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
            e.target.value = val;
            appData.profileUsername = val;

            // Update the display text above the input
            const usernameDisplay = document.getElementById('url-username-preview');
            if (usernameDisplay) {
                usernameDisplay.textContent = val || 'isim';
            }

            autoSave();
        });

        nameInput.addEventListener('input', (e) => {
            appData.profileName = e.target.value;
            updatePreview();
            autoSave();
        });

        bioInput.addEventListener('input', (e) => {
            appData.profileBio = e.target.value;
            updatePreview();
            autoSave();
        });

        // Profile Image Upload
        profileImageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    appData.profileImage = event.target.result; // base64 string
                    updatePreview();
                    autoSave();
                    removeImageBtn.style.display = 'inline-block';
                };
                reader.readAsDataURL(file);
            }
        });

        removeImageBtn.addEventListener('click', () => {
            appData.profileImage = '';
            profileImageUpload.value = '';
            removeImageBtn.style.display = 'none';
            updatePreview();
            autoSave();
        });

        // Social Info
        socialInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const platform = e.target.dataset.platform;
                appData.socials[platform] = e.target.value;
                updatePreview();
                autoSave();
            });
        });

        // Theme Toggle
        themeToggle.addEventListener('click', () => {
            appData.theme = appData.theme === 'dark' ? 'light' : 'dark';
            applyEditorTheme();
            autoSave();
        });

        // Add Link
        addLinkBtn.addEventListener('click', () => {
            const newLink = { id: generateId(), title: 'New Link', url: 'https://' };
            appData.links.push(newLink);
            renderEditorLinks();
            updatePreview();
            autoSave();

            // Scroll to bottom of links
            setTimeout(() => {
                const el = document.querySelector('.editor-content');
                el.scrollTop = el.scrollHeight;
            }, 50);
        });

        // Colors
        bgColorPicker.addEventListener('input', (e) => {
            appData.bgColor = e.target.value;
            updatePreviewStyles();
            autoSave();
        });

        accentColorPicker.addEventListener('input', (e) => {
            appData.accentColor = e.target.value;
            updatePreviewStyles();
            autoSave();
        });

        // Export/Save manually
        exportBtn.addEventListener('click', () => {
            saveData();
            showSaveStatus('Data saved successfully!');
            // In a real app, this might generate a static HTML file to download.
        });

        // Share & Modal Events
        shareBtn.addEventListener('click', () => {
            const currentOrigin = window.location.origin;
            const shareUrl = `${currentOrigin}/?u=${appData.profileUsername || 'yourname'}`;
            finalShareLink.textContent = shareUrl;

            // Reset copy status
            copyStatus.style.opacity = '0';
            copyLinkBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';

            shareModal.classList.add('active');
        });

        closeModalBtn.addEventListener('click', () => {
            shareModal.classList.remove('active');
        });

        // Close modal on outside click
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.classList.remove('active');
            }
        });

        copyLinkBtn.addEventListener('click', () => {
            const textToCopy = finalShareLink.textContent;

            navigator.clipboard.writeText(textToCopy).then(() => {
                copyLinkBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
                copyStatus.style.opacity = '1';

                setTimeout(() => {
                    copyStatus.style.opacity = '0';
                    copyLinkBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
                }, 3000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                copyStatus.textContent = "Failed to copy";
                copyStatus.style.opacity = '1';
            });
        });

        // Auth Modal Events
        let isLoginMode = true;

        if (authTriggerBtn) {
            authTriggerBtn.addEventListener('click', () => {
                authModal.classList.add('active');
            });
        }

        if (closeAuthBtn) {
            closeAuthBtn.addEventListener('click', () => {
                authModal.classList.remove('active');
            });
        }

        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.classList.remove('active');
            }
        });

        if (authSwitchBtn) {
            authSwitchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                isLoginMode = !isLoginMode;
                if (isLoginMode) {
                    authTitle.textContent = 'Giriş Yap';
                    authNameGroup.style.display = 'none';
                    authActionBtn.textContent = 'Giriş Yap';
                    authSwitchText.textContent = 'Hesabın yok mu?';
                    authSwitchBtn.textContent = 'Kayıt Ol';
                } else {
                    authTitle.textContent = 'Kayıt Ol';
                    authNameGroup.style.display = 'block'; // Show name field for registration
                    authActionBtn.textContent = 'Kayıt Ol';
                    authSwitchText.textContent = 'Zaten hesabın var mı?';
                    authSwitchBtn.textContent = 'Giriş Yap';
                }
            });
        }
    }

    function renderEditorLinks() {
        linksContainer.innerHTML = '';

        appData.links.forEach((link, index) => {
            const linkEl = document.createElement('div');
            linkEl.className = 'link-edit-item';
            linkEl.innerHTML = `
                <div class="link-drag-handle"><i class="fa-solid fa-grip-vertical"></i></div>
            <div class="link-details">
                <input type="text" class="link-title-input" value="${link.title}" data-id="${link.id}" placeholder="Link Title">
                <input type="url" class="link-url-input" value="${link.url}" data-id="${link.id}" placeholder="https://example.com">
            </div>
            <button class="icon-btn delete-link-btn text-danger" data-id="${link.id}" title="Delete Link">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
            linksContainer.appendChild(linkEl);
        });

        // Bind events to newly created inputs
        bindEditorLinkEvents();
    }

    // --- Social Icons ---
    function renderSocialsInPreview() {
        previewSocialIcons.innerHTML = '';
        if (!appData.socials) return;

        // Map platform name to font awesome icon class
        const iconMap = {
            instagram: 'fa-instagram',
            twitter: 'fa-x-twitter',
            linkedin: 'fa-linkedin',
            github: 'fa-github',
            youtube: 'fa-youtube'
        };

        for (const [platform, url] of Object.entries(appData.socials)) {
            if (url && url.trim() !== '') {
                const a = document.createElement('a');
                a.href = url.startsWith('http') ? url : `https://${url}`;
                a.className = 'social-icon';
                a.target = '_blank';
                // Add rel attribute if opening external link
                a.rel = 'noopener noreferrer';
                a.innerHTML = `<i class="fa-brands ${iconMap[platform]}"></i>`;
                previewSocialIcons.appendChild(a);
            }
        }
    }

    function updatePreview() {
        // Update Text
        previewName.textContent = appData.profileName || 'Your Name';
        previewBio.textContent = appData.profileBio || 'Your Bio goes here';

        // Update Profile Image
        if (appData.profileImage) {
            profileImageFrame.innerHTML = `<img src="${appData.profileImage}" alt="Profile Image">`;
        } else {
            // Restore default SVG
            profileImageFrame.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" class="avatar-svg">
                    <circle cx="12" cy="8" r="4" fill="currentColor" />
                    <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22" stroke="currentColor" stroke-width="2" />
                </svg>
            `;
        }

        // Re-render Preview Links
        renderPreviewLinks();

        // Re-render Social Icons
        renderSocialsInPreview();

        updatePreviewStyles();
    }

    function renderPreviewLinks() {
        previewLinksContainer.innerHTML = '';
        appData.links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url.startsWith('http') ? link.url : `https://${link.url}`;
            a.className = 'preview-link-btn';
            a.textContent = link.title || 'Untitled Link';

            // if we are in view mode, open in new tab
            if (document.body.classList.contains('view-mode')) {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            } else {
                // In editor mode avoid actual navigation locally
                a.addEventListener('click', e => e.preventDefault());
            }

            previewLinksContainer.appendChild(a);
        });
    }

    function updatePreviewStyles() {
        // Apply background gradient based on selected bg color
        deviceScreen.style.background = `linear-gradient(135deg, ${appData.bgColor} 0%, #000000 100%)`;

        // Update accent colors
        profileImageFrame.style.background = `linear-gradient(135deg, ${appData.accentColor}, #8b5cf6)`;

        // Ensure text contrast (simple approach: white text on dark backgrounds)
        // In a more advanced implementation, we would calculate luminance.
    }

    function applyEditorTheme() {
        document.body.setAttribute('data-theme', appData.theme);
        const icon = themeToggle.querySelector('i');
        if (appData.theme === 'light') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }

    function bindEditorLinkEvents() {
        document.querySelectorAll('.link-title-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = e.target.getAttribute('data-id');
                const link = appData.links.find(l => l.id === id);
                if (link) link.title = e.target.value;
                updatePreview();
                autoSave();
            });
        });

        document.querySelectorAll('.link-url-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = e.target.getAttribute('data-id');
                const link = appData.links.find(l => l.id === id);
                if (link) link.url = e.target.value;
                updatePreview();
                autoSave();
            });
        });

        document.querySelectorAll('.delete-link-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                appData.links = appData.links.filter(l => l.id !== id);
                renderEditorLinks();
                updatePreview();
                autoSave();
            });
        });
    }

    // --- Data Persistence ---

    function autoSave() {
        saveData();
        showSaveStatus('Autosaved');
    }

    let saveTimeout;
    function showSaveStatus(msg) {
        saveStatus.textContent = msg;
        saveStatus.classList.add('show');
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveStatus.classList.remove('show');
        }, 2000);
    }

    function saveData() {
        localStorage.setItem('linkInBioData', JSON.stringify(appData));
    }

    function loadData() {
        const saved = localStorage.getItem('linkInBioData');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);

                // Ensure socials object exists (for backward compatibility if user already saved data before this update)
                if (!parsed.socials) {
                    parsed.socials = { instagram: '', twitter: '', linkedin: '', github: '', youtube: '' };
                }

                appData = { ...appData, ...parsed };

                // Populate editor inputs
                usernameInput.value = appData.profileUsername || 'benim-ismim';
                const usernameDisplay = document.getElementById('url-username-preview');
                if (usernameDisplay) {
                    usernameDisplay.textContent = appData.profileUsername || 'benim-ismim';
                }

                nameInput.value = appData.profileName;
                bioInput.value = appData.profileBio;
                bgColorPicker.value = appData.bgColor;
                accentColorPicker.value = appData.accentColor;

                if (appData.profileImage) {
                    removeImageBtn.style.display = 'inline-block';
                }

                // Populate social inputs
                socialInputs.forEach(input => {
                    input.value = appData.socials[input.dataset.platform] || '';
                });

            } catch (e) {
                console.error("Error loading saved data", e);
            }
        }
    }
});
