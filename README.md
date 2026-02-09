# Generals Deploy

Web interface for deploying and testing custom trained models for [generals.io](https://generals.io).

take your own .eqx file and drop it into the models folder

training - train you agent in generals-bots repo

Built on top of [generals-bots](https://github.com/strakam/generals-bots) by mstraka.

## Build with Docker

```bash
cd /path/to/generals
docker-compose -f generals-deploy/docker-compose.yml up --build
```


