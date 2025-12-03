import { 
  Smile, 
  Utensils, 
  Bath, 
  BedDouble, 
  Gamepad2, 
  Hand, 
  AlertCircle,
  Heart
} from "lucide-react";

export const quickCategories = [
  {
    id: 'needs',
    label: 'Necesidades',
    icon: AlertCircle,
    color: 'bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200',
    phrases: [
      "Quiero ir al baño",
      "Tengo sed",
      "Tengo hambre",
      "Tengo sueño",
      "Me duele algo"
    ]
  },
  {
    id: 'emotions',
    label: 'Emociones',
    icon: Smile,
    color: 'bg-yellow-100 text-yellow-600 border-yellow-200 hover:bg-yellow-200',
    phrases: [
      "Estoy feliz",
      "Estoy triste",
      "Estoy enfadado",
      "Tengo miedo",
      "Estoy cansado"
    ]
  },
  {
    id: 'actions',
    label: 'Acciones',
    icon: Hand,
    color: 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200',
    phrases: [
      "Quiero jugar",
      "Quiero descansar",
      "Ayúdame por favor",
      "Quiero ver la tele",
      "Quiero salir"
    ]
  },
  {
    id: 'social',
    label: 'Social',
    icon: Heart,
    color: 'bg-pink-100 text-pink-600 border-pink-200 hover:bg-pink-200',
    phrases: [
      "Hola",
      "Adiós",
      "Gracias",
      "Te quiero",
      "Lo siento"
    ]
  }
];