const API_BASE = window.RUNTIME_ENV.API_BASE_URL;

function getDeviceUUID() {
  let uuid = localStorage.getItem("deviceUUID");
  if (!uuid) { uuid = crypto.randomUUID(); localStorage.setItem("deviceUUID", uuid); }
  return uuid;
}

function authHeaders(extra) {
  const token = localStorage.getItem("accessToken");
  const headers = { "x-device-uuid": getDeviceUUID(), ...extra };
  if (token) headers["x-access-token"] = token;
  return headers;
}

function saveNewToken(res) {
  const t = res.headers.get("x-access-token");
  if (t) localStorage.setItem("accessToken", t);
}

// ===== Toggle Eye Icon for Password Fields =====
document.querySelectorAll(".toggle-eye").forEach(eye => {
  eye.addEventListener("click", () => {
    const input = document.getElementById(eye.dataset.target);
    if (input) {
      input.type = input.type === "password" ? "text" : "password";
    }
  });
});

// ===== Load Active Sessions =====
async function loadSessions() {
  const sessionsBody = document.getElementById("sessionsBody");
  const sessionsError = document.getElementById("sessionsError");

  try {
    const res = await fetch(`${API_BASE}/auth/active-sessions`, {
      headers: authHeaders(),
      credentials: "include",
    });
    saveNewToken(res);

    if (res.status === 401) { window.location.href = "../auth/login.html"; return; }

    const data = await res.json();
    if (!res.ok || !data.success) {
      sessionsBody.innerHTML = "";
      sessionsError.textContent = data.message || "Failed to load sessions.";
      return;
    }

    const sessions = data.activeSessions || data.data || [];
    if (!sessions || sessions.length === 0) {
      sessionsBody.innerHTML = "<p>No active sessions found.</p>";
      return;
    }

    const currentUUID = getDeviceUUID();
    sessionsBody.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Device Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${sessions.map(s => `
            <tr>
              <td>${s.deviceName || (s.deviceUUID ? s.deviceUUID.slice(0, 16) + "…" : "—")}</td>
              <td>${s.deviceType || "—"}</td>
              <td>
                ${s.deviceUUID === currentUUID
                  ? '<span class="badge badge-current">Current</span>'
                  : '<span class="badge badge-success">Active</span>'}
              </td>
              <td>
                ${s.deviceUUID === currentUUID
                  ? `<button class="btn-secondary" id="signoutCurrentBtn">Sign Out This Device</button>`
                  : "—"}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    const signoutCurrentBtn = document.getElementById("signoutCurrentBtn");
    if (signoutCurrentBtn) {
      signoutCurrentBtn.addEventListener("click", () => signOutCurrentDevice(signoutCurrentBtn));
    }

  } catch (err) {
    sessionsBody.innerHTML = "";
    sessionsError.textContent = "Network error.";
  }
}

// ===== Sign Out Current Device =====
async function signOutCurrentDevice(btn) {
  const sessionsError = document.getElementById("sessionsError");
  sessionsError.textContent = "";
  btn.disabled = true;
  btn.textContent = "Signing out...";

  try {
    const res = await fetch(`${API_BASE}/auth/signout-device`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      sessionsError.textContent = data.message || "Failed to sign out.";
      btn.disabled = false;
      btn.textContent = "Sign Out This Device";
      return;
    }
    localStorage.removeItem("accessToken");
    window.location.href = "../auth/login.html";
  } catch (err) {
    sessionsError.textContent = "Network error.";
    btn.disabled = false;
    btn.textContent = "Sign Out This Device";
  }
}

// ===== Sign Out All Devices =====
document.getElementById("signoutAllBtn").addEventListener("click", async () => {
  const btn = document.getElementById("signoutAllBtn");
  const sessionsError = document.getElementById("sessionsError");
  sessionsError.textContent = "";
  btn.disabled = true;
  btn.textContent = "Signing out...";

  try {
    const res = await fetch(`${API_BASE}/auth/signout`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      sessionsError.textContent = data.message || "Failed to sign out all devices.";
      btn.disabled = false;
      btn.textContent = "Sign Out All Devices";
      return;
    }
    localStorage.removeItem("accessToken");
    window.location.href = "../auth/login.html";
  } catch (err) {
    sessionsError.textContent = "Network error.";
    btn.disabled = false;
    btn.textContent = "Sign Out All Devices";
  }
});

loadSessions();
