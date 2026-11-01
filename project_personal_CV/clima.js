
/**
 * clima.js - Conexión con la API meteorológica pública Open-Meteo
 */
async function obtenerClima() {
    const input = document.getElementById("ciudad-clima");
    const resultado = document.getElementById("resultado-clima");

    // 1. Tomamos la ciudad escrita por el usuario
    const ciudad = (input.value.trim() !== "") ? input.value.trim() : "Madrid";

    // 2. Mensaje de carga mientras la red responde
    resultado.className = "resultado-clima";
    resultado.innerHTML = `⏳ Consultando el clima para <strong>${ciudad}</strong>...`;

    try {
        // PASO 1: Obtener latitud y longitud
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1&language=es&format=json`;
        const resGeo = await fetch(geoUrl);

        if (!resGeo.ok) throw new Error("No se pudo conectar con el servicio de geocodificación.");

        const dataGeo = await resGeo.json();
        if (!dataGeo.results || dataGeo.results.length === 0) {
            resultado.className = "resultado-clima error";
            resultado.innerHTML = `❌ No se encontró la ciudad "<strong>${ciudad}</strong>".`;
            return;
        }

        const { latitude, longitude, name, country } = dataGeo.results[0];

        // PASO 2: Consultar la temperatura actual
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`;
        const resWeather = await fetch(weatherUrl);

        if (!resWeather.ok) throw new Error("El servicio meteorológico no respondió correctamente.");

        const dataWeather = await resWeather.json();
        const temp = dataWeather.current.temperature_2m;
        const unidad = dataWeather.current_units.temperature_2m;

        // PASO 3: Mostrar el resultado en el HTML
        resultado.className = "resultado-clima exito";
        resultado.innerHTML = `📍 En <strong>${name} (${country || ""})</strong> hay actualmente <strong>${temp} ${unidad}</strong> 🌤️`;

    } catch (error) {
        resultado.className = "resultado-clima error";
        resultado.innerHTML = `⚠️ Fallo de conexión o red: ${error.message}`;
    }
}

// Conectar el botón al cargar el documento
document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("btn-clima");
    const input = document.getElementById("ciudad-clima");

    if (boton) {
        boton.addEventListener("click", obtenerClima);
    }

    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") obtenerClima();
        });
    }

    // Consulta inicial automática para Madrid
    obtenerClima();
});
