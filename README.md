HIS - Heatlh Information System

 Tech Stack

- Backend: NestJS, Express, TypeScript
- Database: MongoDB (Mongoose)
- Authentication: JWT, bcrypt
- Monitoring: Prometheus, Grafana
- API Documentation: Swagger/OpenAPI
- Security: Rate limiting, Multi-tenancy

 Requirements

- Node.js 18+
- Docker & Docker Compose

 Quick Start

 With Docker

```bash
cd His
docker-compose up -d
```

App will be available at `http://localhost:3000`

 With Monitoring (Prometheus + Grafana)

```bash
cd His
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

- App: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3002` (admin/admin)

 Local Development

```bash
cd His
npm install
npm run dev
```

 Environment Variables

Create `.env` file in `His/` folder:

```env
PORT=3000
DB_CONNECTION_STRING=mongodb://localhost:27017/his
ENCRYPTION_KEY=your-secret-key

```

 API Documentation

Swagger UI available at `http://localhost:3000/api`

 Available Scripts

```bash
npm run dev
npm run build
npm run start:prod
npm run test
```

---


