.PHONY: up down test

up:
	docker compose up --build -d

down:
	docker compose down

test:
	cd backend && pytest -v
