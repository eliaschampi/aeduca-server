# Node Server con MongoDB y PostgreSQL en Docker

Este proyecto es un servidor Node.js que se conecta a MongoDB y PostgreSQL. Ambos servicios de base de datos se ejecutan en contenedores Docker.

## Preparación

Antes de comenzar, asegúrate de tener Docker y Docker Compose instalados en tu máquina.

## Comandos útiles de Docker

Para eliminar todos los contenedores, imágenes, volúmenes y redes no utilizados:

```bash
docker rm -f "lista"
docker rmi las imagenes server-app y mongo
```

No te olvides de Borrar la carpeta mongodata

## Cómo ejecutar el proyecto

### Construye y ejecuta los contenedores 

* *_Importante:_ No te olvides de ejecutar servicio de postgresql antes*
Recuerda, necesitamos usar el ip local del contenedor de postgres, para obtenerlo ejecutamos:
```bash
ip -4 addr show docker0 | grep -Po 'inet \K[\d.]+'
```
Luego corremos nuestro contenedor
```bash
docker-compose up -d
```

Si necesitas ejecutar comandos como npm run lint o npm run prettier en tu contenedor Docker, puedes hacerlo utilizando el comando docker-compose exec: Para npm run lint:

```bash
docker-compose exec app npm run lint
```

Para npm run prettier:

```bash
docker-compose exec app npm run prettier
```
