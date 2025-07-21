import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    events: 'Events',
    content: 'Content',
    social: 'Social Media',
    calendar: 'Calendar',
    analytics: 'Analytics',
    users: 'Users',
    settings: 'Settings',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    totalEvents: 'Total Events',
    activeUsers: 'Active Users',
    socialPosts: 'Social Posts',
    engagement: 'Engagement',
    upcomingEvents: 'Upcoming Events',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    
    // Actions
    createEvent: 'Create Event',
    newPost: 'New Post',
    viewAll: 'View All',
    schedulePost: 'Schedule Post',
    manageUsers: 'Manage Users',
    viewAnalytics: 'View Analytics',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Events
    eventTitle: 'Event Title',
    eventDescription: 'Event Description',
    startDate: 'Start Date',
    startTime: 'Start Time',
    location: 'Location',
    category: 'Category',
    academic: 'Academic',
    sports: 'Sports',
    cultural: 'Cultural',
    other: 'Other',
    
    // RSVP
    attending: 'Attending',
    notAttending: 'Not Attending',
    maybe: 'Maybe',
    rsvpSuccess: 'RSVP updated successfully',
    
    // Branches
    mainCampus: 'Main Campus',
    northBranch: 'North Branch',
    southBranch: 'South Branch',
    eastBranch: 'East Branch',
  },
  es: {
    // Navigation
    dashboard: 'Tablero',
    events: 'Eventos',
    content: 'Contenido',
    social: 'Redes Sociales',
    calendar: 'Calendario',
    analytics: 'Analíticas',
    users: 'Usuarios',
    settings: 'Configuración',
    
    // Dashboard
    welcomeBack: 'Bienvenido de nuevo',
    totalEvents: 'Eventos Totales',
    activeUsers: 'Usuarios Activos',
    socialPosts: 'Publicaciones Sociales',
    engagement: 'Participación',
    upcomingEvents: 'Próximos Eventos',
    recentActivity: 'Actividad Reciente',
    quickActions: 'Acciones Rápidas',
    
    // Actions
    createEvent: 'Crear Evento',
    newPost: 'Nueva Publicación',
    viewAll: 'Ver Todo',
    schedulePost: 'Programar Publicación',
    manageUsers: 'Gestionar Usuarios',
    viewAnalytics: 'Ver Analíticas',
    
    // Common
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    
    // Events
    eventTitle: 'Título del Evento',
    eventDescription: 'Descripción del Evento',
    startDate: 'Fecha de Inicio',
    startTime: 'Hora de Inicio',
    location: 'Ubicación',
    category: 'Categoría',
    academic: 'Académico',
    sports: 'Deportes',
    cultural: 'Cultural',
    other: 'Otro',
    
    // RSVP
    attending: 'Asistiendo',
    notAttending: 'No Asistiendo',
    maybe: 'Tal vez',
    rsvpSuccess: 'RSVP actualizado exitosamente',
    
    // Branches
    mainCampus: 'Campus Principal',
    northBranch: 'Sucursal Norte',
    southBranch: 'Sucursal Sur',
    eastBranch: 'Sucursal Este',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
