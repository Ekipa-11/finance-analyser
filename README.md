# Finance analyser

![Logo](./frontend/src/icons/logo_96x96.png)


## Finance manager and analyser

This is a personal finance manager and analyser.

Read more in the [frontend](./frontend/README.md) and [backend](./backend/README.md) README files.

## Running

You should run it separately in the frontend and backend directories.  
Read more in the [frontend](./frontend/README.md) and [backend](./backend/README.md) README files.

For ease of use, you can run everything with Docker Compose.  
It is provided 'as-is'. Any changes should be made in the separate services ([frontend](./frontend/README.md) and [backend](./backend/README.md))

If the refrenced docker files change, this composite file should still work, but always check before commiting.

```bash
docker compose up -d --build
```

or with this one-liner:

```bash
docker compose down && docker compose up -d --build && docker compose logs frontend backend -f
```

## Hotkeys

- "." + Left alt = Page reload (Both sites)
- "," + Left alt = Export csv (Budgets site)
- Enter = Go to Graphs site