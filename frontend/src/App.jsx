import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import moment from "moment";

import "./App.css";
import { listaDuas } from "./duas"; // Añade esto arriba con los otros imports

// Quita la barra inclinada inicial si te sigue dando error,
// o asegúrate de que coincida exactamente con el nombre del archivo
const backgrounds = [
  "Kaaba_111.jpg",
  "Medina-12-scaled.jpg",
  "m1.jpg",
  "m2.jpg",
  "m3.jpg",
  "m4.jpg",
]; // Añade más imágenes a esta carpeta y aquí

moment.locale("es"); // Configura moment en español globalmente

const App = () => {
  const [times, setTimes] = useState(null);
  const [hijriDate, setHijriDate] = useState("");
  const [currentTime, setCurrentTime] = useState(moment());
  const [bgIndex, setBgIndex] = useState(0);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Por defecto ponemos Sevilla, ya que estás allí
  const [city, setCity] = useState("Seville");
  const [country, setCountry] = useState("Spain");

  // const cities = [
  //   { name: "Sevilla", val: "Seville", country: "Spain" },
  //   { name: "Madrid", val: "Madrid", country: "Spain" },
  //   { name: "Granada", val: "Granada", country: "Spain" },
  //   { name: "Málaga", val: "Malaga", country: "Spain" },
  //   { name: "Córdoba", val: "Cordoba", country: "Spain" },
  //   { name: "Tánger", val: "Tangier", country: "Morocco" },
  //   { name: "Casablanca", val: "Casablanca", country: "Morocco" },
  //   { name: "Tetuán", val: "Tetouan", country: "Morocco" },
  // ];

  const cities = [
    // España
    { name: "Sevilla", val: "Seville", country: "Spain" },
    { name: "Madrid", val: "Madrid", country: "Spain" },
    { name: "Granada", val: "Granada", country: "Spain" },
    { name: "Málaga", val: "Malaga", country: "Spain" },
    { name: "Córdoba", val: "Cordoba", country: "Spain" },
    { name: "Barcelona", val: "Barcelona", country: "Spain" },
    { name: "Valencia", val: "Valencia", country: "Spain" },
    { name: "Bilbao", val: "Bilbao", country: "Spain" },

    // Marruecos
    { name: "Tánger", val: "Tangier", country: "Morocco" },
    { name: "Casablanca", val: "Casablanca", country: "Morocco" },
    { name: "Tetuán", val: "Tetouan", country: "Morocco" },
    { name: "Rabat", val: "Rabat", country: "Morocco" },
    { name: "Kenitra", val: "Kenitra", country: "Morocco" },
    { name: "Fez", val: "Fes", country: "Morocco" },
    { name: "Marrakech", val: "Marrakesh", country: "Morocco" },
    { name: "Agadir", val: "Agadir", country: "Morocco" },
    { name: "Esauira", val: "Essaouira", country: "Morocco" },
    { name: "Mequinez", val: "Meknes", country: "Morocco" },
    { name: "Oujda", val: "Oujda", country: "Morocco" },

    // Francia
    { name: "París", val: "Paris", country: "France" },
    { name: "Marsella", val: "Marseille", country: "France" },
    { name: "Lyon", val: "Lyon", country: "France" },
    { name: "Burdeos", val: "Bordeaux", country: "France" },
    { name: "Niza", val: "Nice", country: "France" },

    // Estados Unidos
    { name: "Nueva York", val: "New York", country: "USA" },
    { name: "Los Ángeles", val: "Los Angeles", country: "USA" },
    { name: "Chicago", val: "Chicago", country: "USA" },
    { name: "Miami", val: "Miami", country: "USA" },
    { name: "San Francisco", val: "San Francisco", country: "USA" },

    // Inglaterra
    { name: "Londres", val: "London", country: "United Kingdom" },
    { name: "Mánchester", val: "Manchester", country: "United Kingdom" },
    { name: "Liverpool", val: "Liverpool", country: "United Kingdom" },
    { name: "Birmingham", val: "Birmingham", country: "United Kingdom" },
    { name: "Bristol", val: "Bristol", country: "United Kingdom" },
  ];

  // Referencia al audio (asegúrate que el nombre en public coincida)
  const audioRef = useRef(new Audio("/athan.mp3"));

  const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  const ARABIC_NAMES = {
    Fajr: "الفجر",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء",
  };

  const getHijriDateNative = () => {
    const date = new Date();

    // 1. Formato completo en Castellano
    const espParts = new Intl.DateTimeFormat(
      "es-u-ca-islamic-umalqura-nu-latn",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).formatToParts(date);

    // 2. Formato completo en Árabe
    const araParts = new Intl.DateTimeFormat(
      "ar-u-ca-islamic-umalqura-nu-latn",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).formatToParts(date);

    // Extraemos las piezas que queremos
    const diaSemanaEsp = espParts.find((p) => p.type === "weekday").value;
    const diaNum = espParts.find((p) => p.type === "day").value;
    const mesEsp = espParts.find((p) => p.type === "month").value;
    const anio = espParts.find((p) => p.type === "year").value;

    const diaSemanaAra = araParts.find((p) => p.type === "weekday").value;
    const mesAra = araParts.find((p) => p.type === "month").value;

    // Resultado: "Sábado, 2 de Shawwal (شوال) de 1447 | السبت"
    return `${diaSemanaEsp}, ${diaNum} de ${mesEsp} (${mesAra}) de ${anio} AH | ${diaSemanaAra}`;
  };

  // 1. Estados nuevos
  // 1. Estados nuevos (Actualizado con todos los idiomas)
  const [ayah, setAyah] = useState({
    arabic: "جاري التحميل",
    spanish: "Cargando...",
    english: "Loading...",
    french: "Chargement...",
    ref: "",
  });

  // Estado para el Dua (Súplica)
  const [dua, setDua] = useState({
    arabic: "جاري التحميل",
    spanish: "Cargando Dua...",
    english: "Loading Dua...",
    french: "Chargement Dua...",
    ref: "",
  });

  // 2. Función para traer una Ayah aleatoria
  const fetchRandomAyah = async () => {
    try {
      const randomId = Math.floor(Math.random() * 6236) + 1;

      // Usamos Promise.all para eficiencia
      const [arRes, esRes, enRes, frRes] = await Promise.all([
        axios.get(`https://api.alquran.cloud/v1/ayah/${randomId}`),
        axios.get(`https://api.alquran.cloud/v1/ayah/${randomId}/es.cortes`),
        axios.get(`https://api.alquran.cloud/v1/ayah/${randomId}/en.asad`),
        axios.get(
          `https://api.alquran.cloud/v1/ayah/${randomId}/fr.hamidullah`
        ),
      ]);

      // Verificación de seguridad: extraemos el texto comprobando que la ruta existe
      setAyah({
        arabic: arRes.data.data.text || "No disponible",
        spanish: esRes.data.data.text || "No disponible",
        english: enRes.data.data.text || "Not available",
        french: frRes.data.data.text || "Pas disponible",
        ref: `${arRes.data.data.surah.englishName} ${arRes.data.data.surah.number}:${arRes.data.data.numberInSurah}`,
      });

      console.log("Ayah cargada correctamente trilingüe");
    } catch (err) {
      console.error(
        "Error detallado en la API:",
        err.response ? err.response.data : err.message
      );
      // Si falla un idioma, mantenemos los otros o mostramos error
    }
  };

  const fetchRandomDua = () => {
    const random = listaDuas[Math.floor(Math.random() * listaDuas.length)];
    setDua(random);
    console.log("Dua cargado desde fichero local");
  };

  // const fetchRandomDua = async () => {
  //   try {
  //     // Usamos una API alternativa de Adhkar/Duas más estable
  //     const res = await axios.get("https://contact-f9828.pw/api/adhkar/daily");

  //     // La estructura de esta API suele ser un array de objetos
  //     const randomDua = res.data[Math.floor(Math.random() * res.data.length)];

  //     setDua({
  //       arabic: randomDua.content || randomDua.text || "لا إله إلا الله",
  //       english: randomDua.translation_en || "Glory be to Allah",
  //       spanish: randomDua.translation_es || "Súplica espiritual",
  //       french: randomDua.translation_fr || "Invocation",
  //       ref: randomDua.category || "Hisn al-Muslim",
  //     });

  //     console.log("Dua cargado correctamente desde nueva API");
  //   } catch (err) {
  //     console.error("Error en API de Dua, usando Dua de respaldo:", err);
  //     // Si la API falla, cargamos uno manual para que NUNCA salga "Cargando..."
  //     setDua({
  //       arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
  //       english: "Glory be to Allah and His is the praise",
  //       spanish: "Glorificado sea Allah y Suya es la alabanza",
  //       french: "Gloire et louange à Allah",
  //       ref: "Respaldo",
  //     });
  //   }
  // };

  // 3. Efecto para cambiarla cada 30 segundos
  useEffect(() => {
    // Cargamos primero la Ayah
    fetchRandomAyah();

    // Esperamos un segundo antes de cargar el Dua para no saturar
    const timerDua = setTimeout(() => {
      fetchRandomDua();
    }, 1000);

    const interval = setInterval(() => {
      fetchRandomAyah();
      fetchRandomDua();
    }, 45000);

    return () => {
      clearInterval(interval);
      clearTimeout(timerDua);
    };
  }, []);

  // 1. Cargar datos del Backend
  useEffect(() => {
    const fetchData = async () => {
      // Detecta si estás en local o en producción
      const API_BASE_URL =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
          ? "http://127.0.0.1:8000"
          : "https://mihorariosalat.pythonanywhere.com";

      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/schedule?city=${city}&country=${country}`
        );

        if (res.data && res.data.timings) {
          setTimes(res.data.timings);
        }
      } catch (err) {
        console.error("Error al obtener datos:", err);
      }
    };
    fetchData();
  }, [city, country]); // <--- Importante: se dispara cada vez que cambies el combo

  // 2. Lógica del Reloj y Cuenta atrás
  useEffect(() => {
    const timer = setInterval(() => {
      const now = moment();
      setCurrentTime(now);
      if (times) {
        PRAYER_NAMES.forEach((p) => {
          // Comprobamos si es la hora exacta (segundo 00) para el Adán
          if (now.format("HH:mm:ss") === `${times[p].split(" ")[0]}:00`) {
            triggerAdan(p);
          }
        });
        calculateCountdown(now);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [times]);

  // 3. Cambio de fondo cada 10 segundos
  // 3. Cambio de fondo cada 10 segundos (DINÁMICO)
  useEffect(() => {
    const bgTimer = setInterval(
      // El % backgrounds.length hará que funcione con 2, con 6 o con 100 fotos
      () => setBgIndex((prev) => (prev + 1) % backgrounds.length),
      10000
    );
    return () => clearInterval(bgTimer);
  }, []); // No olvides dejar el array vacío aquí para que no se vuelva loco

  // Añade este efecto debajo de tus otros useEffect
  useEffect(() => {
    if (isMuted) {
      audioRef.current.pause();
      // Opcional: audioRef.current.currentTime = 0; // Si quieres que al desmutear empiece de cero
    }
  }, [isMuted]);

  const calculateCountdown = (now) => {
    let next = null;
    for (const p of PRAYER_NAMES) {
      const pTime = moment(times[p].split(" ")[0], "HH:mm");
      if (pTime.isAfter(now)) {
        next = { name: p, time: pTime };
        break;
      }
    }
    if (!next) {
      next = {
        name: "Fajr",
        time: moment(times["Fajr"].split(" ")[0], "HH:mm").add(1, "day"),
      };
    }

    const dur = moment.duration(next.time.diff(now));
    setNextPrayer({
      name: next.name,
      countdown: `${dur.hours()}h ${dur.minutes()}m ${dur.seconds()}s`,
    });
  };

  const triggerAdan = (name) => {
    if (isMuted) return; // Si está silenciado, no hace nada

    audioRef.current.volume = 0;
    audioRef.current.play().catch((e) => console.log("Error audio:", e));

    let vol = 0;
    const interval = setInterval(() => {
      if (vol < 1) {
        vol += 0.1;
        audioRef.current.volume = Math.min(vol, 1).toFixed(1);
      } else {
        clearInterval(interval);
      }
    }, 300);

    Swal.fire({
      title: `¡Es la hora de ${name}!`,
      text: "Allahu Akbar",
      imageUrl: backgrounds[bgIndex],
      imageWidth: 400,
      background: "#1a1a1a",
      color: "#fff",
      timer: 180000,
      showConfirmButton: false,
    }).then(() => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    });
  };

  if (!times)
    return (
      <div className="loading-container">Cargando horarios espirituales...</div>
    );

  return (
    <div
      className="main-container"
      style={{ backgroundImage: `url(${backgrounds[bgIndex]})` }}
    >
      <div className="overlay">
        <div className="city-selector-container">
          <select
            className="city-select"
            value={city}
            onChange={(e) => {
              const selected = cities.find((c) => c.val === e.target.value);
              setCity(selected.val);
              setCountry(selected.country);
            }}
          >
            {cities.map((c) => (
              <option key={c.val} value={c.val}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {/* BOTÓN DE SALIR (A LA IZQUIERDA DEL MUTE) */}
        <button
          className="exit-btn"
          onClick={() => {
            window.open("", "_self", ""); // Engañamos al navegador
            window.close();
          }}
          title="Salir"
        >
          ✕
        </button>
        <button
          className="mute-btn"
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? "Activar sonido" : "Silenciar"}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
        <header className="top-section">
          <h2 className="time-big">{currentTime.format("HH:mm:ss")}</h2>
          <div className="date-text">
            {/* Fecha Normal */}
            <span style={{ opacity: 0.8 }}>
              {currentTime.format("dddd, D [de] MMMM [de] YYYY")}
            </span>

            {/* Fecha Hijri con mes árabe */}
            <span className="hijri-highlight">{getHijriDateNative()}</span>
          </div>
        </header>

        {nextPrayer && (
          <main className="middle-section">
            <div className="floating-box">
              <h3>
                Siguiente oración:{" "}
                <span className="prayer-name">{nextPrayer.name}</span>
              </h3>
              <p className="countdown-text">Quedan {nextPrayer.countdown}</p>
            </div>
          </main>
        )}
        <section className="spiritual-container">
          {/* COLUMNA 1: AYAH (CORÁN) */}
          <div className="spiritual-card ayah-column">
            <span className="source-badge quran-badge">MENSAJE CORÁNICO</span>
            <p className="ayah-arabic">{ayah.arabic}</p>

            <div className="trilingual-translations">
              <p className="ayah-text">
                <span>🇪🇸</span> "{ayah.spanish}"
              </p>
              <p className="ayah-text">
                <span>🇬🇧</span> "{ayah.english}"
              </p>
              <p className="ayah-text">
                <span>🇫🇷</span> "{ayah.french}"
              </p>
            </div>
            <small className="source-ref">{ayah.ref}</small>
          </div>
          <div className="vertical-divider"></div> {/* Separador elegante */}
          {/* COLUMNA 2: DUA (SÚPLICA) */}
          <div className="spiritual-card dua-column">
            <span className="source-badge dua-badge">SÚPLICA (DUA)</span>
            <p className="ayah-arabic">{dua.arabic}</p>

            <div className="trilingual-translations">
              {/* Mostramos inglés como traducción principal si el Dua no tiene nativo español */}
              <p className="ayah-text">
                <span>🇬🇧</span> "{dua.english}"
              </p>
              <p className="ayah-text">
                <span>🇪🇸</span> "{dua.spanish}"
              </p>
              <p className="ayah-text">
                <span>🇫🇷</span> "{dua.french}"
              </p>
            </div>
            <small className="source-ref">{dua.ref}</small>
          </div>
        </section>
        <footer className="bottom-section">
          <div className="prayer-bar">
            {PRAYER_NAMES.map((p) => {
              const isNext = nextPrayer && nextPrayer.name === p;
              return (
                <div
                  key={p}
                  className={`prayer-item ${isNext ? "active" : ""}`}
                >
                  <span>
                    {p}
                    <small
                      style={{
                        display: "block",
                        fontSize: "0.7rem",
                        opacity: 0.8,
                      }}
                    >
                      {ARABIC_NAMES[p]}
                    </small>
                  </span>
                  <strong>{times[p].split(" ")[0]}</strong>
                </div>
              );
            })}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
