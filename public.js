console.log("StarPicks Público v3 conectado a Firestore...");

import { collection, getDocs, doc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = window.firebaseDB;

// FUNCIONES DE LIKE / DISLIKE
async function darLike(id, likesActuales) {
    const ref = doc(db, "jugadas", id);
    await updateDoc(ref, { likes: likesActuales + 1 });
    cargarJugadasFirestore(); // refresca la tabla
}

async function darDislike(id, dislikesActuales) {
    const ref = doc(db, "jugadas", id);
    await updateDoc(ref, { dislikes: dislikesActuales + 1 });
    cargarJugadasFirestore(); // refresca la tabla
}

// CARGAR JUGADAS DESDE FIRESTORE
async function cargarJugadasFirestore() {
    const jugadasRef = collection(db, "jugadas");
    const snapshot = await getDocs(jugadasRef);

    const tbody = document.querySelector("#tablaJugadas tbody");
    tbody.innerHTML = "";

    snapshot.forEach(docSnap => {
        const j = docSnap.data();
        const id = docSnap.id;

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
                <button onclick="darLike('${id}', ${j.likes || 0})">👍 ${j.likes || 0}</button>
                <button onclick="darDislike('${id}', ${j.dislikes || 0})">👎 ${j.dislikes || 0}</button>
            </td>
        `;

        tbody.appendChild(fila);
    });
}

// INICIO
cargarJugadasFirestore();

// INICIO
cargarJugadasFirestore();
