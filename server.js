const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow Express to read form data
app.use(express.urlencoded({ extended: true }));
// Serve website files such as HTML, CSS and images;

// Session setup
app.use(
    session({
        secret: process.env.SESSION_SECRET || "change-this-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60
        }
    })
);

// Protected image
app.get("/GRAUU.JPG", (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect("/login");
    }

    res.sendFile(__dirname + "/GRAUU.JPG");
});

// Password we'll protect the private page with.
// For now, we'll create a temporary password below.
const passwordHash = bcrypt.hashSync("BAE123", 10);

// Login page
app.get("/login", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Private Login ❤️</title>
        </head>
        <body>
            <h1>🔐 Private Area</h1>

            <form method="POST" action="/login">
                <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    required
                >
                <button type="submit">Enter ❤️</button>
            </form>
        </body>
        </html>
    `);
});

// Check password
app.post("/login", async (req, res) => {
    const passwordCorrect = await bcrypt.compare(
        req.body.password,
        passwordHash
    );

    if (passwordCorrect) {
        req.session.loggedIn = true;
        res.redirect("/");
    } else {
        res.send("❌ Wrong password. <a href='/login'>Try again</a>");
    }
});

// Protected page
app.get("/private", (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect("/login");
    }

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>My Private Page ❤️</title>
        </head>
        <body>
            <h1>❤️ Welcome to the private page</h1>
            <p>You successfully logged in!</p>

            <a href="/logout">Log out</a>
        </body>
        </html>
    `);
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

app.get("/", (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect("/login");
    }

    res.sendFile(__dirname + "/index.html");
});
app.listen(PORT, () => {
    console.log(`Website running on port ${PORT}`);
});