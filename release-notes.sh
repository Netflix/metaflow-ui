#!/bin/bash

# Usage:
#   ./release-notes.sh
#   ./release-notes.sh [current-release]
#   ./release-notes.sh [current-release] [previous-release]
# Example:
#   ./release-notes.sh
#   ./release-notes.sh v1.0.1
#   ./release-notes.sh v1.0.1 v1.0.0

VERSION=${1:-$(git rev-parse --short HEAD)}
PREVIOUS_VERSION=${2:-$(git describe --abbrev=0 ${VERSION}^ --tags)}

if ! git describe ${VERSION} --tags &> /dev/null; then
    echo "Invalid current release: ${VERSION}"
    exit 1
fi
if ! git describe ${PREVIOUS_VERSION} --tags &> /dev/null; then
    echo "Invalid previous release: ${PREVIOUS_VERSION}"
    exit 1
fi

# Format list of PR merge commits
# 
# Expected input:
#   6207fe4 Merge pull request #296 from ...
# 
# Output:
#   https://github.com/Netflix/metaflow-ui/pull/296 - Pull request description
function format_pr() {
    if [ -z "$1" ]
    then
        echo "None"
    else
        while read -r merge
        do
            local prid=$(echo $merge | egrep -o '#[[:digit:]]+')
            local commit=$(echo $merge | awk '{print $1}')
            local body=$(git log $commit -1 --pretty='format:%b')
            echo "https://github.com/Netflix/metaflow-ui/pull/${prid:1} - $body"
        done <<< "$1"
    fi
}

RELEASE_DATE=$(date)

MERGES=$(git log --merges --pretty='format:%h %s' ${PREVIOUS_VERSION}..${VERSION})
PR=$(echo "${MERGES}" | grep "Merge pull request")
PR_FEATURES=$(echo "${PR}" | grep -E 'feat/')
PR_BUGS=$(echo "${PR}" | grep -E 'bug/|hotfix/')
PR_IMPROVEMENTS=$(echo "${PR}" | awk '!/feat\// && !/bug\// && !/hotfix\//')

RELEASE_NOTES="\
**What’s new in version** \`${VERSION}\`
- Release date: \`${RELEASE_DATE}\`
- Release package: [metaflow-ui-${VERSION}.zip](https://github.com/Netflix/metaflow-ui/releases/download/${VERSION}/metaflow-ui-${VERSION}.zip)

## Compatibility

| Service version | 2.0.4 | [ui][service-branch] | Netflix/metaflow-service@ea55caf22b38d6c4a9faa255216be2df35aa988a |
| --------------- | ----- | -------------------- | ----------------------------------------------------------------- |
| Compatibility   | ?     | ✓                    | ✓                                                                 |

- \`✓\` Fully supported version
- \`?\` Unknown compatibility

[service-branch]: https://github.com/Netflix/metaflow-service/tree/ui

## Changelog

- **New features**
$(format_pr "${PR_FEATURES}" | sed 's/^/  - /')
- **Bug fixes**
$(format_pr "${PR_BUGS}" | sed 's/^/  - /')
- **Improvements**
$(format_pr "${PR_IMPROVEMENTS}" | sed 's/^/  - /')

Full commit history since the previous release can be found [here](https://github.com/Netflix/metaflow-ui/compare/${PREVIOUS_VERSION}...${VERSION})

## Additional resources

"

echo "$RELEASE_NOTES"