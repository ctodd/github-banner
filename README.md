# GitHub Activity Banner - Source Code Repository

This is the source code repository for the GitHub Activity Banner tool. This branch (`fresh-start`) contains the actual source code and should be kept as the source of truth.

## About This Tool

The GitHub Activity Banner tool creates custom text patterns in your GitHub activity graph by generating commits with specific dates.

## Quick Start

1. Make sure you're on the `fresh-start` branch
2. Run the branch-message script:
   ```bash
   ./branch-message.sh
   ```
3. Follow the prompts to create and push your pattern
4. The script will automatically set the new branch as default (if you provide a GitHub token)

## Branch-Based Workflow

This tool uses a branch-based approach to manage GitHub activity patterns:

1. Each message gets its own dedicated branch (e.g., `message-ai-eng`)
2. The branch is pushed to GitHub and set as the default branch
3. GitHub's contribution graph shows commits from the default branch
4. To change messages, simply create a new branch and set it as default

This approach allows you to:
- Keep your source code safe in the `fresh-start` branch
- Switch between different messages by changing the default branch
- Avoid overlapping patterns in your contribution graph

## GitHub Token Setup

To enable automatic default branch setting:

1. Create a GitHub personal access token at: https://github.com/settings/tokens
2. Ensure it has 'repo' permissions
3. Save it to `~/.github_token` or enter it when prompted

## Security Improvements

This version includes security improvements:
- Input sanitization to prevent command injection
- Path normalization to prevent path traversal
- Secure command execution using `spawn` instead of `execSync`

## Usage

See `node cli.js help` for complete usage instructions.
