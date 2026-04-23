/* TECHOPOPRINT 2026 - ENG AUTH */
/* Registration with Server-side storage */

const Auth = {
    API_URL: '/api/auth',
    
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
                alert('Registration successful!');
                return true;
            } else {
                alert(result.message || 'Registration failed');
                return false;
            }
        } catch (err) {
            console.error('Register error:', err);
            alert('Connection error. Please try again.');
            return false;
        }
    },
    
    async login(email, password) {
        try {
            const res = await fetch(`${this.API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const result = await res.json();
            
            if (result.success) {
                this.currentUser = result.user;
                return true;
            } else {
                alert(result.message || 'Login failed');
                return false;
            }
        } catch (err) {
            console.error('Login error:', err);
            return false;
        }
    },
    
    logout() {
        this.currentUser = null;
    }
};

window.Auth = Auth;
