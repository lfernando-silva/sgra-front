# Sistema-de-Gerência-Remota-De-Alarmes
O objetivo do trabalho foi construir um sistema de alarme real-time baseado no conceito de internet das coisas, utilizando a tecnologia NodeJS. Houve a construção de um backend, com a construção de um servidor de sockets TCP, e um frontend RESTful utilizando o ExpressJS framework. Além disso, a persistência foi feita numa base de dados não relacional MongoDB.

Essa é a API frontend, baseada em REST com expressJS.

Running with docker - Example

```sh
docker run -d  --name sgra -p 27029:27017 -e MONGO_INITDB_ROOT_USERNAME=alarm_root -e MONGO_INITDB_ROOT_PASSWORD=123456 mongo
```

MONGO_URI: 

```
mongodb://alarm_root:123456@localhost:27029/sgra?authSource=admin
```