
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      meeting: 'Meeting',
      chat: 'Chat',
      participants: 'Participants',
      profile: 'Profile',
      
      // Chat features
      services: 'Services',
      channels: 'Channels',
      voiceMemo: 'Voice Memo',
      codeEditor: 'Code Editor',
      whiteboard: 'Whiteboard',
      spreadsheet: 'Spreadsheet',
      
      // Actions
      send: 'Send',
      record: 'Record',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      cancel: 'Cancel',
      
      // Status
      online: 'Online',
      offline: 'Offline',
      away: 'Away',
      busy: 'Busy',
      typing: 'Typing...',
      
      // Messages
      welcomeMessage: 'Welcome to the enhanced chat system!',
      selectService: 'Select a service to start chatting',
      recordingStarted: 'Recording started',
      recordingStopped: 'Recording stopped',
      voiceMemoSent: 'Voice memo sent',
      codeSaved: 'Code saved successfully',
      
      // Errors
      errorGeneric: 'Something went wrong',
      errorMicrophoneAccess: 'Could not access microphone',
      errorCodeSave: 'Failed to save code',
      errorVoiceUpload: 'Failed to upload voice memo',
    }
  },
  es: {
    translation: {
      dashboard: 'Tablero',
      meeting: 'Reunión',
      chat: 'Chat',
      participants: 'Participantes',
      profile: 'Perfil',
      
      services: 'Servicios',
      channels: 'Canales',
      voiceMemo: 'Nota de Voz',
      codeEditor: 'Editor de Código',
      whiteboard: 'Pizarra',
      spreadsheet: 'Hoja de Cálculo',
      
      send: 'Enviar',
      record: 'Grabar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      cancel: 'Cancelar',
      
      online: 'En línea',
      offline: 'Desconectado',
      away: 'Ausente',
      busy: 'Ocupado',
      typing: 'Escribiendo...',
      
      welcomeMessage: '¡Bienvenido al sistema de chat mejorado!',
      selectService: 'Selecciona un servicio para empezar a chatear',
      recordingStarted: 'Grabación iniciada',
      recordingStopped: 'Grabación detenida',
      voiceMemoSent: 'Nota de voz enviada',
      codeSaved: 'Código guardado exitosamente',
      
      errorGeneric: 'Algo salió mal',
      errorMicrophoneAccess: 'No se pudo acceder al micrófono',
      errorCodeSave: 'Error al guardar el código',
      errorVoiceUpload: 'Error al subir la nota de voz',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;
