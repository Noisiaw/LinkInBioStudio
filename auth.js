const supabaseUrl = 'https://wieturwgmmhafbhxnfne.supabase.co';
const supabaseKey = 'sb_publishable_MEv5951ejOcOKTF44WX9aw_wcY-BT8q';
let _supabase = null;

if (window.supabase) {
    _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in, redirect them away if so
    if (_supabase) {
        _supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                window.location.href = '/editor.html';
            }
        });
    }

    const authTitle = document.getElementById('auth-title');
    const authNameGroup = document.getElementById('auth-name-group');
    const authNameInput = document.getElementById('auth-name-input');
    const authEmailInput = document.getElementById('auth-email-input');
    const authPasswordInput = document.getElementById('auth-password-input');
    const authActionBtn = document.getElementById('auth-action-btn');
    const authSwitchText = document.getElementById('auth-switch-text');
    const authSwitchBtn = document.getElementById('auth-switch-btn');
    const authSwitchBox = document.getElementById('auth-switch-box');
    const authPasswordGroup = document.getElementById('auth-password-group');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const errorMsg = document.getElementById('auth-error-msg');
    const authFormContainer = document.getElementById('auth-form-container');
    const authSuccessScreen = document.getElementById('auth-success-screen');
    const authSuccessMsg = document.getElementById('auth-success-msg');

    // Modes: 'login', 'register', 'reset', 'update_password'
    let currentMode = 'login';

    // Check if URL asked for a specific mode
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('mode');
    if (urlMode === 'register') {
        currentMode = 'register';
    } else if (urlMode === 'reset') {
        currentMode = 'reset';
    }

    // Intercept Password Recovery Event
    _supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
            currentMode = 'update_password';
            updateUI();
        }
    });

    // Initialize UI
    updateUI();

    function updateUI() {
        errorMsg.textContent = '';
        authNameGroup.style.display = 'none';
        authPasswordGroup.style.display = 'block';
        authSwitchBox.style.display = 'block';

        if (currentMode === 'login') {
            authTitle.textContent = 'Giriş Yap';
            authActionBtn.textContent = 'Giriş Yap';
            authSwitchText.textContent = 'Hesabın yok mu?';
            authSwitchBtn.textContent = 'Kayıt Ol';
            document.title = "Giriş Yap - LinkInBio Studio";
        } else if (currentMode === 'register') {
            authTitle.textContent = 'Kayıt Ol';
            authNameGroup.style.display = 'block';
            authActionBtn.textContent = 'Ücretsiz Kayıt Ol';
            authSwitchText.textContent = 'Zaten hesabın var mı?';
            authSwitchBtn.textContent = 'Giriş Yap';
            document.title = "Kayıt Ol - LinkInBio Studio";
        } else if (currentMode === 'reset') {
            authTitle.textContent = 'Şifremi Sıfırla';
            authPasswordGroup.style.display = 'none'; // Only need email
            authActionBtn.textContent = 'Sıfırlama Bağlantısı Gönder';
            authSwitchText.textContent = 'Şifreni hatırladın mı?';
            authSwitchBtn.textContent = 'Giriş Yap';
            document.title = "Şifremi Sıfırla - LinkInBio Studio";
        } else if (currentMode === 'update_password') {
            // User clicked the link in their email
            authTitle.textContent = 'Yeni Şifre Belirle';
            authNameGroup.style.display = 'none';
            // Hide email since we only need the new password
            authEmailInput.parentElement.style.display = 'none'; 
            // Hide forgot password link
            forgotPasswordLink.style.display = 'none';
            authSwitchBox.style.display = 'none';
            authActionBtn.textContent = 'Şifremi Güncelle';
            document.title = "Yeni Şifre - LinkInBio Studio";
        }
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentMode = 'reset';
            window.history.pushState({}, '', '/auth.html?mode=reset');
            updateUI();
        });
    }

    authSwitchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentMode === 'login' || currentMode === 'reset') {
            currentMode = 'register';
        } else {
            currentMode = 'login';
        }
        
        const newUrl = currentMode === 'login' ? '/auth.html' : `/auth.html?mode=${currentMode}`;
        window.history.pushState({}, '', newUrl);
        updateUI();
    });

    if (authActionBtn && _supabase) {
        authActionBtn.addEventListener('click', async () => {
             const email = authEmailInput.value;
             const password = authPasswordInput.value;
             const name = authNameInput.value;

            if (currentMode === 'update_password') {
                if (!password) {
                    errorMsg.textContent = 'Lütfen yeni şifrenizi girin.';
                    errorMsg.style.color = 'var(--danger)';
                    return;
                }
                
                errorMsg.textContent = 'Şifre güncelleniyor...';
                errorMsg.style.color = '#94a3b8';
                
                const { error } = await _supabase.auth.updateUser({ password: password });
                
                if (error) {
                    errorMsg.textContent = translateAuthError(error.message);
                    errorMsg.style.color = 'var(--danger)';
                } else {
                    errorMsg.textContent = 'Şifreniz başarıyla güncellendi! Editöre yönlendiriliyorsunuz...';
                    errorMsg.style.color = '#10b981';
                    setTimeout(() => { window.location.href = '/editor.html'; }, 1500);
                }
                return;
            }

             if (!email) {
                 errorMsg.textContent = 'Lütfen e-posta adresinizi girin!';
                 errorMsg.style.color = 'var(--danger)';
                 return;
             }

             if (currentMode === 'reset') {
                 errorMsg.textContent = 'Bağlantı gönderiliyor...';
                 errorMsg.style.color = '#94a3b8';

                 const { error } = await _supabase.auth.resetPasswordForEmail(email, {
                     redirectTo: window.location.origin + '/auth.html',
                 });

                 if (error) {
                     errorMsg.textContent = translateAuthError(error.message);
                     errorMsg.style.color = 'var(--danger)';
                 } else {
                     // Show Success Screen
                     authFormContainer.style.display = 'none';
                     authSuccessScreen.style.display = 'block';
                     authSuccessScreen.querySelector('h2').textContent = 'Bağlantı Gönderildi';
                     authSuccessMsg.textContent = 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi! Lütfen gelen kutunuzu kontrol edip bağlantıya tıklayın.';
                 }
                 return;
             }

             if (!password || (currentMode === 'register' && !name)) {
                 errorMsg.textContent = 'Lütfen tüm alanları doldurun!';
                 errorMsg.style.color = 'var(--danger)';
                 return;
             }

             errorMsg.textContent = 'İşlem yapılıyor, lütfen bekleyin...';
             errorMsg.style.color = '#94a3b8';

             if (currentMode === 'register') {
                 // REGISTER
                 const { data, error } = await _supabase.auth.signUp({
                     email: email,
                     password: password,
                     options: { data: { full_name: name } }
                 });

                 if (error) {
                     errorMsg.textContent = translateAuthError(error.message);
                     errorMsg.style.color = 'var(--danger)';
                 } else {
                     if (data.session) {
                         errorMsg.textContent = 'Kayıt başarılı! Editöre yönlendiriliyorsunuz...';
                         errorMsg.style.color = '#10b981';
                         setTimeout(() => { window.location.href = '/editor.html'; }, 800);
                     } else {
                         // Email confirmation required setup - Show Success Screen
                         authFormContainer.style.display = 'none';
                         authSuccessScreen.style.display = 'block';
                         authSuccessScreen.querySelector('h2').textContent = 'E-postanızı Kontrol Edin';
                         authSuccessMsg.textContent = 'Hesabınızı başarıyla oluşturduk! Giriş yapabilmek için lütfen e-posta adresinize gönderdiğimiz onay bağlantısına tıklayın.';
                     }
                 }
             } else if (currentMode === 'login') {
                 // LOGIN
                 const { data, error } = await _supabase.auth.signInWithPassword({
                     email: email,
                     password: password,
                 });

                 if (error) {
                     errorMsg.textContent = translateAuthError(error.message);
                     errorMsg.style.color = 'var(--danger)';
                 } else {
                     errorMsg.textContent = 'Giriş başarılı! Yönlendiriliyorsunuz...';
                     errorMsg.style.color = '#10b981';
                     setTimeout(() => { window.location.href = '/editor.html'; }, 800);
                 }
             }
        });

        // Trigger on Enter key
        [authEmailInput, authPasswordInput, authNameInput].forEach(input => {
            input.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    authActionBtn.click();
                }
            });
        });
    }

    // --- Translation Helper ---
    function translateAuthError(msg) {
        if (!msg) return 'Bir hata oluştu.';
        const txt = msg.toLowerCase();
        
        if (txt.includes('invalid login credentials')) return 'E-posta veya şifre hatalı.';
        if (txt.includes('email not confirmed')) return 'Lütfen giriş yapmadan önce e-posta adresinize gönderilen linke tıklayarak hesabınızı doğrulayın.';
        if (txt.includes('user already registered')) return 'Bu e-posta adresiyle zaten kayıtlı bir hesap var.';
        if (txt.includes('password should be at least')) return 'Şifreniz en az 6 karakter olmalıdır.';
        if (txt.includes('rate limit') || txt.includes('too many requests')) return 'Güvenlik sebebiyle çok fazla deneme yaptınız. Lütfen biraz bekleyip tekrar deneyin.';
        if (txt.includes('network') || txt.includes('fetch')) return 'İnternet bağlantınızı kontrol edin.';
        if (txt.includes('weak password')) return 'Şifreniz çok zayıf, lütfen daha zor bir şifre seçin.';
        
        return msg; // Fallback to raw message if translation is missing
    }
});
