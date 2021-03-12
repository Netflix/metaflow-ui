# Release process

We follow [Semantic Versioning Specification 2.0.0](https://semver.org/spec/v2.0.0.html).

In short, given a version number MAJOR.MINOR.PATCH, increment the:

1. MAJOR version when you make incompatible API changes,
2. MINOR version when you add functionality in a backwards compatible manner, and
3. PATCH version when you make backwards compatible bug fixes.

Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.

## Shipping a new version

Release process is mostly automated via Github Actions, however few manual steps are required:

- [ ] Make sure `package.json` version is up to date on `master` branch (e.g. `"version": "1.0.0"`)
- [ ] Create new tag from `master` branch (e.g. `git tag v1.0.0`, note the `v` -prefix)
- [ ] Push tag to remote (e.g. `git push origin v1.0.0`)
- [ ] [Package job](https://github.com/Netflix/metaflow-ui/actions/workflows/package.yml) is triggered
- [ ] New [release draft](https://github.com/Netflix/metaflow-ui/releases) is automatically created via Github Actions
- [ ] Edit release draft
  - [ ] Make sure current and previous version are correct
  - [ ] Edit `Compatibility` section (e.g. [latest commit from UI branch](https://github.com/Netflix/metaflow-service/tree/ui))
  - [ ] Edit/remove `Additional resources` section
  - [ ] Make sure release artifact is uploaded
- [ ] Publish release draft

## Preview release notes

You can use `release-notes.sh` locally to preview generated release notes before pushing a tag to remote:

```sh
$ ./release-notes.sh v1.0.0
```
