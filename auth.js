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
    const errorMsg = document.getElementById('auth-error-msg');

    let isLoginMode = true;

    // Check if URL asked for register
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'register') {
        isLoginMode = false;
        updateUI();
    }

    function updateUI() {
        errorMsg.textContent = '';
        if (isLoginMode) {
            authTitle.textContent = 'Giriş Yap';
            authNameGroup.style.display = 'none';
            authActionBtn.textContent = 'Giriş Yap';
            authSwitchText.textContent = 'Hesabın yok mu?';
            authSwitchBtn.textContent = 'Kayıt Ol';
            document.title = "Giriş Yap - LinkInBio Studio";
        } else {
            authTitle.textContent = 'Kayıt Ol';
            authNameGroup.style.display = 'block';
            authActionBtn.textContent = 'Ücretsiz Kayıt Ol';
            authSwitchText.textContent = 'Zaten hesabın var mı?';
            authSwitchBtn.textContent = 'Giriş Yap';
            document.title = "Kayıt Ol - LinkInBio Studio";
        }
    }

    authSwitchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        // Optionally update URL to preserve state
        const newUrl = isLoginMode ? '/auth.html' : '/auth.html?mode=register';
        window.history.pushState({}, '', newUrl);
        updateUI();
    });

    if (authActionBtn && _supabase) {
        authActionBtn.addEventListener('click', async () => {
             const email = authEmailInput.value;
             const password = authPasswordInput.value;
             const name = authNameInput.value;

             if (!email || !password || (!isLoginMode && !name)) {
                 errorMsg.textContent = 'Lütfen tüm alanları doldurun!';
                 errorMsg.style.color = 'var(--danger)';
                 return;
             }

             errorMsg.textContent = 'İşlem yapılıyor, lütfen bekleyin...';
             errorMsg.style.color = '#94a3b8';

             if (!isLoginMode) {
                 // REGISTER
                 const { data, error } = await _supabase.auth.signUp({
                     email: email,
                     password: password,
                     options: { data: { full_name: name } }
                 });

                 if (error) {
                     errorMsg.textContent = error.message;
                     errorMsg.style.color = 'var(--danger)';
                 } else {
                     if (data.session) {
                         errorMsg.textContent = 'Kayıt başarılı! Editöre yönlendiriliyorsunuz...';
                         errorMsg.style.color = '#10b981';
                         setTimeout(() => { window.location.href = '/editor.html'; }, 800);
                     } else {
                         // Email confirmation required setup
                         errorMsg.textContent = 'Kayıt başarılı! Lütfen giriş yapın.';
                         errorMsg.style.color = '#10b981';
                         setTimeout(() => { authSwitchBtn.click(); }, 1500); 
                     }
                 }
             } else {
                 // LOGIN
                 const { data, error } = await _supabase.auth.signInWithPassword({
                     email: email,
                     password: password,
                 });

                 if (error) {
                     errorMsg.textContent = 'E-posta veya şifre hatalı!';
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
});
