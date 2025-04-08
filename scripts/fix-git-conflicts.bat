@echo off
:: Git Conflict Resolution Script for Windows
:: This batch file helps resolve Git merge conflicts
:: Usage: Right-click in VS Code folder and select "Run as Administrator"

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