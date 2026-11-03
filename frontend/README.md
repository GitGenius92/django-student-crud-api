# Northstar Student Management

React/Vite student administration frontend connected to the existing Django REST API.

## Local development

1. Start Django from `backend/`:

   ```sh
   python manage.py runserver
   ```

2. Start the frontend from `frontend/`:

   ```sh
   npm install
   npm run dev
   ```

Vite proxies `/api` requests to `http://127.0.0.1:8000` by default. Override the development target with `VITE_DJANGO_API_TARGET` if Django runs elsewhere.

## API configuration

The frontend uses the existing endpoints:

- `GET /api/students/` — list student records
- `POST /api/students/` — create a record
- `GET /api/students/<id>/` — read a record
- `PUT /api/students/<id>/` — update a record
- `DELETE /api/students/<id>/` — remove a record

The frontend expects the existing `{id, name, email, age, course, created_at}` response shape. Dashboard registration dates and course summaries are derived from those API records. Course names remain free-form, matching the Django model. The API does not expose a status field, so the directory uses a neutral “Registered” record label rather than inventing enrollment states.

Set `VITE_API_BASE_URL` when the API is served at a different base path or origin. For a different-origin production deployment, configure the required CORS policy in the deployment or Django environment before using an absolute API URL. No login or token flow is defined by this project; the frontend uses the existing API defaults and sends a Django CSRF header when a same-origin CSRF cookie is available.

## Validation

```sh
npm run lint
npm run build
```
