"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionService = exports.VersionService = void 0;
/**
 * VersionService: Provides Git-like version control functionality for DApps
 * Handles version history, branching, merging, and diffing for smart contracts.
 */
const db_1 = require("../../db");
const dapp_schema_1 = require("../../../shared/dapp-schema");
const drizzle_orm_1 = require("drizzle-orm");
const diff = __importStar(require("diff"));
class VersionService {
    /**
     * Creates a new version of a DApp
     * @param data Version data
     * @returns The created version
     */
    async createVersion(data) {
        const [version] = await db_1.db.insert(dapp_schema_1.dappVersions).values(data).returning();
        return version;
    }
    /**
     * Gets all versions of a DApp
     * @param userDappId DApp ID
     * @returns List of versions
     */
    async getDappVersions(userDappId) {
        return await db_1.db.select().from(dapp_schema_1.dappVersions)
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappVersions.userDappId, userDappId))
            .orderBy((0, drizzle_orm_1.desc)(dapp_schema_1.dappVersions.createdAt));
    }
    /**
     * Gets all versions of a specific branch
     * @param userDappId DApp ID
     * @param branch Branch name
     * @returns List of versions in the branch
     */
    async getBranchVersions(userDappId, branch) {
        return await db_1.db.select().from(dapp_schema_1.dappVersions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.dappVersions.userDappId, userDappId), (0, drizzle_orm_1.eq)(dapp_schema_1.dappVersions.branch, branch)))
            .orderBy((0, drizzle_orm_1.desc)(dapp_schema_1.dappVersions.createdAt));
    }
    /**
     * Gets all branches for a DApp
     * @param userDappId DApp ID
     * @returns List of branch names
     */
    async getDappBranches(userDappId) {
        const result = await db_1.db.select({ branch: dapp_schema_1.dappVersions.branch })
            .from(dapp_schema_1.dappVersions)
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappVersions.userDappId, userDappId))
            .groupBy(dapp_schema_1.dappVersions.branch);
        return result.map(r => r.branch);
    }
    /**
     * Creates a new branch from an existing version
     * @param userDappId DApp ID
     * @param sourceVersionId Source version ID
     * @param newBranchName New branch name
     * @param userId User ID
     * @returns The created version in the new branch
     */
    async createBranch(userDappId, sourceVersionId, newBranchName, userId) {
        // Get the source version
        const sourceVersions = await db_1.db.select().from(dapp_schema_1.dappVersions)
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappVersions.id, sourceVersionId));
        if (sourceVersions.length === 0) {
            throw new Error('Source version not found');
        }
        const sourceVersion = sourceVersions[0];
        // Get files from the source version
        const sourceFiles = await db_1.db.select().from(dapp_schema_1.dappFiles)
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappFiles.dappVersionId, sourceVersionId));
        // Create new version in the new branch
        const [newVersion] = await db_1.db.insert(dapp_schema_1.dappVersions).values({
            userDappId,
            version: this.generateVersionString(),
            branch: newBranchName,
            createdBy: userId,
            parentVersionId: sourceVersionId,
            commitMessage: `Created branch ${newBranchName} from ${sourceVersion.branch}/${sourceVersion.version}`
        }).returning();
        // Copy files to the new version
        for (const file of sourceFiles) {
            await db_1.db.insert(dapp_schema_1.dappFiles).values({
                userDappId,
                dappVersionId: newVersion.id,
                fileType: file.fileType,
                fileName: file.fileName,
                content: file.content,
                path: file.path,
                lastModifiedBy: userId,
                lastModifiedAt: new Date()
            });
        }
        return newVersion;
    }
    /**
     * Merges changes from one branch to another
     * @param userDappId DApp ID
     * @param sourceBranch Source branch name
     * @param targetBranch Target branch name
     * @param userId User ID
     * @returns The created version with merged changes
     */
    async mergeBranches(userDappId, sourceBranch, targetBranch, userId) {
        // Get latest version from source branch
        const sourceVersions = await this.getBranchVersions(userDappId, sourceBranch);
        if (sourceVersions.length === 0) {
            throw new Error(`Source branch ${sourceBranch} not found`);
        }
        // Get latest version from target branch
        const targetVersions = await this.getBranchVersions(userDappId, targetBranch);
        if (targetVersions.length === 0) {
            throw new Error(`Target branch ${targetBranch} not found`);
        }
        const sourceVersion = sourceVersions[0];
        const targetVersion = targetVersions[0];
        // Get files from source and target versions
        const sourceFiles = await db_1.db.select().from(dapp_schema_1.dappFiles)
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappFiles.dappVersionId, sourceVersion.id));
        const targetFiles = await db_1.db.select().from(dapp_schema_1.dappFiles)
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.dappFiles.dappVersionId, targetVersion.id));
        // Create a map of target files by name for easier access
        const targetFileMap = new Map(targetFiles.map(file => [file.fileName, file]));
        // Create new version in the target branch
        const [mergedVersion] = await db_1.db.insert(dapp_schema_1.dappVersions).values({
            userDappId,
            version: this.generateVersionString(),
            branch: targetBranch,
            createdBy: userId,
            parentVersionId: targetVersion.id,
            commitMessage: `Merged branch ${sourceBranch} into ${targetBranch}`
        }).returning();
        // Perform the merge
        const mergedFiles = [];
        const conflicts = [];
        for (const sourceFile of sourceFiles) {
            if (targetFileMap.has(sourceFile.fileName)) {
                // File exists in both branches, need to merge
                const targetFile = targetFileMap.get(sourceFile.fileName);
                if (sourceFile.content === targetFile.content) {
                    // No changes, just copy the file
                    mergedFiles.push({
                        userDappId,
                        dappVersionId: mergedVersion.id,
                        fileType: sourceFile.fileType,
                        fileName: sourceFile.fileName,
                        content: sourceFile.content,
                        path: sourceFile.path,
                        lastModifiedBy: userId,
                        lastModifiedAt: new Date()
                    });
                }
                else {
                    // Try to auto-merge
                    try {
                        const mergedContent = this.mergeContents(targetFile.content, sourceFile.content, `${targetBranch} version`, `${sourceBranch} version`);
                        mergedFiles.push({
                            userDappId,
                            dappVersionId: mergedVersion.id,
                            fileType: sourceFile.fileType,
                            fileName: sourceFile.fileName,
                            content: mergedContent,
                            path: sourceFile.path,
                            lastModifiedBy: userId,
                            lastModifiedAt: new Date(),
                            metadata: { merged: true }
                        });
                    }
                    catch (error) {
                        // Conflict detected
                        conflicts.push({
                            fileName: sourceFile.fileName,
                            sourceBranch,
                            targetBranch,
                            sourceContent: sourceFile.content,
                            targetContent: targetFile.content
                        });
                    }
                }
                // Remove from map to track which files are only in target
                targetFileMap.delete(sourceFile.fileName);
            }
            else {
                // File only in source, add it
                mergedFiles.push({
                    userDappId,
                    dappVersionId: mergedVersion.id,
                    fileType: sourceFile.fileType,
                    fileName: sourceFile.fileName,
                    content: sourceFile.content,
                    path: sourceFile.path,
                    lastModifiedBy: userId,
                    lastModifiedAt: new Date(),
                    metadata: { addedFromSource: true }
                });
            }
        }
        // Add remaining files that are only in target
        for (const [_, targetFile] of targetFileMap.entries()) {
            mergedFiles.push({
                userDappId,
                dappVersionId: mergedVersion.id,
                fileType: targetFile.fileType,
                fileName: targetFile.fileName,
                content: targetFile.content,
                path: targetFile.path,
                lastModifiedBy: userId,
                lastModifiedAt: new Date()
            });
        }
        // Insert merged files if there are no conflicts
        if (conflicts.length === 0) {
            for (const file of mergedFiles) {
                await db_1.db.insert(dapp_schema_1.dappFiles).values(file);
            }
            return {
                success: true,
                version: mergedVersion,
                message: `Successfully merged ${sourceBranch} into ${targetBranch}`
            };
        }
        else {
            // Delete the created version since merge failed
            await db_1.db.delete(dapp_schema_1.dappVersions).where((0, drizzle_orm_1.eq)(dapp_schema_1.dappVersions.id, mergedVersion.id));
            return {
                success: false,
                conflicts,
                message: `Merge conflicts detected in ${conflicts.length} files`
            };
        }
    }
    /**
     * Tracks changes to a file
     * @param fileId File ID
     * @param userId User ID
     * @param changeType Change type (create, modify, delete)
     * @param previousContent Previous content
     * @param newContent New content
     * @returns The created change record
     */
    async trackFileChange(fileId, userId, changeType, previousContent, newContent) {
        const [change] = await db_1.db.insert(dapp_schema_1.fileChangeHistory).values({
            fileId,
            userId,
            changeType,
            previousContent,
            newContent,
            changedAt: new Date()
        }).returning();
        return change;
    }
    /**
     * Gets the change history for a file
     * @param fileId File ID
     * @returns List of changes
     */
    async getFileHistory(fileId) {
        return await db_1.db.select().from(dapp_schema_1.fileChangeHistory)
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.fileChangeHistory.fileId, fileId))
            .orderBy((0, drizzle_orm_1.desc)(dapp_schema_1.fileChangeHistory.changedAt));
    }
    /**
     * Computes the difference between two versions of a file
     * @param oldContent Old content
     * @param newContent New content
     * @returns Diff in unified format
     */
    diffContents(oldContent, newContent) {
        return diff.createPatch('file', oldContent, newContent);
    }
    /**
     * Merges contents from two different versions
     * @param baseContent Base content
     * @param newContent New content to merge
     * @param baseLabel Label for base content
     * @param newLabel Label for new content
     * @returns Merged content
     */
    mergeContents(baseContent, newContent, baseLabel = 'base', newLabel = 'new') {
        // This is a simple merge strategy and may need to be improved for complex merges
        // For production use, consider using a more robust merge library
        const patches = diff.createPatch('file', baseContent, newContent, baseLabel, newLabel);
        // If there are conflicting changes, throw an error
        if (patches.includes('<<<<<<<') || patches.includes('=======') || patches.includes('>>>>>>>')) {
            throw new Error('Merge conflict detected');
        }
        // Apply the patches to the base content
        try {
            const mergedContent = diff.applyPatch(baseContent, patches);
            if (mergedContent === false) {
                throw new Error('Failed to apply patch');
            }
            return mergedContent;
        }
        catch (error) {
            throw new Error(`Merge failed: ${error.message}`);
        }
    }
    /**
     * Generates a version string
     * @returns Version string in format v1.0.0
     */
    generateVersionString() {
        // In a real implementation, this would be more sophisticated
        // and would follow semantic versioning based on the changes
        const timestamp = Date.now();
        return `v${timestamp}`;
    }
}
exports.VersionService = VersionService;
exports.versionService = new VersionService();
