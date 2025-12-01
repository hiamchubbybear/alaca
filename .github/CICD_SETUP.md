# GitHub Actions CI/CD Setup Guide

## Required Secrets

You need to add these secrets to your GitHub repository:

### 1. Docker Hub Credentials
Go to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:
- **Name**: `DOCKERHUB_USERNAME`
  - **Value**: `hiamchubbybear` (your Docker Hub username)

- **Name**: `DOCKERHUB_TOKEN`
  - **Value**: Your Docker Hub access token
  - **How to get**:
    1. Go to https://hub.docker.com/settings/security
    2. Click "New Access Token"
    3. Name: "GitHub Actions"
    4. Permissions: "Read, Write, Delete"
    5. Copy the token

### 2. Verify Permissions

Make sure your workflow has these permissions in the repository settings:
- Go to: **Settings** → **Actions** → **General**
- Under "Workflow permissions", select:
  - ✅ "Read and write permissions"
  - ✅ "Allow GitHub Actions to create and approve pull requests"

### 3. Enable Security Features

For security scanning to work:
- Go to: **Settings** → **Code security and analysis**
- Enable:
  - ✅ Dependency graph
  - ✅ Dependabot alerts
  - ✅ Dependabot security updates
  - ✅ Code scanning (CodeQL analysis)

## Current Issues Fixed

### ✅ Docker Build & Push
**Problem**: `unauthorized: incorrect username or password`
**Solution**: Changed from `GITHUB_TOKEN` to `DOCKERHUB_TOKEN` secret

**Before**:
```yaml
password: ${{ secrets.GITHUB_TOKEN }}  # ❌ Wrong for docker.io
```

**After**:
```yaml
username: ${{ secrets.DOCKERHUB_USERNAME }}
password: ${{ secrets.DOCKERHUB_TOKEN }}  # ✅ Correct
```

### ✅ Security Scan
**Problem**: `Resource not accessible by integration`
**Solution**: Added explicit permissions to security-scan job

**Before**:
```yaml
security-scan:
  runs-on: ubuntu-latest
  # ❌ No permissions specified
```

**After**:
```yaml
security-scan:
  runs-on: ubuntu-latest
  permissions:
    contents: read
    security-events: write  # ✅ Required for CodeQL upload
    actions: read
```

## How to Add Secrets

### Via GitHub Web UI:
1. Go to your repository
2. Click **Settings** (top right)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**
5. Add `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`

### Via GitHub CLI:
```bash
# Set Docker Hub username
gh secret set DOCKERHUB_USERNAME --body "hiamchubbybear"

# Set Docker Hub token (will prompt for input)
gh secret set DOCKERHUB_TOKEN
```

## Testing the Workflow

After adding secrets, test by:

1. **Push to main/develop**:
   ```bash
   git add .
   git commit -m "fix(ci): update Docker Hub credentials"
   git push origin main
   ```

2. **Manual trigger**:
   - Go to **Actions** tab
   - Select "CI/CD Pipeline"
   - Click "Run workflow"

## Expected Workflow Results

✅ **Build & Test**: Should pass
✅ **Docker Build & Push**: Should push to `docker.io/hiamchubbybear/alaca-backend`
✅ **Security Scan**: Should upload results to GitHub Security tab
✅ **Code Quality**: Should analyze code
✅ **Notify**: Should show deployment status

## Troubleshooting

### If Docker push still fails:
1. Verify token is valid: https://hub.docker.com/settings/security
2. Check token has "Read, Write, Delete" permissions
3. Ensure username is exactly `hiamchubbybear`

### If security scan fails:
1. Check repository has security features enabled
2. Verify workflow has `security-events: write` permission
3. Check if running on a fork (security uploads don't work on forks)

### If you see "Resource not accessible":
- This usually means permissions are insufficient
- Make sure workflow permissions are set to "Read and write"

## Docker Hub Image

After successful push, your image will be available at:
```
docker pull hiamchubbybear/alaca-backend:latest
docker pull hiamchubbybear/alaca-backend:main-<sha>
```

## Next Steps

1. ✅ Add `DOCKERHUB_USERNAME` secret
2. ✅ Add `DOCKERHUB_TOKEN` secret
3. ✅ Enable workflow permissions
4. ✅ Enable security features
5. ✅ Push changes to trigger workflow
6. ✅ Monitor Actions tab for results
