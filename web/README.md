# CollegePortal — Frontend

React + Vite + Tailwind CSS admin portal for managing students, faculty, courses and attendance.

## Local Development

```bash
npm install
npm run dev        # starts on http://localhost:5173
```

The dev server proxies `/api/*` to `http://localhost:8080` automatically (configured in `vite.config.js`), so no CORS issues during local development.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | Backend base URL (e.g. `https://your-api.onrender.com`) |
| `VITE_APP_NAME` | — | App display name (default: `CollegePortal`) |
| `VITE_APP_VERSION` | — | App version string (default: `1.0.0`) |

Files:
- `.env` — shared non-secret defaults (committed)
- `.env.development` — local overrides (committed)
- `.env.production` — **gitignored**, set via platform dashboard

## Build

```bash
npm run build      # outputs to /dist
npm run preview    # preview the production build locally
```

Vite splits the bundle into:
- `vendor-react` — react, react-dom, react-router-dom
- `vendor-ui` — react-hot-toast, recharts
- `vendor-network` — axios
- Per-route lazy chunks for every page

## Deploy — Vercel (Frontend)

1. Push repo to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Set **Root Directory** to `web`
4. Add environment variable `VITE_API_BASE_URL` → your backend URL
5. Deploy — `vercel.json` handles SPA routing automatically

## Deploy — Render / Railway (Backend)

1. Create a new **Web Service** pointing to your Spring Boot repo
2. Set build command: `./mvnw package -DskipTests`
3. Set start command: `java -jar target/*.jar`
4. Add environment variables:
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
   - `JWT_SECRET`
5. Add your Render/Railway URL as `VITE_API_BASE_URL` in Vercel

## CORS (Backend)

Ensure your Spring Boot app allows the Vercel domain:

```java
@CrossOrigin(origins = "${FRONTEND_URL:http://localhost:5173}")
```

Or configure globally in your `SecurityConfig` / `WebMvcConfigurer`.
