// ===== TECHNO-CONTROL - TEST USER CREATION =====

const SUPABASE_URL = 'https://rqzsokvhgjlftkouhphb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenNva3ZoZ2psZnRrb3VocGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjUyNDcsImV4cCI6MjA5MTA0MTI0N30.2VJpfOpCUp_Mr9ot00qH0nhLmIIfUy3Rr5TQ5GOgjbY';

console.log('🔍 TEST: Creating hseenop33 directly in Supabase');

// First, check all users in DB
async function checkAllUsers() {
    console.log('📋 Checking ALL profiles in database...');
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
            headers: { 
                'apikey': SUPABASE_ANON_KEY, 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}` 
            }
        });
        const users = await res.json();
        console.log('📊 Total users in DB:', users?.length || 0);
        if (users && users.length > 0) {
            console.log('📋 All usernames:', users.map(u => u.username).join(', '));
        } else {
            console.log('❌ Database appears EMPTY');
        }
        return users;
    } catch (e) {
        console.error('❌ Error fetching users:', e.message);
        return null;
    }
}

// Create hseenop33 as admin
async function createTestAdmin() {
    console.log('🔧 Creating hseenop33 in Supabase...');
    
    const newUser = {
        id: crypto.randomUUID(),
        username: 'hseenop33',
        password: 'test123',
        phone: '+9647700000001',
        governorate: 'baghdad',
        address: 'Test HQ',
        category: 'عادي',
        role: 'admin',
        balance_iqd: 9999999,
        pages_count: 999999,
        status: 'active'
    };
    
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: { 
                'apikey': SUPABASE_ANON_KEY, 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(newUser)
        });
        
        console.log('📥 Create response status:', res.status);
        
        if (res.ok) {
            const created = await res.json();
            console.log('✅ User CREATED successfully!');
            console.log('   ID:', created?.[0]?.id || created?.id);
            console.log('   Username:', created?.[0]?.username || newUser.username);
            console.log('   Role:', created?.[0]?.role || newUser.role);
            return true;
        } else {
            const error = await res.json();
            console.error('❌ Create FAILED:', error);
            return false;
        }
    } catch (e) {
        console.error('❌ Create error:', e.message);
        return false;
    }
}

// Login with hseenop33
async function loginAsHseenop33() {
    console.log('🔵 Trying to login as hseenop33...');
    
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?username=eq.hseenop33&select=*`, {
            headers: { 
                'apikey': SUPABASE_ANON_KEY, 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}` 
            }
        });
        
        const users = await res.json();
        console.log('📥 Login check - Users found:', users?.length || 0);
        
        if (users && users.length > 0) {
            const user = users[0];
            console.log('👤 User found!');
            console.log('   Password match:', user.password === 'test123' ? 'YES' : 'NO');
            console.log('   Role:', user.role);
            
            if (user.role === 'admin') {
                console.log('✅ GRANTING ACCESS');
                localStorage.setItem('adminToken', 'admin-db-' + user.id);
                localStorage.setItem('adminUser', JSON.stringify({ 
                    id: user.id,
                    username: user.username, 
                    role: user.role, 
                    isAdmin: true 
                }));
                window.location.href = 'admin-dashboard.html';
            }
        } else {
            console.log('❌ User NOT FOUND after creation attempt');
            console.log('🔧 Trying to create now...');
            await createTestAdmin();
        }
    } catch (e) {
        console.error('❌ Login error:', e.message);
    }
}

// Run tests on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🧪 Starting TEST MODE...');
    
    // Check existing users first
    const existingUsers = await checkAllUsers();
    
    // Show results
    if (existingUsers && existingUsers.length > 0) {
        console.log('✅ Database has users');
        console.log('   Try logging in with existing username');
    } else {
        console.log('❌ Database is EMPTY');
        console.log('🔧 Creating hseenop33 as test admin...');
        await createTestAdmin();
    }
});

// Add test button to login page
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (form) {
        const testBtn = document.createElement('button');
        testBtn.textContent = '🧪 TEST: Create hseenop33 in DB';
        testBtn.style.cssText = 'background:#0066FF;color:#fff;padding:10px;margin-top:10px;cursor:pointer;border:none;';
        testBtn.onclick = async () => {
            await checkAllUsers();
            await createTestAdmin();
            alert('Test admin created! Try login now.');
        };
        form.appendChild(testBtn);
    }
});