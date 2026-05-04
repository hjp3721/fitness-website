const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

const db = new Database("fitness.db");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "fitness-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(express.static(path.join(__dirname, "public")));

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/login.html");
  }
  next();
}

app.post("/api/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.json({ success: false, message: "请填写所有字段" });
  }
  if (password.length < 6) {
    return res.json({ success: false, message: "密码至少6位" });
  }
  try {
    const hashed = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)").run(
      username,
      email,
      hashed
    );
    res.json({ success: true, message: "注册成功！" });
  } catch (e) {
    if (e.message.includes("UNIQUE")) {
      return res.json({ success: false, message: "用户名或邮箱已存在" });
    }
    res.json({ success: false, message: "注册失败，请重试" });
  }
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ success: false, message: "请填写用户名和密码" });
  }
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.json({ success: false, message: "用户名或密码错误" });
  }
  req.session.userId = user.id;
  req.session.username = user.username;
  res.json({ success: true, message: "登录成功" });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get("/api/user", (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true, username: req.session.username });
  } else {
    res.json({ loggedIn: false });
  }
});

app.get("/profile.html", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "profile.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
