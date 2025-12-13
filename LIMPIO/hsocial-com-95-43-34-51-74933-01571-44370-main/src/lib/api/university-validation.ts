// Universidad domains validation for Red H
export const COLOMBIAN_UNIVERSITIES = {
  // Públicas Nacionales
  'unal.edu.co': 'Universidad Nacional de Colombia',
  'udea.edu.co': 'Universidad de Antioquia',
  'univalle.edu.co': 'Universidad del Valle',
  'uis.edu.co': 'Universidad Industrial de Santander',
  'ufps.edu.co': 'Universidad Francisco de Paula Santander',
  'udistrital.edu.co': 'Universidad Distrital Francisco José de Caldas',
  'uptc.edu.co': 'Universidad Pedagógica y Tecnológica de Colombia',
  'unicauca.edu.co': 'Universidad del Cauca',
  'unipamplona.edu.co': 'Universidad de Pamplona',
  'unicordoba.edu.co': 'Universidad de Córdoba',
  'unimagdalena.edu.co': 'Universidad del Magdalena',
  'uniatlántico.edu.co': 'Universidad del Atlántico',
  'unisucre.edu.co': 'Universidad de Sucre',
  'uniquindio.edu.co': 'Universidad del Quindío',
  'uniandes.edu.co': 'Universidad de los Andes',
  
  // Privadas reconocidas
  'javeriana.edu.co': 'Pontificia Universidad Javeriana',
  'uexternado.edu.co': 'Universidad Externado de Colombia',
  'urosario.edu.co': 'Universidad del Rosario',
  'eafit.edu.co': 'Universidad EAFIT',
  'icesi.edu.co': 'Universidad Icesi',
  'utadeo.edu.co': 'Universidad Jorge Tadeo Lozano',
  'unbosque.edu.co': 'Universidad El Bosque',
  'usergioarboleda.edu.co': 'Universidad Sergio Arboleda',
  'uniminuto.edu': 'Corporación Universitaria Minuto de Dios',
  'unisabana.edu.co': 'Universidad de La Sabana',
  'sanbuenaventura.edu.co': 'Universidad de San Buenaventura',
  'lasalle.edu.co': 'Universidad de La Salle',
  'ucentral.edu.co': 'Universidad Central',
  'ucatolica.edu.co': 'Universidad Católica de Colombia',
  'ucc.edu.co': 'Universidad Cooperativa de Colombia',
  'unilibre.edu.co': 'Universidad Libre',
  'unab.edu.co': 'Universidad Autónoma de Bucaramanga',
  'fuac.edu.co': 'Fundación Universidad Autónoma de Colombia',
  
  // Tecnológicas
  'sena.edu.co': 'Servicio Nacional de Aprendizaje (SENA)',
  'tecnar.edu.co': 'Fundación Tecnológica Antonio de Arévalo',
  'itm.edu.co': 'Instituto Tecnológico Metropolitano',
  'uniremington.edu.co': 'Corporación Universitaria Remington',
  'unicatolica.edu.co': 'Fundación Universitaria Católica del Norte',
  'funandi.edu.co': 'Fundación Universitaria del Área Andina',
  'uniagustiniana.edu.co': 'Universitaria Agustiniana',
  'areandina.edu.co': 'Fundación Universitaria del Área Andina',
  'uniagraria.edu.co': 'Universidad Agraria de Colombia',
  'unireformada.edu.co': 'Universidad Reformada',
  
  // Regionales importantes
  'unicesar.edu.co': 'Universidad Popular del Cesar',
  'uniminuto.edu.co': 'Corporación Universitaria Minuto de Dios',
  'unisimon.edu.co': 'Universidad Simón Bolívar',
  'cuc.edu.co': 'Corporación Universidad de la Costa',
  'unitecnologica.edu.co': 'Universidad Tecnológica de Bolívar',
  'unad.edu.co': 'Universidad Nacional Abierta y a Distancia',
};

export const validateUniversityEmail = (email: string): { 
  isValid: boolean; 
  universityName?: string; 
  domain?: string;
} => {
  if (!email || !email.includes('@')) {
    return { isValid: false };
  }

  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) {
    return { isValid: false };
  }

  // Check exact domain match
  if (COLOMBIAN_UNIVERSITIES[domain]) {
    return {
      isValid: true,
      universityName: COLOMBIAN_UNIVERSITIES[domain],
      domain
    };
  }

  // Check if it's a subdomain of any university
  for (const [uniDomain, uniName] of Object.entries(COLOMBIAN_UNIVERSITIES)) {
    if (domain.endsWith('.' + uniDomain)) {
      return {
        isValid: true,
        universityName: uniName,
        domain: uniDomain
      };
    }
  }

  return { isValid: false };
};

export const getUniversityNameFromEmail = (email: string): string | null => {
  const validation = validateUniversityEmail(email);
  return validation.isValid ? validation.universityName || null : null;
};

export const getAllUniversities = (): Array<{ domain: string; name: string }> => {
  return Object.entries(COLOMBIAN_UNIVERSITIES).map(([domain, name]) => ({
    domain,
    name
  }));
};