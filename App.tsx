import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Image,
  Alert
} from 'react-native';
// Módulo nativo para interactuar con la cámara y galería
import * as ImagePicker from 'expo-image-picker';
// Componentes y servicios del proyecto
import { CustomInput } from './src/components/CustomInput';
import { enviarEvidenciaIA } from './src/services/apiService';

export default function App() {
  // --- ESTADOS LOCALES ---
  const [tema, setTema] = useState('');
  const [cargando, setCargando] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  
  // Estado para guardar el reporte que nos regrese la IA
  const [resultado, setResultado] = useState<{
    calificacion: number;
    retroalimentacion: string;
    puntos_clave: string[];
  } | null>(null);

  // --- FUNCIÓN DE EVALUACIÓN (CONEXIÓN AL BACKEND) ---
  const procesarEvaluacion = async () => {
    if (!tema.trim() || !imagenSeleccionada) {
      Alert.alert('Datos Incompletos', 'Por favor, escriba un tema y capture una foto del cuaderno antes de evaluar.');
      return;
    }

    try {
      setCargando(true);
      setResultado(null); // Limpiamos resultados anteriores
      
      // Llamamos a nuestro servicio pasándole los datos reales del iPhone
      const data = await enviarEvidenciaIA(tema, imagenSeleccionada);
      setResultado(data);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor de IA. Verifique que el backend esté encendido.');
    } finally {
      setCargando(false);
    }
  };

  // --- FUNCIÓN 1: ABRIR LA CÁMARA NATIVA ---
  const abrirCamara = async () => {
    const permisos = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permisos.granted) {
      Alert.alert('Permiso Denegado', 'Profesor, necesitamos acceso a su cámara para poder escanear los cuadernos.');
      return;
    }

    const resultadoCamara = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, 
      aspect: [4, 3],     
      quality: 0.8,       
    });

    if (!resultadoCamara.canceled) {
      setImagenSeleccionada(resultadoCamara.assets[0].uri);
    }
  };

  // --- FUNCIÓN 2: SELECCIONAR DE LA GALERÍA ---
  const abrirGaleria = async () => {
    const permisos = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permisos.granted) {
      Alert.alert('Permiso Denegado', 'Necesitamos acceso a su galería para seleccionar evidencias previas.');
      return;
    }

    const resultadoGaleria = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!resultadoGaleria.canceled) {
      setImagenSeleccionada(resultadoGaleria.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.contenedorPadre}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <ScrollView contentContainerStyle={styles.areaScroll}>
        {/* --- ENCABEZADO --- */}
        <View style={styles.encabezado}>
          <Text style={styles.tituloApp}>🤖 Calificador IA</Text>
          <Text style={styles.subtituloApp}>Asistente de Evaluación Docente</Text>
        </View>

        {/* --- ZONA DE CONFIGURACIÓN --- */}
        <View style={styles.tarjeta}>
          <Text style={styles.tituloSeccion}>1. Configuración de la Clase</Text>
          <Text style={styles.textoExplicativo}>
            Escribe el tema que vas a evaluar para que la IA sepa qué buscar en el cuaderno.
          </Text>
          
          <CustomInput 
            label="Tema de la Actividad"
            placeholder="Ej. Fracciones equivalentes, Leyes de Newton..."
            value={tema}
            onChangeText={setTema}
          />
        </View>

        {/* --- ZONA DE ACCIÓN (CÁMARA) --- */}
        <View style={styles.tarjeta}>
          <Text style={styles.tituloSeccion}>2. Capturar Evidencia</Text>
          
          <TouchableOpacity style={styles.botonCamara} activeOpacity={0.8} onPress={abrirCamara}>
            <Text style={styles.textoBotonCamara}>📸 Abrir Cámara de Evidencias</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botonGaleria} activeOpacity={0.8} onPress={abrirGaleria}>
            <Text style={styles.textoBotonGaleria}>🖼️ Seleccionar de la Galería</Text>
          </TouchableOpacity>

          {imagenSeleccionada && (
            <View style={styles.contenedorMiniatura}>
              <Text style={styles.textoMiniatura}>Evidencia capturada:</Text>
              <Image source={{ uri: imagenSeleccionada }} style={styles.miniaturaImagen} />
            </View>
          )}
        </View>

        {/* --- BOTÓN DE DISPARO DE IA --- */}
        <TouchableOpacity 
          style={[styles.botonEvaluar, (!tema || !imagenSeleccionada || cargando) && styles.botonDeshabilitado]} 
          onPress={procesarEvaluacion}
          disabled={cargando}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBotonEvaluar}>
            {cargando ? '⏳ Procesando con IA y Supabase...' : '🚀 Evaluar con Inteligencia Artificial'}
          </Text>
        </TouchableOpacity>

        {/* --- ZONA DE RESULTADOS DINÁMICA --- */}
        <View style={[styles.tarjeta, styles.tarjetaResultado]}>
          <Text style={styles.tituloSeccion}>3. Reporte de Evaluación</Text>
          
          {resultado ? (
            <View style={styles.contenedorReporte}>
              <View style={styles.badgeCalificacion}>
                <Text style={styles.textoBadge}>Nota: {resultado.calificacion}/10</Text>
              </View>
              <Text style={styles.tituloRetro}>Retroalimentación Docente:</Text>
              <Text style={styles.textoRetro}>{resultado.retroalimentacion}</Text>
            </View>
          ) : (
            <Text style={styles.textoPlaceholderResultado}>
              {cargando ? 'Analizando caligrafía, ortografía y contenido...' : 'Los resultados estructurados de la IA aparecerán aquí una vez procesada la imagen.'}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- HOJA DE ESTILOS LIMPIA ---
const styles = StyleSheet.create({
  contenedorPadre: {
    flex: 1,
    backgroundColor: '#f1f3f5',
  },
  areaScroll: {
    padding: 20,
  },
  encabezado: {
    marginBottom: 25,
    marginTop: 10,
  },
  tituloApp: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtituloApp: {
    fontSize: 15,
    color: '#6c757d',
    marginTop: 4,
  },
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tarjetaResultado: {
    borderLeftWidth: 5,
    borderLeftColor: '#4dabf7',
    minHeight: 150,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  textoExplicativo: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 15,
    lineHeight: 18,
  },
  botonCamara: {
    backgroundColor: '#228be6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  textoBotonCamara: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  botonGaleria: {
    backgroundColor: '#f1f3f5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  textoBotonGaleria: {
    color: '#495057',
    fontSize: 15,
    fontWeight: '600',
  },
  contenedorMiniatura: {
    marginTop: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
    paddingTop: 15,
  },
  textoMiniatura: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  miniaturaImagen: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#e9ecef',
  },
  textoPlaceholderResultado: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  // --- ESTILOS DE LOS NUEVOS COMPONENTES CORREGIDOS ---
  botonEvaluar: {
    backgroundColor: '#37b24d',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  botonDeshabilitado: {
    backgroundColor: '#94d82d',
    opacity: 0.6,
  },
  textoBotonEvaluar: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  contenedorReporte: {
    marginTop: 10,
  },
  badgeCalificacion: {
    backgroundColor: '#e6fcf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#37b24d',
    marginBottom: 12,
  },
  textoBadge: {
    color: '#2b8a3e',
    fontWeight: '700',
    fontSize: 14,
  },
  tituloRetro: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  textoRetro: {
    fontSize: 14,
    color: '#212529',
    lineHeight: 20,
  }
});