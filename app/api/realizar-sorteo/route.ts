import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import NumberModel from '@/app/lib/models/Number';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { cantidadGanadores } = await request.json();

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

    // 1. Obtener todos los números participantes de la base de datos
    const todosLosNumeros = await NumberModel.find({}).select('value -_id');
    const numerosParticipantes = todosLosNumeros.map(n => n.value);

    // Validar si hay suficientes participantes para la cantidad de ganadores
    if (numerosParticipantes.length < cantidadGanadores) {
      return NextResponse.json(
        { message: `No hay suficientes participantes. Se necesitan ${cantidadGanadores} ganadores pero solo hay ${numerosParticipantes.length} números registrados.` },
        { status: 400 }
      );
    }

    // 2. Mezclar el array de números al azar (Algoritmo Fisher-Yates)
    for (let i = numerosParticipantes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numerosParticipantes[i], numerosParticipantes[j]] = [numerosParticipantes[j], numerosParticipantes[i]];
    }

    // 3. Seleccionar los ganadores del array ya mezclado
    const ganadores = numerosParticipantes.slice(0, cantidadGanadores);

    return NextResponse.json({ ganadores }, { status: 200 });

  } catch (error) {
    console.error('Error al realizar el sorteo:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}