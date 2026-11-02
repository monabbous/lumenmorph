# Maintain Lumenmorph

## Register website content

The standalone lab is `public/lab/`. The article is `public/blog.md`; its animated cover supplies blog and lab listing thumbnails. See nabous.dev's `docs/runtime-content.md` for the host contract.

The project supplies content-only HTML and relative functional assets. The host owns fonts, navigation, metadata, and pointer lighting. When `[data-nabous-shell]` is present, the lab reuses `--mouse-x/y` without another pointer listener.

Append this entry to nabous.dev's existing `NABOUS_PROJECTS` repository variable, preserving other entries:

```json
{"slug":"lumenmorph","repository":"monabbous/lumenmorph","ref":"main"}
```

The website's deployment workflow reads the repository variable into the runtime environment. Apply the configuration using that workflow; changing the variable alone doesn't change an already-running container. Once configured, later project-content pushes don't require website rebuilds.

For filesystem-based development, use `{"slug":"lumenmorph","path":"/absolute/path/to/lumenmorph"}` in a development-only project list. Don't combine `path` with `repository`/`ref` on one entry.

## Publish a package

Publishing requires owner authorization and is manual. Configure npm trusted publishing for package `@monabbous/lumenmorph`, repository `monabbous/lumenmorph`, workflow `publish-npm.yml`, and environment `production`.

Run the checks in `CONTRIBUTING.md`, review the packed files, commit with Conventional Commits, and push. Dispatch the workflow on `main` with the exact `package.json` version:

```sh
gh workflow run publish-npm.yml --ref main -f version=0.1.0
```

Use the actual version for later releases. The workflow checks the version, builds generated outputs, runs tests, and publishes with provenance. Pushes alone don't publish. Confirm the npm registry version before registering a new website project or creating its release tag.

The lab bundles, recordings, and test fixtures aren't part of the npm package. Retain capture originals outside Git; publish only approved derivatives.
