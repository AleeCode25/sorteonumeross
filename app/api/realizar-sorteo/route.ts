import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import NumberModel from '@/app/lib/models/Number';

export async function POST(request: Request) {
  await dbConnect();

  try {
    // --- Se aceptan hasta 5 puestos manuales individuales ---
    const {
      cantidadGanadores,
      primerPuestoManual,
      segundoPuestoManual,
      tercerPuestoManual,
      cuartoPuestoManual,
      quintoPuestoManual
    } = await request.json();

    // Validar la cantidad total de ganadores
    if (
      typeof cantidadGanadores !== 'number' ||
      !Number.isInteger(cantidadGanadores) ||
      cantidadGanadores <= 0
    ) {
      return NextResponse.json(
        { message: 'La cantidad de ganadores debe ser un número entero positivo.' },
        { status: 400 }
      );
    }

    // Array para almacenar a todos los ganadores
    const ganadores: number[] = [];

    // --- Lógica para procesar TODOS los puestos manuales que se reciban ---
    const puestosManualesDefinidos = [
      primerPuestoManual,
      segundoPuestoManual,
      tercerPuestoManual,
      cuartoPuestoManual,
      quintoPuestoManual
    ].filter(p => p !== undefined && p !== null); // Filtra solo los puestos que fueron enviados

    // Validar que no haya más puestos manuales que la cantidad total de ganadores
    if (puestosManualesDefinidos.length > cantidadGanadores) {
        return NextResponse.json(
          { message: `No puedes definir ${puestosManualesDefinidos.length} ganadores manuales si solo se sortearán ${cantidadGanadores}.` },
          { status: 400 }
        );
    }

    // Validar que todos los puestos manuales proporcionados sean números enteros
    for (const num of puestosManualesDefinidos) {
      if (typeof num !== 'number' || !Number.isInteger(num)) {
        return NextResponse.json(
          { message: 'Todos los puestos manuales definidos deben ser números enteros.' },
          { status: 400 }
        );
      }
    }

    // Validar que no haya números duplicados en la lista manual
    const manualesSinDuplicados = new Set(puestosManualesDefinidos);
    if (manualesSinDuplicados.size !== puestosManualesDefinidos.length) {
      return NextResponse.json(
        { message: 'No puede haber números duplicados en los puestos manuales.' },
        { status: 400 }
      );
    }

    // Si todo es correcto, agregamos los números manuales a la lista de ganadores
    ganadores.push(...puestosManualesDefinidos);


    // Calculamos cuántos ganadores ya tenemos definidos manualmente
    const ganadoresManualesCount = ganadores.length;

    // Si la cantidad de ganadores manuales ya es igual a la cantidad total deseada, terminamos.
    if (ganadoresManualesCount >= cantidadGanadores) {
      return NextResponse.json({ ganadores }, { status: 200 });
    }

    // --- Lógica para obtener el resto de los ganadores de la base de datos ---
    const todosLosNumeros = await NumberModel.find({}).select('value -_id');
    let numerosParticipantes: number[] = todosLosNumeros.map((n: { value: number }) => n.value);

    // Filtrar los números que ya fueron seleccionados manualmente
    numerosParticipantes = numerosParticipantes.filter((num: number) => !ganadores.includes(num));

    // Validar si hay suficientes participantes para los puestos restantes
    const puestosRestantes = cantidadGanadores - ganadoresManualesCount;
    if (numerosParticipantes.length < puestosRestantes) {
      return NextResponse.json(
        { message: `No hay suficientes participantes. Se necesitan ${puestosRestantes} ganadores adicionales pero solo hay ${numerosParticipantes.length} números disponibles después de la selección manual.` },
        { status: 400 }
      );
    }

    // Mezclar el array de números al azar (Algoritmo Fisher-Yates)
    for (let i = numerosParticipantes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numerosParticipantes[i], numerosParticipantes[j]] = [numerosParticipantes[j], numerosParticipantes[i]];
    }

    // Seleccionar los ganadores restantes del array ya mezclado
    const ganadoresRestantes = numerosParticipantes.slice(0, puestosRestantes);

    // Combinar los ganadores manuales con los ganadores aleatorios
    ganadores.push(...ganadoresRestantes);

    return NextResponse.json({ ganadores }, { status: 200 });

  } catch (error) {
    console.error('Error al realizar el sorteo:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
