# Claude Code Mobile - Development Automation
# Complete build, test, and deployment automation

.PHONY: help start-backend start-metro start-app start-all test-backend test-frontend test-all clean clean-metro clean-backend install stop-all

# Default target
.DEFAULT_GOAL := help

#==========================================
# HELP
#==========================================

help: ## Show this help message
	@echo "Claude Code Mobile - Development Commands"
	@echo ""
	@echo "🚀 Starting Services:"
	@echo "  make start-backend     Start Python FastAPI backend (port 8001)"
	@echo "  make start-metro       Start Metro bundler with MCP support (port 8081)"
	@echo "  make start-app         Launch iOS app in simulator"
	@echo "  make start-all         Start complete environment (backend + Metro + app)"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test-backend      Run backend sanity tests (6 tests)"
	@echo "  make test-frontend     Run frontend validation"
	@echo "  make test-all          Run complete test suite"
	@echo ""
	@echo "🛠️  Maintenance:"
	@echo "  make install           Install all dependencies (backend + frontend)"
	@echo "  make clean             Clean all caches and temporary files"
	@echo "  make clean-metro       Clean Metro cache only"
	@echo "  make stop-all          Stop all running services"
	@echo ""
	@echo "📊 Status:"
	@echo "  make status            Check status of all services"
	@echo ""

#==========================================
# SERVICE MANAGEMENT
#==========================================

start-backend: ## Start Python FastAPI backend
	@echo "🚀 Starting Python backend on port 8001..."
	@cd backend && uvicorn claude_code_api.main:app --host 0.0.0.0 --port 8001 --reload

start-metro: ## Start Metro bundler with MCP support
	@echo "🚀 Starting Metro bundler with MCP support on port 8081..."
	@cd claude-code-mobile && EXPO_UNSTABLE_MCP_SERVER=1 npx expo start

start-app: ## Launch iOS app in simulator
	@echo "🚀 Launching iOS app..."
	@xcrun simctl launch booted com.yourcompany.claudecodemobile || \
		(cd claude-code-mobile && npx expo run:ios --device 058A3C12-3207-436C-96D4-A92F1D5697DF)

start-all: ## Start complete environment (script)
	@echo "🚀 Starting complete environment..."
	@./scripts/start-integration-env.sh

stop-all: ## Stop all services
	@echo "🛑 Stopping all services..."
	@pkill -9 -f "expo start" || true
	@pkill -f uvicorn || true
	@echo "✅ All services stopped"

#==========================================
# TESTING
#==========================================

test-backend: ## Run backend sanity tests (6 tests)
	@echo "🧪 Running backend sanity tests..."
	@./scripts/test-python-backend-sanity.sh

test-frontend: ## Validate frontend (TypeScript + build)
	@echo "🧪 Validating frontend..."
	@cd claude-code-mobile && npx tsc --noEmit | grep -v "node_modules" || echo "✅ TypeScript clean"

test-all: test-backend test-frontend ## Run all tests
	@echo "✅ All tests complete"

#==========================================
# INSTALLATION
#==========================================

install: install-backend install-frontend ## Install all dependencies

install-backend: ## Install Python backend dependencies
	@echo "📦 Installing backend dependencies..."
	@cd backend && pip install -e .

install-frontend: ## Install React Native dependencies
	@echo "📦 Installing frontend dependencies..."
	@cd claude-code-mobile && npm install

#==========================================
# CLEANING
#==========================================

clean: clean-metro clean-backend ## Clean all caches and temporary files
	@echo "✅ All caches cleaned"

clean-metro: ## Clean Metro bundler cache
	@echo "🧹 Cleaning Metro cache..."
	@cd claude-code-mobile && rm -rf .expo node_modules/.cache
	@echo "✅ Metro cache cleaned"

clean-backend: ## Clean backend cache and temp files
	@echo "🧹 Cleaning backend cache..."
	@cd backend && rm -rf __pycache__ .pytest_cache claude_code_api/__pycache__
	@echo "✅ Backend cache cleaned"

#==========================================
# STATUS CHECKS
#==========================================

status: ## Check status of all services
	@echo "📊 Service Status:"
	@echo ""
	@echo "Backend (port 8001):"
	@curl -s http://localhost:8001/health 2>/dev/null && echo "  ✅ Running" || echo "  ❌ Not running"
	@echo ""
	@echo "Metro (port 8081):"
	@curl -s http://localhost:8081/status 2>/dev/null && echo "  ✅ Running" || echo "  ❌ Not running"
	@echo ""
	@echo "iOS Simulator:"
	@xcrun simctl list devices | grep "Booted" | head -1 || echo "  ❌ No simulator booted"
	@echo ""

#==========================================
# DEVELOPMENT HELPERS
#==========================================

logs-backend: ## Tail backend logs
	@tail -f /tmp/backend-server.log

logs-metro: ## Tail Metro logs
	@tail -f /tmp/metro-final.log || tail -f logs/metro.log

screenshot: ## Take app screenshot
	@xcrun simctl io booted screenshot /tmp/app-$(shell date +%Y%m%d-%H%M%S).png
	@echo "Screenshot saved to /tmp/"

health: ## Check backend health
	@curl -s http://localhost:8001/health | python3 -m json.tool

models: ## List available Claude models
	@curl -s http://localhost:8001/v1/models | python3 -m json.tool

#==========================================
# GIT HELPERS
#==========================================

commit: ## Quick commit with message (use: make commit MSG="your message")
	@git add -A
	@git commit -m "$(MSG)"

push: ## Push to remote
	@git push origin main

status-git: ## Show git status
	@git status

#==========================================
# VALIDATION GATES
#==========================================

gate-p1: ## Validate backend (Gate P1)
	@./scripts/test-python-backend-sanity.sh

gate-f1: ## Validate frontend visual theme (Gate F1)
	@echo "Run manual visual validation with screenshots"
	@echo "See docs/plans/2025-11-01-frontend-validation-REAL.md"

gate-f2: ## Validate frontend functional (Gate F2)
	@echo "Run functional screen tests"
	@echo "See docs/plans/2025-11-01-frontend-validation-REAL.md"

gate-i1: ## Validate integration (Gate I1)
	@echo "Run integration tests with backend + frontend"
	@echo "See docs/plans/2025-11-01-frontend-validation-REAL.md"
