console.log("StarPicks Público v3 iniciado...");

// CARGAR JUGADAS DEL LOCALSTORAGE
let jugadas = JSON.parse(localStorage.getItem("jugadas")) || [];

// CARGAR VOTOS DEL USUARIO
let votos = JSON.parse(localStorage.getItem("votosStarPicks")) || {}; 

// MOSTRAR TABLA PÚBLICA
function mostrarTablaPublica() {
    const tbody = document.querySelector("#tablaJugadas tbody");
    tbody.innerHTML = "";

    jugadas.forEach((j, index) => {
        const yaVoto = votos[index]; 

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${j.fecha}</td>
            <td>${j.hora || "--:--"}</td>
            <td>${j.competicion || "Sin competencia"}</td>
            <td>${j.partido}</td>
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

            <td>
                <span class="like-btn ${yaVoto === 'like' ? 'votado' : ''}" onclick="likeJugada(${index})">👍</span>
                <span class="dislike-btn ${yaVoto === 'dislike' ? 'votado' : ''}" onclick="dislikeJugada(${index})">👎</span>

                &nbsp;&nbsp; 👍 ${j.likes || 0}
                &nbsp;&nbsp; 👎 ${j.dislikes || 0}
            </td>
        `;

        tbody.appendChild(fila);
    });
}

// LIKE
function likeJugada(jIndex) {
    if (votos[jIndex]) return alert("Ya votaste esta jugada");

    jugadas[jIndex].likes = (jugadas[jIndex].likes || 0) + 1;

    votos[jIndex] = "like";
    localStorage.setItem("votosStarPicks", JSON.stringify(votos));
    localStorage.setItem("jugadas", JSON.stringify(jugadas));

    mostrarTablaPublica();
}

// DISLIKE
function dislikeJugada(jIndex) {
    if (votos[jIndex]) return alert("Ya votaste esta jugada");

    jugadas[jIndex].dislikes = (jugadas[jIndex].dislikes || 0) + 1;

    votos[jIndex] = "dislike";
    localStorage.setItem("votosStarPicks", JSON.stringify(votos));
    localStorage.setItem("jugadas", JSON.stringify(jugadas));

    mostrarTablaPublica();
}

// INICIO
mostrarTablaPublica();
