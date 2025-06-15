'use client';

import { useState } from 'react';

export default function HomePage() {
  // Estado para el monto que se ingresa
  const [monto, setMonto] = useState<string>('');
  // Estado para guardar la lista de números generados
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateNumbers = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedNumbers([]);

    const montoNumerico = parseFloat(monto);
    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      setError('Por favor, ingresa un monto válido y positivo.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/generate-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ monto: montoNumerico }), // Enviamos el monto
      });

      const data = await response.json();

      if (!response.ok) {
        // Usamos el mensaje de error que viene del backend
        throw new Error(data.message || 'No se pudieron generar los números.');
      }

      setGeneratedNumbers(data.numbers); // Guardamos el array de números

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    if (generatedNumbers.length > 0) {
      // Unimos los números con comas para copiarlos

      if(generatedNumbers.length === 1) {
        const textToCopy = "Tu número para el sorteo es: " + generatedNumbers[0];
        navigator.clipboard.writeText(textToCopy);
        return alert('¡Número copiado al portapapeles!');
      }
        const textToCopy = "Tus números para el sorteo son: " + generatedNumbers.join(', ');
        navigator.clipboard.writeText(textToCopy);
        return alert('¡Números copiados al portapapeles!');
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>Generador de Números</h1>
        
        {/* Input para el monto */}
        <div style={styles.inputGroup}>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Ingresa el monto"
            style={styles.input}
            min="1"
          />
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={handleGenerateNumbers}
            disabled={isLoading || !monto}
            style={styles.button}
          >
            {isLoading ? 'Generando...' : 'Generar Números'}
          </button>
          <button
            onClick={handleCopyText}
            disabled={generatedNumbers.length === 0}
            style={styles.button}
          >
            Copiar Texto
          </button>
        </div>

        {/* Mostramos la lista de números generados */}
        {generatedNumbers.length > 0 && (
          <div style={styles.result}>
            <p>Números Generados:</p>
            <div style={styles.numberList}>
              {generatedNumbers.map((num) => (
                <span key={num} style={styles.number}>
                  {num}
                </span>
              ))}
            </div>
          </div>
        )}
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </main>
  );
}

// Añadimos estilos para el input y el contenedor de la lista de números
const styles = {
  main: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
  },
  container: {
    textAlign: 'center' as const,
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '90%',
    maxWidth: '500px',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '20px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    fontSize: '1rem',
    width: '80%',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#0070f3',
    color: 'white',
    transition: 'background-color 0.3s',
  },
  result: {
    marginTop: '20px',
    color: '#000000',
  },
  numberList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    gap: '15px',
    marginTop: '10px',
  },
  number: {
    fontSize: '2rem',
    fontWeight: 'bold' as const,
    color: '#0070f3',
    backgroundColor: '#eaf4ff',
    padding: '5px 15px',
    borderRadius: '8px',
  },
  error: {
    color: 'red',
    marginTop: '15px',
  },
};