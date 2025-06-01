#!/bin/bash

# GitHub Activity Banner Update Script
# This script creates a new branch with the specified message

# Colors for output
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

MESSAGE="AI ENGR"
BRANCH_NAME="message-ai-engr"
USE_UTC=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --message=*)
      MESSAGE="${1#*=}"
      shift
      ;;
    --branch=*)
      BRANCH_NAME="${1#*=}"
      shift
      ;;
    --use-utc)
      USE_UTC=true
      shift
      ;;
    --help)
      echo "Usage: ./update-banner.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --message=TEXT          Specify the message text (default: AI ENGR)"
      echo "  --branch=NAME           Specify the branch name (default: message-ai-engr)"
      echo "  --use-utc               Use UTC timezone for commits (default: use local timezone)"
      echo "  --help                  Show this help message"
      exit 0
      ;;
    *)
      shift
      ;;
  esac
done

echo -e "${BLUE}=== GitHub Activity Banner Update Script ===${NC}"
echo -e "${BLUE}This script creates a new branch with the specified message${NC}\n"

# Clean up any existing lock files
echo -e "${YELLOW}Cleaning up any Git lock files...${NC}"
find .git -name "*.lock" -delete
echo -e "${GREEN}✓ Lock files removed${NC}"

# Reset any uncommitted changes
git reset --hard HEAD
git clean -fd
echo -e "${GREEN}✓ Working directory cleaned${NC}"

# Create a new branch for the message
echo -e "${YELLOW}Creating branch: $BRANCH_NAME${NC}"
git checkout --orphan "$BRANCH_NAME"

# Remove all files from the working directory
git rm -rf . 2>/dev/null || true

echo -e "${GREEN}✓ Created new orphan branch with no history: $BRANCH_NAME${NC}\n"

# Copy necessary files from fresh-start branch
echo -e "${YELLOW}Copying source files from fresh-start branch...${NC}"
git checkout fresh-start -- .gitignore patterns/ activity-generator.js cli.js utility-functions.js README.md 2>/dev/null || true
echo -e "${GREEN}✓ Source files copied${NC}"

# Run the pattern generation with or without UTC option
echo -e "${YELLOW}Generating pattern for \"$MESSAGE\"...${NC}"
if [ "$USE_UTC" = true ]; then
  echo -e "${YELLOW}Using UTC timezone for commits${NC}"
  node cli.js create "$MESSAGE" --intensity=ultra --force-replace --use-utc
else
  echo -e "${YELLOW}Using local timezone for commits${NC}"
  node cli.js create "$MESSAGE" --intensity=ultra --force-replace
fi

# Make sure all changes are committed
if [[ -n $(git status -s) ]]; then
  echo -e "${YELLOW}Committing any remaining changes...${NC}"
  git add . 2>/dev/null || true
  git commit -m "Finalize $MESSAGE pattern" 2>/dev/null || true
fi

# Push to GitHub
echo -e "\n${YELLOW}Pushing to GitHub...${NC}"
git push -f origin "$BRANCH_NAME" 2>/dev/null || true

# Set as default branch
echo -e "\n${YELLOW}Setting $BRANCH_NAME as the default branch...${NC}"
echo -e "${YELLOW}Waiting 5 seconds for GitHub to process the new branch...${NC}"
sleep 5

# Get GitHub token
GITHUB_TOKEN=$(cat ~/.github_token)

# Extract owner and repo from remote URL
REPO_URL=$(git config --get remote.origin.url)
REPO_NAME=$(echo $REPO_URL | sed -n 's/.*github.com[:\/]\([^\/]*\/[^\/]*\).*/\1/p' | sed 's/\.git$//')
OWNER=$(echo $REPO_NAME | cut -d '/' -f1)
REPO=$(echo $REPO_NAME | cut -d '/' -f2)

# First, check the current default branch
CURRENT_DEFAULT=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$OWNER/$REPO" | grep -o '"default_branch": *"[^"]*"' | cut -d'"' -f4)

echo -e "${YELLOW}Current default branch: $CURRENT_DEFAULT${NC}"

# Make API call to update default branch
RESPONSE=$(curl -s -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d "{\"default_branch\":\"$BRANCH_NAME\"}" \
  "https://api.github.com/repos/$OWNER/$REPO")

# Check the updated default branch
UPDATED_DEFAULT=$(echo "$RESPONSE" | grep -o '"default_branch": *"[^"]*"' | cut -d'"' -f4)

if [ "$UPDATED_DEFAULT" = "$BRANCH_NAME" ]; then
  echo -e "${GREEN}✓ Successfully set $BRANCH_NAME as the default branch${NC}"
  
  # Delete old message branches
  echo -e "\n${YELLOW}Cleaning up old message branches...${NC}"
  
  # Get list of remote branches
  REMOTE_BRANCHES=$(git ls-remote --heads origin | grep -o 'refs/heads/message-[^[:space:]]*' | sed 's|refs/heads/||')
  
  # Delete old message branches (except the current one)
  for branch in $REMOTE_BRANCHES; do
    if [ "$branch" != "$BRANCH_NAME" ]; then
      echo -e "${YELLOW}Deleting old branch: $branch${NC}"
      git push origin --delete "$branch" 2>/dev/null || true
    fi
  done
  
  echo -e "${GREEN}✓ Old message branches cleaned up${NC}"
else
  echo -e "${RED}✗ Failed to set default branch${NC}"
  echo -e "${YELLOW}API Response default branch: $UPDATED_DEFAULT${NC}"
fi

# Return to fresh-start branch
echo -e "\n${YELLOW}Returning to fresh-start branch...${NC}"
git checkout fresh-start 2>/dev/null || true
echo -e "${GREEN}✓ Now on fresh-start branch${NC}"

echo -e "\n${GREEN}Done!${NC}"
