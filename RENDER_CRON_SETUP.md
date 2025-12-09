# Configuración del Cron Job en Render

## Requisitos Previos

- Proyecto desplegado en Render
- Acceso al dashboard de Render
- Script `trigger-notifications.js` creado en el proyecto

---

## Paso 1: Configurar Variables de Entorno en el Web Service

1. Ve a tu **Web Service** en Render dashboard
2. Navega a **Environment** → **Environment Variables**
3. Añade (si no existen):
   - **Key:** `CRON_SECRET`
   - **Value:** Genera un string aleatorio seguro (ejemplo: `cron_abc123xyz789_secret`)
4. Guarda los cambios

---

## Paso 2: Crear Cron Job en Render

1. En tu cuenta de Render, haz clic en **New +**
2. Selecciona **Cron Job**
3. Conecta el **mismo repositorio** que tu web service
4. Configura:

   - **Name:** `check-notifications` (o el nombre que prefieras)
   - **Branch:** `main` (o tu rama principal)
   - **Command:**

   ```bash
   node src/server/scripts/trigger-notifications.js
   ```

   - **Schedule (cron expression):**
     - `0 * * * *` → Cada hora en punto
     - `*/30 * * * *` → Cada 30 minutos
     - `*/15 * * * *` → Cada 15 minutos
     - `0 */2 * * *` → Cada 2 horas

5. **Environment Variables:** Añade las siguientes:

   - `CRON_SECRET`: El **mismo valor** que en tu web service
   - `WEB_SERVICE_URL`: La URL completa de tu web service
     - Ejemplo: `https://family-planner-server.onrender.com`
     - **Importante:** Sin la barra final `/`

6. Haz clic en **Create Cron Job**

---

## Paso 3: Verificar que Funciona

### Ver Logs del Cron Job

1. Ve al **Cron Job** que creaste en Render
2. Haz clic en **Logs**
3. Espera a que se ejecute (según el schedule que configuraste)
4. Deberías ver:
   ```
   Triggering notification check at 2025-12-09T10:00:00.000Z
   Target URL: https://family-planner-server.onrender.com/api/cron/check-notifications
   Status: 200
   Response: {"success":true,"timestamp":"...","notificationsSent":0,"errors":0}
   ✅ Success - Sent 0 notifications
   ```

### Probar Manualmente (Opcional)

Desde tu terminal local, ejecuta:

```bash
# En el directorio del proyecto
cd src/server
node scripts/trigger-notifications.js
```

Asegúrate de tener el archivo `.env` con `CRON_SECRET` y `WEB_SERVICE_URL` configurados.

---

## Cómo Funciona

1. **Render ejecuta el cron job** según el schedule configurado
2. El script `trigger-notifications.js` hace una petición HTTPS GET al endpoint `/api/cron/check-notifications`
3. El endpoint **verifica el token** `CRON_SECRET`
4. Si es válido, **ejecuta** `checkAndSendNotifications()`
5. La función busca tareas y envía notificaciones push
6. El script **muestra las estadísticas** en los logs del cron job

---

## Ventajas de este Enfoque

✅ **Servidor despierto:** El cron job mantiene el servidor activo cada hora  
✅ **Redundancia:** Funciona junto con el `setInterval` interno (cada 30s)  
✅ **Flexible:** Puedes ajustar la frecuencia modificando el schedule  
✅ **Monitoreable:** Logs detallados en el cron job de Render  
✅ **Todo en Render:** Backend y cron en la misma plataforma

---

## Notas Importantes

⚠️ **Seguridad:** Nunca compartas tu `CRON_SECRET` públicamente  
⚠️ **Frecuencia:** No configures muy frecuente (máx. cada 15 min) para no sobrecargar  
⚠️ **URL correcta:** Asegúrate de que `WEB_SERVICE_URL` apunta a tu web service real  
⚠️ **Zona horaria:** El servidor usa UTC, pero convierte automáticamente a CET/CEST

---

## Troubleshooting

### El cron job falla con "CRON_SECRET not set"

**Solución:** Añade la variable `CRON_SECRET` en las Environment Variables del **Cron Job** (no solo del web service)

---

### El script retorna HTTP 401

**Solución:** Verifica que el `CRON_SECRET` en el cron job coincide exactamente con el del web service

---

### El script retorna HTTP 500

**Solución:**

1. Verifica que `WEB_SERVICE_URL` esté correctamente configurado
2. Revisa los logs del **Web Service** para ver el error específico

---

### Las notificaciones no se envían

**Solución:**

1. Verifica que hay tareas con `notification_time` configurado
2. Revisa que la hora de la tarea es futura
3. Comprueba los logs del **Web Service** (no del cron job) para ver si hubo errores al enviar

---

## Alternativa: Servicio Externo

Si prefieres no usar el Cron Job de Render, puedes usar **cron-job.org**:

1. Ve a https://cron-job.org
2. Crea una cuenta gratuita
3. Crea un nuevo cron job:
   - **URL:** `https://TU-WEB-SERVICE.onrender.com/api/cron/check-notifications`
   - **HTTP Header:** `Authorization: Bearer TU_CRON_SECRET`
   - **Schedule:** Cada hora
4. Guarda y activa

Con esta opción no necesitas el script `trigger-notifications.js`, el servicio externo llama directamente al endpoint.
