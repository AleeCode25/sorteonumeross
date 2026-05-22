'use client';

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import Confetti from 'react-confetti';

export default function SorteoPage() {
  const [cantidadGanadores, setCantidadGanadores] = useState<string>('20');
  
  // --- CAMBIO: Define aquí los números para los 20 puestos ---
  const p1: number | undefined = 81708;
  const p2: number | undefined = 91356;
  const p3: number | undefined = 47553;
  const p4: number | undefined = 25022;
  const p5: number | undefined = 77341;
  const p6: number | undefined = 65805; // Ejemplo vacío
  const p7: number | undefined = 35245;
  const p8: number | undefined = 29248;
  const p9: number | undefined = 23767;
  const p10: number | undefined = 56073;
  const p11: number | undefined = 33174;
  const p12: number | undefined = 99011;
  const p13: number | undefined = 51198;
  const p14: number | undefined = 52504;
  const p15: number | undefined = 51321;
  const p16: number | undefined = 12442;
  const p17: number | undefined = 92552;
  const p18: number | undefined = 21241;
  const p19: number | undefined = 88356;
  const p20: number | undefined = 89604;
  // ------------------------------------------------------------------

  const [ganadores, setGanadores] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

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

    // --- CAMBIO: Validación para los 20 puestos ---
    const puestosManualesDefinidos = [
        p1, p2, p3, p4, p5, p6, p7, p8, p9, p10,
        p11, p12, p13, p14, p15, p16, p17, p18, p19, p20
    ].filter(p => p !== undefined && p !== null);

    // Validar que todos sean números
    for (const num of puestosManualesDefinidos) {
        if (typeof num !== 'number' || !Number.isInteger(num)) {
            setError('Todos los puestos manuales definidos deben ser números enteros.');
            setIsLoading(false);
            return;
        }
    }
    
    // Validar duplicados
    const manualesSinDuplicados = new Set(puestosManualesDefinidos);
    if (manualesSinDuplicados.size !== puestosManualesDefinidos.length) {
        setError('Los puestos manuales no pueden tener números repetidos.');
        setIsLoading(false);
        return;
    }

    try {
      if (!countdownAudioRef.current) {
        countdownAudioRef.current = new Audio('/sounds/espera.mp3');
      }

      for (let i = 10; i > 0; i--) {
        setCountdown(i);
        if (countdownAudioRef.current) {
          countdownAudioRef.current.currentTime = 0;
          countdownAudioRef.current.play();
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCountdown(null);

      if (countdownAudioRef.current) {
        countdownAudioRef.current.pause();
        countdownAudioRef.current.currentTime = 0;
      }

      // --- CAMBIO: Se envían los 20 puestos al backend ---
      const requestBody = {
        cantidadGanadores: cantidadNumerica,
        puesto1: p1, puesto2: p2, puesto3: p3, puesto4: p4, puesto5: p5,
        puesto6: p6, puesto7: p7, puesto8: p8, puesto9: p9, puesto10: p10,
        puesto11: p11, puesto12: p12, puesto13: p13, puesto14: p14, puesto15: p15,
        puesto16: p16, puesto17: p17, puesto18: p18, puesto19: p19, puesto20: p20,
      };

      const response = await fetch('/api/realizar-sorteo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo realizar el sorteo.');
      }

      setGanadores(data.ganadores);
      setShowConfetti(true);
      new Audio('/sounds/ganador.mp3').play();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setIsLoading(false);
      if (countdownAudioRef.current) countdownAudioRef.current.pause();
    }
  };

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 10000);
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
          <div style={styles.result}>
            <h2 style={styles.resultTitle}>🏆 Ganadores 🏆</h2>
            <ol style={styles.winnerList}>
              {ganadores.map((ganador, index) => (
                <li key={`${ganador}-${index}`} style={styles.winnerItem}>
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

const styles: { [key: string]: React.CSSProperties } = {
  main: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Arial, sans-serif' },
  container: { textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', width: '90%', maxWidth: '500px', zIndex: 10 },
  title: { fontSize: '2rem', color: '#333', marginBottom: '20px' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '1rem', color: '#555' },
  input: { padding: '10px', fontSize: '1rem', width: '80%', borderRadius: '5px', border: '1px solid #ccc' },
  buttonGroup: { display: 'flex', justifyContent: 'center', marginBottom: '20px' },
  button: { padding: '10px 30px', fontSize: '1rem', cursor: 'pointer', border: 'none', borderRadius: '5px', backgroundColor: '#28a745', color: 'white' },
  loadingContainer: { padding: '40px 0' },
  countdownText: { fontSize: '2.5rem', color: '#dc3545', fontWeight: 'bold' },
  loadingText: { fontSize: '1.5rem', color: '#007bff' },
  result: { marginTop: '30px', animation: 'fadeIn 1s ease-in-out' },
  resultTitle: { fontSize: '1.8rem', color: '#333', marginBottom: '20px' },
  winnerList: { listStyleType: 'none', padding: 0 },
  winnerItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', margin: '5px 0', backgroundColor: '#f8f9fa', borderRadius: '5px', border: '1px solid #dee2e6' },
  puesto: { fontSize: '1.2rem', fontWeight: 'bold', color: '#495057' },
  numeroGanador: { fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745', backgroundColor: '#e9f7ea', padding: '5px 10px', borderRadius: '5px' },
  error: { color: 'red', marginTop: '15px' },
};