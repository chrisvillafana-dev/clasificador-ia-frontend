import axios from 'axios';

// NOTA DOCENTE: Reemplazaremos esta IP por la IP real de tu backend de FastAPI cuando lo encendamos
const API_URL = 'http://192.168.1.94:8000'; 

interface RespuestaEvaluacion {
  calificacion: number;
  retroalimentacion: string;
  puntos_clave: string[];
}

export const enviarEvidenciaIA = async (tema: string, imageUri: string): Promise<RespuestaEvaluacion> => {
  const formData = new FormData();
  
  // Agregar el tema de la clase al paquete
  formData.append('tema', tema);

  // Preparar la imagen para que viaje como un archivo binario real
  const nombreArchivo = imageUri.split('/').pop() || 'evidencia.jpg';
  const match = /\.(\w+)$/.exec(nombreArchivo);
  const tipoArchivo = match ? `image/${match[1]}` : `image/jpeg`;

  // Añadimos la imagen al FormData con el formato que FastAPI espera
  formData.append('file', {
    uri: imageUri,
    name: nombreArchivo,
    type: tipoArchivo,
  } as any);

  // Hacer la petición POST al servidor
  const respuesta = await axios.post(`${API_URL}/evaluar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return respuesta.data;
};