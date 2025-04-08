# Git Conflict Resolution Scripts

This directory contains scripts that help automate the process of resolving Git merge conflicts.

## Available Scripts

### 1. `fix-git-conflicts.js`

A Node.js script that provides an interactive CLI for resolving Git merge conflicts. This script works across platforms (Windows, macOS, Linux) and offers a menu-driven interface to:

- Show details of conflicted files
- Accept all changes from one side (--ours or --theirs)
- Resolve conflicts file-by-file
- Complete or abort the merge/rebase process

#### Usage:

```bash
node scripts/fix-git-conflicts.js
```

### 2. Windows Batch Script (For VS Code)

For Windows users, a batch script is available that can be run directly from VS Code:

1. Create a file named `fix-git-conflicts.bat` in a convenient location with the following content:

```batch
@echo off
:: Git Conflict Resolution Script for Windows
:: This batch file helps resolve Git merge conflicts

echo Git Conflict Resolution Tool
echo ===========================
echo.

:: Check if we're in a Git repository
git rev-parse --is-inside-work-tree >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: This directory is not a Git repository.
    goto :EOF
)

:: Check if there's a merge in progress
set MERGE_IN_PROGRESS=0
set REBASE_IN_PROGRESS=0

git rev-parse --git-dir > tmpFile
set /p GIT_DIR=<tmpFile
del tmpFile

if exist "%GIT_DIR%\MERGE_HEAD" (
    set MERGE_IN_PROGRESS=1
)
if exist "%GIT_DIR%\rebase-merge" (
    set REBASE_IN_PROGRESS=1
)
if exist "%GIT_DIR%\rebase-apply" (
    set REBASE_IN_PROGRESS=1
)

if %MERGE_IN_PROGRESS% EQU 0 (
    if %REBASE_IN_PROGRESS% EQU 0 (
        echo ERROR: No merge or rebase in progress.
        echo This tool is designed to help resolve merge conflicts.
        goto :EOF
    )
)

:: Check for unmerged files
echo Checking for unmerged files...
git ls-files --unmerged > unmerged_files.txt

findstr /r "." unmerged_files.txt >nul
if %ERRORLEVEL% NEQ 0 (
    echo No unmerged files found.
    del unmerged_files.txt
    
    set /p COMPLETE=Do you want to complete the merge/rebase now? (y/n) 
    if /i "%COMPLETE%"=="y" (
        if %MERGE_IN_PROGRESS% EQU 1 (
            echo Completing merge...
            git commit --no-edit
            echo Merge completed successfully!
        ) else (
            echo Continuing rebase...
            git rebase --continue
            echo Rebase step completed successfully!
        )
    )
    goto :EOF
)

echo.
echo Found unmerged files with conflicts!

:MENU
echo.
echo === Git Conflict Resolution Menu ===
echo 1. Show conflicted files
echo 2. Resolve all conflicts by accepting our version (--ours)
echo 3. Resolve all conflicts by accepting their version (--theirs)
echo 4. Complete merge/rebase (after resolving conflicts)
echo 5. Abort merge/rebase
echo 6. Exit
echo.

set /p OPTION=Select an option (1-6): 

if "%OPTION%"=="1" (
    call :SHOW_FILES
    goto MENU
) else if "%OPTION%"=="2" (
    call :RESOLVE_ALL ours
    goto MENU
) else if "%OPTION%"=="3" (
    call :RESOLVE_ALL theirs
    goto MENU
) else if "%OPTION%"=="4" (
    call :COMPLETE_MERGE
    goto :EOF
) else if "%OPTION%"=="5" (
    call :ABORT_MERGE
    goto :EOF
) else if "%OPTION%"=="6" (
    echo Exiting...
    goto :EOF
) else (
    echo Invalid option. Please try again.
    goto MENU
)

:SHOW_FILES
echo.
echo === Conflicted Files ===
git diff --name-only --diff-filter=U
echo.
goto :EOF

:RESOLVE_ALL
echo.
echo Resolving all conflicts using %1 strategy...

for /f "tokens=*" %%f in ('git diff --name-only --diff-filter=U') do (
    echo Resolving conflicts in %%f...
    git checkout --%1 -- "%%f"
    if %ERRORLEVEL% EQU 0 (
        echo Resolved conflicts in %%f successfully.
        git add "%%f"
    ) else (
        echo Failed to resolve conflicts in %%f.
    )
)

echo.
echo All resolved files have been staged.
echo.

set /p COMPLETE=Do you want to complete the merge/rebase now? (y/n) 
if /i "%COMPLETE%"=="y" (
    call :COMPLETE_MERGE
)
goto :EOF

:COMPLETE_MERGE
echo.
if %MERGE_IN_PROGRESS% EQU 1 (
    echo Completing merge...
    git add .
    git commit --no-edit
    echo Merge completed successfully!
) else (
    echo Continuing rebase...
    git add .
    git rebase --continue
    echo Rebase step completed successfully!
)
goto :EOF

:ABORT_MERGE
echo.
if %MERGE_IN_PROGRESS% EQU 1 (
    echo Aborting merge...
    git merge --abort
    echo Merge aborted successfully!
) else (
    echo Aborting rebase...
    git rebase --abort
    echo Rebase aborted successfully!
)
goto :EOF
```

2. Save the file and run it from the VS Code terminal when you encounter merge conflicts.

## VS Code Setup

You can integrate these scripts into VS Code by adding custom tasks:

1. Create or open `.vscode/tasks.json` in your project
2. Add the following tasks:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Resolve Git Conflicts",
            "type": "shell",
            "command": "node ${workspaceFolder}/scripts/fix-git-conflicts.js",
            "presentation": {
                "reveal": "always",
                "panel": "new"
            },
            "problemMatcher": []
        }
    ]
}
```

Then you can run it via the Command Palette (Ctrl+Shift+P) by typing "Tasks: Run Task" and selecting "Resolve Git Conflicts".

## Manual Conflict Resolution

If you prefer to resolve conflicts manually:

1. Open each file with conflicts in VS Code
2. Look for sections marked with `<<<<<<< HEAD`, `=======`, and `>>>>>>> branch-name`
3. Edit these sections to resolve the conflicts
4. After resolving conflicts, stage the files with `git add <filename>`
5. Complete the merge with `git merge --continue` or the rebase with `git rebase --continue`