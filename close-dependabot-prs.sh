#!/bin/bash

# This script would close all open Dependabot PRs
# Note: This requires GitHub CLI (gh) to be installed and authenticated

# Get all open PRs from Dependabot
DEPENDABOT_PRS=$(gh pr list --author "dependabot[bot]" --state open --json number,title --jq '.[] | "\(.number) \(.title)"')

# Loop through each PR and close it with a comment
for PR in $DEPENDABOT_PRS; do
  PR_NUMBER=$(echo $PR | cut -d' ' -f1)
  echo "Closing PR #$PR_NUMBER"
  
  # Add a comment explaining why we're closing the PR
  gh pr comment $PR_NUMBER --body "Closing this PR as it's being superseded by a comprehensive dependency update PR that fixes all compatibility issues at once."
  
  # Close the PR
  gh pr close $PR_NUMBER --comment "Superseded by comprehensive dependency update PR"
done

echo "All Dependabot PRs have been closed."