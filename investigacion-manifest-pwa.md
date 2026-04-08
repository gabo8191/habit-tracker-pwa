# Investigación Avanzada de Claves del Web App Manifest para PWAs

## 1. Introducción

El Web App Manifest es un archivo JSON que proporciona a los desarrolladores el poder de controlar cómo se ve y se comporta una aplicación web cuando se "instala" en el dispositivo del usuario. Va más allá de un simple atajo en la pantalla de inicio, permitiendo una integración profunda con el sistema operativo.

Este documento explora diversas claves del manifest, agrupadas por funcionalidad, con explicaciones detalladas, ejemplos y referencias a la documentación oficial. Se enfoca en las capacidades que se pueden declarar y cómo preparan a la aplicación para una experiencia de usuario más rica, aunque la implementación final de la lógica de manejo (por ejemplo, qué hacer con un archivo compartido) reside en el código de la aplicación (JavaScript).

**Nota sobre la Aplicabilidad:** Muchas de estas características requieren que el usuario interactúe con la PWA de una manera específica (por ejemplo, usando el menú de compartir del SO, abriendo un tipo de archivo asociado). La declaración en el manifest es el primer paso; el código de la PWA debe implementar la lógica para manejar estas interacciones. La validación final y las capturas de pantalla de estas interacciones deben realizarse probando la PWA instalada en un navegador y sistema operativo compatibles.

---

## 2. Grupo: Metadatos e Identidad

Estas claves definen la identidad visual y descriptiva de la PWA. Son cruciales para el proceso de instalación y cómo la aplicación aparece en catálogos o en la interfaz del dispositivo.

- **`name` y `short_name`**: `name` es el nombre completo de la aplicación, usado en el banner de instalación. `short_name` es un nombre más corto que se usa donde el espacio es limitado, como debajo del ícono en la pantalla de inicio.
- **`description`**: Una explicación de lo que hace la aplicación. Ayuda a los usuarios a entender su propósito.
- **`categories`**: Un array de strings que sugiere categorías a las que pertenece la aplicación (ej. "books", "education", "games"). Ayuda a las tiendas de aplicaciones a clasificarla.
- **`lang` y `dir`**: `lang` especifica el idioma principal de la aplicación (ej. "en-US", "es-MX"), y `dir` especifica la dirección del texto ("ltr" para izquierda a derecha, "rtl" para derecha a izquierda).
- **`iarc_rating_id`**: Un string que representa el código de certificación de la Coalición Internacional de Calificación por Edad (IARC). Es opcional y sirve para tiendas de aplicaciones que lo requieran.
- **`icons`**: Un array de objetos de ícono, cada uno con `src`, `sizes`, `type` y, opcionalmente, `purpose` ("any", "maskable", "monochrome"). Los íconos "maskable" son clave para una buena apariencia en Android, ya que se adaptan a diferentes formas de íconos.
- **`screenshots`**: Un array de objetos de captura de pantalla, cada uno con `src`, `sizes`, `type` y `form_factor` ("wide" o "narrow"). Estas imágenes se muestran durante el proceso de instalación para dar al usuario una vista previa de la aplicación.

**Ejemplo:** Ver `manifests/manifest-metadata.json`.

---

## 3. Grupo: Capacidades y Permisos

Estas claves no otorgan permisos directamente, pero declaran la intención de la PWA de integrarse con funcionalidades del sistema operativo, lo que a menudo desencadena un flujo de permisos del usuario.

- **`share_target`**: Permite que la PWA se registre como un objetivo en la hoja de compartir del sistema operativo. Cuando un usuario comparte contenido (texto, URLs, archivos) desde otra aplicación, tu PWA puede aparecer como una opción para recibir ese contenido.
  - `action`: La URL que manejará los datos compartidos.
  - `method`: "GET" o "POST". Se recomienda "POST" para manejar archivos.
  - `enctype`: "application/x-www-form-urlencoded" o "multipart/form-data" (necesario para archivos).
  - `params`: Un objeto que mapea los datos compartidos (`title`, `text`, `url`, `files`) a los nombres de los parámetros que recibirá tu `action` URL.
- **`file_handlers`**: Permite que la PWA se registre como un manejador de archivos para ciertos tipos de MIME. Cuando el usuario intenta abrir un archivo de ese tipo desde el explorador de archivos del sistema, la PWA puede ser una opción.
  - `action`: La URL que se abrirá cuando se lance un archivo.
  - `accept`: Un objeto que mapea tipos MIME a un array de extensiones de archivo.
- **`protocol_handlers`**: Registra la PWA como un manejador para un esquema de protocolo específico (ej. `web+chathero://`). Los enlaces que usen este protocolo pueden abrir la PWA directamente.
  - `protocol`: El esquema de protocolo a registrar (debe empezar con "web+").
  - `url`: La URL dentro de la PWA que manejará el enlace, con `%s` como marcador de posición para la URL completa del enlace.

**Ejemplo:** Ver `manifests/manifest-permisos.json`.
**Causa de no aplicabilidad directa:** Estas características requieren un sistema operativo y un navegador que las soporten (ej. Chrome en Android para `share_target`, Chrome/Edge en escritorio para `file_handlers`). La prueba final consiste en instalar la PWA y verificar que aparezca en los diálogos de "Compartir" o "Abrir con".

---

## 4. Grupo: Configuración de Ventana

Estas claves controlan cómo se ve y se comporta la ventana de la PWA una vez que se inicia.

- **`display`**: Define el modo de visualización preferido. Valores comunes:
  - `standalone`: La PWA se abre en su propia ventana, sin la UI del navegador. Es el más común.
  - `fullscreen`: Ocupa toda la pantalla.
  - `minimal-ui`: Similar a `standalone` pero con una UI mínima del navegador (ej. botones de atrás/adelante).
  - `browser`: Se abre en una pestaña normal del navegador.
- **`display_override`**: Un array de modos de `display` que el navegador probará en orden antes de recurrir al valor de `display`. Esto permite, por ejemplo, intentar usar `window-controls-overlay` (para PWAs de escritorio que quieran dibujar en la barra de título) y luego caer a `standalone` si no es compatible.
- **`orientation`**: Define la orientación por defecto de la aplicación (ej. "portrait", "landscape", "any").
- **`theme_color` y `background_color`**: `theme_color` define el color de la barra de herramientas de la ventana. `background_color` define un color de fondo de marcador de posición que se muestra mientras la hoja de estilos de la aplicación se está cargando.
- **`launch_handler`**: Controla qué sucede cuando la PWA se inicia varias veces.
  - `client_mode`: Puede ser "navigate-existing" (la ventana existente navega a la URL del `start_url`), "focus-existing" (la ventana existente simplemente se enfoca), o "navigate-new" (siempre se abre una nueva ventana).

**Ejemplo:** Ver `manifests/manifest-ventana.json`.

---

## 5. Grupo: Desarrollador y Distribución

Estas claves ayudan en la distribución y ofrecen funcionalidades adicionales a los usuarios.

- **`shortcuts`**: Define una lista de accesos directos que aparecen cuando un usuario hace un clic largo o derecho en el ícono de la PWA en su sistema operativo. Cada atajo tiene un `name`, `url` y opcionalmente `description` e `icons`.
- **`related_applications` y `prefer_related_applications`**: `related_applications` permite especificar aplicaciones nativas relacionadas (ej. de la Play Store o App Store). Si `prefer_related_applications` es `true`, el navegador podría sugerir al usuario que instale la aplicación nativa en lugar de la PWA. Esto es útil para dirigir a los usuarios a una experiencia nativa si se desea.

**Ejemplo:** Ver `manifests/manifest-desarrollador.json`.

---

## 6. Grupo: Otros y Experimentales

Estas son claves más nuevas o con soporte limitado que habilitan casos de uso específicos.

- **`scope_extensions`**: Permite que una PWA, cuyo `scope` está en un origen, declare que también tiene control sobre otros orígenes. Esto es útil para empresas con múltiples dominios que forman parte de una misma experiencia de aplicación. Requiere un acuerdo entre los orígenes a través de un archivo `.well-known/web-app-origin-association`.
- **`note_taking`**: Una capacidad que declara que la aplicación puede tomar notas.
  - `new_note_url`: La URL que se debe abrir para crear una nueva nota. Esto puede integrarse con asistentes de sistema operativo para acciones como "Ok Google, tomar una nota con [nombre de la PWA]".

**Ejemplo:** Ver `manifests/manifest-otros.json`.
**Causa de no aplicabilidad directa:** Estas son características experimentales. `scope_extensions` requiere configuración del servidor en los orígenes asociados. `note_taking` depende del soporte del sistema operativo y del navegador para la acción de tomar notas.

---

## 7. Referencias y Fuentes

1.  **MDN Web Docs - Web App Manifest**: La referencia principal y más completa sobre todas las claves del manifest.
    - [developer.mozilla.org/en-US/docs/Web/Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
2.  **web.dev by Google - The Web App Manifest**: Una guía de aprendizaje estructurada con excelentes explicaciones y mejores prácticas.
    - [web.dev/learn/pwa/web-app-manifest/](https://web.dev/learn/pwa/web-app-manifest/)
3.  **W3C - Web App Manifest Specification**: El borrador oficial de la especificación. Es técnico pero es la fuente de la verdad.
    - [w3c.github.io/manifest/](https://w3c.github.io/manifest/)
4.  **Chrome for Developers - PWA Capability Articles**: Artículos detallados sobre la implementación de capacidades específicas como `share_target`, `file_handlers`, etc.
    - [developer.chrome.com/docs/capabilities/web-apis/](https://developer.chrome.com/docs/capabilities/web-apis/)
