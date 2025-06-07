import mongoose from 'mongoose';

const NumberSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: [true, 'El número es obligatorio.'],
    unique: true, // Asegura que no se puedan guardar números duplicados
    min: 10000,
    max: 99999,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Number || mongoose.model('Number', NumberSchema);