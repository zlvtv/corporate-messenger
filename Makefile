.PHONY: dev build lint test test-unit test-unit-watch test-coverage e2e component open-cypress preview clean help

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

test-unit:
	npm run test:unit

test-unit-watch:
	npm run test:unit -- --watch

test-coverage:
	npm run test:unit -- --coverage --watchAll=false

e2e:
	npm run dev & sleep 3; npm run cypress:open

component:
	npm run cypress:component

open-cypress:
	npm run cypress:open

preview:
	npm run preview

clean:
	rm -rf node_modules/.vite
	rm -rf coverage
	rm -rf cypress/videos cypress/screenshots
	npm cache clean --force

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
	@echo "  make test-unit-watch   — Юнит-тесты в режиме watch"
	@echo "  make test-coverage     — Покрытие кода (Jest)"
	@echo ""
	@echo "  make e2e               — Запустить E2E тесты (Cypress)"
	@echo "  make component         — Запустить компонентные тесты (Cypress)"
	@echo "  make open-cypress      — Открыть Cypress UI"
	@echo ""
	@echo "  make clean             — Очистить кэш и артефакты"
	@echo "  make help              — Показать это сообщение"
	@echo ""

.DEFAULT_GOAL := help
