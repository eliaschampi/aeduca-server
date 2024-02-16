.PHONY: start dev lint prettier down

start:
	docker compose up -d

dev:
	docker compose run -p 3000:3000 --rm npm run dev

lint:
	docker compose run --rm npm run lint

prettier:
	docker compose run --rm npm run prettier

down:
	docker compose down
