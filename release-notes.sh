#!/bin/bash

# Usage:
#   ./release-notes.sh
#   ./release-notes.sh [current-release]
#   ./release-notes.sh [current-release] [previous-release]
#   GITHUB_TOKEN=ghp_hJe... ./release-notes.sh
#
# Example:
#   ./release-notes.sh
#   ./release-notes.sh v1.0.1
#   ./release-notes.sh v1.0.1 v1.0.0

SERVICE_BRANCH="ui"

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

# Call Github API and use GITHUB_TOKEN from env if available
# 
# Example (Get latest release from repository)
#   gh_api /repos/Netflix/metaflow-service/releases/latest
gh_api() {
    if [ -z "$GITHUB_TOKEN" ]
    then
        curl -s https://api.github.com$1
    else
        curl -s -H "Authorization: token ${GITHUB_TOKEN}" https://api.github.com$1
    fi
}    

# Extract value of key from JSON input
# 
# Example (key value of key 'foo'):
#   get_json_value '{"foo": "bar"}' foo
get_json_value() {
    json_value=$(echo $1 | sed -n "s|.*\"$2\": \"\([^\"]*\)\".*|\1|p")
    echo "${json_value}"
}

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
            # Take message from commit message body BUT take only first line of commit body. Github squash by default
            # adds all the commits to the message and that doesn't looks so good here. Also remove '* ' that is in squashed messages
            # by default
            local body=$(git log $commit -1 --pretty='format:%b' | head -n 1 | sed 's/* //')
            # If merge commit body is empty, use subject instead.
            if [ -z "$body" ]
            then
                local body=$(git log $commit -1 --pretty='format:%s')
            fi

            echo "https://github.com/Netflix/metaflow-ui/pull/${prid:1} - $body"
        done <<< "$1"
    fi
}

GH_RELEASE=$(gh_api /repos/Netflix/metaflow-service/releases/latest)
GH_BRANCH_REF=$(gh_api /repos/Netflix/metaflow-service/git/refs/heads/${SERVICE_BRANCH})
SERVICE_RELEASE=$(get_json_value "$GH_RELEASE" tag_name)
SERVICE_REF=$(get_json_value "$GH_BRANCH_REF" sha)
SERVICE_RELEASE=${SERVICE_RELEASE:-2.0.10}
SERVICE_REF=${SERVICE_REF:-ea55caf22b38d6c4a9faa255216be2df35aa988a}

RELEASE_DATE=$(date)

MERGES=$(git log --first-parent --pretty='format:%h %s' ${PREVIOUS_VERSION}..${VERSION})
PR=$(echo "${MERGES}" | grep "#[[:digit:]]")
PR_FEATURES=$(echo "${PR}" | grep -E 'feat/|feat:|Feat/')
PR_BUGS=$(echo "${PR}" | grep -E 'bug/|bug:|hotfix/|hotfix:|bugfix/|bugfix:')
PR_IMPROVEMENTS=$(echo "${PR}" | awk '!/feat\/|feat:|Feat\// && !/bug\/|bug:/ && !/hotfix\/|hotfix:/ && !/bugfix\/|bugfix:/')

RELEASE_NOTES="\
**What’s new in version** \`${VERSION}\`
- Release date: \`${RELEASE_DATE}\`
- Release package: [metaflow-ui-${VERSION}.zip](https://github.com/Netflix/metaflow-ui/releases/download/${VERSION}/metaflow-ui-${VERSION}.zip)

## Compatibility

| Service version | ${SERVICE_RELEASE} | [${SERVICE_BRANCH}][service-branch] | Netflix/metaflow-service@${SERVICE_REF} |
| --------------- | ------------------ | -------------------- | --------------------------------------- |
| Compatibility   | ?                  | ✓                    | ✓                                       |

- \`✓\` Fully supported version
- \`?\` Unknown compatibility

[service-branch]: https://github.com/Netflix/metaflow-service/tree/${SERVICE_BRANCH}

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