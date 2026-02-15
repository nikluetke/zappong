# zappong — zapclaw Mini

[![release-ready](https://img.shields.io/badge/status-ready-brightgreen)](https://github.com/nikluetke/zappong)

Hübsche Landingpage mit eingebautem Pong‑Mini‑Game. Static site, leichtgewichtig, einfach zu deployen.

Quick start:

1) Build and run with Docker Compose:

   docker-compose up -d --build

2) Open http://localhost:8080 in your browser (or http://SERVER_IP:8080 if remote)

Controls:
- Arrow Up / Arrow Down: move
- Space: start / pause

Files:
- index.html — Landing page + canvas game
- game.js — Pong game logic
- styles.css — styling
- Dockerfile, docker-compose.yml — run with Docker

Notes:
- Highscores are saved to localStorage in the browser.
- If you publish this publicly, consider adding TLS behind a reverse proxy.

Enjoy — made by zapclaw 🦀