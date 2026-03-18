import { app } from "./firebase-config.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("googleLoginBtn");
  if (!btn) return;
  const label = btn.querySelector(".btn-google-label");

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    btn.disabled = true;
    if (label) label.textContent = "Signing in…";

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Exchange Firebase ID token for this app's JWT (so /api/me works)
      const data = await AgroTechApp.api("/api/auth/google", {
        method: "POST",
        body: { idToken }
      });

      AgroTechApp.setSession(data);

      window.location.href = "dashboard.html";
    } catch (err) {
      console.error("Google login error:", err);
      const code =
        err?.data?.error ||
        err?.code ||
        err?.message ||
        (typeof err === "string" ? err : "unknown_error");
      const status = err?.status != null ? `HTTP ${err.status}` : null;
      // Common root causes:
      // - auth/unauthorized-domain: site domain not added in Firebase Auth > Settings > Authorized domains
      // - auth/operation-not-allowed: Google provider not enabled in Firebase Auth > Sign-in method
      alert(`Google login failed (${[code, status].filter(Boolean).join(", ")}). Please try again.`);
    } finally {
      btn.disabled = false;
      if (label) label.textContent = "Continue with Google";
    }
  });
});

