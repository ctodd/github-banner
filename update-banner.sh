#!/bin/bash

# GitHub Activity Banner Update Script
# This script demonstrates the workflow for updating your GitHub activity banner

# Colors for output
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

echo -e "${BLUE}=== GitHub Activity Banner Update Script ===${NC}"
echo -e "${BLUE}This script demonstrates the workflow for updating your banner${NC}\n"

# Step 1: Make sure we are on fresh-start branch
echo -e "${YELLOW}Step 1: Switching to fresh-start branch...${NC}"
git checkout fresh-start
echo -e "${GREEN}✓ Now on fresh-start branch${NC}\n"

# Step 2: Create a temporary branch
echo -e "${YELLOW}Step 2: Creating temporary branch for the new pattern...${NC}"
git checkout -b temp-pattern
echo -e "${GREEN}✓ Created and switched to temp-pattern branch${NC}\n"

# Step 3: Generate the pattern
echo -e "${YELLOW}Step 3: What message would you like to display?${NC}"
read -p "Enter message (e.g., AI ENG): " MESSAGE
echo -e "\n${YELLOW}Generating pattern for \"$MESSAGE\"...${NC}"
node cli.js create "$MESSAGE" --intensity=ultra --force-replace
echo -e "${GREEN}✓ Pattern generated${NC}\n"

# Step 4: Push to GitHub
echo -e "${YELLOW}Step 4: Ready to push to GitHub?${NC}"
read -p "Push to GitHub now? (y/n): " CONFIRM

if [[ $CONFIRM == "y" || $CONFIRM == "Y" ]]; then
  echo -e "\n${YELLOW}Force pushing to GitHub...${NC}"
  git push -f origin temp-pattern:main
  echo -e "${GREEN}✓ Pattern pushed to GitHub!${NC}"
  echo -e "${BLUE}Note: There may be a transition period where GitHub shows overlapping patterns${NC}"
  echo -e "${BLUE}This will resolve as GitHub updates its cache${NC}"
else
  echo -e "\n${YELLOW}Push cancelled. You can push manually with:${NC}"
  echo -e "git push -f origin temp-pattern:main"
fi

echo -e "\n${GREEN}Done! Return to fresh-start branch with: git checkout fresh-start${NC}"

