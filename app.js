// ===============================
// IMPORTS FIRESTORE
// ===============================
import { 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = window.firebaseDB; // 🔥 IMPORTANTE

console.log("StarPicks Admin conectado a Firestore");

// ===============================
// VARIABLES
// ===============================
let jugadas = [];
let jugadaActualIndex = null;

// ===============================
// CARGAR JUGADAS
// ===============================
async function cargarJugadas() {
    const snapshot = await getDocs(collection(db, "jugadas"));
    jugadas = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    mostrarTabla();
    actualizarCuadroExcel();
    actualizarDashboard();
}

cargarJugadas();

// ===============================
// AGREGAR PRONÓSTICO
// ===============================
document.getElementById("agregarPronostico").addEventListener("click", () => {
    const div = document.createElement("div");
    div.classList.add("pronostico");

    div.innerHTML = `
        <input type="text" placeholder="Pronóstico" required>
        <select>
            <option value="pendiente">Pendiente</option>
            <option value="ganado">Ganado</option>
            <option value="perdido">Perdido</option>
        </select>
    `;

    document.getElementById("listaPronosticos").appendChild(div);
});

// ===============================
// GUARDAR JUGADA
// ===============================
document.getElementById("betForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const local = document.getElementById("local").value;
    const visita = document.getElementById("visita").value;
    const hora = document.getElementById("hora").value;
    const competicion = document.getElementById("competicion").value;

    const pronosticos = [];
    document.querySelectorAll(".pronostico").forEach(p => {
        pronosticos.push({
            nombre: p.querySelector("input").value,
            resultado: p.querySelector("select").value
        });
    });

    const cuotaTotal = parseFloat(document.getElementById("cuota").value);
    const stake = parseFloat(document.getElementById("stake").value);
    const tipoJugada = document.getElementById("tipoJugada").value;

    let resultadoFinal = "pendiente";
    if (pronosticos.every(p => p.resultado === "ganado")) resultadoFinal = "ganado";
    else if (pronosticos.some(p => p.resultado === "perdido")) resultadoFinal = "perdido";

    const nuevaJugada = {
        partido: `${local} vs ${visita}`,
        pronosticos,
        cuotaTotal,
        stake,
        fecha: new Date().toISOString().split("T")[0],
        hora,
        competicion,
        resultadoFinal,
        tipo: tipoJugada,
        likes: 0,
        dislikes: 0
    };

    await addDoc(collection(db, "jugadas"), nuevaJugada);

    alert("✔ Jugada guardada en Firebase");
    document.getElementById("betForm").reset();
    document.getElementById("listaPronosticos").innerHTML = "";

    cargarJugadas();
});

// ===============================
// TABLA
// ===============================
function mostrarTabla() {
    const tbody = document.querySelector("#tablaJugadas tbody");
    tbody.innerHTML = "";

    jugadas.forEach((j, index) => {
        const fila = document.createElement("tr");
        const esPremium = j.tipo === "premium";

        fila.innerHTML = `
            <td>${j.fecha}</td>
            <td>${j.hora || "--:--"}</td>

            <!-- 🔥 ORDEN CORREGIDO -->
            <td class="${esPremium ? 'premium-blur premium-lock premium-shine' : ''}">
                ${j.partido}
            </td>

            <td>${j.competicion || "Sin competencia"}</td>

            <td class="${esPremium ? 'premium-blur premium-lock premium-shine' : ''}">
                ${j.cuotaTotal}
            </td>

            <td class="${esPremium ? 'premium-blur premium-lock premium-shine' : ''}">
                ${j.stake}
            </td>

            <td class="${esPremium ? 'premium-blur premium-lock premium-shine' : ''}">
                ${j.pronosticos.map(p => `
                    <div>
                        ${p.nombre} →
                        ${
                            p.resultado === "ganado" ? "<span class='ok'>✔</span>" :
                            p.resultado === "perdido" ? "<span class='fail'>✘</span>" :
                            "<span class='pendiente'>⏳</span>"
                        }
                    </div>
                `).join("")}
            </td>

            <td class="${esPremium ? 'premium-blur premium-lock premium-shine' : ''}">
                ${
                    j.resultadoFinal === "ganado" ? "<span class='ok'>✔</span>" :
                    j.resultadoFinal === "perdido" ? "<span class='fail'>✘</span>" :
                    "<span class='pendiente'>⏳</span>"
                }
            </td>

            <td>
                <button class="btn-editar" onclick="editarJugada(${index})">Editar</button>
                <button class="btn-borrar" onclick="borrarJugada(${index})">X</button>
                ${esPremium ? `<button class="btn-desbloquear" onclick="desbloquearJugada(${index})">Desbloquear</button>` : ""}
            </td>
        `;

        tbody.appendChild(fila);
    });
}

// ===============================
// BORRAR JUGADA (CORREGIDO)
// ===============================
async function borrarJugada(index) {
    const jugada = jugadas[index];

    if (!jugada || !jugada.id) {
        alert("❌ Esta jugada ya no existe en Firebase.");
        cargarJugadas();
        return;
    }

    await deleteDoc(doc(db, "jugadas", jugada.id));
    cargarJugadas();
}

// ===============================
// EDITAR JUGADA (CORREGIDO)
// ===============================
function editarJugada(index) {
    jugadaActualIndex = index;

    const jugada = jugadas[index];
    const contenedor = document.getElementById("listaEditarPronosticos");

    contenedor.innerHTML = "";

    jugada.pronosticos.forEach((p, i) => {
        contenedor.innerHTML += `
            <div>
                <strong>${p.nombre}</strong>
                <select id="editPronostico_${i}">
                    <option value="pendiente" ${p.resultado === "pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="ganado" ${p.resultado === "ganado" ? "selected" : ""}>Ganado</option>
                    <option value="perdido" ${p.resultado === "perdido" ? "selected" : ""}>Perdido</option>
                </select>
            </div>
        `;
    });

    document.getElementById("modalEditar").style.display = "block";
}

document.getElementById("cerrarModalBtn").addEventListener("click", () => {
    document.getElementById("modalEditar").style.display = "none";
});

document.getElementById("guardarCambiosBtn").addEventListener("click", async () => {
    const jugada = jugadas[jugadaActualIndex];

    jugada.pronosticos.forEach((p, i) => {
        p.resultado = document.getElementById(`editPronostico_${i}`).value;
    });

    if (jugada.pronosticos.every(p => p.resultado === "ganado")) jugada.resultadoFinal = "ganado";
    else if (jugada.pronosticos.some(p => p.resultado === "perdido")) jugada.resultadoFinal = "perdido";
    else jugada.resultadoFinal = "pendiente";

    await updateDoc(doc(db, "jugadas", jugada.id), {
        pronosticos: jugada.pronosticos,
        resultadoFinal: jugada.resultadoFinal
    });

    document.getElementById("modalEditar").style.display = "none";
    cargarJugadas();
});

// ===============================
// DESBLOQUEAR PREMIUM
// ===============================
function desbloquearJugada(index) {
    const modal = document.getElementById("modalYape");
    modal.style.display = "block";
    window.jugadaParaDesbloquear = index;
}

document.getElementById("cerrarYapeBtn").addEventListener("click", () => {
    document.getElementById("modalYape").style.display = "none";
});

document.getElementById("confirmarPagoBtn").addEventListener("click", async () => {
    const index = window.jugadaParaDesbloquear;
    const jugada = jugadas[index];

    jugada.tipo = "free";

    await updateDoc(doc(db, "jugadas", jugada.id), { tipo: "free" });

    document.getElementById("modalYape").style.display = "none";
    alert("✔ Jugada desbloqueada correctamente");

    cargarJugadas();
});

// ===============================
// DASHBOARD
// ===============================
function actualizarDashboard() {

    let totalApostado = 0;
    let totalRecuperado = 0;
    let gananciaTotal = 0;

    let aciertos = 0;
    let fallas = 0;

    jugadas.forEach(j => {

        totalApostado += j.stake;

        if (j.resultadoFinal === "ganado") {
            aciertos++;
            totalRecuperado += j.stake * j.cuotaTotal;
        }

        if (j.resultadoFinal === "perdido") {
            fallas++;
        }
    });

    gananciaTotal = totalRecuperado - totalApostado;

    const roi = totalApostado > 0 ? ((gananciaTotal / totalApostado) * 100).toFixed(1) : 0;
    const yieldCalc = totalApostado > 0 ? ((totalRecuperado / totalApostado) * 100).toFixed(1) : 0;
    const porcentajeGlobal = (aciertos + fallas) > 0 ? ((aciertos / (aciertos + fallas)) * 100).toFixed(1) : 0;

    document.getElementById("gananciaTotal").textContent = gananciaTotal.toFixed(2);
    document.getElementById("totalApostado").textContent = totalApostado.toFixed(2);
    document.getElementById("totalRecuperado").textContent = totalRecuperado.toFixed(2);
    document.getElementById("roi").textContent = roi + "%";
    document.getElementById("yield").textContent = yieldCalc + "%";
    document.getElementById("porcentajeGlobal").textContent = porcentajeGlobal + "%";
}

// ===============================
// CUADRO HOY/SEMANA/MES/AÑO
// ===============================
function actualizarCuadroExcel() {

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    const semanaInicio = new Date(hoy);
    semanaInicio.setDate(hoy.getDate() - hoy.getDay());

    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    let hoyTotal = 0, hoyAciertos = 0, hoyFallas = 0;
    let semTotal = 0, semAciertos = 0, semFallas = 0;
    let mesTotal = 0, mesAciertos = 0, mesFallas = 0;
    let anioTotal = 0, anioAciertos = 0, anioFallas = 0;

    jugadas.forEach(j => {
        const fechaJugada = new Date(j.fecha + "T00:00:00");

        if (
            fechaJugada.getDate() === hoy.getDate() &&
            fechaJugada.getMonth() === hoy.getMonth() &&
            fechaJugada.getFullYear() === hoy.getFullYear()
        ) {
            hoyTotal++;
            if (j.resultadoFinal === "ganado") hoyAciertos++;
            if (j.resultadoFinal === "perdido") hoyFallas++;
        }

        if (fechaJugada >= semanaInicio) {
            semTotal++;
            if (j.resultadoFinal === "ganado") semAciertos++;
            if (j.resultadoFinal === "perdido") semFallas++;
        }

        if (fechaJugada.getMonth() === mesActual) {
            mesTotal++;
            if (j.resultadoFinal === "ganado") mesAciertos++;
            if (j.resultadoFinal === "perdido") mesFallas++;
        }

        if (fechaJugada.getFullYear() === anioActual) {
            anioTotal++;
            if (j.resultadoFinal === "ganado") anioAciertos++;
            if (j.resultadoFinal === "perdido") anioFallas++;
        }
    });

    document.getElementById("hoyCal").textContent =
        hoy.toLocaleDateString("es-PE", { weekday: "long", day: "numeric" });

    document.getElementById("semCal").textContent =
        "Semana " + Math.ceil(hoy.getDate() / 7);

    document.getElementById("mesCal").textContent =
        hoy.toLocaleDateString("es-PE", { month: "long" });

    document.getElementById("anioCal").textContent = anioActual;

    document.getElementById("hoyTotal").textContent = hoyTotal;
    document.getElementById("hoyAciertos").textContent = hoyAciertos;
    document.getElementById("hoyFallas").textContent = hoyFallas;
    document.getElementById("hoyPorcentaje").textContent =
        hoyTotal ? ((hoyAciertos / hoyTotal) * 100).toFixed(1) + "%" : "0%";

    document.getElementById("semTotal").textContent = semTotal;
    document.getElementById("semAciertos").textContent = semAciertos;
    document.getElementById("semFallas").textContent = semFallas;
    document.getElementById("semPorcentaje").textContent =
        semTotal ? ((semAciertos / semTotal) * 100).toFixed(1) + "%" : "0%";

    document.getElementById("mesTotal").textContent = mesTotal;
    document.getElementById("mesAciertos").textContent = mesAciertos;
    document.getElementById("mesFallas").textContent = mesFallas;
    document.getElementById("mesPorcentaje").textContent =
        mesTotal ? ((mesAciertos / mesTotal) * 100).toFixed(1) + "%" : "0%";

    document.getElementById("anioTotal").textContent = anioTotal;
    document.getElementById("anioAciertos").textContent = anioAciertos;
    document.getElementById("anioFallas").textContent = anioFallas;
    document.getElementById("anioPorcentaje").textContent =
        anioTotal ? ((anioAciertos / anioTotal) * 100).toFixed(1) + "%" : "0%";
}
