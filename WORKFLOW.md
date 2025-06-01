# 🔄 GitHub Activity Banner Workflow

This document outlines the branch-based workflow for using the GitHub Activity Banner tool to create and manage GitHub activity patterns.

## 🌿 Branch-Based Workflow

### 🚀 Initial Setup

1. Clone this repository or create a new one with these files
2. Make sure you're on the `fresh-start` branch which contains the source code
3. Set up a GitHub personal access token (see [INSTALL.md](INSTALL.md) for details)

### 🎨 Creating a New Pattern

#### Interactive Mode (Default)

1. **Run the branch-message script**:
   ```bash
   ./branch-message.sh
   ```

2. **Follow the prompts**:
   - Enter the message you want to display (max 9 characters)
   - The script will create a new branch named `message-your-text`
   - It will generate the pattern on this branch
   - It will push the branch to GitHub
   - If you provided a GitHub token, it will set the branch as default

#### Non-Interactive Mode (For Automation)

Run the script with the `--non-interactive` flag and provide a message:

```bash
./branch-message.sh --non-interactive --message=TEST
```

This will:
- Automatically create the pattern for "TEST"
- Push to GitHub without prompting
- Set as default branch if a token is available
- Clean up old message branches

Available options:
```
--non-interactive       Run in non-interactive mode (auto-push enabled)
--message=TEXT          Specify the message text (required in non-interactive mode)
--help                  Show help message
```

### 🔄 Switching Between Patterns

To switch between different patterns:

1. Go to your repository settings on GitHub
2. Navigate to the Branches section
3. Change the default branch to the desired message branch

When you create a new message branch, old message branches are automatically removed from the remote repository to keep things clean.

## ⚙️ How It Works

### 🌿 Branch Structure

- **fresh-start**: Contains the source code and should never be the default branch on GitHub
- **message-xxx**: Each message gets its own branch with the pattern commits
- The default branch on GitHub determines which pattern is displayed in your activity graph

### 📊 GitHub's Contribution Graph

GitHub's contribution graph shows commits from the default branch of your repositories. By changing the default branch, you can control which pattern is displayed without deleting repositories or dealing with overlapping patterns.

## 🔍 Technical Details

1. **Orphan Branches**: Each message branch is created as an orphan branch with no history from the source code branch
2. **Commit Dating**: The tool creates commits with specific dates to form the pattern
3. **Uniform Distribution**: Commits are spread evenly throughout each day for a more natural appearance
4. **Automatic Centering**: The pattern is automatically centered in the GitHub activity window

## 🛠️ Troubleshooting

If you encounter issues:

1. **Git process conflicts**:
   - Run `git stash` to save any uncommitted changes
   - Then try the operation again

2. **Failed to set default branch**:
   - Check that your GitHub token has the correct permissions
   - Try setting the default branch manually in GitHub settings

3. **Pattern not appearing in contribution graph**:
   - Verify that the message branch is set as the default branch
   - Allow time for GitHub to update its cache (up to 24 hours)
