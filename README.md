# GitHub Activity Banner - Source Code Repository

This is the source code repository for the GitHub Activity Banner tool. This branch (`fresh-start`) contains the actual source code and should be kept as the source of truth.

## About This Tool

The GitHub Activity Banner tool creates custom text patterns in your GitHub activity graph by generating commits with specific dates.

## Quick Start

1. Make sure you're on the `fresh-start` branch
2. Create a temporary branch for your pattern:
   ```bash
   git checkout -b temp-pattern
   ```
3. Generate your pattern:
   ```bash
   node cli.js create "YOUR MESSAGE" --intensity=ultra
   ```
4. Push to GitHub:
   ```bash
   git push -f origin temp-pattern:main
   ```

## Important Notes on Usage

### Updating Your Pattern

To update your pattern:
1. Start from the `fresh-start` branch
2. Create a new temporary branch
3. Generate your new pattern
4. Force push to main

Note: There may be a transition period where GitHub shows overlapping patterns as its cache updates.

### Keeping Source Code Safe

The `--force-replace` flag completely replaces git history, which can remove source code files. To prevent this:

1. Always keep this `fresh-start` branch as your source of truth
2. When making changes to the code, make them on this branch
3. Create a temporary branch for activity patterns
4. Run the tool on the temporary branch
5. Force push the temporary branch to GitHub as main

See `WORKFLOW.md` for detailed instructions.

## Security Improvements

This version includes security improvements:
- Input sanitization to prevent command injection
- Path normalization to prevent path traversal
- Secure command execution using `spawn` instead of `execSync`

## Usage

See `node cli.js help` for complete usage instructions.
