
const http = require("http");
const fs = require("fs");
const path = require("path");
const net = require("net");

const servidor = http.createServer((req, res) => {

    // Página principal
    if (req.method === "GET" && req.url === "/") {

        res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8"
        });

        fs.createReadStream(
            path.join(__dirname, "index.html")
        ).pipe(res);

        return;
    }

    // Registro de participación
    if (req.method === "POST" && req.url === "/registrar") {

        let cuerpo = "";
        let excedido = false;

        req.on("data", parte => {

            cuerpo += parte;

            if (Buffer.byteLength(cuerpo) > 10000) {
                excedido = true;
                req.destroy();
            }

        });

        req.on("end", () => {

            if (excedido) return;

            try {

                const datos = JSON.parse(cuerpo);

                // Validar nombre
                const nombre = String(datos.nombre || "")
                    .trim()
                    .slice(0, 60);

                if (!nombre) {
                    res.writeHead(400);
                    res.end("Nombre requerido");
                    return;
                }

                // Obtener la IP reenviada por Render
                const forwarded = req.headers["x-forwarded-for"];

                let ip = "No disponible";

                if (typeof forwarded === "string") {

                    // Se toma el primer elemento de la lista
                    const primeraIP = forwarded
                        .split(",")[0]
                        .trim();

                    // Comprobar que tenga formato IPv4 o IPv6
                    if (net.isIP(primeraIP)) {
                        ip = primeraIP;
                    }

                }

                // Preparar datos técnicos
                const navegador = String(
                    datos.navegador || ""
                ).slice(0, 500);

                const sistema = String(
                    datos.plataforma || ""
                ).slice(0, 100);

                const idioma = String(
                    datos.idioma || ""
                ).slice(0, 30);

                const pantalla = String(
                    datos.pantalla || ""
                ).slice(0, 30);

                const movil = Boolean(datos.movil);

                // Mostrar participación en Render Logs
                console.log("\n================================");
                console.log("NUEVA PARTICIPACION EDUCATIVA");
                console.log("================================");

                console.log("Nombre:", nombre);
                console.log("IP pública observada:", ip);
                console.log("Navegador:", navegador);
                console.log("Sistema:", sistema);
                console.log("Dispositivo móvil:", movil);
                console.log("Idioma:", idioma);
                console.log("Pantalla:", pantalla);

                console.log(
                    "Fecha:",
                    new Date().toLocaleString("es-MX", {
                        timeZone: "America/Mexico_City"
                    })
                );

                console.log("================================\n");

                res.writeHead(200, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    correcto: true
                }));

            } catch (error) {

                console.error("Error al procesar participación");

                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    correcto: false
                }));

            }

        });

        return;
    }

    // Ruta no encontrada
    res.writeHead(404, {
        "Content-Type": "text/plain"
    });

    res.end("Página no encontrada");

});

const PUERTO = process.env.PORT || 3000;

servidor.listen(PUERTO, "0.0.0.0", () => {

    console.log("================================");
    console.log("LABORATORIO DE PRIVACIDAD");
    console.log("Servidor iniciado correctamente");
    console.log("Puerto:", PUERTO);
    console.log("================================");

});
