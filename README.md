# Flutter Clean Architecture
<p align="left">
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-purple.svg" alt="License: MIT"></a>
</p>
Esta extensión genera una estructura de carpetas y archivos para implementar la arquitectura limpia (Clean Architecture) en proyectos de Dart.

## Características
* Genera la estructura básica de carpetas y archivos para la capa de datos (Data), la capa de dominio (Domain) y la capa de interfaz de usuario (UI).
* Crea un archivo index.dart en cada carpeta que exporta todos los archivos de esa carpeta.
* Puede generar las clases y los archivos necesarios para implementar las operaciones CRUD (create, read, update, delete).

## Requerimientos

Antes de utilizar esta extensión, asegúrate de tener instalado [Visual Studio Code](https://code.visualstudio.com/) y la extensión [Dart](https://marketplace.visualstudio.com/items?itemName=Dart-Code.dart-code).

## Uso

Para utilizar esta extensión, sigue los siguientes pasos:

1) Abre Visual Studio Code.
2) Crea un nuevo proyecto de Dart (por ejemplo, utilizando el comando "Dart: New Project" del comando "Command Palette").
3) Abre el menú de la extensión (pulsando en el icono de la barra lateral o utilizando el comando "Extension: Show Extensions").
Busca la extensión "flutter-arq-hex" y pulsa en "Instalar".
4) Abre el menú de comandos (pulsando en "Command Palette" o utilizando el comando "View: Command Palette").
5) Busca el comando "Clean Architecture - Create feature without CRUD" y pulsa en "Ejecutar".
6) Introduce el nombre de la feature (que será utilizado para generar los imports de tus archivos).
7) Si deseas generar las operaciones CRUD, busca el comando "Clean Architecture - Create feature with CRUD" y pulsa en "Ejecutar".

¡Listo! La estructura de carpetas y archivos para la arquitectura limpia ha sido generada. Puedes empezar a implementar tus clases y métodos.

# Licencia
Esta extensión está bajo la licencia [MIT](https://opensource.org/licenses/MIT).

**Enjoy!**
