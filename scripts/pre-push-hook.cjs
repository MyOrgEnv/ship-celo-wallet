#!/usr/bin/env node

/**
 * GitHub Pre-Push Hook for Automatic Issue Creation
 * 
 * This script runs as a pre-push hook and automatically creates GitHub issues
 * when commits contain special prefixes like [BUG], [FEATURE], [DOCS], etc.
 * 
 * Setup:
 * 1. Copy this file to .git/hooks/pre-push in your repository
 * 2. Make it executable: chmod +x .git/hooks/pre-push
 * 3. Set GITHUB_TOKEN environment variable
 */

const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  owner: process.env.GITHUB_OWNER || 'your-github-username', // Change this to your GitHub username/org
  repo: process.env.GITHUB_REPO || 'ship-celo-wallet', // Change this to your repository name
  token: process.env.GITHUB_TOKEN, // Personal Access Token with repo scope
};

// Issue type configurations
const ISSUE_TYPES = {
  'BUG': {
    labels: ['bug', 'needs-triage'],
    priority: 'high'
  },
  'FEATURE': {
    labels: ['enhancement', 'needs-triage'],
    priority: 'medium'
  },
  'ENHANCEMENT': {
    labels: ['enhancement', 'needs-triage'],
    priority: 'medium'
  },
  'DOCS': {
    labels: ['documentation', 'needs-triage'],
    priority: 'low'
  },
  'TODO': {
    labels: ['task', 'needs-triage'],
    priority: 'low'
  },
  'SECURITY': {
    labels: ['security', 'high-priority'],
    priority: 'critical'
  }
};

/**
 * Get recent commits that are being pushed
 */
function getCommitsToPush() {
  try {
    const output = execSync('git log --pretty=format:"%H|%s|%an|%ad" --date=short -n 10', {
      encoding: 'utf8',
      cwd: process.cwd()
    });
    
    return output.split('\n').filter(line => line.trim()).map(line => {
      const [hash, subject, author, date] = line.split('|');
      return { hash, subject, author, date };
    });
  } catch (error) {
    console.error('❌ Failed to get commit history:', error.message);
    return [];
  }
}

/**
 * Extract issue information from commit message
 */
function extractIssueFromCommit(commit) {
  for (const [type, config] of Object.entries(ISSUE_TYPES)) {
    if (commit.subject.includes(`[${type}]`)) {
      const title = commit.subject.replace(`[${type}]`, '').trim();
      const body = `## Auto-Created Issue from Commit

**Commit:** ${commit.subject}
**Hash:** ${commit.hash}
**Author:** ${commit.author}
**Date:** ${commit.date}
**Repository:** ${config.owner}/${config.repo}

### Description
This issue was automatically created from a commit that referenced "${type}".

### Next Steps
1. Review the commit for context
2. Add more details if needed
3. Assign to appropriate team member
4. Track progress

---
*Generated automatically by pre-push hook*`;

      return {
        title: title || `${type} issue from commit ${commit.hash.substring(0, 8)}`,
        body,
        labels: config.labels
      };
    }
  }
  return null;
}

/**
 * Create issue via GitHub API
 */
function createIssue(title, body, labels) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      title,
      body,
      labels
    });

    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${config.owner}/${config.repo}/issues`,
      method: 'POST',
      headers: {
        'Authorization': `token ${config.token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Git-PrePush-Issue-Creator/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201) {
          const issue = JSON.parse(responseData);
          console.log(`✅ Issue created: ${issue.html_url}`);
          resolve(issue);
        } else if (res.statusCode === 422) {
          // Issue might already exist
          console.log(`⚠️ Issue might already exist: ${title}`);
          resolve(null);
        } else {
          console.error(`❌ Failed to create issue: ${res.statusCode}`);
          console.error(responseData);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Check for duplicate issues
 */
async function checkDuplicate(title) {
  try {
    const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/issues?state=open&per_page=100`, {
      headers: {
        'Authorization': `token ${config.token}`,
        'User-Agent': 'Git-PrePush-Issue-Creator/1.0'
      }
    });

    if (response.ok) {
      const issues = await response.json();
      return issues.find(issue => issue.title === title);
    }
  } catch (error) {
    console.error('❌ Failed to check duplicates:', error.message);
  }
  return null;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 GitHub Pre-Push Hook - Checking for issues to create...\n');

  // Check if token is available
  if (!config.token) {
    console.log('⚠️ GITHUB_TOKEN not set. Skipping automatic issue creation.');
    console.log('   To enable, set: export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxx');
    process.exit(0);
  }

  // Get recent commits
  const commits = getCommitsToPush();
  console.log(`📋 Found ${commits.length} commits to check`);

  let createdCount = 0;

  // Check each commit for issue prefixes
  for (const commit of commits) {
    const issueInfo = extractIssueFromCommit(commit);
    
    if (issueInfo) {
      console.log(`\n🔍 Found issue trigger in commit: ${commit.subject}`);

      // Check for duplicates
      const duplicate = await checkDuplicate(issueInfo.title);
      if (duplicate) {
        console.log(`⚠️ Issue already exists: ${duplicate.html_url}`);
        continue;
      }

      try {
        const issue = await createIssue(issueInfo.title, issueInfo.body, issueInfo.labels);
        if (issue) {
          createdCount++;
        }
      } catch (error) {
        console.error(`❌ Failed to create issue for commit ${commit.hash}:`, error.message);
      }
    }
  }

  console.log(`\n📊 Summary: Created ${createdCount} new issue(s)`);
  
  if (createdCount > 0) {
    console.log('\n🎉 Issues created successfully! Check your GitHub repository.');
  }
}

// Run the hook
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Pre-push hook failed:', error);
    process.exit(1);
  });
}

module.exports = { main, extractIssueFromCommit, createIssue };