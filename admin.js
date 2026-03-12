const supabaseUrl = 'https://wieturwgmmhafbhxnfne.supabase.co';
const supabaseKey = 'sb_publishable_MEv5951ejOcOKTF44WX9aw_wcY-BT8q';
let _supabase = null;

if (window.supabase) {
    _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
}

document.addEventListener('DOMContentLoaded', () => {
    const authGate = document.getElementById('auth-gate');
    const adminApp = document.getElementById('admin-app');
    const gateError = document.getElementById('gate-error');
    const logoutBtn = document.getElementById('logout-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const tableBody = document.getElementById('users-table-body');

    // Stats
    const statTotalUsers = document.getElementById('stat-total-users');
    const statProUsers = document.getElementById('stat-pro-users');
    const statTotalLinks = document.getElementById('stat-total-links');
    const statTotalViews = document.getElementById('stat-total-views');

    let adminSession = null;

    // 1. Check Authentication on Load
    if (_supabase) {
        _supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                adminSession = session;
                // Try to load the admin data
                loadAdminData();
            } else {
                // Not logged in at all, kick them back to login
                window.location.replace('/auth.html');
            }
        });

        // Keep session updated
        _supabase.auth.onAuthStateChange((event, session) => {
            adminSession = session;
            if (!session) {
                window.location.replace('/auth.html');
            }
        });
    }

    // 2. Load the Data
    async function loadAdminData() {
        try {
            // Attempt to fetch ALL profiles
            // IMPORTANT: If RLS is not configured for the admin email, this will only return the admin's own row!
            const { data: profiles, error } = await _supabase
                .from('profiles')
                .select('*')
                .order('views', { ascending: false }); // Order by most viewed

            if (error) throw error;

            if (profiles) {
                // Determine if we actually have admin access based on rows returned
                // If they have 1 row, it might be just themselves (RLS blocking rest). 
                // But for the sake of the dashboard, we render whatever the DB allowed us to see.
                
                // Hide gate, show app
                authGate.style.display = 'none';
                adminApp.style.display = 'flex';

                renderDashboard(profiles);

            }
        } catch (err) {
            console.error(err);
            gateError.textContent = "Veritabanı bağlantı hatası: " + err.message;
            gateError.style.display = 'block';
            document.querySelector('.spinner').style.display = 'none';
        }
    }

    // 3. Render Dashboard Math and UI
    function renderDashboard(profiles) {
        // Calculate Stats
        const totalUsers = profiles.length;
        let totalPro = 0;
        let totalLinks = 0;
        let totalViews = 0;

        tableBody.innerHTML = ''; // Clear loading spinner

        if (totalUsers === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">Kayıtlı sistem verisi bulunamadı.</td></tr>`;
        }

        profiles.forEach(p => {
            // Math
            if (p.is_pro) totalPro++;
            if (p.links && Array.isArray(p.links)) totalLinks += p.links.length;
            totalViews += (p.views || 0);

            // Determine if they added socials
            let socialsCount = 0;
            if (p.socials) {
                Object.values(p.socials).forEach(val => {
                    if (val && val.trim() !== '') socialsCount++;
                });
            }

            const linksCount = p.links && Array.isArray(p.links) ? p.links.length : 0;
            
            // Generate Avatar SVG or Image
            const avatarHtml = p.profile_image 
                ? `<img src="${p.profile_image}" alt="Avatar">`
                : `<i class="fa-solid fa-user" style="color: var(--text-secondary);"></i>`;

            // Row HTML
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div class="user-avatar">${avatarHtml}</div>
                        <div>
                            <div style="font-weight: 600; color: white;">${p.full_name || 'İsimsiz Kullanıcı'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <a href="https://linkinbiostudio.vercel.app/${p.username}" target="_blank" style="color: var(--accent); text-decoration: none;">
                        /${p.username}
                    </a>
                </td>
                <td>
                    ${p.is_pro 
                        ? '<span class="badge pro"><i class="fa-solid fa-crown"></i> PRO</span>' 
                        : '<span class="badge free">Ücretsiz</span>'}
                </td>
                <td>
                    <div style="color: var(--text-secondary); font-size: 0.75rem;">
                        <i class="fa-solid fa-link text-accent"></i> ${linksCount} Link
                        <span style="margin: 0 0.5rem;">•</span>
                        <i class="fa-solid fa-hashtag" style="color: #a855f7;"></i> ${socialsCount} Sosyal
                    </div>
                </td>
                <td style="font-weight: 600;">
                    ${p.views || 0}
                </td>
                <td>
                    <a href="/preview.html?u=${p.username}" target="_blank" class="btn outline" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">
                        <i class="fa-solid fa-eye"></i> İncele
                    </a>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // Update Stat Cards
        statTotalUsers.textContent = totalUsers;
        statProUsers.textContent = totalPro;
        statTotalLinks.textContent = totalLinks;
        statTotalViews.textContent = totalViews;
    }

    // --- Actions ---
    refreshBtn.addEventListener('click', () => {
        refreshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yenileniyor...';
        loadAdminData().then(() => {
            setTimeout(() => {
                refreshBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Verileri Yenile';
            }, 500);
        });
    });

    logoutBtn.addEventListener('click', async () => {
        if (_supabase) {
            await _supabase.auth.signOut();
            localStorage.removeItem('lb_app_data');
            window.location.replace('/');
        }
    });

});
