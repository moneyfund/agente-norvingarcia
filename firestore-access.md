# Activar la privacidad en Firebase

El sitio utiliza el proyecto `norvin-garcia-inmobiliaria`. Las dos políticas completas son [firestore.rules](./firestore.rules) y [storage.rules](./storage.rules). La cuenta administrativa configurada es `agentenorvingarcia@gmail.com`, verificada por Google. Los perfiles de clientes conservan su acceso a los formularios, comentarios y reseñas.

Desde la raíz del repositorio, con una sesión con permiso de publicación en ese proyecto, se aplican ambas políticas con este comando.

```sh
firebase deploy --only firestore:rules,storage --project norvin-garcia-inmobiliaria
```

La misma operación se puede realizar pegando cada archivo en la pestaña **Reglas** del producto correspondiente y pulsando **Publicar**. El despliegue de Vercel actualiza la web. Firebase administra las reglas por separado.

## Archivos privados anteriores

En **Storage → Archivos**, revisa los objetos de `avaluos/` y `listado/`. Revoca las URL de descarga antiguas en los detalles de cada archivo que tenga un token. Un enlace que alguien ya recibió puede seguir funcionando hasta revocarlo. La aplicación conserva el documento histórico y usa la ruta del objeto para leerlo con la sesión administrativa. Las imágenes alojadas por terceros dependen de los permisos de su proveedor.

Verifica desde el dominio final que una foto de un expediente se muestre en su detalle y en su PDF. Las lecturas binarias desde el navegador necesitan que el bucket admita CORS para ese dominio. La configuración esperada figura en [cors.json](./cors.json).

## Pruebas locales

`npm run test:access` ejecuta las reglas de ambos servicios sobre registros sintéticos del proyecto local `demo-ng-access`. Incluye visitante, cliente Google, cuenta sin verificar, otro proveedor y administrador. `npm run test:rural-sur` verifica la curva de cálculo de avalúos existente.
