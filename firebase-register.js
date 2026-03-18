import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { app } from "./firebase-config.js";
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("firebaseRegisterForm");
  const statusEl = document.getElementById("firebaseRegisterStatus");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("fbName").value.trim();
    const email = document.getElementById("fbEmail").value.trim();
    const password = document.getElementById("fbPassword").value;
    const role = document.getElementById("fbRole").value;

    if (!name || !email || !password) {
      showStatus("Please fill all fields.", "error");
      return;
    }

    try {
      showStatus("Creating account…", "info");

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      if (name) {
        await updateProfile(user, { displayName: name });
      }

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      });

      showStatus("Account created successfully. You can now log in.", "success");
      form.reset();
    } catch (err) {
      console.error("Firebase registration error:", err);
      const message = mapFirebaseError(err);
      showStatus(message, "error");
    }
  });

  function showStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "";
    statusEl.classList.add("form-status", `form-status--${type}`);
  }

  function mapFirebaseError(err) {
    const code = err?.code || "";
    if (code === "auth/email-already-in-use") {
      return "This email is already registered. Please login instead.";
    }
    if (code === "auth/weak-password") {
      return "Password is too weak. Please use at least 6 characters.";
    }
    if (code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }
    return "Registration failed. Please try again.";
  }
});

