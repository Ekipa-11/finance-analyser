# Finance analyser client
This is the frontend of finance-analyser

![Logo](./src/icons/logo_96x96.png)

## Running

Make sure environment variables are set.  
For more information, see the [Environment Variables](#environment-variables) section below.

### Node.js

1. Install dependencies:

```bash
npm install
```

2. Start the server:
```bash
npm run start
```

### Docker compose
Some [environment variables](#environment-variables) are set in `docker-compose.yaml` and `docker-compose.dev.yaml`.

```bash
docker compose up -d --build
```

### Development
To run the frontend in development mode, you can use the following command:

```bash
docker compose -f docker-compose.dev.yaml up --build
```
or with this one liner:
```bash
docker compose -f docker-compose.dev.yaml down && docker compose -f docker-compose.dev.yaml up -d --build && docker compose -f docker-compose.dev.yaml logs -f --no-log-prefix
```

## Environment Variables

Make sure to set the following environment variables in a `.env` file or in your environment:
```yaml
API_BASE_URL=http://localhost:3000/api # set in docker-compose.yaml
PORT=4000 # set in docker-compose.yaml
```
