console.log("StarPicks Público v3 conectado a Firestore...");

import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = window.firebaseDB;

// CARGAR JUGADAS DESDE FIRESTORE
async function cargarJugadasFirestore() {
    const jugadasRef = collection(db, "jugadas");
    const snapshot = await getDocs(jugadasRef);

    const tbody = document.querySelector("#tablaJugadas tbody");
    tbody.innerHTML = "";

    snapshot.forEach(doc => {
        const j = doc.data();

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${j.fecha || "-"}</td>
            <td>${j.hora || "--:--"}</td>
            <td>${j.competicion || "Sin competencia"}</td>
            <td>${j.partido}</td>
            <td>${j.cuota}</td>
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

            <td>
                👍 ${j.likes || 0} &nbsp;&nbsp;  
                👎 ${j.dislikes || 0}
            </td>
        `;

        tbody.appendChild(fila);
    });
}

// INICIO
cargarJugadasFirestore();
