export interface Institution {
  id: string;
  name: string;
  type: 'universidad' | 'tecnologico' | 'colegio' | 'instituto' | 'otro';
}

export const institutions: Institution[] = [
  // Públicas Nacionales
  { id: 'unal', name: 'Universidad Nacional de Colombia', type: 'universidad' },
  { id: 'udea', name: 'Universidad de Antioquia', type: 'universidad' },
  { id: 'univalle', name: 'Universidad del Valle', type: 'universidad' },
  { id: 'uis', name: 'Universidad Industrial de Santander', type: 'universidad' },
  { id: 'ufps', name: 'Universidad Francisco de Paula Santander', type: 'universidad' },
  { id: 'udistrital', name: 'Universidad Distrital Francisco José de Caldas', type: 'universidad' },
  { id: 'uptc', name: 'Universidad Pedagógica y Tecnológica de Colombia', type: 'universidad' },
  { id: 'unicauca', name: 'Universidad del Cauca', type: 'universidad' },
  { id: 'unipamplona', name: 'Universidad de Pamplona', type: 'universidad' },
  { id: 'unicordoba', name: 'Universidad de Córdoba', type: 'universidad' },
  { id: 'unimagdalena', name: 'Universidad del Magdalena', type: 'universidad' },
  { id: 'uniatlantico', name: 'Universidad del Atlántico', type: 'universidad' },
  { id: 'unisucre', name: 'Universidad de Sucre', type: 'universidad' },
  { id: 'uniquindio', name: 'Universidad del Quindío', type: 'universidad' },
  
  // Privadas reconocidas  
  { id: 'andes', name: 'Universidad de los Andes', type: 'universidad' },
  { id: 'javeriana', name: 'Pontificia Universidad Javeriana', type: 'universidad' },
  { id: 'externado', name: 'Universidad Externado de Colombia', type: 'universidad' },
  { id: 'rosario', name: 'Universidad del Rosario', type: 'universidad' },
  { id: 'eafit', name: 'Universidad EAFIT', type: 'universidad' },
  { id: 'icesi', name: 'Universidad Icesi', type: 'universidad' },
  { id: 'utadeo', name: 'Universidad Jorge Tadeo Lozano', type: 'universidad' },
  { id: 'unbosque', name: 'Universidad El Bosque', type: 'universidad' },
  { id: 'usergioarboleda', name: 'Universidad Sergio Arboleda', type: 'universidad' },
  { id: 'unisabana', name: 'Universidad de La Sabana', type: 'universidad' },
  { id: 'sanbuenaventura', name: 'Universidad de San Buenaventura', type: 'universidad' },
  { id: 'lasalle', name: 'Universidad de La Salle', type: 'universidad' },
  { id: 'ucentral', name: 'Universidad Central', type: 'universidad' },
  { id: 'ucatolica', name: 'Universidad Católica de Colombia', type: 'universidad' },
  { id: 'ucc', name: 'Universidad Cooperativa de Colombia', type: 'universidad' },
  { id: 'unilibre', name: 'Universidad Libre', type: 'universidad' },
  { id: 'unab', name: 'Universidad Autónoma de Bucaramanga', type: 'universidad' },
  { id: 'fuac', name: 'Fundación Universidad Autónoma de Colombia', type: 'universidad' },
  
  // Tecnológicas
  { id: 'sena', name: 'SENA - Servicio Nacional de Aprendizaje', type: 'tecnologico' },
  { id: 'tecnar', name: 'Fundación Tecnológica Antonio de Arévalo', type: 'tecnologico' },
  { id: 'itm', name: 'Instituto Tecnológico Metropolitano', type: 'tecnologico' },
  { id: 'uniremington', name: 'Corporación Universitaria Remington', type: 'tecnologico' },
  { id: 'unicatolica', name: 'Fundación Universitaria Católica del Norte', type: 'tecnologico' },
  { id: 'areandina', name: 'Fundación Universitaria del Área Andina', type: 'tecnologico' },
  { id: 'uniagustiniana', name: 'Universitaria Agustiniana', type: 'tecnologico' },
  { id: 'uniagraria', name: 'Universidad Agraria de Colombia', type: 'tecnologico' },
  { id: 'unireformada', name: 'Universidad Reformada', type: 'tecnologico' },
  
  // Regionales importantes
  { id: 'unicesar', name: 'Universidad Popular del Cesar', type: 'universidad' },
  { id: 'uniminuto', name: 'Corporación Universitaria Minuto de Dios', type: 'universidad' },
  { id: 'unisimon', name: 'Universidad Simón Bolívar', type: 'universidad' },
  { id: 'cuc', name: 'Corporación Universidad de la Costa', type: 'universidad' },
  { id: 'unitecnologica', name: 'Universidad Tecnológica de Bolívar', type: 'universidad' },
  { id: 'unad', name: 'Universidad Nacional Abierta y a Distancia', type: 'universidad' },
  
  // Colegios importantes de Colombia
  { id: 'gimnasio_moderno', name: 'Gimnasio Moderno', type: 'colegio' },
  { id: 'colegio_rochester', name: 'Colegio Rochester', type: 'colegio' },
  { id: 'liceo_frances', name: 'Liceo Francés Louis Pasteur', type: 'colegio' },
  { id: 'nueva_granada', name: 'Colegio Nueva Granada', type: 'colegio' },
  { id: 'andino', name: 'Colegio Andino', type: 'colegio' },
  { id: 'bennett', name: 'Colegio Bennett', type: 'colegio' },
  { id: 'clasico_guatemala', name: 'Colegio Clásico de Guatemala', type: 'colegio' },
  { id: 'san_patricio', name: 'Colegio San Patricio', type: 'colegio' },
  { id: 'colegio_aleman', name: 'Colegio Alemán', type: 'colegio' },
  { id: 'marymount', name: 'Marymount School', type: 'colegio' },
  
  { id: 'otra', name: 'Otra institución', type: 'otro' }
];

export const academicRoles = [
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'profesor', label: 'Profesor' },
  { value: 'egresado', label: 'Egresado' },
  { value: 'otro', label: 'Otro' }
] as const;

export type AcademicRole = typeof academicRoles[number]['value'];