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

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Signing in…";

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // For now, just store a lightweight user object in localStorage.
      // You can later connect this to your backend JWT flow if needed.
      const profile = {
        id: user.uid,
        name: user.displayName || "Google user",
        email: user.email,
        // Default role: buyer; adjust logic if you want role selection.
        role: "buyer",
        language: AgroTechApp.getLang()
      };

      AgroTechApp.setSession({
        // Using Firebase access token here so the session behaves like existing token-based logic.
        token: user.accessToken || "firebase_google_token",
        user: profile
      });

      window.location.href = "dashboard.html";
    } catch (err) {
      console.error("Google login error:", err);
      alert("Google login failed. Please try again.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Continue with Google";
    }
  });
});

