# StepClaim

**StepClaim** is an innovative, location-based territory conquest game that transforms your everyday physical activities—running, walking, and cycling—into an interactive, real-world digital land grab.

By blending fitness tracking with competitive geographic control, StepClaim turns your neighborhood into a live multiplayer battlefield. Every step you take actively claims the ground beneath your feet, allowing you to build an empire of territories, compete against neighboring runners, and rise through the ranks.

## Core Features

* **Real-time Territory Conquest:** Uses Uber's H3 Hexagonal Hierarchical Spatial Index to map the globe into conquerable sectors. Your live GPS coordinates actively capture and paint territories on your map as you run.
* **Live Multiplayer Sync:** A high-performance Socket.io engine broadcasts live captures and presence, allowing you to see nearby runners and instantly recognize when your claimed territories are under attack.
* **Intelligent Anti-Cheat System:** Advanced backend velocity and acceleration heuristics ensure all captures are performed at realistic human speeds, automatically detecting and flagging teleportation or vehicle spoofing.
* **RPG Progression System:** Gain Experience Points (XP) for every kilometer traveled and every new hex captured. Level up your runner profile to unlock new tiers and achievements.
* **Global & Local Leaderboards:** Compete against the community for total distance covered, total territories owned, and longest active running streaks.

## Technology Stack

* **Frontend:** Next.js, React, Tailwind CSS, Zustand (State Management), React-Leaflet (Mapping)
* **Backend:** Node.js, Fastify, Socket.io, Prisma ORM
* **Database:** PostgreSQL (Supabase)
* **Geospatial Engine:** H3-js

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
