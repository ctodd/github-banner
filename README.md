# GitHub Activity Banner - Source Code Repository

This is the source code repository for the GitHub Activity Banner tool. This branch (`fresh-start`) contains the actual source code and should be kept as the source of truth.

## About This Tool

The GitHub Activity Banner tool creates custom text patterns in your GitHub activity graph by generating commits with specific dates.

## Important Notes on Usage

### Overlapping Contributions Issue

When replacing messages, GitHub may show overlapping contributions if:
1. You've previously pushed a pattern to GitHub
2. You create a new pattern with `--force-replace`
3. You push to the same repository

This happens because GitHub caches contribution data. To completely remove a previous pattern:
1. Delete the repository from GitHub
2. Create a new repository
3. Push your new pattern

### Keeping Source Code Safe

The `--force-replace` flag completely replaces git history, which can remove source code files. To prevent this:

1. Always keep this `fresh-start` branch as your source of truth
2. When making changes to the code, make them on this branch
3. Create a new branch for activity patterns: `git checkout -b activity-pattern`
4. Run the tool on the activity pattern branch
5. Push only the activity pattern branch to GitHub

## Security Improvements

This version includes security improvements:
- Input sanitization to prevent command injection
- Path normalization to prevent path traversal
- Secure command execution using `spawn` instead of `execSync`

## Usage

See `node cli.js help` for complete usage instructions.
