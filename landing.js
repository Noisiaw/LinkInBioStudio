// --- Translations ---
const translations = {
    TR: {
        nav_login: "Giriş Yap",
        nav_register: "Kayıt Ol",
        nav_dashboard: "Üye Paneli",
        hero_badge: "Yeni Özellikler Yayında",
        hero_title_1: "Tüm Dünyanızı",
        hero_title_2: "Tek Bir Linkte",
        hero_title_3: "Birleştirin.",
        hero_subtitle: "Sosyal medya profillerinizi, videolarınızı, projelerinizi ve bültenlerinizi çarpıcı bir tasarımla tek bir bio linkinde toplayın.",
        hero_input_placeholder: "kullaniciadiniz",
        hero_cta: "Linkimi Oluştur",
        hero_sub_cta: "Kredi kartı gerekmez. Sonsuza dek ücretsiz başlayın.",
        feat_title: "Neden Bizi Seçmelisiniz?",
        feat_1_title: "Göz Alıcı Temalar",
        feat_1_desc: "Klasik, Aurora, veya Buzlu Cam... Tarzınızı yansıtan profesyonel şablonları saniyeler içinde uygulayın.",
        feat_2_title: "Gelişmiş İstatistikler",
        feat_2_desc: "Hangi linkiniz daha çok tıklanıyor? Ziyaretçileriniz nereden geliyor? Tüm veriler elinizin altında.",
        feat_3_title: "Medya Embedleri",
        feat_3_desc: "Sadece link değil; YouTube videolarını, Spotify müziklerini ve TikTok gönderilerini doğrudan profilinize gömün.",
        price_title: "Basit ve Net Fiyatlandırma",
        plan_free_name: "Standart",
        price_period: "/ay",
        plan_free_desc: "Temel ihtiyaçlar için harika bir başlangıç.",
        pf_unlimited: "Sınırsız Link Ekleme",
        pf_basic_stats: "Temel İstatistikler (Tıklama)",
        pf_standard_themes: "Standart Temalar",
        pf_pro_themes: "Premium Temalar (Aurora, Glass)",
        pf_media: "TikTok ve Bülten Özellikleri",
        btn_start_free: "Ücretsiz Başla",
        plan_pro_name: "Premium",
        plan_pro_desc: "İşini ve markasını büyütmek isteyenler için.",
        pf_adv_stats: "Gelişmiş İstatistik Paneli",
        pf_pro_themes_check: "Premium Temalar (Aurora, Glass)",
        pf_media_check: "TikTok ve Bülten Özellikleri",
        pf_no_ads: "LinkInBio Reklamını Kaldırma",
        btn_start_pro: "Pro'ya Geç",
        footer_rights: "Tüm Hakları Saklıdır.",
        
        // Auth Translate
        auth_login_title: "Giriş Yap",
        auth_reg_title: "Kayıt Ol",
        auth_name_label: "İsim Soyisim",
        auth_email_label: "E-posta",
        auth_pass_label: "Şifre",
        auth_login_btn: "Giriş Yap",
        auth_reg_btn: "Kayıt Ol Düğmesi",
        auth_no_account: "Hesabın yok mu?",
        auth_register_link: "Kayıt Ol",
        auth_has_account: "Zaten üye misin?",
        auth_login_link: "Giriş Yap"
    },
    EN: {
        nav_login: "Login",
        nav_register: "Sign Up",
        nav_dashboard: "Dashboard",
        hero_badge: "New Features Live",
        hero_title_1: "Unite Your World",
        hero_title_2: "In One Single",
        hero_title_3: "Link.",
        hero_subtitle: "Gather your social media profiles, videos, projects, and newsletters into one stunning bio link.",
        hero_input_placeholder: "yourusername",
        hero_cta: "Create My Link",
        hero_sub_cta: "No credit card required. Free forever.",
        feat_title: "Why Choose Us?",
        feat_1_title: "Stunning Themes",
        feat_1_desc: "Classic, Aurora, or Glassmorphism... Apply professional templates that reflect your style in seconds.",
        feat_2_title: "Advanced Analytics",
        feat_2_desc: "Which link gets clicked the most? Where are visitors coming from? All data at your fingertips.",
        feat_3_title: "Media Embeds",
        feat_3_desc: "Not just links; embed YouTube videos, Spotify tracks, and TikTok posts directly into your profile.",
        price_title: "Simple & Clear Pricing",
        plan_free_name: "Standard",
        price_period: "/mo",
        plan_free_desc: "A great start for basic needs.",
        pf_unlimited: "Unlimited Links",
        pf_basic_stats: "Basic Analytics (Clicks)",
        pf_standard_themes: "Standard Themes",
        pf_pro_themes: "Premium Themes (Aurora, Glass)",
        pf_media: "TikTok & Newsletter Features",
        btn_start_free: "Start for Free",
        plan_pro_name: "Premium",
        plan_pro_desc: "For those who want to grow their brand.",
        pf_adv_stats: "Advanced Analytics Dashboard",
        pf_pro_themes_check: "Premium Themes (Aurora, Glass)",
        pf_media_check: "TikTok & Newsletter Features",
        pf_no_ads: "Remove LinkInBio Branding",
        btn_start_pro: "Upgrade to Pro",
        footer_rights: "All Rights Reserved.",
        
        // Auth Translate
        auth_login_title: "Log In",
        auth_reg_title: "Register",
        auth_name_label: "Full Name",
        auth_email_label: "Email",
        auth_pass_label: "Password",
        auth_login_btn: "Log In",
        auth_reg_btn: "Sign Up",
        auth_no_account: "Don't have an account?",
        auth_register_link: "Sign Up",
        auth_has_account: "Already have an account?",
        auth_login_link: "Log In"
    }
};

document.addEventListener('DOMContentLoaded', () => {

    // --- Routing Interceptor ---
    // If the user appended ?u=username to the URL, they want to view a public profile.
    const params = new URLSearchParams(window.location.search);
    const viewUser = params.get('u');
    if (viewUser) {
        // Redirect to editor.html which has the logic to render public view mode
        window.location.href = `/editor.html?u=${viewUser}`;
        return; 
    }

    // Ensure landing page styling is forced explicitly on body
    document.body.setAttribute('data-page-theme', 'landing');

    // --- Language State ---
    let currentLang = 'TR'; // Default to Turkish
    const langBtn = document.getElementById('lang-toggle-btn');
    const langDisplay = document.getElementById('current-lang');

    // Language Toggle Function
    function setLanguage(lang) {
        currentLang = lang;
        langDisplay.textContent = lang;
        
        // Find all elements with data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const prop = el.getAttribute('data-i18n-prop') || 'textContext'; // Default is text, replace if placeholder
            
            if (translations[lang] && translations[lang][key]) {
                if(prop === 'placeholder') {
                    el.placeholder = translations[lang][key];
                } else {
                    el.innerHTML = translations[lang][key];
                }
            }
        });
        
        // Save pref to localstorage
        localStorage.setItem('lb_lang_pref', lang);
    }

    // Run on Load
    const savedLang = localStorage.getItem('lb_lang_pref');
    if (savedLang) setLanguage(savedLang);

    // Toggle Click Event
    langBtn.addEventListener('click', () => {
        setLanguage(currentLang === 'TR' ? 'EN' : 'TR');
        // Update Auth Modal texts if active
        if (authTitle.textContent !== 'Giriş Yap' && authTitle.textContent !== 'Log In') {
            updateAuthModalText(false); // keep register mode translated
        } else {
            updateAuthModalText(true);
        }
    });

    // --- Supabase Init ---
    const supabaseUrl = 'https://wieturwgmmhafbhxnfne.supabase.co';
    const supabaseKey = 'sb_publishable_MEv5951ejOcOKTF44WX9aw_wcY-BT8q';
    let _supabase = null;
    let userSession = null;
    
    if (window.supabase) {
        _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    }

    const authBtnsContainer = document.getElementById('auth-buttons-container');

    if (_supabase) {
        _supabase.auth.onAuthStateChange((event, session) => {
            userSession = session;
            if (session) {
                // User is authenticated. Instantly redirect from landing page
                window.location.href = 'editor.html';
            } else {
                // User is not authenticated. Keep Login/Register
                authBtnsContainer.innerHTML = `
                    <button class="primary-btn login-trigger" data-i18n="nav_login">${translations[currentLang].nav_login}</button>
                    <button class="primary-btn outline register-trigger" data-i18n="nav_register">${translations[currentLang].nav_register}</button>
                `;
                bindModalTriggers();
            }
        });
    }

    // --- Hero CTA ---
    const heroBtn = document.getElementById('hero-cta-btn');
    if (heroBtn) {
        heroBtn.addEventListener('click', () => {
            const val = document.getElementById('landing-username').value.trim();
            if (val) {
                // Pass username as query param so auth can optionally pick it up later
                window.location.href = `/auth.html?mode=register&u=${encodeURIComponent(val)}`;
            } else {
                window.location.href = `/auth.html?mode=register`;
            }
        });
    }

});

});
