.PHONY: dev build lint test-unit test-coverage preview clean help

dev:
	pnpm run dev

build:
	pnpm run build

lint:
	pnpm run lint

test-unit:
	pnpm run test:unit

test-coverage:
	pnpm run test:unit -- --coverage --watchAll=false

preview:
	pnpm run preview

clean:
	rm -rf node_modules/.vite
	rm -rf coverage
	rm -rf cypress/videos cypress/screenshots
	pnpm store prune

help:
	@echo ""
	@echo "corporate-messenger — Команды сборки и тестирования"
	@echo "--------------------------------------------------"
	@echo "  make dev               — Запустить dev-сервер"
	@echo "  make build             — Собрать продакшн"
	@echo "  make preview           — Просмотр сборки"
	@echo "  make lint              — Проверить код (ESLint)"
	@echo ""
	@echo "  make test-unit         — Запустить юнит-тесты (Jest)"
	@echo "  make test-coverage     — Покрытие кода (Jest)"
	@echo ""
	@echo "  make preview           — Предпросмотр сборки"
	@echo ""
	@echo "  make clean             — Очистить кэш и артефакты"
	@echo "  make help              — Показать это сообщение"
	@echo ""

.DEFAULT_GOAL := help
