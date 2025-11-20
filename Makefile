type ?= patch
example := src/example

run := deno run -A
prettier := ${run} npm:prettier
esbuild := ${run} npm:esbuild

all: lint test dry-run
	git config core.hooksPath src/git

clean:
	rm -rf node_modules
	find . -path '*/coverage*' -delete

dry-run:
	deno publish --dry-run --allow-dirty

example:
	${esbuild} \
		${example}/client.ts \
		${example}/index.ts \
		${example}/worker.ts \
		--bundle \
		--outdir=${example} \
		--platform=neutral \
		--serve=127.0.0.1:8080 \
		--servedir=${example} \
		--serve-fallback=${example}/index.html

format:
	${prettier} --write .

increment:
	git diff --quiet --exit-code HEAD
	git tag "$${make -s version}"
	${run} src/cmd/increment.ts ${type}
	make format
	git add deno.json
	git diff --quiet --exit-code
	git commit -m "next version $$(make -s version)"
	git push --follow-tags

lint:
	${prettier} --check .
	deno lint

pre-commit: all

publish: all
	deno publish

test:
	deno test -A --coverage src/test

version:
	${run} -r src/cmd/version.ts
