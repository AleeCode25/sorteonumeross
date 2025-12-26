import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import NumberModel from '@/app/lib/models/Number';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    
    // --- CAMBIO: Extraemos los 10 posibles puestos del body ---
    const {
      cantidadGanadores,
      puesto1, puesto2, puesto3, puesto4, puesto5,
      puesto6, puesto7, puesto8, puesto9, puesto10
    } = body;

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
    let ganadores: number[] = [];

    // --- CAMBIO: Agrupamos los 10 puestos en un array y filtramos los definidos ---
    const puestosManualesDefinidos = [
      puesto1, puesto2, puesto3, puesto4, puesto5,
      puesto6, puesto7, puesto8, puesto9, puesto10
    ].filter(p => p !== undefined && p !== null);

    // Validar que no haya más puestos manuales que la cantidad total solicitada
    if (puestosManualesDefinidos.length > cantidadGanadores) {
      return NextResponse.json(
        { message: `Has definido ${puestosManualesDefinidos.length} números manuales, pero el total de ganadores es ${cantidadGanadores}.` },
        { status: 400 }
      );
    }

    // Validar que sean números enteros
    for (const num of puestosManualesDefinidos) {
      if (typeof num !== 'number' || !Number.isInteger(num)) {
        return NextResponse.json(
          { message: 'Todos los puestos manuales deben ser números enteros.' },
          { status: 400 }
        );
      }
    }

    // Validar duplicados en la lista manual
    const manualesSinDuplicados = new Set(puestosManualesDefinidos);
    if (manualesSinDuplicados.size !== puestosManualesDefinidos.length) {
      return NextResponse.json(
        { message: 'No puede haber números duplicados en la configuración manual.' },
        { status: 400 }
      );
    }

    // Agregamos los manuales a la lista final
    ganadores = [...puestosManualesDefinidos];

    // Si ya cubrimos el cupo con los manuales, devolvemos la respuesta
    if (ganadores.length >= cantidadGanadores) {
      return NextResponse.json({ ganadores }, { status: 200 });
    }

    // --- Lógica para completar con la Base de Datos ---
    const todosLosNumeros = await NumberModel.find({}).select('value -_id');
    let numerosParticipantes: number[] = todosLosNumeros.map((n: { value: number }) => n.value);

    // Quitamos los que ya ganaron manualmente para que no se repitan
    numerosParticipantes = numerosParticipantes.filter((num: number) => !ganadores.includes(num));

    const puestosRestantes = cantidadGanadores - ganadores.length;

    if (numerosParticipantes.length < puestosRestantes) {
      return NextResponse.json(
        { message: `Faltan participantes. Se necesitan ${puestosRestantes} más, pero solo quedan ${numerosParticipantes.length} disponibles.` },
        { status: 400 }
      );
    }

    // Mezcla aleatoria (Fisher-Yates)
    for (let i = numerosParticipantes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numerosParticipantes[i], numerosParticipantes[j]] = [numerosParticipantes[j], numerosParticipantes[i]];
    }

    // Tomamos los que faltan
    const ganadoresAleatorios = numerosParticipantes.slice(0, puestosRestantes);
    ganadores.push(...ganadoresAleatorios);

    return NextResponse.json({ ganadores }, { status: 200 });

  } catch (error) {
    console.error('Error al realizar el sorteo:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}