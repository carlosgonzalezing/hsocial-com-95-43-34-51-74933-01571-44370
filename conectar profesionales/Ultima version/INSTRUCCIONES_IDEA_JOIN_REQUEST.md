# Implementación de Solicitud de Unión para Posts de Tipo 'Idea'

## 📋 Resumen

Esta implementación añade la funcionalidad completa para que los usuarios puedan solicitar unirse a publicaciones de tipo 'Idea'. Incluye:

- ✅ Tabla de base de datos `idea_requests` para gestionar solicitudes
- ✅ Campo `max_members` en la tabla `posts` para límite de integrantes
- ✅ Hook personalizado `useIdeaRequest` para manejar la lógica
- ✅ Botón "Solicitar Unirse" en el componente `IdeaContent`
- ✅ Sistema de notificaciones para el creador de la idea
- ✅ Validación de límites y estados de solicitud

## 🗄️ Cambios en Base de Datos

### Paso 1: Aplicar la Migración

Ejecuta el siguiente comando desde la raíz del proyecto para aplicar la migración:

```bash
# Si usas Supabase CLI local
npx supabase migration up

# O si usas Supabase Dashboard, ejecuta manualmente:
# Ve a SQL Editor y ejecuta el contenido del archivo:
# supabase/migrations/20250412000000_idea_requests_and_max_members.sql
```

### Estructura de la Tabla `idea_requests`

```sql
CREATE TABLE idea_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'ACEPTADO', 'RECHAZADO')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(idea_id, requester_id)
);
```

### Campo Añadido a `posts`

```sql
ALTER TABLE posts
ADD COLUMN max_members INTEGER;
```

## 📁 Archivos Creados/Modificados

### 1. **src/hooks/ideas/use-idea-request.ts** (NUEVO)
Hook personalizado que maneja toda la lógica de solicitudes:
- `sendJoinRequest()`: Envía solicitud de unión
- `cancelJoinRequest()`: Cancela una solicitud pendiente
- `checkMaxMembersLimit()`: Verifica si se alcanzó el límite de miembros
- `requestStatus`: Estado actual de la solicitud del usuario

### 2. **src/components/post/IdeaContent.tsx** (MODIFICADO)
Añadido:
- Botón "Solicitar Unirse" visible solo para ideas (no proyectos)
- Estados dinámicos del botón:
  - "Solicitar Unirse" - Estado inicial
  - "Solicitud Pendiente" - Cuando ya se envió
  - "Ya eres miembro" - Cuando fue aceptado
  - "Solicitud rechazada" - Cuando fue rechazada
  - "Cupo lleno" - Cuando se alcanzó el límite
- Indicador de límite máximo de miembros

### 3. **src/components/Post.tsx** (MODIFICADO)
- Actualizado `IdeaPostView` para pasar props necesarios a `IdeaContent`:
  - `postId`: ID del post
  - `postUserId`: ID del creador
  - `maxMembers`: Límite de miembros

### 4. **src/types/post.ts** (MODIFICADO)
- Añadido campo `max_members?: number | null` a la interfaz `Post`

### 5. **supabase/migrations/20250412000000_idea_requests_and_max_members.sql** (NUEVO)
- Migración completa con:
  - Creación de tabla `idea_requests`
  - Campo `max_members` en `posts`
  - Índices para optimización
  - Políticas RLS (Row Level Security)
  - Triggers para `updated_at`

## 🔒 Políticas de Seguridad (RLS)

Las siguientes políticas están implementadas:

1. **Lectura de solicitudes propias**: Los usuarios pueden ver sus propias solicitudes
2. **Lectura de solicitudes de ideas propias**: Los creadores pueden ver solicitudes de sus ideas
3. **Creación de solicitudes**: Usuarios autenticados pueden crear solicitudes
4. **Actualización de estado**: Solo creadores de ideas pueden aceptar/rechazar solicitudes
5. **Eliminación de solicitudes**: Los usuarios solo pueden eliminar sus solicitudes pendientes

## 🔔 Sistema de Notificaciones

Cuando un usuario solicita unirse a una idea:

1. Se crea una notificación de tipo `'idea_join_request'`
2. Se envía al creador de la idea (`receiver_id`)
3. Incluye el ID del solicitante (`sender_id`)
4. Incluye el ID del post (`post_id`)
5. Mensaje: "quiere unirse a tu idea"

## 🎯 Flujo de Usuario

### Para el Usuario que Solicita:

1. **Ve una publicación de tipo 'Idea'**
2. **Click en "Solicitar Unirse"**
   - Se crea registro en `idea_requests` con estado 'PENDIENTE'
   - Se envía notificación al creador
   - El botón cambia a "Solicitud Pendiente"

3. **Estados posibles**:
   - **Pendiente**: Esperando respuesta del creador
   - **Aceptado**: El creador aceptó la solicitud
   - **Rechazado**: El creador rechazó la solicitud
   - **Cupo lleno**: Se alcanzó el límite de miembros

### Para el Creador de la Idea:

1. **Recibe notificación** de nueva solicitud
2. **Puede revisar el perfil** del solicitante
3. **Acepta o rechaza** la solicitud (funcionalidad a implementar en Fase 2)

## ⚙️ Configuración de Límite de Miembros

Los creadores de ideas pueden definir `max_members` al crear la publicación. Si es `NULL`, no hay límite.

Ejemplo al crear una idea:
```typescript
{
  content: "Mi idea innovadora...",
  post_type: "idea",
  max_members: 5, // Máximo 5 miembros
  idea: {
    title: "Aplicación móvil",
    description: "...",
    // ... otros campos
  }
}
```

## 🧪 Validaciones Implementadas

- ❌ El creador no puede solicitar unirse a su propia idea
- ❌ No se puede enviar solicitud duplicada
- ❌ No se muestra botón si se alcanzó el límite de miembros
- ❌ No se muestra botón al creador de la idea
- ❌ Solo usuarios autenticados pueden solicitar

## 📊 Estados de Solicitud

| Estado | Descripción | Botón |
|--------|-------------|-------|
| `null` | Sin solicitud | "Solicitar Unirse" (activo) |
| `PENDIENTE` | Esperando respuesta | "Solicitud Pendiente" (deshabilitado) |
| `ACEPTADO` | Solicitud aceptada | "Ya eres miembro" (deshabilitado) |
| `RECHAZADO` | Solicitud rechazada | "Solicitud rechazada" (deshabilitado) |
| Límite alcanzado | Cupo completo | "Cupo lleno" (deshabilitado) |

## 🔄 Próximos Pasos (Fase 2)

Las siguientes funcionalidades están pendientes:

1. **Panel de gestión para creadores**: Ver/aceptar/rechazar solicitudes
2. **Notificación de aceptación**: Avisar al usuario cuando su solicitud es aceptada
3. **Añadir a participantes**: Automáticamente añadir a `idea_participants` al aceptar
4. **Contador de solicitudes pendientes**: Badge en notificaciones
5. **Cancelar solicitud**: Permitir cancelar solicitud pendiente

## 🐛 Solución de Problemas

### Error: "column 'max_members' does not exist"
**Solución**: Ejecuta la migración de base de datos

### Error: "table 'idea_requests' does not exist"
**Solución**: Ejecuta la migración de base de datos

### No aparece el botón "Solicitar Unirse"
**Verificar**:
- El post debe ser de tipo 'idea' (`post_type === 'idea' || post.idea && post_type !== 'project'`)
- El usuario no debe ser el creador
- El usuario debe estar autenticado

### TypeScript Errors sobre 'idea_requests'
**Nota**: Los errores de tipo son normales hasta regenerar los tipos de Supabase:
```bash
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## 📝 Notas Importantes

1. **La tabla `idea_requests` es independiente de `idea_participants`**: Las solicitudes son solo el primer paso. Cuando se acepta, debe crearse un registro en `idea_participants` (Fase 2).

2. **El botón NO aparece en posts de tipo 'project'**: Solo en 'idea', ya que los proyectos tienen un flujo diferente.

3. **Las notificaciones usan el tipo existente**: Se reutiliza la tabla `notifications` con tipo `'idea_join_request'`.

4. **Seguridad**: Todas las operaciones están protegidas por RLS de Supabase.

## ✅ Checklist de Implementación

- [x] Crear migración SQL
- [x] Añadir campo `max_members` a tipo `Post`
- [x] Crear hook `useIdeaRequest`
- [x] Modificar `IdeaContent.tsx` con botón
- [x] Actualizar `Post.tsx` para pasar props
- [x] Implementar lógica de notificaciones
- [x] Validar límites de miembros
- [x] Documentar implementación
- [ ] Aplicar migración a base de datos (EJECUTAR MANUALMENTE)
- [ ] Probar funcionalidad en desarrollo

## 🚀 Para Activar la Funcionalidad

1. **Ejecuta la migración SQL** en tu base de datos Supabase
2. **Reinicia el servidor de desarrollo** si está corriendo
3. **Crea una publicación de tipo 'Idea'** para probar
4. **Con otro usuario**, intenta solicitar unirse
5. **Verifica** que el creador reciba la notificación

---

**Fase Completada**: ✅ Fase 1 - Flujo de Solicitud Básico  
**Próxima Fase**: Fase 2 - Panel de Gestión de Solicitudes
