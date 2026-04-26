install:
	npm ci

dev:
	npx vite

build:
	rm -rf dist
	npx vite build

preview:
	npx vite preview

lint:
	npx eslint .
