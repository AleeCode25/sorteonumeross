'use client';

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import Confetti from 'react-confetti';

export default function SorteoPage() {
  const [cantidadGanadores, setCantidadGanadores] = useState<string>('1');
  
  // --- Variables para los puestos manuales (NO son estados de UI) ---
  // Define aquí los números que quieres para el primer y segundo puesto.
  // Si no quieres un puesto manual, déjalo como 'undefined' o 'null'.
  const primerPuestoDefinido: number | undefined | null = null; // Ejemplo: El número 1010 será el primer ganador
  const segundoPuestoDefinido: number | undefined | null = null; // Ejemplo: El número 2020 será el segundo ganador
  // Si no quieres segundo puesto manual:
  // const segundoPuestoDefinido: number | undefined = undefined; 
  // ------------------------------------------------------------------

  const [ganadores, setGanadores] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // La referencia para nuestro "reproductor" único de audio
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleRealizarSorteo = async () => {
    setIsLoading(true);
    setError(null);
    setGanadores([]);
    setShowConfetti(false);

    const cantidadNumerica = parseInt(cantidadGanadores, 10);
    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
      setError('Por favor, ingresa una cantidad válida de ganadores.');
      setIsLoading(false);
      return;
    }

    // --- Validación de los puestos manuales (sigue siendo importante) ---
    if (primerPuestoDefinido !== undefined && !Number.isInteger(primerPuestoDefinido)) {
        setError('El primer puesto manual definido debe ser un número entero válido.');
        setIsLoading(false);
        return;
    }
    if (segundoPuestoDefinido !== undefined && !Number.isInteger(segundoPuestoDefinido)) {
        setError('El segundo puesto manual definido debe ser un número entero válido.');
        setIsLoading(false);
        return;
    }
    // Si ambos puestos manuales son iguales y distintos de vacío
    if (primerPuestoDefinido !== undefined && segundoPuestoDefinido !== undefined && primerPuestoDefinido === segundoPuestoDefinido) {
        setError('El primer y segundo puesto manual no pueden ser el mismo número.');
        setIsLoading(false);
        return;
    }
    // --------------------------------------------------------------------

    try {
      // 1. Creamos el objeto de audio UNA SOLA VEZ y lo guardamos en la referencia
      if (!countdownAudioRef.current) {
        countdownAudioRef.current = new Audio('/sounds/espera.mp3');
      }

      // Bucle de la cuenta regresiva
      for (let i = 10; i > 0; i--) {
        setCountdown(i);

        if (countdownAudioRef.current) {
          // 2. Reiniciamos el sonido al principio y lo reproducimos
          countdownAudioRef.current.currentTime = 0;
          countdownAudioRef.current.play();
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCountdown(null);

      // 3. Detenemos el sonido del conteo definitivamente
      if (countdownAudioRef.current) {
        countdownAudioRef.current.pause();
        countdownAudioRef.current.currentTime = 0;
      }

      // Preparamos el cuerpo de la solicitud con los puestos manuales definidos por variable
      const requestBody = {
        cantidadGanadores: cantidadNumerica,
        primerPuestoManual: primerPuestoDefinido, // Usamos la variable constante
        segundoPuestoManual: segundoPuestoDefinido, // Usamos la variable constante
      };

      const response = await fetch('/api/realizar-sorteo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo realizar el sorteo.');
      }

      setGanadores(data.ganadores);
      setShowConfetti(true);

      // Reproducimos el sonido del ganador (este sí puede ser nuevo cada vez)
      new Audio('/sounds/ganador.mp3').play();

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setIsLoading(false);
      if (countdownAudioRef.current) {
        countdownAudioRef.current.pause();
      }
    }
  };

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <main style={styles.main}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      <div style={styles.container}>
        <h1 style={styles.title}>Realizar Sorteo</h1>
        {!isLoading && (
          <>
            <div style={styles.inputGroup}>
              <label htmlFor="cantidad" style={styles.label}>Cantidad de Ganadores:</label>
              <input
                id="cantidad"
                type="number"
                value={cantidadGanadores}
                onChange={(e) => setCantidadGanadores(e.target.value)}
                style={styles.input}
                min="1"
              />
            </div>

            {/* Los campos para los puestos manuales YA NO ESTÁN VISIBLES AQUÍ */}

            <div style={styles.buttonGroup}>
              <button onClick={handleRealizarSorteo} disabled={isLoading} style={styles.button}>Sortear</button>
            </div>
          </>
        )}
        {isLoading && (
          <div style={styles.loadingContainer}>
            {countdown !== null ? (
              <p style={styles.countdownText}>Sorteando en {countdown}...</p>
            ) : (
              <p style={styles.loadingText}>Buscando ganadores...</p>
            )}
          </div>
        )}
        {!isLoading && ganadores.length > 0 && (
          <div style={{...styles.result, animation: 'fadeIn 1s ease-in-out'}}>
            <h2 style={styles.resultTitle}>🏆 Ganadores 🏆</h2>
            <ol style={styles.winnerList}>
              {ganadores.map((ganador, index) => (
                <li key={ganador} style={styles.winnerItem}>
                  <span style={styles.puesto}>{index + 1}° Puesto:</span>
                  <span style={styles.numeroGanador}>{ganador}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </main>
  );
}

// Estilos sin cambios
const styles: { [key: string]: React.CSSProperties } = {
  main: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Arial, sans-serif' },
  container: { textAlign: 'center' as const, padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', width: '90%', maxWidth: '500px', zIndex: 10 },
  title: { fontSize: '2rem', color: '#333', marginBottom: '20px' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '1rem', color: '#555' },
  input: { padding: '10px', fontSize: '1rem', width: '80%', borderRadius: '5px', border: '1px solid #ccc' },
  buttonGroup: { display: 'flex', justifyContent: 'center', marginBottom: '20px' },
  button: { padding: '10px 30px', fontSize: '1rem', cursor: 'pointer', border: 'none', borderRadius: '5px', backgroundColor: '#28a745', color: 'white' },
  loadingContainer: { padding: '40px 0' },
  countdownText: { fontSize: '2.5rem', color: '#dc3545', fontWeight: 'bold' as const, animation: 'blink 1s linear infinite' },
  loadingText: { fontSize: '1.5rem', color: '#007bff' },
  result: { marginTop: '30px' },
  resultTitle: { fontSize: '1.8rem', color: '#333', marginBottom: '20px' },
  winnerList: { listStyleType: 'none', padding: 0 },
  winnerItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', margin: '5px 0', backgroundColor: '#f8f9fa', borderRadius: '5px', border: '1px solid #dee2e6' },
  puesto: { fontSize: '1.2rem', fontWeight: 'bold' as const, color: '#495057' },
  numeroGanador: { fontSize: '1.5rem', fontWeight: 'bold' as const, color: '#28a745', backgroundColor: '#e9f7ea', padding: '5px 10px', borderRadius: '5px' },
  error: { color: 'red', marginTop: '15px' },
};