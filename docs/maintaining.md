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

Publishing requires owner authorization. Configure npm trusted publishing for package `@monabbous/lumenmorph`, repository `monabbous/lumenmorph`, workflow `publish-npm.yml`, and environment `production`.

Run the checks in `CONTRIBUTING.md`, review the packed files, and commit with Conventional Commits. Stable publication remains manual: push to `main`, then dispatch the workflow with the exact stable `package.json` version:

```sh
gh workflow run publish-npm.yml --ref main -f version=0.1.0
```

Use the actual version for later releases. The workflow checks the version, builds generated outputs, runs tests, and publishes with provenance under npm's `latest` tag. Ordinary pushes to `main` don't publish.

### Alpha releases

Keep an alpha on its own named branch, with the exact version in `package.json` and `package-lock.json`. For `0.4.0-alpha.0`, use `release/0.4.0-alpha.0`; do not merge it into `main` to publish it.

An authorized push that changes `package.json` on a `release/*-alpha.*` branch starts the publishing workflow. Review and test the release commit before pushing it. The workflow rejects a branch that does not exactly match `release/<package version>`, and accepts only canonical `x.y.z-alpha.n` versions for this route. Manual dispatch on the same branch is also supported with the exact version input:

```sh
gh workflow run publish-npm.yml --ref release/0.4.0-alpha.0 -f version=0.4.0-alpha.0
```

Both routes run the full release checks and publish with `--tag alpha`, preserving npm's stable `latest` tag. The existing `production` environment and npm trusted publisher must permit the release branch. After npm accepts the package, a separate job creates the matching `v<version>` GitHub prerelease at the release commit, using that version's changelog entry as its notes. Only that job receives repository write permission.

Confirm the npm registry version and dist-tags after publishing. Existing versions are immutable: make the next version and matching branch, such as `0.4.0-alpha.1` on `release/0.4.0-alpha.1`, for subsequent alpha changes.

The lab bundles, recordings, and test fixtures aren't part of the npm package. Retain capture originals outside Git; publish only approved derivatives.
