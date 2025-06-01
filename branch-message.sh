#!/bin/bash

# GitHub Activity Banner Branch-Based Update Script
# This script creates a new branch for each message and pushes it to GitHub

# Colors for output
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

echo -e "${BLUE}=== GitHub Activity Banner Branch-Based Update Script ===${NC}"
echo -e "${BLUE}This script creates a new branch for each message${NC}\n"

# Clean up any existing lock files
echo -e "${YELLOW}Cleaning up any Git lock files...${NC}"
find .git -name "*.lock" -delete
echo -e "${GREEN}✓ Lock files removed${NC}"

# Prune stale remote branches
echo -e "${YELLOW}Pruning stale remote branches...${NC}"
git fetch --prune origin
git remote prune origin
echo -e "${GREEN}✓ Remote branches pruned${NC}"

# Configuration
# Get the repository name from the remote URL
REPO_URL=$(git config --get remote.origin.url)
REPO_NAME=$(echo $REPO_URL | sed -n 's/.*github.com[:\/]\([^\/]*\/[^\/]*\).*/\1/p' | sed 's/\.git$//')

if [ -z "$REPO_NAME" ]; then
  echo -e "${RED}Error: Could not determine repository name from remote URL${NC}"
  echo -e "${YELLOW}Please enter your GitHub username and repository name manually:${NC}"
  read -p "GitHub username: " GITHUB_USERNAME
  read -p "Repository name: " REPO_NAME_ONLY
  REPO_NAME="${GITHUB_USERNAME}/${REPO_NAME_ONLY}"
fi

echo -e "${BLUE}Repository: ${REPO_NAME}${NC}"

# Check for GitHub token
if [ -f ~/.github_token ]; then
  GITHUB_TOKEN=$(cat ~/.github_token)
  echo -e "${GREEN}✓ Found GitHub token${NC}"
else
  echo -e "${YELLOW}GitHub token not found at ~/.github_token${NC}"
  echo -e "${YELLOW}A GitHub personal access token is required to change the default branch${NC}"
  echo -e "${YELLOW}For fine-grained tokens, you need 'Administration: Write' permission${NC}"
  echo -e "${YELLOW}For classic tokens, you need 'repo' permission${NC}"
  echo -e "${YELLOW}Create one at: https://github.com/settings/tokens${NC}"
  read -p "Enter your GitHub token (or press Enter to skip auto-setting default branch): " GITHUB_TOKEN
  
  if [ ! -z "$GITHUB_TOKEN" ]; then
    read -p "Save token for future use? (y/n): " SAVE_TOKEN
    if [[ $SAVE_TOKEN == "y" || $SAVE_TOKEN == "Y" ]]; then
      echo "$GITHUB_TOKEN" > ~/.github_token
      chmod 600 ~/.github_token
      echo -e "${GREEN}✓ Token saved to ~/.github_token${NC}"
    fi
  fi
fi

# Step 1: Make sure we are on fresh-start branch and have no uncommitted changes
echo -e "\n${YELLOW}Step 1: Checking for uncommitted changes...${NC}"
if [[ -n $(git status -s) ]]; then
  echo -e "${YELLOW}Uncommitted changes detected. Stashing changes...${NC}"
  git stash
  echo -e "${GREEN}✓ Changes stashed${NC}"
fi

echo -e "${YELLOW}Switching to fresh-start branch...${NC}"
git checkout fresh-start
echo -e "${GREEN}✓ Now on fresh-start branch${NC}\n"

# Clean up local message branches
echo -e "${YELLOW}Cleaning up local message branches...${NC}"
LOCAL_MESSAGE_BRANCHES=$(git branch | grep "message-" | sed 's/^[ *]*//')
if [ ! -z "$LOCAL_MESSAGE_BRANCHES" ]; then
  for branch in $LOCAL_MESSAGE_BRANCHES; do
    echo -e "${YELLOW}Deleting local branch: $branch${NC}"
    git branch -D "$branch" 2>/dev/null || true
  done
  echo -e "${GREEN}✓ Local message branches cleaned up${NC}"
else
  echo -e "${GREEN}✓ No local message branches to clean up${NC}"
fi

# Step 2: Get the message
echo -e "\n${YELLOW}Step 2: What message would you like to display?${NC}"
read -p "Enter message (e.g., AI ENG): " MESSAGE

# Validate message is not empty
if [ -z "$MESSAGE" ]; then
  echo -e "${RED}Error: Message cannot be empty${NC}"
  exit 1
fi

# Create a sanitized branch name
BRANCH_NAME="message-$(echo $MESSAGE | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -d '#')"
echo -e "\n${YELLOW}Creating branch: $BRANCH_NAME${NC}"

# Step 3: Create a new branch for this message with no history
git checkout --orphan "$BRANCH_NAME"
git rm -rf .
echo -e "${GREEN}✓ Created new orphan branch with no history: $BRANCH_NAME${NC}\n"

# Step 4: Generate the pattern
echo -e "${YELLOW}Step 4: Generating pattern for \"$MESSAGE\"...${NC}"

# Create a separate branch for pattern generation to avoid issues with --force-replace
TEMP_BRANCH="temp-$BRANCH_NAME"
git checkout --orphan "$TEMP_BRANCH"
git rm -rf .
echo -e "${GREEN}✓ Created temporary orphan branch for pattern generation${NC}"

# Copy necessary files from fresh-start branch
echo -e "${YELLOW}Copying source files from fresh-start branch...${NC}"
git checkout fresh-start -- .gitignore patterns/ activity-generator.js cli.js utility-functions.js
echo -e "${GREEN}✓ Source files copied${NC}"

# Run the pattern generation
node cli.js create "$MESSAGE" --intensity=ultra --force-replace
PATTERN_EXIT_CODE=$?

# Check if the pattern generation was successful
if [ $PATTERN_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✓ Pattern generated successfully${NC}\n"
  
  # Make sure all changes are committed
  if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}Committing any remaining changes...${NC}"
    git add .
    git commit -m "Finalize $MESSAGE pattern"
  fi
  
  # Step 5: Push to GitHub
  echo -e "${YELLOW}Step 5: Ready to push to GitHub?${NC}"
  read -p "Push to GitHub now? (y/n): " CONFIRM

  if [[ $CONFIRM == "y" || $CONFIRM == "Y" ]]; then
    echo -e "\n${YELLOW}Pushing to GitHub...${NC}"
    git push -f origin "$TEMP_BRANCH:$BRANCH_NAME"
    PUSH_SUCCESS=$?
    
    if [ $PUSH_SUCCESS -eq 0 ]; then
      echo -e "${GREEN}✓ Pattern pushed to GitHub as branch: $BRANCH_NAME${NC}"
      
      # Step 6: Set as default branch if token is available
      if [ ! -z "$GITHUB_TOKEN" ]; then
        echo -e "\n${YELLOW}Setting $BRANCH_NAME as the default branch...${NC}"
        echo -e "${YELLOW}Waiting 5 seconds for GitHub to process the new branch...${NC}"
        sleep 5
        
        # Extract owner and repo from REPO_NAME
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
              git push origin --delete "$branch"
            fi
          done
          
          echo -e "${GREEN}✓ Old message branches cleaned up${NC}"
        else
          echo -e "${RED}✗ Failed to set default branch${NC}"
          echo -e "${YELLOW}API Response default branch: $UPDATED_DEFAULT${NC}"
          echo -e "${YELLOW}You can manually set the default branch at:${NC}"
          echo -e "${BLUE}https://github.com/$REPO_NAME/settings/branches${NC}"
        fi
      else
        echo -e "${YELLOW}No GitHub token provided. Please set the default branch manually:${NC}"
        echo -e "${BLUE}1. Go to: https://github.com/$REPO_NAME/settings/branches${NC}"
        echo -e "${BLUE}2. Change the default branch to: $BRANCH_NAME${NC}"
      fi
    else
      echo -e "${RED}✗ Failed to push to GitHub${NC}"
    fi
  else
    echo -e "\n${YELLOW}Push cancelled. You can push manually with:${NC}"
    echo -e "git push -f origin $TEMP_BRANCH:$BRANCH_NAME"
  fi
else
  echo -e "${RED}✗ Pattern generation failed${NC}\n"
fi

# Return to fresh-start branch
echo -e "\n${YELLOW}Returning to fresh-start branch...${NC}"
git checkout fresh-start
echo -e "${GREEN}✓ Now on fresh-start branch${NC}"

# Clean up temporary branch
echo -e "\n${YELLOW}Cleaning up temporary branch...${NC}"
git branch -D "$TEMP_BRANCH" 2>/dev/null || true
git branch -D "$BRANCH_NAME" 2>/dev/null || true
echo -e "${GREEN}✓ Temporary branches removed${NC}"

# Final prune to ensure everything is clean
echo -e "\n${YELLOW}Final pruning of remote branches...${NC}"
git fetch --prune origin
git remote prune origin
echo -e "${GREEN}✓ Remote branches pruned${NC}"

echo -e "\n${GREEN}Done!${NC}"
