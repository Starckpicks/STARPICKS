console.log("StarPicks Público v3 conectado a Firestore...");

import { collection, getDocs, doc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = window.firebaseDB;

// Cargar votos del usuario (localStorage)
let votosUsuario = JSON.parse(localStorage.getItem("votosStarPicks")) || {}; 
// votosUsuario[id] = "like" o "dislike"

// FUNCIONES DE LIKE / DISLIKE
async function darLike(id, likesActuales) {
    if (votosUsuario[id]) return alert("Ya votaste esta jugada");

    const ref = doc(db, "jugadas", id);
    await updateDoc(ref, { likes: likesActuales + 1 });

    votosUsuario[id] = "like";
    localStorage.setItem("votosStarPicks", JSON.stringify(votosUsuario));

    actualizarBotones(id);
}

async function darDislike(id, dislikesActuales) {
    if (votosUsuario[id]) return alert("Ya votaste esta jugada");

    const ref = doc(db, "jugadas", id);
    await updateDoc(ref, { dislikes: dislikesActuales + 1 });

    votosUsuario[id] = "dislike";
    localStorage.setItem("votosStarPicks", JSON.stringify(votosUsuario));

    actualizarBotones(id);
}

// DESACTIVAR BOTONES DESPUÉS DE VOTAR
function actualizarBotones(id) {
    const botones = document.querySelectorAll(`button[data-id='${id}']`);
    botones.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = "0.4";
    });
}

// ===============================
// REACCIONES LIKE / DISLIKE — HORIZONTAL Y ADAPTADO
// ===============================
function generarReaccionesHTML(j, id, yaVoto) {
    return `
        <td style="
            display:flex;
            flex-direction:row;
            justify-content:center;
            align-items:center;
            gap:20px;
            width:100%;
            padding:10px 0;
        ">

            <!-- LIKE -->
            <div style="display:flex; flex-direction:column; align-items:center;">
                <button 
                    data-id="${id}"
                    onclick="darLike('${id}', ${j.likes || 0})"
                    ${yaVoto ? "disabled style='opacity:0.4; cursor:not-allowed;'" : ""}
                    style="
                        font-size:26px;
                        background:none;
                        border:none;
                        cursor:pointer;
                        line-height:1;
                    "
                >
                    👍
                </button>
                <span style="font-size:15px; font-weight:bold; margin-top:4px;">
                    ${j.likes || 0}
                </span>
            </div>

            <!-- DISLIKE -->
            <div style="display:flex; flex-direction:column; align-items:center;">
                <button 
                    data-id="${id}"
                    onclick="darDislike('${id}', ${j.dislikes || 0})"
                    ${yaVoto ? "disabled style='opacity:0.4; cursor:not-allowed;'" : ""}
                    style="
                        font-size:26px;
                        background:none;
                        border:none;
                        cursor:pointer;
                        line-height:1;
                    "
                >
                    👎
                </button>
                <span style="font-size:15px; font-weight:bold; margin-top:4px;">
                    ${j.dislikes || 0}
                </span>
            </div>

        </td>
    `;
}

// ===============================
// CARGAR JUGADAS DESDE FIRESTORE
// ===============================
async function cargarJugadasFirestore() {
    const jugadasRef = collection(db, "jugadas");
    const snapshot = await getDocs(jugadasRef);

    const tbody = document.querySelector("#tablaJugadas tbody");
    tbody.innerHTML = "";

    snapshot.forEach(docSnap => {
        const j = docSnap.data();
        const id = docSnap.id;

        const yaVoto = votosUsuario[id]; // "like" o "dislike"

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${j.fecha || "-"}</td>
            <td>${j.hora || "--:--"}</td>
            <td>${j.competicion || "Sin competencia"}</td>
            <td>${j.partido}</td>

            <!-- ⭐ CORREGIDO: cuotaTotal -->
            <td>${j.cuotaTotal}</td>

            <td>${j.stake}</td>

            <td>
                ${j.pronosticos.map((p) => `
                    <div class="pronostico-item">
                        ${p.nombre} →
                        ${
                            p.resultado === "ganado" ? "<span class='ok'>✔</span>" :
                            p.resultado === "perdido" ? "<span class='fail'>✘</span>" :
                            "<span class='pendiente'>⏳</span>"
                        }
                    </div>
                `).join("")}
            </td>

            <td>
                ${
                    j.resultadoFinal === "ganado" ? "<span class='ok'>✔</span>" :
                    j.resultadoFinal === "perdido" ? "<span class='fail'>✘</span>" :
                    "<span class='pendiente'>⏳</span>"
                }
            </td>

            ${generarReaccionesHTML(j, id, yaVoto)}
        `;

        tbody.appendChild(fila);
    });
}

// INICIO
cargarJugadasFirestore();

// Exponer funciones al DOM
window.darLike = darLike;
window.darDislike = darDislike;
