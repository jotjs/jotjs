all: clean build

build: lint
	deno run -A src/cmd/build.ts

clean:
	rm -rf dist node_modules

example:
	deno run -A src/cmd/example.ts

format: node_modules
	deno run -A npm:prettier --write .

increment-patch: __patch format __version

lint: node_modules
	deno run -A npm:prettier --check .
	deno lint
	deno publish --dry-run --allow-dirty

node_modules:
	deno install
	git config core.hooksPath src/git

pre-commit: build

version:
	deno run -A src/cmd/version.ts

__patch:
		deno run -A src/cmd/version_increment.ts patch

__version:
	git add .
	git commit --amend
	git tag "$$(deno run -A src/cmd/version.ts)"
