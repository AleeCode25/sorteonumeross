import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import NumberModel from '@/app/lib/models/Number';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { cantidadGanadores, primerPuestoManual, segundoPuestoManual } = await request.json();

    // Validar la cantidad de ganadores
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

    // Array para almacenar a los ganadores
    const ganadores: number[] = [];

    // --- Lógica para los puestos manuales ---
    // Si se proporciona un primer puesto manual, lo agregamos y validamos
    if (primerPuestoManual !== undefined && primerPuestoManual !== null) {
      if (typeof primerPuestoManual !== 'number' || !Number.isInteger(primerPuestoManual)) {
        return NextResponse.json(
          { message: 'El primer puesto manual debe ser un número entero.' },
          { status: 400 }
        );
      }
      ganadores.push(primerPuestoManual);
    }

    // Si se proporciona un segundo puesto manual, lo agregamos y validamos
    if (segundoPuestoManual !== undefined && segundoPuestoManual !== null) {
      if (typeof segundoPuestoManual !== 'number' || !Number.isInteger(segundoPuestoManual)) {
        return NextResponse.json(
          { message: 'El segundo puesto manual debe ser un número entero.' },
          { status: 400 }
        );
      }
      // Asegurarse de que el segundo puesto no sea igual al primero (si ambos son manuales)
      if (primerPuestoManual !== undefined && primerPuestoManual === segundoPuestoManual) {
        return NextResponse.json(
          { message: 'El primer y segundo puesto manual no pueden ser el mismo número.' },
          { status: 400 }
        );
      }
      ganadores.push(segundoPuestoManual);
    }

    // Calculamos cuántos ganadores ya tenemos definidos manualmente
    const ganadoresManualesCount = ganadores.length;

    // Si la cantidad de ganadores manuales ya es igual o excede la cantidad total deseada, no necesitamos más
    if (ganadoresManualesCount >= cantidadGanadores) {
      // Si tenemos más ganadores manuales de los que se pidieron, solo tomamos los primeros 'cantidadGanadores'
      const finalGanadores = ganadores.slice(0, cantidadGanadores);
      return NextResponse.json({ ganadores: finalGanadores }, { status: 200 });
    }

    // --- Lógica para obtener el resto de los ganadores de la base de datos ---
    // 1. Obtener todos los números participantes de la base de datos
    const todosLosNumeros = await NumberModel.find({}).select('value -_id');

    // Add type annotation for 'n' in map
    let numerosParticipantes: number[] = todosLosNumeros.map((n: { value: number }) => n.value);

    // Filtrar los números que ya fueron seleccionados manualmente
    // Add type annotation for 'num' in filter
    numerosParticipantes = numerosParticipantes.filter((num: number) => !ganadores.includes(num));

    // Validar si hay suficientes participantes para los puestos restantes
    const puestosRestantes = cantidadGanadores - ganadoresManualesCount;
    if (numerosParticipantes.length < puestosRestantes) {
      return NextResponse.json(
        { message: `No hay suficientes participantes. Se necesitan ${puestosRestantes} ganadores adicionales pero solo hay ${numerosParticipantes.length} números disponibles después de la selección manual.` },
        { status: 400 }
      );
    }

    // 2. Mezclar el array de números al azar (Algoritmo Fisher-Yates)
    for (let i = numerosParticipantes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numerosParticipantes[i], numerosParticipantes[j]] = [numerosParticipantes[j], numerosParticipantes[i]];
    }

    // 3. Seleccionar los ganadores restantes del array ya mezclado
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