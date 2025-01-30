all: clean lint

clean:
	rm -rf dist node_modules

example:
	deno run -A src/cmd/example.ts

format: node_modules
	deno run -A npm:prettier --write .

lint: node_modules
	deno run -A npm:prettier --check .
	deno lint
	deno publish --dry-run --allow-dirty

node_modules:
	deno install
	git config core.hooksPath src/git

pre-commit: clean lint

version: version-patch format

version-patch:
		deno run -A src/cmd/version.ts patch
