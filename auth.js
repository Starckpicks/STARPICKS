import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCHYnDqtxzA9nrqFEkZNELtIuonVpBJUsk",
    authDomain: "starpicks-8a477.firebaseapp.com",
    projectId: "starpicks-8a477",
    storageBucket: "starpicks-8a477.firebasestorage.app",
    messagingSenderId: "444164019875",
    appId: "1:444164019875:web:20651ceffabba3446d1116",
    measurementId: "G-13407KYWJ8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ===============================
// LOGIN
// ===============================
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        const email = document.getElementById("email").value;
        const pass = document.getElementById("password").value;

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            window.location.href = "admin.html";
        } catch (err) {
            document.getElementById("msg").textContent = "Correo o contraseña incorrectos";
        }
    });
}

// ===============================
// PROTEGER ADMIN.HTML
// ===============================
if (window.location.pathname.includes("admin.html")) {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "login.html";
        }
    });
}

// ===============================
// LOGOUT
// ===============================
window.logout = () => {
    const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        logout(); // usa tu función existente
    });
}

    signOut(auth).then(() => {
        window.location.href = "login.html";
    });
};
