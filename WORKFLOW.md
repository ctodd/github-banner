# GitHub Activity Banner Workflow

This document outlines the simplified workflow for using the GitHub Activity Banner tool to manage your GitHub activity graph patterns.

## Simplified Workflow

### For Users: Getting Started with the Tool

1. Clone this repository
2. Make sure you're on the `fresh-start` branch which contains the source code:
   ```bash
   git checkout fresh-start
   ```
3. Follow the usage instructions in the README.md

### For Pattern Updates: Changing Your Banner

1. Start from the `fresh-start` branch:
   ```bash
   git checkout fresh-start
   ```

2. Create a temporary branch for your new pattern:
   ```bash
   git checkout -b temp-pattern
   ```

3. Generate your new pattern:
   ```bash
   node cli.js create "YOUR MESSAGE" --intensity=ultra --force-replace
   ```

4. Force push this branch to GitHub as main:
   ```bash
   git push -f origin temp-pattern:main
   ```

5. Note: There may be a transition period where GitHub's contribution graph shows overlapping patterns. This will resolve as GitHub updates its cache.

## Understanding the Process

- The `fresh-start` branch is your source of truth and contains all the tool's code
- The `main` branch on GitHub is only for displaying your activity pattern
- Force-replacing the main branch completely rewrites its history
- GitHub's contribution graph may temporarily show both old and new patterns

## Best Practices

1. **Keep Source Code Safe**:
   - Always make code changes in the `fresh-start` branch
   - Never run the pattern generation on the `fresh-start` branch

2. **Clean Patterns**:
   - Use `--force-replace` to ensure clean pattern generation
   - Allow time between pattern changes for GitHub's cache to update

3. **Repository Management**:
   - If overlapping patterns persist and are problematic, creating a new repository is still an option
   - For critical presentations or screenshots, consider using a fresh repository

This simplified workflow balances ease of use with maintaining clean activity patterns.
