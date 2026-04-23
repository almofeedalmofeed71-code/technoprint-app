/* TECHOPRINT 2026 - ENG AUTH */
/* Login/Register with Server-side storage */

const Auth = {
    API_URL: '/api/auth',
    user: null,
    
    // Register with full data
    async register(data) {
        const { fullName, username, password, phone, governorate, address } = data;
        
        if (!fullName || !username || !password || !phone) {
            alert('Please fill all required fields');
            return false;
        }
        
        try {
            const res = await fetch(`${this.API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, username, password, phone, governorate, address })
            });
            
            const result = await res.json();
            
            if (result.success) {
                alert('Registration successful! Please login.');
                return true;
            } else {
                alert(result.message || 'Registration failed');
                return false;
            }
        } catch (err) {
            console.error('Register error:', err);
            alert('Connection error');
            return false;
        }
    },
    
    // Login and fetch user data
    async login(email, password) {
        try {
            const res = await fetch(`${this.API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const result = await res.json();
            
            if (result.success) {
                this.user = result.user;
                this.fetchUserData();
                return true;
            } else {
                alert(result.message || 'Login failed');
                return false;
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Connection error');
            return false;
        }
    },
    
    // Fetch user's wallet, orders, profile
    async fetchUserData() {
        if (!this.user?.id) return;
        
        try {
            const res = await fetch(`${this.API_URL}/user/${this.user.id}`);
            const data = await res.json();
            
            if (data.success) {
                this.user = { ...this.user, ...data };
                this.updateUI();
            }
        } catch (err) {
            console.error('Fetch user data error:', err);
        }
    },
    
    // Update wallet balance in header
    updateUI() {
        const balanceEl = document.getElementById('headerBalance');
        if (balanceEl && this.user?.balance) {
            balanceEl.textContent = this.user.balance.toLocaleString() + ' IQD';
        }
    },
    
    logout() {
        this.user = null;
        this.updateUI();
    }
};

window.Auth = Auth;
