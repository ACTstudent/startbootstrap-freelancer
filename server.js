const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const sql = require('msnodesqlv8');

const app = express();
const PORT = process.env.PORT || 3000;

const connectionString = "server=LAB2-PC28\\LAB3PC44;Database=SIS;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

// Database helper using Promises
function queryDb(query, params = []) {
    return new Promise((resolve, reject) => {
        sql.query(connectionString, query, params, (err, rows) => {
            if (err) {
                console.error("Database query error:", err);
                return reject(err);
            }
            resolve(rows);
        });
    });
}

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
        const query = `
            SELECT u.user_id, u.username, u.password_hash, u.role_id, r.role 
            FROM user_login u 
            INNER JOIN Role r ON u.role_id = r.role_id 
            WHERE u.username = ?
        `;
        const rows = await queryDb(query, [username]);
        
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid username or password." });
        }

        const user = rows[0];
        
        // Plaintext comparison as per existing database passwords (e.g. admin123, louisse123)
        if (user.password_hash !== password) {
            return res.status(401).json({ success: false, message: "Invalid username or password." });
        }

        // Store user in session
        req.session.user = {
            id: user.user_id,
            username: user.username.trim(),
            role_id: user.role_id,
            role: user.role.trim()
        };

        res.json({ success: true, user: req.session.user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// Register route
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const role_id = 3; // Default to Student (role_id: 3)

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    try {
        // Check if username already exists
        const checkUserQuery = "SELECT 1 FROM user_login WHERE username = ?";
        const checkRows = await queryDb(checkUserQuery, [username]);
        
        if (checkRows.length > 0) {
            return res.status(400).json({ success: false, message: "Username is already taken." });
        }

        // Get the next user_id (not auto-incrementing in DB)
        const idQuery = "SELECT ISNULL(MAX(user_id), 0) + 1 AS next_id FROM user_login";
        const idRows = await queryDb(idQuery);
        const nextId = idRows[0].next_id;

        // Insert new user
        const insertQuery = "INSERT INTO user_login (user_id, username, password_hash, role_id) VALUES (?, ?, ?, ?)";
        await queryDb(insertQuery, [nextId, username, password, role_id]);

        res.status(201).json({ success: true, message: "Registration successful!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// Logout route
app.post('/api/logout', (req, res) => {
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
