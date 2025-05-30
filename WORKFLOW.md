# GitHub Activity Banner Workflow

This document outlines the proper workflow for using the GitHub Activity Banner tool to avoid issues with overlapping contributions and to keep your source code safe.

## Proper Workflow

### Initial Setup

1. Clone this repository or create a new one with these files
2. Make sure you're on the `fresh-start` branch which contains the source code
3. Create a new GitHub repository for displaying your activity pattern

### Creating a New Pattern

1. **Always start from the source code branch**:
   ```bash
   git checkout fresh-start
   ```

2. **Create a new branch for your activity pattern**:
   ```bash
   git checkout -b activity-pattern
   ```

3. **Generate your pattern on this branch**:
   ```bash
   node cli.js create "YOUR MESSAGE" --intensity=ultra
   ```

4. **Push only the activity pattern branch to GitHub**:
   ```bash
   git push -f origin activity-pattern:main
   ```

### Updating an Existing Pattern

If you want to change your activity pattern:

1. **Delete the GitHub repository** to completely remove the previous pattern
2. **Create a new GitHub repository**
3. **Follow the steps above** to create a new pattern
4. **Push to the new repository**

## Why This Workflow Is Necessary

GitHub caches contribution data, which can cause overlapping patterns when you:
1. Push a pattern to GitHub
2. Create a new pattern with `--force-replace`
3. Push to the same repository

The cached data from the previous pattern may still appear in your activity graph, causing visual artifacts and overlapping patterns.

## Keeping Your Source Code Safe

The `--force-replace` flag is necessary for creating clean patterns, but it completely replaces git history. This means:

1. All previous commits are removed
2. All files not included in the new pattern are deleted
3. Source code can be lost if not properly backed up

By keeping your source code in the `fresh-start` branch and only pushing the activity pattern branch to GitHub, you ensure that your source code remains safe while still creating clean activity patterns.

## Troubleshooting

If you see overlapping patterns in your GitHub activity graph:

1. Delete the GitHub repository
2. Create a new repository
3. Follow the workflow above to create a clean pattern
4. Push to the new repository

This ensures that no cached contribution data interferes with your new pattern.
