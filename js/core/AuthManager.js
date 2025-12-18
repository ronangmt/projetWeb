export class AuthManager {
    constructor(baseUrl = "http://localhost:3000") {
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem('matharena_token');
        this.username = localStorage.getItem('matharena_username');
    }

    isLoggedIn() {
        return !!this.token;
    }

    async login(username, password) {
        const res = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (res.ok) {
            this.setSession(data.token, data.username);
            return { success: true, gameData: data.gameData };
        } else {
            return { success: false, error: data.error };
        }
    }

    async register(username, password) {
        const res = await fetch(`${this.baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        return { success: res.ok, error: data.error };
    }

    async saveCloudData(gameData) {
        if (!this.token) return;
        
        try {
            await fetch(`${this.baseUrl}/save`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': this.token 
                },
                body: JSON.stringify({ gameData })
            });
            console.log("Sauvegarde Cloud OK");
        } catch (e) {
            console.error("Erreur sauvegarde cloud", e);
        }
    }

    setSession(token, username) {
        this.token = token;
        this.username = username;
        localStorage.setItem('matharena_token', token);
        localStorage.setItem('matharena_username', username);
    }

    logout() {
        this.token = null;
        this.username = null;
        localStorage.removeItem('matharena_token');
        localStorage.removeItem('matharena_username');
        localStorage.removeItem('matharena_data_v1');
        location.reload();
    }
}