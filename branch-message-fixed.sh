#!/bin/bash

# GitHub Activity Banner Branch-Based Update Script
# This script creates a new branch for each message and pushes it to GitHub

# Colors for output
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

# Default settings
INTERACTIVE=true
AUTO_PUSH=false
DELETE_BRANCHES=false
BRANCHES_TO_DELETE=""
USE_UTC=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --non-interactive)
      INTERACTIVE=false
      AUTO_PUSH=true
      shift
      ;;
    --message=*)
      MESSAGE="${1#*=}"
      shift
      ;;
    --delete-branches)
      DELETE_BRANCHES=true
      shift
      ;;
    --delete=*)
      DELETE_BRANCHES=true
      BRANCHES_TO_DELETE="${1#*=}"
      shift
      ;;
    --use-utc)
      USE_UTC=true
      shift
      ;;
    --help)
      echo "Usage: ./branch-message-fixed.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --non-interactive       Run in non-interactive mode (auto-push enabled)"
      echo "  --message=TEXT          Specify the message text (required in non-interactive mode)"
      echo "  --delete-branches       Delete all other branches except fresh-start and the new message branch"
      echo "  --delete=BRANCH1,BRANCH2 Delete specific branches (comma-separated list)"
      echo "  --use-utc               Use UTC timezone for commits (default: use local timezone)"
      echo "  --help                  Show this help message"
      exit 0
      ;;
    *)
      shift
      ;;
  esac
done

# Error handling function
handle_error() {
  echo -e "${RED}Error: $1${NC}"
  # Clean up any temporary branches
  git checkout -q fresh-start 2>/dev/null || true
  git branch -D temp-message-* 2>/dev/null || true
  git branch -D message-* 2>/dev/null || true
  # Remove lock files
  find .git -name "*.lock" -delete
  exit 1
}

# Function to safely execute git commands
safe_git() {
  # Add a small delay to prevent race conditions
  sleep 0.5
  
  # Execute the git command
  "$@"
  
  # Check if the command succeeded
  if [ $? -ne 0 ]; then
    handle_error "Git command failed: $*"
  fi
}

# Function to delete branches
delete_branches() {
  local branches_to_delete="$1"
  local current_branch="$2"
  local preserve_branch="$3"
  
  echo -e "\n${YELLOW}Deleting specified branches...${NC}"
  
  # If specific branches are provided, delete them
  if [ ! -z "$branches_to_delete" ]; then
    IFS=',' read -ra BRANCH_ARRAY <<< "$branches_to_delete"
    for branch in "${BRANCH_ARRAY[@]}"; do
      if [[ "$branch" != "$current_branch" && "$branch" != "$preserve_branch" && "$branch" != "fresh-start" ]]; then
        echo -e "${YELLOW}Deleting branch: $branch${NC}"
        git push origin --delete "$branch" 2>/dev/null || true
      fi
    done
  else
    # Get list of all remote branches
    REMOTE_BRANCHES=$(git ls-remote --heads origin | grep -o 'refs/heads/[^[:space:]]*' | sed 's|refs/heads/||')
    
    # Delete all branches except the current one, fresh-start, and the preserve branch
    for branch in $REMOTE_BRANCHES; do
      if [[ "$branch" != "$current_branch" && "$branch" != "$preserve_branch" && "$branch" != "fresh-start" ]]; then
        echo -e "${YELLOW}Deleting branch: $branch${NC}"
        git push origin --delete "$branch" 2>/dev/null || true
      fi
    done
  fi
  
  echo -e "${GREEN}✓ Branch deletion completed${NC}"
}

echo -e "${BLUE}=== GitHub Activity Banner Branch-Based Update Script (FIXED) ===${NC}"
echo -e "${BLUE}This script creates a new branch for each message${NC}\n"

# Check if we're in non-interactive mode and have a message
if [ "$INTERACTIVE" = false ] && [ -z "$MESSAGE" ]; then
  handle_error "Message is required in non-interactive mode. Use --message=TEXT"
fi

# Handle branch deletion only mode
if [ "$DELETE_BRANCHES" = true ] && [ -z "$MESSAGE" ]; then
  delete_branches "$BRANCHES_TO_DELETE" "" ""
  echo -e "\n${GREEN}Branch deletion completed. Exiting.${NC}"
  exit 0
fi

# Aggressive cleanup of any existing lock files
echo -e "${YELLOW}Cleaning up any Git lock files...${NC}"
find .git -name "*.lock" -delete
echo -e "${GREEN}✓ Lock files removed${NC}"

# Reset any uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo -e "${YELLOW}Uncommitted changes detected. Resetting...${NC}"
  git reset --hard HEAD
  git clean -fd
  echo -e "${GREEN}✓ Working directory cleaned${NC}"
fi

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
  if [ "$INTERACTIVE" = true ]; then
    echo -e "${YELLOW}Please enter your GitHub username and repository name manually:${NC}"
    read -p "GitHub username: " GITHUB_USERNAME
    read -p "Repository name: " REPO_NAME_ONLY
    REPO_NAME="${GITHUB_USERNAME}/${REPO_NAME_ONLY}"
  else
    handle_error "Could not determine repository name in non-interactive mode"
  fi
fi

echo -e "${BLUE}Repository: ${REPO_NAME}${NC}"

# Check for GitHub token
if [ -f ~/.github_token ]; then
  GITHUB_TOKEN=$(cat ~/.github_token)
  echo -e "${GREEN}✓ Found GitHub token${NC}"
else
  echo -e "${YELLOW}GitHub token not found at ~/.github_token${NC}"
  if [ "$INTERACTIVE" = true ]; then
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
  else
    echo -e "${YELLOW}Warning: No GitHub token found. Default branch will not be set automatically.${NC}"
  fi
fi

# Step 1: Make sure we are on fresh-start branch and have no uncommitted changes
echo -e "\n${YELLOW}Step 1: Checking for uncommitted changes...${NC}"
if [[ -n $(git status -s) ]]; then
  echo -e "${YELLOW}Uncommitted changes detected. Stashing changes...${NC}"
  safe_git git stash
  echo -e "${GREEN}✓ Changes stashed${NC}"
fi

echo -e "${YELLOW}Switching to fresh-start branch...${NC}"
safe_git git checkout fresh-start
echo -e "${GREEN}✓ Now on fresh-start branch${NC}\n"

# Clean up local message branches
echo -e "${YELLOW}Cleaning up local message branches...${NC}"
LOCAL_MESSAGE_BRANCHES=$(git branch | grep -E "message-|temp-message-" | sed 's/^[ *]*//')
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
if [ -z "$MESSAGE" ]; then
  echo -e "\n${YELLOW}Step 2: What message would you like to display?${NC}"
  read -p "Enter message (e.g., AI ENG): " MESSAGE
fi

# Validate message is not empty
if [ -z "$MESSAGE" ]; then
  echo -e "${RED}Error: Message cannot be empty${NC}"
  exit 1
fi

# Validate message length (maximum 9 characters to fit in GitHub's display)
if [ ${#MESSAGE} -gt 9 ]; then
  echo -e "${RED}Error: Message is too long (${#MESSAGE} characters)${NC}"
  echo -e "${YELLOW}Messages must be 9 characters or less to fit in GitHub's activity graph${NC}"
  exit 1
fi

# Create a sanitized branch name - replace all special characters with hyphens and normalize
SANITIZED_MESSAGE=$(echo "$MESSAGE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')

# Validate that there's at least one valid character after sanitization
if [ -z "$SANITIZED_MESSAGE" ]; then
  echo -e "${RED}Error: Message must contain at least one letter or number${NC}"
  exit 1
fi

# Create the branch name with the sanitized message
BRANCH_NAME="message-$SANITIZED_MESSAGE"

echo -e "\n${YELLOW}Original message: $MESSAGE${NC}"
echo -e "${YELLOW}Branch name: $BRANCH_NAME${NC}"

# Step 3: Create a new branch for this message with no history
echo -e "\n${YELLOW}Creating branch: $BRANCH_NAME${NC}"
safe_git git checkout --orphan "$BRANCH_NAME"

# Remove all files from the working directory
git rm -rf . 2>/dev/null || true

echo -e "${GREEN}✓ Created new orphan branch with no history: $BRANCH_NAME${NC}\n"

# Step 4: Generate the pattern
echo -e "${YELLOW}Step 4: Generating pattern for \"$MESSAGE\"...${NC}"

# Create a separate branch for pattern generation to avoid issues with --force-replace
TEMP_BRANCH="temp-$BRANCH_NAME"
safe_git git checkout --orphan "$TEMP_BRANCH"

# Remove all files from the working directory
git rm -rf . 2>/dev/null || true

echo -e "${GREEN}✓ Created temporary orphan branch for pattern generation${NC}"

# Copy necessary files from fresh-start branch
echo -e "${YELLOW}Copying source files from fresh-start branch...${NC}"
git checkout fresh-start -- .gitignore patterns/ activity-generator.js cli.js utility-functions.js README.md 2>/dev/null || true
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
    git add . 2>/dev/null || true
    git commit -m "Finalize $MESSAGE pattern" 2>/dev/null || true
  fi
  
  # Step 5: Push to GitHub
  CONFIRM="n"
  
  if [ "$INTERACTIVE" = true ]; then
    echo -e "${YELLOW}Step 5: Ready to push to GitHub?${NC}"
    read -p "Push to GitHub now? (y/n): " CONFIRM
  elif [ "$AUTO_PUSH" = true ]; then
    CONFIRM="y"
    echo -e "${YELLOW}Step 5: Auto-pushing to GitHub (non-interactive mode)${NC}"
  fi

  if [[ $CONFIRM == "y" || $CONFIRM == "Y" ]]; then
    echo -e "\n${YELLOW}Pushing to GitHub...${NC}"
    git push -f origin "$TEMP_BRANCH:$BRANCH_NAME" 2>/dev/null || true
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
          
          # Delete branches if requested
          if [ "$DELETE_BRANCHES" = true ]; then
            delete_branches "$BRANCHES_TO_DELETE" "$BRANCH_NAME" "fresh-start"
          else
            # Ask if user wants to delete other branches
            if [ "$INTERACTIVE" = true ]; then
              echo -e "\n${YELLOW}Do you want to delete other branches?${NC}"
              read -p "Delete other branches (except fresh-start and $BRANCH_NAME)? (y/n): " DELETE_CONFIRM
              
              if [[ $DELETE_CONFIRM == "y" || $DELETE_CONFIRM == "Y" ]]; then
                delete_branches "" "$BRANCH_NAME" "fresh-start"
              fi
            fi
          fi
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
        
        # Still offer to delete branches even without token
        if [ "$DELETE_BRANCHES" = true ]; then
          delete_branches "$BRANCHES_TO_DELETE" "$BRANCH_NAME" "fresh-start"
        elif [ "$INTERACTIVE" = true ]; then
          echo -e "\n${YELLOW}Do you want to delete other branches?${NC}"
          read -p "Delete other branches (except fresh-start and $BRANCH_NAME)? (y/n): " DELETE_CONFIRM
          
          if [[ $DELETE_CONFIRM == "y" || $DELETE_CONFIRM == "Y" ]]; then
            delete_branches "" "$BRANCH_NAME" "fresh-start"
          fi
        fi
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
git checkout fresh-start 2>/dev/null || true
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
