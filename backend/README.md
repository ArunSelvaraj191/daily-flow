# DailyFlow Backend API

High-performance, asynchronous REST API for DailyFlow built with FastAPI, Motor (MongoDB), Pydantic v2, and PyJWT.

## Requirements
- Python 3.12+
- MongoDB 6.0+

## Getting Started

1. Set up a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and configure your settings:
   ```bash
   cp .env.example .env
   ```

4. Run database migrations / initialize indexes (handled automatically on app startup):
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. Explore the interactive documentation:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## Running Tests & Linter
```bash
pytest -v
ruff check app tests
```

## Deployment on Render
1. Create a **Web Service** on Render.
2. Select your repository and choose runtime **Python 3**.
3. Set build command: `pip install -r backend/requirements.txt`.
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas URI.
   - `MONGODB_DATABASE`: `dailyflow`.
   - `JWT_SECRET_KEY`: A strong 64-character secret.
   - `FRONTEND_ORIGINS`: Your Vercel frontend domain URL.
