const { execSync } = require('child_process');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import letter patterns
const letterPatterns = require('./patterns');

// Added sanitizeInput function to prevent command injection
function sanitizeInput(input) {
  // Remove any potentially dangerous characters
  return input.replace(/[;&|`$(){}]/g, '');
}

// Secure command execution using spawn
function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'pipe', ...options });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
    
    proc.on('error', (err) => {
      reject(err);
    });
  });
}

class AIEngineerActivityGenerator {
  constructor(repoPath, version = 'AI', options = {}) {
    // Normalize and resolve path to prevent path traversal
    this.repoPath = path.normalize(path.resolve(repoPath));
    // Sanitize user input to prevent command injection
    this.version = sanitizeInput(version.toUpperCase());
    
    // Default options
    this.options = {
      intensity: 'ultra',
      commitsPerDay: 25,
      centerMessage: true,
      keepInView: false,
      dryRun: false,
      forceReplace: false,
      useUtc: false, // Default to local timezone
      ...options
    };
    
    // Set commits per day based on intensity
    if (!options.commitsPerDay) {
      switch (this.options.intensity) {
        case 'light':
          this.options.commitsPerDay = 5;
          break;
        case 'medium':
          this.options.commitsPerDay = 10;
          break;
        case 'high':
          this.options.commitsPerDay = 15;
          break;
        case 'ultra':
          this.options.commitsPerDay = 25;
          break;
        default:
          this.options.commitsPerDay = 10;
      }
    }
    
    // Load letter patterns
    this.letterPatterns = letterPatterns;
    
    // Calculate start date
    if (this.options.startDate) {
      this.startDate = new Date(this.options.startDate);
    } else if (this.options.centerMessage) {
      this.startDate = this.calculateCenteredStartDate();
    } else {
      const { startDate } = this.getCurrentGitHubWindow();
      this.startDate = startDate;
    }
    
    // Recommended versions with descriptions
    this.recommendedVersions = {
      'AI ENG': {
        visibility: 'Excellent',
        description: 'Perfect fit for GitHub activity graph'
      },
      'AI ENGR': {
        visibility: 'Excellent',
        description: 'Perfect fit for GitHub activity graph'
      },
      'AWS HERO': {
        visibility: 'Excellent',
        description: 'Shows AWS expertise'
      },
      'DEVOPS': {
        visibility: 'Excellent',
        description: 'Clear and visible'
      },
      'CLOUD': {
        visibility: 'Excellent',
        description: 'Short and impactful'
      },
      'PYTHON': {
        visibility: 'Excellent',
        description: 'Shows Python expertise'
      },
      'JAVA': {
        visibility: 'Good',
        description: 'Shows Java expertise'
      },
      'REACT': {
        visibility: 'Good',
        description: 'Shows React expertise'
      },
      'NODE JS': {
        visibility: 'Good',
        description: 'Shows Node.js expertise'
      },
      'ML': {
        visibility: 'Excellent',
        description: 'Shows Machine Learning focus'
      },
      'AI': {
        visibility: 'Excellent',
        description: 'Simple and impactful'
      }
    };
  }
  
  // Generate commit dates with option to use UTC or local timezone
  generateUniformCommitDates() {
    const { startDate, endDate } = this.getPatternDateRange();
    const pattern = this.generatePattern();
    const commitDates = [];
    
    // Calculate the number of commits per day based on intensity
    const commitsPerDay = this.options.commitsPerDay;
    
    // For each day in the pattern
    for (let week = 0; week < pattern[0].length; week++) {
      for (let day = 0; day < 7; day++) {
        // Check if this day should have commits
        if (pattern[day][week] === 1) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + (week * 7) + day);
          
          // Create multiple commits for this day based on intensity
          for (let i = 0; i < commitsPerDay; i++) {
            // Distribute commits throughout the day
            const hour = Math.floor(i / (commitsPerDay / 24)) % 24;
            const minute = (i * 60) % 60;
            
            let commitDate;
            
            if (this.options.useUtc) {
              // Use UTC dates if specified
              commitDate = new Date(Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                hour,
                minute,
                0,
                0
              ));
            } else {
              // Use local timezone (default)
              commitDate = new Date(date);
              commitDate.setHours(hour, minute, 0, 0);
            }
            
            commitDates.push(commitDate);
          }
        }
      }
    }
    
    return commitDates;
  }
}

module.exports = { AIEngineerActivityGenerator };
