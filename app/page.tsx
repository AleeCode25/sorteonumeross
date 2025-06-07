import React from 'react';

// Este componente representa una página simple con un texto centrado.
export default function InfoPage() {
  return (
    // El elemento <main> actúa como el contenedor principal.
    // Le aplicamos estilos para que ocupe toda la pantalla y centre su contenido.
    <main style={styles.mainContainer}>
      {/* El texto que quieres mostrar */}
      <h1 style={styles.centeredText}>
        sistema de sorteo by ReySanto
      </h1>
    </main>
  );
}

// Objeto de estilos para mantener el código limpio y organizado.
const styles: { [key: string]: React.CSSProperties } = {
  // Estilo para el contenedor principal
  mainContainer: {
    display: 'flex', // Activa Flexbox para alinear fácilmente el contenido.
    justifyContent: 'center', // Centra el contenido horizontalmente.
    alignItems: 'center', // Centra el contenido verticalmente.
    minHeight: '100vh', // Asegura que el contenedor ocupe al menos el 100% de la altura de la pantalla.
    backgroundColor: '#1a1a1a', // Un fondo oscuro para que el texto resalte.
    color: '#ffffff', // Color del texto blanco.
    fontFamily: 'Arial, sans-serif', // Una fuente estándar y legible.
  },
  // Estilo para el texto
  centeredText: {
    fontSize: '2rem', // Un tamaño de fuente grande y visible.
    fontWeight: 'bold', // Texto en negrita.
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Una sombra sutil para dar profundidad.
  },
};