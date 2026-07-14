require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: 'sis-system-secret-key-12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// API Routes

// Get currently logged-in user
app.get('/api/me', (req, res) => {
    if (req.session && req.session.user) {
        return res.json({ loggedIn: true, user: req.session.user });
    }
    res.json({ loggedIn: false });
});

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    try {
        // username field may be an email address
        const email = username.includes('@') ? username : `${username}@example.com`;

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            return res.status(401).json({ success: false, message: "Invalid username or password." });
        }

        // Fetch profile to get username
        const { data: profile } = await supabase
            .from('profiles')
            .select('username, birthday')
            .eq('id', data.user.id)
            .single();

        // Store user in session
        req.session.user = {
            id: data.user.id,
            username: (profile && profile.username) ? profile.username : username.trim(),
            email: data.user.email
        };

        res.json({ success: true, user: req.session.user });
    } catch (err) {
        console.error("Login exception:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// Register route
app.post('/api/register', async (req, res) => {
    const { username, email, password, birthday } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: "Username, email, and password are required." });
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    birthday: birthday || null
                }
            }
        });

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(201).json({ success: true, message: "Registration successful! You can now log in." });
    } catch (err) {
        console.error("Registration exception:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// Logout route
app.post('/api/logout', async (req, res) => {
    try {
        // Also sign out from Supabase auth instance
        await supabase.auth.signOut();
    } catch (err) {
        console.error("Supabase signOut error:", err);
    }

    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: "Could not log out." });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for client-side routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
