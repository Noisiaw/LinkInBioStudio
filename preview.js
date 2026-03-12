// Supabase Init
const supabaseUrl = 'https://wieturwgmmhafbhxnfne.supabase.co';
const supabaseKey = 'sb_publishable_MEv5951ejOcOKTF44WX9aw_wcY-BT8q';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const loadingScreen = document.getElementById('loading');
const errorCard = document.getElementById('error-card');
const mainContainer = document.getElementById('main-container');

const previewName = document.getElementById('preview-name');
const previewBio = document.getElementById('preview-bio');
const previewImageContainer = document.getElementById('profile-img-container');
const previewSocialIcons = document.getElementById('preview-social-icons');
const previewLinksContainer = document.getElementById('preview-links-container');
const previewWatermark = document.getElementById('preview-watermark');

// Meta elements
const ogTitle = document.getElementById('og-title');
const ogDesc = document.getElementById('og-desc');

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get username from URL (preview.html?u=ahmet)
    const params = new URLSearchParams(window.location.search);
    const username = params.get('u');

    if (!username) {
        showError();
        return;
    }

    loadProfile(username);
});

async function loadProfile(username) {
    try {
        // Fetch User Data from Supabase
        const { data: profile, error } = await _supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !profile) {
            console.error("Profile not found:", error);
            showError();
            return;
        }

        // Increment total views safely using RPC
        _supabase.rpc('increment_view', { p_username: username })
                 .catch(err => console.error("View increment failed", err));

        renderData(profile);
        hideLoading();

    } catch (err) {
        console.error("Critical error loading profile:", err);
        showError();
    }
}

function renderData(profile) {
    // 1. Theme Configuration
    const theme = profile.theme || 'default';
    const bgColor = profile.bg_color || '#0f172a';
    const accentColor = profile.accent_color || '#3b82f6';

    document.documentElement.style.setProperty('--bg-main', bgColor);
    document.documentElement.style.setProperty('--accent', accentColor);
    
    // Apply Theme Datasets
    document.body.setAttribute('data-theme', theme);

    // 2. Text Data
    const nameStr = sanitizeHTML(profile.full_name) || '@' + profile.username;
    const bioStr = sanitizeHTML(profile.bio) || '';

    previewName.textContent = nameStr;
    previewBio.textContent = bioStr;
    document.title = `${nameStr} | LinkInBio`;
    ogTitle.content = nameStr;
    ogDesc.content = bioStr;

    // 3. Pro Check (Watermark)
    if (profile.is_pro) {
        previewWatermark.style.display = 'none';
        previewWatermark.innerHTML = '';
    }

    // 4. Custom Profile Image
    if (profile.profile_image_url) {
        previewImageContainer.innerHTML = `<img src="${sanitizeHTML(profile.profile_image_url)}" alt="Profile Image" style="width: 100%; height: 100%; object-fit: cover;">`;
    }

    // 5. Social Icons
    previewSocialIcons.innerHTML = '';
    const socials = profile.social_links || {};
    const platformIcons = {
        'instagram': 'fa-brands fa-instagram',
        'twitter': 'fa-brands fa-x-twitter',
        'facebook': 'fa-brands fa-facebook-f',
        'linkedin': 'fa-brands fa-linkedin-in',
        'github': 'fa-brands fa-github',
        'youtube': 'fa-brands fa-youtube',
        'tiktok': 'fa-brands fa-tiktok',
        'email': 'fa-solid fa-envelope'
    };

    const platformBases = {
        'instagram': 'https://instagram.com/',
        'twitter': 'https://twitter.com/',
        'linkedin': 'https://linkedin.com/in/',
        'github': 'https://github.com/',
        'youtube': 'https://youtube.com/@',
        'tiktok': 'https://tiktok.com/@'
    };

    for (const [platform, handle] of Object.entries(socials)) {
        if (handle && handle.trim() !== '') {
            const a = document.createElement('a');
            a.className = 'social-icon';
            const cleanHandle = sanitizeHTML(handle.trim());
            
            // Build absolute URL if needed
            if (platformBases[platform] && !cleanHandle.startsWith('http')) {
                a.href = platformBases[platform] + cleanHandle;
            } else if (platform === 'email') {
                a.href = `mailto:${cleanHandle}`;
            } else {
                a.href = cleanHandle.startsWith('http') ? cleanHandle : `https://${cleanHandle}`;
            }
            
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.innerHTML = `<i class="${platformIcons[platform] || 'fa-solid fa-link'}"></i>`;
            previewSocialIcons.appendChild(a);
        }
    }

    // 6. Links & Media
    previewLinksContainer.innerHTML = '';
    const links = profile.links || [];

    links.forEach(link => {
        const type = link.type || 'button';
        const targetUrl = sanitizeHTML(link.url);
        const titleText = sanitizeHTML(link.title);

        if (type === 'header') {
            const h3 = document.createElement('h3');
            h3.className = 'preview-header-item';
            h3.textContent = titleText;
            previewLinksContainer.appendChild(h3);
            return;
        }

        // Handle Media Embeds or Standard Links
        if (type === 'youtube') {
            let videoId = '';
            const testUrl = targetUrl;
            try {
                if (testUrl.includes('youtube.com/watch')) {
                    videoId = new URL(testUrl).searchParams.get('v');
                } else if (testUrl.includes('youtu.be/')) {
                    videoId = testUrl.split('youtu.be/')[1].split('?')[0];
                }
            } catch(e) {}

            if (videoId) {
                const iframe = document.createElement('iframe');
                iframe.className = 'preview-embed-youtube';
                iframe.src = `https://www.youtube.com/embed/${videoId}`;
                iframe.title = titleText || 'YouTube video';
                iframe.frameBorder = '0';
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;
                previewLinksContainer.appendChild(iframe);
            } else {
                previewLinksContainer.appendChild(createStandardLink(link, profile.username));
            }
        } 
        else if (type === 'spotify') {
            let embedUrl = targetUrl;
            if (targetUrl.includes('open.spotify.com') && !targetUrl.includes('/embed/')) {
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
                    videoId = paths[paths.length - 1]; 
                }
            } catch (e) {}

            if (videoId) {
                const iframe = document.createElement('iframe');
                iframe.className = 'preview-embed-tiktok';
                iframe.src = `https://www.tiktok.com/embed/v2/${videoId}`;
                iframe.title = titleText || 'TikTok video';
                iframe.frameBorder = '0';
                iframe.allowFullscreen = true;
                iframe.style.width = '100%';
                iframe.style.height = '700px'; 
                iframe.style.borderRadius = 'var(--radius-md)';
                iframe.style.marginBottom = '1rem';
                previewLinksContainer.appendChild(iframe);
            } else {
               previewLinksContainer.appendChild(createStandardLink(link, profile.username));
            }
        }
        else if (type === 'newsletter') {
            const formBox = document.createElement('div');
            formBox.className = 'preview-newsletter-box';
            formBox.style.padding = '1.5rem';
            formBox.style.borderRadius = 'var(--radius-md)';
            formBox.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            formBox.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            formBox.style.marginBottom = '1rem';
            formBox.style.textAlign = 'center';

            formBox.innerHTML = `
                <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem; color: #fff;">${titleText || 'Bültene Abone Ol'}</h4>
                <p style="font-size: 0.85rem; color: #a1a1aa; margin-bottom: 1rem;">En güncel haberleri almak için e-posta adresini bırak.</p>
                <form id="newsletter-form-${link.id}" style="display: flex; gap: 0.5rem;">
                    <input type="email" required placeholder="ornek@email.com" style="flex: 1; padding: 0.6rem; border-radius: var(--radius-sm); border: none; outline: none; background: rgba(0,0,0,0.2); color: #fff;">
                    <button type="submit" class="primary-btn" style="padding: 0.6rem 1rem; border: none; border-radius: var(--radius-sm); font-weight: bold; cursor: pointer; background: var(--accent); color: white;">Abone Ol</button>
                </form>
            `;
            
            // Functional form submission logic
            const formObj = formBox.querySelector('form');
            formObj.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Tebrikler! Bültene kaydınız alındı.'); // Future DB connect here
                formObj.reset();
                _supabase.rpc('increment_link_click', {
                    p_username: profile.username,
                    p_link_id: link.id
                }).catch(e=>console.log(e));
            });

            previewLinksContainer.appendChild(formBox);
        }
        else {
            previewLinksContainer.appendChild(createStandardLink(link, profile.username));
        }
    });

}

// Helper to create the generic button anchor elements
function createStandardLink(linkData, username) {
    const a = document.createElement('a');
    a.href = sanitizeHTML(linkData.url) || '#';
    a.className = 'preview-link-btn';
    a.textContent = sanitizeHTML(linkData.title) || 'Link';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    // Analytics Tracker Attachment
    a.addEventListener('click', () => {
        _supabase.rpc('increment_link_click', {
            p_username: username,
            p_link_id: linkData.id
        }).catch(err => console.error("Could not register click", err));
    });

    return a;
}

function hideLoading() {
    loadingScreen.style.display = 'none';
    mainContainer.style.display = 'flex';
}

function showError() {
    loadingScreen.style.display = 'none';
    errorCard.style.display = 'block';
}
