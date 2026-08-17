# CLAUDE.local.md

Preferencias personales para este repo (privado, no versionado).

## Reglas

- **Nunca leas ni abras `.env`** (ni `src/server/.env`, `src/app/.env` ni ninguna variante). Si necesitas saber qué variables existen, consulta el README o pregúntame.
- **Propón un plan y espera aprobación antes de editar código.** Para lecturas, búsquedas y diagnósticos, adelante sin preguntar.

## Sobre mí

- Desarrollador único y owner del proyecto: no hay convenciones de equipo que respetar, las decisiones son mías.
- Cómodo con el stack (React 19, TypeScript, Express, PostgreSQL). Ve al grano y explica solo las partes menos habituales.

## Mi entorno

- **Postgres local**: `docker-compose up -d` levanta Postgres en el puerto **5433** (no 5432), db `family_planner`.
- **Postgres remoto (Neon, plan gratuito)**: también desarrollo contra la BD en la nube. Tiene límites de conexiones y cómputo — evita queries en bucle, polling frecuente o abrir pools nuevos; reutiliza el pool de `src/server/src/db.ts`.
- **Despliegue**: frontend en Vercel, backend en Render (`family-planner-backend-ugxx.onrender.com`, configurado en `src/app/vercel.json`). **No despliegues ni hagas push a producción sin que te lo pida.**
