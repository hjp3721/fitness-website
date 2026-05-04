async function checkAuth() {
  try {
    const res = await fetch("/api/user");
    const data = await res.json();
    const navAuth = document.getElementById("navAuth");
    const navUser = document.getElementById("navUser");
    if (data.loggedIn && navAuth) {
      navAuth.style.display = "none";
      navUser.style.display = "flex";
      document.getElementById("navUsername").textContent = data.username;
    }
  } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("submitBtn");
      btn.disabled = true;
      btn.textContent = "登录中...";
      const fd = new FormData(loginForm);
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd)),
      });
      const data = await res.json();
      const msg = document.getElementById("msg");
      msg.textContent = data.message;
      msg.className = "msg " + (data.success ? "success" : "error");
      if (data.success) {
        setTimeout(() => (window.location.href = "/"), 1000);
      }
      btn.disabled = false;
      btn.textContent = "登录";
    });
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("submitBtn");
      btn.disabled = true;
      btn.textContent = "注册中...";
      const fd = new FormData(registerForm);
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd)),
      });
      const data = await res.json();
      const msg = document.getElementById("msg");
      msg.textContent = data.message;
      msg.className = "msg " + (data.success ? "success" : "error");
      if (data.success) {
        setTimeout(() => (window.location.href = "/login.html"), 1500);
      }
      btn.disabled = false;
      btn.textContent = "注册";
    });
  }

  const userDisplay = document.getElementById("userDisplay");
  if (userDisplay) {
    fetch("/api/user")
      .then((r) => r.json())
      .then((d) => {
        if (d.loggedIn) {
          userDisplay.textContent = d.username;
          document.getElementById("navUsername").textContent = d.username;
        } else {
          window.location.href = "/login.html";
        }
      });
  }
});

async function logout() {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/";
}
