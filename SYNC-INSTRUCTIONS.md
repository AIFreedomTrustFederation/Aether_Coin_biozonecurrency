# Repository Sync Instructions

To sync all branches and ensure your website is pulling from the most updated versions, follow these steps in your local environment:

## 1. Clone the Repository (if you haven't already)
```bash
git clone https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency.git
cd Aether_Coin_biozonecurrency
```

## 2. Fetch All Branches
```bash
git fetch --all
```

## 3. Pull Latest Changes from Main
```bash
git checkout main
git pull origin main
```

## 4. Pull the Latest Changes from the Fix Branch
```bash
git checkout clean_fixes_20250410_163230
git pull origin clean_fixes_20250410_163230
```

## 5. Merge the CodeStar Changes
If the Replit changes aren't showing up in your local clean_fixes branch, manually copy these files from the Replit environment:
- `client/src/pages/CodeStarPage.tsx` (new file)
- `client/src/App.tsx` (updated with new import and route)
- `server-proxy.js` (updated to include the new route)

Then commit them:
```bash
git add client/src/App.tsx client/src/pages/CodeStarPage.tsx server-proxy.js
git commit -m "Replace Codester with CodeStar throughout the codebase"
```

## 6. Merge Fix Branch into Main
```bash
git checkout main
git merge clean_fixes_20250410_163230
```

## 7. Push Changes to All Branches
```bash
# Push to main
git push origin main

# Push to fix branch
git checkout clean_fixes_20250410_163230
git push origin clean_fixes_20250410_163230
```

## 8. Deploy the Updated Code
Update your deployment to pull from the latest version of the main branch.

## Notes
- The commit made in the Replit environment has the message: "Replace Codester with CodeStar throughout the codebase"
- If you encounter merge conflicts, resolve them carefully, making sure to keep the CodeStar component and routing.