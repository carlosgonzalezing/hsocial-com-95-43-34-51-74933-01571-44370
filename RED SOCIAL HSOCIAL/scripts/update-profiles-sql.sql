-- Deshabilitar triggers temporalmente para actualizar perfiles de bots
SET session_replication_role = replica;

-- Actualizar perfiles de bots
UPDATE profiles 
SET 
  username = CASE 
    WHEN id = 'fa7de4f1-26b7-4866-a2bc-2cc1845eaf6b' THEN 'Sara Tech'
    WHEN id = '1187b53f-2c2e-4a2f-9521-5054f6580588' THEN 'Mateo Design'
    WHEN id = '57c2eda0-a9d3-4886-9241-aa2e6ba89e7a' THEN 'Lucía Data'
    ELSE username
  END,
  bio = CASE 
    WHEN id = 'fa7de4f1-26b7-4866-a2bc-2cc1845eaf6b' THEN 'Apasionada por IA y desarrollo de software. Siempre aprendiendo algo nuevo. 🚀'
    WHEN id = '1187b53f-2c2e-4a2f-9521-5054f6580588' THEN 'Diseñador UX/UI con foco en accesibilidad. Creando experiencias digitales inclusivas. 🎨♿'
    WHEN id = '57c2eda0-a9d3-4886-9241-aa2e6ba89e7a' THEN 'Data Scientist en formación. Amante de los datos, el café y los gatos. ☕🐱📊'
    ELSE bio
  END,
  career = CASE 
    WHEN id = 'fa7de4f1-26b7-4866-a2bc-2cc1845eaf6b' THEN 'Ingeniería de Software'
    WHEN id = '1187b53f-2c2e-4a2f-9521-5054f6580588' THEN 'Diseño Gráfico'
    WHEN id = '57c2eda0-a9d3-4886-9241-aa2e6ba89e7a' THEN 'Ciencia de Datos'
    ELSE career
  END,
  institution_name = CASE 
    WHEN id = 'fa7de4f1-26b7-4866-a2bc-2cc1845eaf6b' THEN 'Universidad Nacional'
    WHEN id = '1187b53f-2c2e-4a2f-9521-5054f6580588' THEN 'Instituto de Diseño'
    WHEN id = '57c2eda0-a9d3-4886-9241-aa2e6ba89e7a' THEN 'Universidad Técnica'
    ELSE institution_name
  END,
  avatar_url = CASE 
    WHEN id = 'fa7de4f1-26b7-4866-a2bc-2cc1845eaf6b' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara'
    WHEN id = '1187b53f-2c2e-4a2f-9521-5054f6580588' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=mateo'
    WHEN id = '57c2eda0-a9d3-4886-9241-aa2e6ba89e7a' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucia'
    ELSE avatar_url
  END,
  updated_at = NOW()
WHERE id IN ('fa7de4f1-26b7-4866-a2bc-2cc1845eaf6b', '1187b53f-2c2e-4a2f-9521-5054f6580588', '57c2eda0-a9d3-4886-9241-aa2e6ba89e7a');

-- Restaurar rol normal
SET session_replication_role = DEFAULT;
