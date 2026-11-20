# Norvin García - Plataforma Inmobiliaria

Aplicación web con frontend público + dashboard privado construida con React, Vite, Tailwind y Firebase.

## Características implementadas

- Dashboard privado en `/admin` con layout SaaS (sidebar + header).
- Login en `/admin/login` con Firebase Auth (email/password).
- Protección de rutas privadas.
- CRUD completo de propiedades (Firestore + Storage).
- Perfil editable del agente (Firestore + Storage).
- Sitio público conectado a Firestore (`/propiedades`, `/propiedad/:id`, `/mapa`, portada).
- Estados de carga y manejo de errores en módulos clave.

## Estructura

```txt
/src
  /admin
    /pages
    /components
    /layouts
  /services
    firebase.js
    propiedadesService.js
    agentesService.js
  /context
    authContext.jsx
```

## Configuración

1. Copia `.env.example` a `.env`.
2. Completa tus credenciales Firebase `VITE_FIREBASE_*`.
3. Ejecuta:

```bash
npm install
npm run dev
```

## Acceso administrativo

Las políticas completas y el procedimiento de publicación están en [Privacidad en Firebase](./firestore-access.md). La sesión de clientes permite enviar formularios y participar en las fichas públicas. Captaciones, avalúos, documentos e historial requieren la cuenta administrativa verificada.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
