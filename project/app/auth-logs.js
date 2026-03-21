const API_BASE = window.RUNTIME_ENV.API_BASE_URL;
const LIMIT = 10;
let currentPage = 1;

function getDeviceUUID() {
  let uuid = localStorage.getItem("deviceUUID");
  if (!uuid) { uuid = crypto.randomUUID(); localStorage.setItem("deviceUUID", uuid); }
  return uuid;
}

function authHeaders() {
  const token = localStorage.getItem("accessToken");
  const headers = { "x-device-uuid": getDeviceUUID() };
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

function getEventBadge(event) {
  if (!event) return "—";
  const e = event.toLowerCase();
  if (e.includes("sign_in") || e.includes("signin") || e.includes("login"))
    return `<span class="badge badge-success">${event}</span>`;
  if (e.includes("sign_out") || e.includes("signout") || e.includes("logout"))
    return `<span class="badge badge-info">${event}</span>`;
  if (e.includes("fail") || e.includes("error") || e.includes("denied") || e.includes("blocked"))
    return `<span class="badge badge-error">${event}</span>`;
  if (e.includes("password") || e.includes("reset") || e.includes("2fa"))
    return `<span class="badge badge-warning">${event}</span>`;
  return `<span class="badge badge-info">${event}</span>`;
}

async function loadLogs(page) {
  const logsBody = document.getElementById("logsBody");
  const logsError = document.getElementById("logsError");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageInfo = document.getElementById("pageInfo");

  logsBody.innerHTML = "Loading...";
  logsError.textContent = "";

  try {
    const res = await fetch(`${API_BASE}/auth/auth-logs?page=${page}&limit=${LIMIT}`, {
      headers: authHeaders(),
      credentials: "include",
    });
    saveNewToken(res);

    if (res.status === 401) { window.location.href = "../auth/login.html"; return; }

    const data = await res.json();
    if (!res.ok || !data.success) {
      logsBody.innerHTML = "";
      logsError.textContent = data.message || "Failed to load logs.";
      return;
    }

    // Handle different response shapes from backend
    const logs = data.data?.logs || data.logs || (Array.isArray(data.data) ? data.data : []);
    const total = data.meta?.totalLogs ?? logs.length;
    const totalPages = data.meta?.totalPages ?? Math.max(1, Math.ceil(total / LIMIT));

    if (logs.length === 0) {
      logsBody.innerHTML = "<p>No auth logs found.</p>";
    } else {
      logsBody.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Device</th>
              <th>IP Address</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(log => `
              <tr>
                <td>${getEventBadge(log.event || log.action || log.type || log.eventType)}</td>
                <td>${log.deviceName || (log.deviceUUID ? log.deviceUUID.slice(0, 12) + "…" : "—")}</td>
                <td>${log.ipAddress || log.ip || "—"}</td>
                <td>${new Date(log.createdAt || log.timestamp).toLocaleString()}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    }

    currentPage = page;
    pageInfo.textContent = `Page ${page} of ${totalPages}`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;

  } catch (err) {
    logsBody.innerHTML = "";
    logsError.textContent = "Network error.";
  }
}

document.getElementById("prevBtn").addEventListener("click", () => loadLogs(currentPage - 1));
document.getElementById("nextBtn").addEventListener("click", () => loadLogs(currentPage + 1));

loadLogs(1);
