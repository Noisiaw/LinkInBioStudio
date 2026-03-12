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

    // Analytics Modal Elements
    const analyticsSummaryBtn = document.getElementById('analytics-summary');
    const analyticsModal = document.getElementById('analytics-modal');
    const closeAnalyticsBtn = document.getElementById('close-analytics-btn');
    const modalTotalViews = document.getElementById('modal-total-views');
    const modalTotalClicks = document.getElementById('modal-total-clicks');
    const linkStatsList = document.getElementById('link-stats-list');

    // Add Item Modals
    const addLinkModal = document.getElementById('add-link-modal');
    const closeAddLinkBtn = document.getElementById('close-add-link-btn');
    const submitNewLinkBtn = document.getElementById('submit-new-link-btn');
    const newLinkTitleInput = document.getElementById('new-link-title');
    const newLinkUrlInput = document.getElementById('new-link-url');
    const newLinkTypeInput = document.getElementById('new-link-type');

    const newHeaderTitleInput = document.getElementById('new-header-title');
    const addHeaderModal = document.getElementById('add-header-modal');
    const closeAddHeaderBtn = document.getElementById('close-add-header-btn');
    const submitNewHeaderBtn = document.getElementById('submit-new-header-btn');

    // Social Modal Elements
    const manageSocialsBtn = document.getElementById('manage-socials-btn');
    const editSocialModal = document.getElementById('edit-social-modal');
    const closeSocialBtn = document.getElementById('close-social-btn');
    const saveSocialBtn = document.getElementById('save-social-btn');

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

    // Pro Elements
    const upgradeProBtn = document.getElementById('upgrade-pro-btn');
    const proBadge = document.getElementById('pro-badge');
    const previewWatermark = document.getElementById('preview-watermark');

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
        },
        views: 0,
        isPro: false // NEW: Pro status
    };

    // Global State
    let userSession = null;

    // --- Supabase Init ---
    const supabaseUrl = 'https://wieturwgmmhafbhxnfne.supabase.co';
    const supabaseKey = 'sb_publishable_MEv5951ejOcOKTF44WX9aw_wcY-BT8q';
    let _supabase = null;
    if (window.supabase) {
        _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    }

    // --- Initialization ---
    init();

    function init() {
        if (_supabase) {
            // Watch for Auth changes
            _supabase.auth.onAuthStateChange(async (event, session) => {
                userSession = session;
                if (session) {
                    // Update UI for logged-in user
                    if (authTriggerBtn) {
                        authTriggerBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> <span id="auth-trigger-text">Çıkış Yap</span>';
                        authTriggerBtn.style.backgroundColor = 'var(--bg-secondary)';
                        authTriggerBtn.style.color = 'var(--text-secondary)';
                    }
                    if (authModal.classList.contains('active')) authModal.classList.remove('active');

                    // Load Profile Data from Supabase
                    await loadProfileFromDB(session.user.id);
                } else {
                    // Update UI for logged-out user
                    if (authTriggerBtn) {
                        authTriggerBtn.innerHTML = '<i class="fa-solid fa-user"></i> <span id="auth-trigger-text">Giriş Yap</span>';
                        authTriggerBtn.style.backgroundColor = 'var(--accent)';
                        authTriggerBtn.style.color = 'white';
                    }
                    // Load from LocalStorage if logged out
                    loadFromLocalStorage();
                }
            });
        }

        // Handle View Mode vs Editor Mode
        const params = new URLSearchParams(window.location.search);
        const viewUser = params.get('u');

        if (viewUser) {
            // View Mode
            document.body.classList.add('view-mode');
            document.querySelector('.editor-section').style.display = 'none';
            document.querySelector('.preview-section').classList.add('view-mode-active');

            // Fetch public profile by username
            loadPublicProfile(viewUser);
        } else {
            // Editor Mode
            document.querySelector('.editor-section').style.display = 'block';
            document.querySelector('.preview-section').classList.remove('view-mode-active');

            // Note: Initial load is now handled by onAuthStateChange callback
            // which fires immediately on page load to set the session.
        }
        // applyEditorTheme() is called by updateEditorUI now
        bindEvents();
    }

    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // --- Security Helpers ---
    function sanitizeHTML(str) {
        if (!str) return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    function isValidUsername(username) {
        // 3-20 chars, alphanumeric, underscores, hyphens only
        const regex = /^[a-zA-Z0-9_-]{3,20}$/;
        if (!regex.test(username)) return false;

        // Block reserved words
        const reserved = ['admin', 'api', 'login', 'register', 'dashboard', 'settings', 'auth'];
        if (reserved.includes(username.toLowerCase())) return false;

        return true;
    }

    // --- Core Functions ---

    function bindEvents() {
        // Profile Inputs
        usernameInput.addEventListener('input', (e) => {
            // Sanitize username (alphanumeric and dashes only)
            let val = e.target.value.trim().toLowerCase();

            if (val && !isValidUsername(val)) {
                usernameInput.style.borderColor = 'var(--danger)';
                // Don't auto-save if invalid to prevent broken URLs in DB
                return;
            } else {
                usernameInput.style.borderColor = 'var(--border)';
            }

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
                    removeImageBtn.style.display = 'flex'; // Changed to flex for center alignment
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

        // Social Modal Events
        if (manageSocialsBtn && editSocialModal) {
            manageSocialsBtn.addEventListener('click', () => {
                editSocialModal.classList.add('active');
            });

            closeSocialBtn.addEventListener('click', () => {
                editSocialModal.classList.remove('active');
            });

            saveSocialBtn.addEventListener('click', () => {
                editSocialModal.classList.remove('active');
            });

            // Close on outside click
            editSocialModal.addEventListener('click', (e) => {
                if (e.target === editSocialModal) {
                    editSocialModal.classList.remove('active');
                }
            });
        }

        // Theme Toggle (Dark/Light Mode)
        themeToggle.addEventListener('click', () => {
            appData.theme = appData.theme === 'dark' ? 'light' : 'dark';
            applyEditorTheme();
            autoSave();
        });

        // Theme Presets (Glass, Aurora, Minimal, etc.)
        document.querySelectorAll('.theme-preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const selectedTheme = target.getAttribute('data-theme');
                
                // Pro Lock Check
                if (target.classList.contains('pro-theme') && !appData.isPro) {
                    alert("Bu özelliği kullanmak için Pro versiyona geçmelisiniz!");
                    return;
                }

                appData.pageTheme = selectedTheme;
                updatePreviewStyles();
                autoSave();
            });
        });

        // Add Link Modal Triggers
        if (addLinkBtn && addLinkModal) {
            addLinkBtn.addEventListener('click', () => {
                newLinkTitleInput.value = '';
                newLinkUrlInput.value = 'https://';
                newLinkTypeInput.value = 'button';
                addLinkModal.classList.add('active');
            });

            closeAddLinkBtn.addEventListener('click', () => addLinkModal.classList.remove('active'));

            addLinkModal.addEventListener('click', (e) => {
                if (e.target === addLinkModal) addLinkModal.classList.remove('active');
            });

            submitNewLinkBtn.addEventListener('click', () => {
                const title = newLinkTitleInput.value.trim() || 'Yeni Link';
                const url = newLinkUrlInput.value.trim() || 'https://';
                const type = newLinkTypeInput.value;

                // Pro Validation
                if ((type === 'tiktok' || type === 'newsletter') && !appData.isPro) {
                    alert('Bu özellikler Pro kullanıcılarına özeldir!');
                    return;
                }

                const newLink = { id: generateId(), title, url, clicks: 0, type };
                appData.links.push(newLink);
                addLinkModal.classList.remove('active');

                renderEditorLinks();
                updatePreview();
                autoSave();

                setTimeout(() => {
                    const el = document.querySelector('.editor-content');
                    el.scrollTop = el.scrollHeight;
                }, 50);
            });
        }

        // Add Header Modal Triggers
        const addHeaderBtn = document.getElementById('add-header-btn');
        if (addHeaderBtn && addHeaderModal) {
            addHeaderBtn.addEventListener('click', () => {
                newHeaderTitleInput.value = '';
                addHeaderModal.classList.add('active');
            });

            closeAddHeaderBtn.addEventListener('click', () => addHeaderModal.classList.remove('active'));

            addHeaderModal.addEventListener('click', (e) => {
                if (e.target === addHeaderModal) addHeaderModal.classList.remove('active');
            });

            submitNewHeaderBtn.addEventListener('click', () => {
                const title = newHeaderTitleInput.value.trim() || 'Yeni Başlık';

                const newHeader = { id: generateId(), title, type: 'header' };
                appData.links.push(newHeader);
                addHeaderModal.classList.remove('active');

                renderEditorLinks();
                updatePreview();
                autoSave();

                setTimeout(() => {
                    const el = document.querySelector('.editor-content');
                    el.scrollTop = el.scrollHeight;
                }, 50);
            });
        }

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
            autoSave(); // Now calls autoSave which handles both local and remote
            showSaveStatus('Data saved successfully!');
            // In a real app, this might generate a static HTML file to download.
        });

        // Share & Modal Events
        // Analytics Modal Events
        if (analyticsSummaryBtn) {
            analyticsSummaryBtn.addEventListener('click', () => {
                openAnalyticsModal();
            });
        }

        if (closeAnalyticsBtn) {
            closeAnalyticsBtn.addEventListener('click', () => {
                analyticsModal.classList.remove('active');
            });
        }

        // Close analytics modal on outside click
        if (analyticsModal) {
            analyticsModal.addEventListener('click', (e) => {
                if (e.target === analyticsModal) {
                    analyticsModal.classList.remove('active');
                }
            });
        }

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

        // Close share modal on outside click
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
            authTriggerBtn.addEventListener('click', async () => {
                if (userSession && _supabase) {
                    // Sign out
                    await _supabase.auth.signOut();
                    window.location.reload();
                } else {
                    // Open Login Modal
                    authModal.classList.add('active');
                    document.getElementById('auth-error-msg').textContent = '';
                }
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
                const errorMsg = document.getElementById('auth-error-msg');
                if (errorMsg) errorMsg.textContent = '';

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

        // Supabase Login/Register Submission
        if (authActionBtn && _supabase) {
            authActionBtn.addEventListener('click', async () => {
                const email = document.getElementById('auth-email-input').value;
                const password = document.getElementById('auth-password-input').value;
                const name = document.getElementById('auth-name-input').value;
                const errorMsg = document.getElementById('auth-error-msg');

                if (!email || !password || (!isLoginMode && !name)) {
                    errorMsg.textContent = 'Lütfen tüm alanları doldurun!';
                    errorMsg.style.color = 'var(--danger)';
                    return;
                }

                errorMsg.textContent = 'İşleminiz yapılıyor, lütfen bekleyin...';
                errorMsg.style.color = 'var(--text-secondary)';

                if (!isLoginMode) {
                    // Registration Flow
                    const { data, error } = await _supabase.auth.signUp({
                        email: email,
                        password: password,
                        options: {
                            data: { full_name: name, }
                        }
                    });

                    if (error) {
                        errorMsg.textContent = error.message.includes('weak_password') ? 'Şifre en az 6 karakter olmalıdır.' : error.message;
                        errorMsg.style.color = 'var(--danger)';
                    } else {
                        if (data.session) {
                            errorMsg.textContent = 'Kayıt başarılı! Giriş yapılıyor...';
                            errorMsg.style.color = '#10b981';
                            setTimeout(() => { window.location.reload(); }, 1000);
                        } else {
                            errorMsg.textContent = 'Kayıt başarılı! Lütfen giriş yapın.';
                            errorMsg.style.color = '#10b981'; // emerald green
                            setTimeout(() => { authSwitchBtn.click(); }, 1500); // switch to login mode automatically
                        }
                    }
                } else {
                    // Login Flow
                    const { data, error } = await _supabase.auth.signInWithPassword({
                        email: email,
                        password: password,
                    });

                    if (error) {
                        errorMsg.textContent = 'Hatalı e-posta veya şifre!';
                        errorMsg.style.color = 'var(--danger)';
                    } else {
                        errorMsg.textContent = 'Giriş başarılı!';
                        errorMsg.style.color = '#10b981';
                        setTimeout(() => { window.location.reload(); }, 1000);
                    }
                }
            });
        }
    }

    function renderEditorLinks() {
        linksContainer.innerHTML = '';

        appData.links.forEach((link, index) => {
            const clicks = link.clicks || 0;
            const type = link.type || 'button';

            const linkEl = document.createElement('div');

            if (type === 'header') {
                linkEl.className = 'link-edit-item link-edit-header-item';
                linkEl.innerHTML = `
                    <div class="link-drag-handle"><i class="fa-solid fa-grip-vertical"></i></div>
                    <div class="link-details">
                        <input type="text" class="link-title-input" value="${link.title}" data-id="${link.id}" placeholder="Başlık Adı" style="font-weight: bold;">
                    </div>
                    <button class="icon-btn delete-link-btn text-danger" data-id="${link.id}" title="Başlığı Sil">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
            } else {
                linkEl.className = 'link-edit-item';
                linkEl.innerHTML = `
                    <div class="link-drag-handle"><i class="fa-solid fa-grip-vertical"></i></div>
                <div class="link-details">
                    <input type="text" class="link-title-input" value="${link.title}" data-id="${link.id}" placeholder="Link Title">
                    <input type="url" class="link-url-input" value="${link.url}" data-id="${link.id}" placeholder="https://example.com">
                    <select class="link-type-select" data-id="${link.id}" style="margin-top: 0.5rem; width: 100%; border-radius: var(--radius-sm); border: 1px solid var(--border); padding: 0.4rem; background-color: var(--bg-main); color: var(--text-primary); outline: none;">
                        <option value="button" ${type === 'button' ? 'selected' : ''}>🔗 Normal Buton</option>
                        <option value="youtube" ${type === 'youtube' ? 'selected' : ''}>▶️ YouTube Video (Gömülü)</option>
                        <option value="spotify" ${type === 'spotify' ? 'selected' : ''}>🎧 Spotify (Gömülü)</option>
                        <option value="tiktok" ${type === 'tiktok' ? 'selected' : ''}>🎵 TikTok (PRO ✨)</option>
                        <option value="newsletter" ${type === 'newsletter' ? 'selected' : ''}>✉️ Bülten (PRO ✨)</option>
                    </select>
                    <div class="link-analytics text-xs text-secondary" style="margin-top: 5px; font-size: 0.75rem;"><i class="fa-solid fa-hand-pointer"></i> ${clicks} Tıklanma</div>
                </div>
                <button class="icon-btn delete-link-btn text-danger" data-id="${link.id}" title="Delete Link">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            }
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

        // Map platform name to base URL
        const urlMap = {
            instagram: 'https://instagram.com/',
            twitter: 'https://x.com/',
            linkedin: 'https://linkedin.com/in/',
            github: 'https://github.com/',
            youtube: 'https://youtube.com/@'
        };

        for (const [platform, username] of Object.entries(appData.socials)) {
            if (username && username.trim() !== '') {
                const a = document.createElement('a');

                // Construct the URL using the base URL + username
                // If the user pasted a full URL by mistake, use it directly
                let finalUrl = username.trim();
                if (!finalUrl.startsWith('http')) {
                    finalUrl = `${urlMap[platform]}${finalUrl.replace('@', '')}`; // Ensure no double @ for youtube/twitter
                }

                a.href = finalUrl;
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
        // Update Text (Sanitized)
        previewName.innerHTML = sanitizeHTML(appData.profileName) || 'Your Name';
        previewBio.innerHTML = sanitizeHTML(appData.profileBio) || 'Your Bio goes here';

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
            const type = link.type || 'button';
            let targetUrl = '';
            if (link.url) targetUrl = link.url.startsWith('http') ? link.url : `https://${link.url}`;

            if (type === 'header') {
                const h3 = document.createElement('h3');
                h3.className = 'preview-link-header';
                h3.innerHTML = sanitizeHTML(link.title) || 'Başlık';
                previewLinksContainer.appendChild(h3);
            }
            else if (type === 'youtube') {
                let videoId = '';
                try {
                    const urlObj = new URL(targetUrl);
                    if (urlObj.hostname.includes('youtube.com')) {
                        videoId = urlObj.searchParams.get('v');
                    } else if (urlObj.hostname.includes('youtu.be')) {
                        videoId = urlObj.pathname.slice(1);
                    }
                } catch (e) { }

                if (videoId) {
                    const iframe = document.createElement('iframe');
                    iframe.className = 'preview-embed-youtube';
                    iframe.src = `https://www.youtube.com/embed/${videoId}`;
                    iframe.title = link.title || 'YouTube video';
                    iframe.frameBorder = '0';
                    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                    iframe.allowFullscreen = true;
                    previewLinksContainer.appendChild(iframe);
                } else {
                    const a = document.createElement('a');
                    a.href = targetUrl;
                    a.className = 'preview-link-btn';
                    a.textContent = `[YT Hata] ${link.title}`;
                    a.target = '_blank';
                    previewLinksContainer.appendChild(a);
                }
            }
            else if (type === 'spotify') {
                let embedUrl = targetUrl;
                if (targetUrl.includes('open.spotify.com')) {
                    embedUrl = targetUrl.replace('open.spotify.com/', 'open.spotify.com/embed/');
                }
                const iframe = document.createElement('iframe');
                iframe.className = 'preview-embed-spotify';
                iframe.src = embedUrl;
                iframe.frameBorder = '0';
                iframe.allowFullscreen = true;
                iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
                previewLinksContainer.appendChild(iframe);
            }
            else if (type === 'tiktok') {
                let videoId = '';
                try {
                    const urlObj = new URL(targetUrl);
                    if (urlObj.hostname.includes('tiktok.com')) {
                        const paths = urlObj.pathname.split('/');
                        videoId = paths[paths.length - 1]; // usually /@user/video/123456789
                    }
                } catch (e) {}

                if (videoId) {
                    const iframe = document.createElement('iframe');
                    iframe.className = 'preview-embed-tiktok';
                    iframe.src = `https://www.tiktok.com/embed/v2/${videoId}`;
                    iframe.title = link.title || 'TikTok video';
                    iframe.frameBorder = '0';
                    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
                    iframe.allowFullscreen = true;
                    // TikTok standard embed height is pretty tall
                    iframe.style.width = '100%';
                    iframe.style.height = '700px'; 
                    iframe.style.borderRadius = 'var(--radius-md)';
                    iframe.style.marginBottom = '1rem';
                    previewLinksContainer.appendChild(iframe);
                } else {
                    const a = document.createElement('a');
                    a.href = targetUrl;
                    a.className = 'preview-link-btn';
                    a.textContent = `[TikTok Hata] ${link.title}`;
                    a.target = '_blank';
                    previewLinksContainer.appendChild(a);
                }
            }
            else if (type === 'newsletter') {
                // A UI-only representation for MVP
                const formBox = document.createElement('div');
                formBox.className = 'preview-newsletter-box';
                formBox.style.padding = '1.5rem';
                formBox.style.borderRadius = 'var(--radius-md)';
                formBox.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                formBox.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                formBox.style.marginBottom = '1rem';
                formBox.style.textAlign = 'center';

                formBox.innerHTML = `
                    <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem; color: #fff;">${sanitizeHTML(link.title) || 'Bültene Abone Ol'}</h4>
                    <p style="font-size: 0.85rem; color: #a1a1aa; margin-bottom: 1rem;">En güncel haberleri almak için e-posta adresini bırak.</p>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="email" placeholder="ornek@email.com" style="flex: 1; padding: 0.6rem; border-radius: var(--radius-sm); border: none; outline: none; background: rgba(0,0,0,0.2); color: #fff;">
                        <button class="primary-btn" style="padding: 0.6rem 1rem; border: none; border-radius: var(--radius-sm); font-weight: bold; cursor: pointer; background: var(--accent); color: white;">Abone Ol</button>
                    </div>
                `;
                
                // Block form submission in preview
                const btn = formBox.querySelector('button');
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (document.body.classList.contains('view-mode')) {
                        alert("Bülten aboneliği alındı! (Demo Özelliği)");
                        if (_supabase && appData.profileUsername) {
                            _supabase.rpc('increment_link_click', {
                                p_username: appData.profileUsername,
                                p_link_id: link.id
                            }).catch(err => console.error(err));
                        }
                    }
                });

                previewLinksContainer.appendChild(formBox);
            }
            else {
                const a = document.createElement('a');
                a.href = targetUrl;
                a.className = 'preview-link-btn';
                a.innerHTML = sanitizeHTML(link.title) || 'Untitled Link';

                if (document.body.classList.contains('view-mode')) {
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.addEventListener('click', () => {
                        if (_supabase && appData.profileUsername) {
                            _supabase.rpc('increment_link_click', {
                                p_username: appData.profileUsername,
                                p_link_id: link.id
                            }).catch(e => console.error(e));
                        }
                    });
                } else {
                    a.addEventListener('click', e => e.preventDefault());
                }

                previewLinksContainer.appendChild(a);
            }
        });
    }

    // --- Analytics Logic ---
    function openAnalyticsModal() {
        if (!analyticsModal) return;

        // Populate Total Views
        if (modalTotalViews) {
            modalTotalViews.textContent = appData.views || 0;
        }

        // Calculate Total Clicks
        let totalClicks = 0;
        appData.links.forEach(link => {
            if (link.type !== 'header') {
                totalClicks += (link.clicks || 0);
            }
        });

        if (modalTotalClicks) {
            modalTotalClicks.textContent = totalClicks;
        }

        // Render Link Stats List
        if (linkStatsList) {
            linkStatsList.innerHTML = '';

            const clickableLinks = appData.links.filter(link => link.type !== 'header');

            if (clickableLinks.length === 0) {
                linkStatsList.innerHTML = '<p class="text-secondary" style="text-align: center; margin-top: 1rem;">Henüz bir linkiniz yok.</p>';
            } else {
                clickableLinks.forEach(link => {
                    const row = document.createElement('div');
                    row.className = 'link-stat-row';

                    const titleText = sanitizeHTML(link.title) || 'İsimsiz Link';
                    let iconHtml = '<i class="fa-solid fa-link text-secondary"></i>';

                    if (link.type === 'youtube') iconHtml = '<i class="fa-brands fa-youtube text-danger"></i>';
                    if (link.type === 'spotify') iconHtml = '<i class="fa-brands fa-spotify text-success"></i>';

                    row.innerHTML = `
                        <div class="link-stat-title">
                            ${iconHtml} <span>${titleText}</span>
                        </div>
                        <div class="link-stat-clicks">
                            ${link.clicks || 0} tık
                        </div>
                    `;
                    linkStatsList.appendChild(row);
                });
            }
        }

        // Toggle Pro Banner
        const proBanner = document.getElementById('pro-analytics-banner');
        if (proBanner) {
            proBanner.style.display = appData.isPro ? 'none' : 'block';
        }

        // Show Modal
        analyticsModal.classList.add('active');
    }

    function updatePreviewStyles() {
        // Apply background gradient based on selected bg color
        deviceScreen.style.background = `linear-gradient(135deg, ${appData.bgColor} 0%, #000000 100%)`;

        // Update accent colors
        profileImageFrame.style.background = `linear-gradient(135deg, ${appData.accentColor}, #8b5cf6)`;

        // Apply Theme Preset
        const currentTheme = appData.pageTheme || 'default';
        document.body.setAttribute('data-page-theme', currentTheme);
        document.querySelector('.preview-section').setAttribute('data-page-theme', currentTheme);

        // Sync buttons UI inside the editor
        document.querySelectorAll('.theme-preset-btn').forEach(b => {
            if (b.getAttribute('data-theme') === currentTheme) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
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

        document.querySelectorAll('.link-type-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                const link = appData.links.find(l => l.id === id);
                const newType = e.target.value;
                
                if ((newType === 'tiktok' || newType === 'newsletter') && !appData.isPro) {
                    alert('Bu özellikler Pro kullanıcılarına özeldir!');
                    e.target.value = link.type; // Revert strictly visually
                    return;
                }

                if (link) link.type = newType;
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

    let saveTimeout;
    function showSaveStatus(msg) {
        saveStatus.textContent = msg;
        saveStatus.classList.add('show');
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveStatus.classList.remove('show');
        }, 2000);
    }

    // --- Core Logic ---

    async function loadProfileFromDB(userId) {
        if (!_supabase) return;

        try {
            const { data, error } = await _supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // PGRST116 means zero rows returned (not found), which is normal for a brand new user
                if (error.code !== 'PGRST116') {
                    console.error("Error fetching profile from DB:", error);
                }
                return;
            }

            if (data) {
                appData = {
                    profileUsername: data.username || 'benim-ismim',
                    profileName: data.full_name || 'Hoşgeldin 👋',
                    profileBio: data.bio || '',
                    profileImage: data.profile_image || '',
                    theme: data.theme || 'dark',
                    pageTheme: data.theme_preset || 'default',
                    bgColor: data.bg_color || '#0f172a',
                    accentColor: data.accent_color || '#3b82f6',
                    links: data.links || [],
                    socials: data.socials || {},
                    views: data.views || 0,
                    isPro: data.is_pro || false
                };

                updateEditorUI();
                renderEditorLinks();
                updatePreview();
            }
        } catch (err) {
            console.error(err);
        }
    }

    function updateEditorUI() {
        // Populate editor inputs from appData
        usernameInput.value = appData.profileUsername;
        const usernameDisplay = document.getElementById('url-username-preview');
        if (usernameDisplay) {
            usernameDisplay.textContent = appData.profileUsername;
        }

        nameInput.value = appData.profileName;
        bioInput.value = appData.profileBio;
        bgColorPicker.value = appData.bgColor;
        accentColorPicker.value = appData.accentColor;

        if (appData.profileImage) {
            removeImageBtn.style.display = 'flex';
        } else {
            removeImageBtn.style.display = 'none';
        }

        // Pro UI Update
        if (appData.isPro) {
            if (upgradeProBtn) upgradeProBtn.style.display = 'none';
            if (proBadge) proBadge.style.display = 'inline-block';
            if (previewWatermark) previewWatermark.style.display = 'none';
            
            // Unlock pro themes in UI
            document.querySelectorAll('.pro-theme i.fa-lock').forEach(icon => {
                icon.className = 'fa-solid fa-crown'; // Change lock to crown for Pro users
            });
        } else {
            // Only show UPGRADE button if the user is actually logged in, otherwise hide it to save space
            if (userSession && upgradeProBtn) {
                upgradeProBtn.style.display = 'inline-block';
            } else if (upgradeProBtn) {
                upgradeProBtn.style.display = 'none';
            }
            if (proBadge) proBadge.style.display = 'none';
            if (previewWatermark) previewWatermark.style.display = 'block';
        }

        const totalViewsDisplay = document.getElementById('total-views-display');
        if (totalViewsDisplay) {
            totalViewsDisplay.textContent = appData.views || 0;
        }

        // Populate social inputs
        socialInputs.forEach(input => {
            const platform = input.dataset.platform;
            if (appData.socials && appData.socials[platform]) {
                input.value = appData.socials[platform];
            } else {
                input.value = '';
            }
        });

        applyEditorTheme(); // Renamed from applyTheme to match existing function
    }

    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('linkInBioData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // Ensure socials object exists (for backward compatibility if user already saved data before this update)
                if (!parsed.socials) {
                    parsed.socials = { instagram: '', twitter: '', linkedin: '', github: '', youtube: '' };
                }
                appData = { ...appData, ...parsed };
                updateEditorUI();
            } catch (e) {
                console.error("Error parsing local storage", e);
            }
        }
        renderEditorLinks();
        updatePreview();
    }

    async function autoSave() {
        // Always save to LocalStorage as a fallback
        localStorage.setItem('linkInBioData', JSON.stringify(appData));

        // Save to Database if logged in
        if (userSession && _supabase) {
            try {
                // Determine save payload
                const payload = {
                    username: appData.profileUsername,
                    full_name: appData.profileName,
                    bio: appData.profileBio,
                    theme: appData.theme,
                    theme_preset: appData.pageTheme,
                    bg_color: appData.bgColor,
                    accent_color: appData.accentColor,
                    profile_image: appData.profileImage, // Base64
                    links: appData.links, // JSON array
                    socials: appData.socials // JSON object
                };

                const { error, data } = await _supabase
                    .from('profiles')
                    .upsert([{ id: userSession.user.id, ...payload }])
                    .select();

                if (error) {
                    console.error("Supabase Save Error:", error);
                    showSaveStatus('Buluta kaydedilemedi!');
                    return;
                }
                showSaveStatus('Buluta kaydedildi ✓');
            } catch (err) {
                console.error(err);
            }
        } else {
            showSaveStatus('Okal kaydedildi ✓');
        }
    }

    async function loadPublicProfile(username) {
        if (!_supabase) return;

        try {
            const { data, error } = await _supabase
                .from('profiles')
                .select('*')
                .eq('username', username)
                .single();

            if (error || !data) {
                console.error("Profile not found:", error);
                document.getElementById('preview-name').textContent = "Profile Not Found";
                document.getElementById('preview-bio').textContent = "This user does not exist or hasn't saved their profile yet.";
                return;
            }

            // Map data to appData to properly reuse rendering logic
            appData = {
                profileUsername: data.username,
                profileName: data.full_name || '',
                profileBio: data.bio || '',
                profileImage: data.profile_image || '',
                theme: data.theme || 'dark',
                bgColor: data.bg_color || '#0f172a',
                accentColor: data.accent_color || '#3b82f6',
                links: data.links || [],
                socials: data.socials || {},
                views: data.views || 0,
                isPro: data.is_pro || false
            };

            // Render view with fetched db parameters
            renderPreviewLinks();
            updatePreview();

            // Increment views via RPC when public profile is loaded
            if (_supabase) {
                _supabase.rpc('increment_profile_view', { p_username: username })
                    .catch(err => console.error("Could not increment view:", err));
            }

            // Set root theme colors explicitly for View Mode since we hid the editor and bypass applyEditorTheme
            document.documentElement.style.setProperty('--bg-main', appData.bgColor);
            document.documentElement.style.setProperty('--accent', appData.accentColor);
            document.body.style.backgroundColor = appData.bgColor;
            
            // Hide watermark for pro users in View Mode
            if (appData.isPro && previewWatermark) {
                previewWatermark.style.display = 'none';
            }

        } catch (err) {
            console.error(err);
        }
    }
});
