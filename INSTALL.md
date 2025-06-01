# 📋 Installation & Setup Guide

This guide will walk you through the process of setting up the GitHub Activity Banner tool.

## 📋 Prerequisites

- Git installed on your system
- Node.js (v20 or higher) installed
- A GitHub account
- A GitHub repository (new or existing)

## 🚀 Installation Steps

### 1. Clone the Repository

```bash
# Option 1: Clone this repository
git clone https://github.com/yourusername/github-banner.git
cd github-banner

# Option 2: Create a new repository and copy the files
mkdir github-banner
cd github-banner
git init
# Then copy all files from this repository
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up GitHub Personal Access Token (PAT)

To enable automatic default branch setting, you'll need a GitHub Personal Access Token:

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token" (Fine-grained token)
3. Configure the token:
   - **Name**: GitHub Activity Banner
   - **Expiration**: Select a longer duration if desired (e.g., 1 year)
   - **Repository access**: Select "Only select repositories"
   - **Select the repository** you'll use for the activity banner
   - Under **Permissions**:
     - Repository permissions:
       - **Administration**: Read and write (required to change default branch)
   - Click "Generate token"
4. Copy the generated token
5. Save it to `~/.github_token` on your system:
   ```bash
   echo "your_token_here" > ~/.github_token
   chmod 600 ~/.github_token  # Set proper permissions
   ```

> **Security Note**: The token should be limited to only the repository you're using for the activity banner. This minimizes potential security risks if the token is ever compromised.

### 4. Configure Git

Ensure your Git is configured with your GitHub username and email:

```bash
git config --global user.name "Your GitHub Username"
git config --global user.email "your.email@example.com"
```

### 5. Make Scripts Executable

```bash
chmod +x branch-message.sh
chmod +x update-banner.sh
```

## 🧪 Testing Your Setup

Run a simple test to ensure everything is working:

```bash
./branch-message.sh
```

Enter a short message (e.g., "TEST") when prompted. The script should:
1. Create a new branch
2. Generate the pattern
3. Push to GitHub
4. Set as the default branch (if you provided a token)

## 🔄 Updating the Tool

To update to the latest version:

1. Make sure you're on the `fresh-start` branch
2. Pull the latest changes:
   ```bash
   git pull origin fresh-start
   ```

## 🛠️ Troubleshooting

### Common Issues

1. **Permission denied when running scripts**:
   ```bash
   chmod +x *.sh
   ```

2. **Git authentication issues**:
   - Ensure your GitHub credentials are configured
   - Try using HTTPS instead of SSH for the remote URL

3. **Token not working**:
   - Verify the token has the correct permissions
   - Check that it's saved correctly in `~/.github_token`

4. **Pattern not appearing**:
   - Ensure the message branch is set as the default branch
   - Wait for GitHub's cache to update (up to 24 hours)

For more detailed troubleshooting, see the [WORKFLOW.md](WORKFLOW.md) document.
