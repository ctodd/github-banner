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

# Step 1: Make sure we are on fresh-start branch
echo -e "${YELLOW}Step 1: Switching to fresh-start branch...${NC}"
git checkout fresh-start
echo -e "${GREEN}✓ Now on fresh-start branch${NC}\n"

# Step 2: Get the message
echo -e "${YELLOW}Step 2: What message would you like to display?${NC}"
read -p "Enter message (e.g., AI ENG): " MESSAGE

# Create a sanitized branch name
BRANCH_NAME="message-$(echo $MESSAGE | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"
echo -e "\n${YELLOW}Creating branch: $BRANCH_NAME${NC}"

# Step 3: Create a new branch for this message
git checkout -b "$BRANCH_NAME"
echo -e "${GREEN}✓ Created and switched to $BRANCH_NAME branch${NC}\n"

# Step 4: Generate the pattern
echo -e "${YELLOW}Step 4: Generating pattern for \"$MESSAGE\"...${NC}"
node cli.js create "$MESSAGE" --intensity=ultra --force-replace

# Check if the pattern generation was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Pattern generated successfully${NC}\n"
  
  # Step 5: Push to GitHub
  echo -e "${YELLOW}Step 5: Ready to push to GitHub?${NC}"
  read -p "Push to GitHub now? (y/n): " CONFIRM

  if [[ $CONFIRM == "y" || $CONFIRM == "Y" ]]; then
    echo -e "\n${YELLOW}Pushing to GitHub...${NC}"
    git push -f origin "$BRANCH_NAME"
    echo -e "${GREEN}✓ Pattern pushed to GitHub as branch: $BRANCH_NAME${NC}"
    echo -e "${BLUE}Important: Now go to GitHub repository settings and set $BRANCH_NAME as the default branch${NC}"
    echo -e "${BLUE}URL: https://github.com/USERNAME/REPO/settings/branches${NC}"
  else
    echo -e "\n${YELLOW}Push cancelled. You can push manually with:${NC}"
    echo -e "git push -f origin $BRANCH_NAME"
  fi
else
  echo -e "${RED}✗ Pattern generation failed${NC}\n"
fi

# Return to fresh-start branch
echo -e "\n${YELLOW}Returning to fresh-start branch...${NC}"
git checkout fresh-start
echo -e "${GREEN}✓ Now on fresh-start branch${NC}"

echo -e "\n${GREEN}Done!${NC}"
