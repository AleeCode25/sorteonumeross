import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import NumberModel from '@/app/lib/models/Number';

export async function POST(request: Request) {
  // Conectamos a la base de datos
  await dbConnect();

  try {
    const { monto } = await request.json();

    // Validamos el monto recibido
    if (typeof monto !== 'number' || monto <= 0) {
      return NextResponse.json(
        { message: 'El monto debe ser un número positivo.' },
        { status: 400 }
      );
    }

    // Calculamos cuántos números generar
    const cantidadNumeros = Math.floor(monto / 2500);

    if (cantidadNumeros === 0) {
      return NextResponse.json(
        { message: 'El monto no es suficiente para generar un número.' },
        { status: 400 }
      );
    }

    const numerosGenerados = [];
    // Bucle para generar la cantidad necesaria de números únicos
    for (let i = 0; i < cantidadNumeros; i++) {
      let numeroUnico = false;
      let nuevoNumero;

      while (!numeroUnico) {
        const valorGenerado = Math.floor(10000 + Math.random() * 90000);
        // Verificamos si ya existe en la BD
        const numeroExistente = await NumberModel.findOne({ value: valorGenerado });

        if (!numeroExistente) {
          nuevoNumero = new NumberModel({ value: valorGenerado });
          await nuevoNumero.save();
          numerosGenerados.push(nuevoNumero.value);
          numeroUnico = true;
        }
      }
    }

    // Retornamos el array de números generados
    return NextResponse.json({ numbers: numerosGenerados }, { status: 201 });

  } catch (error) {
    console.error('Error al generar los números:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}