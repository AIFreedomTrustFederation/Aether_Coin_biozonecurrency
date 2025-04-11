/**
 * VersionService: Provides Git-like version control functionality for DApps
 * Handles version history, branching, merging, and diffing for smart contracts.
 */
import { db } from '../../db';
import { 
  dappVersions, 
  dappFiles, 
  fileChangeHistory,
  InsertDappVersion, 
  InsertDappFile, 
  InsertFileChangeHistory 
} from '../../../shared/dapp-schema';
import { eq, and, desc } from 'drizzle-orm';
import * as diff from 'diff';

export class VersionService {
  /**
   * Creates a new version of a DApp
   * @param data Version data
   * @returns The created version
   */
  async createVersion(data: InsertDappVersion) {
    const [version] = await db.insert(dappVersions).values(data).returning();
    return version;
  }

  /**
   * Gets all versions of a DApp
   * @param userDappId DApp ID
   * @returns List of versions
   */
  async getDappVersions(userDappId: number) {
    return await db.select().from(dappVersions)
      .where(eq(dappVersions.userDappId, userDappId))
      .orderBy(desc(dappVersions.createdAt));
  }

  /**
   * Gets all versions of a specific branch
   * @param userDappId DApp ID
   * @param branch Branch name
   * @returns List of versions in the branch
   */
  async getBranchVersions(userDappId: number, branch: string) {
    return await db.select().from(dappVersions)
      .where(and(
        eq(dappVersions.userDappId, userDappId),
        eq(dappVersions.branch, branch)
      ))
      .orderBy(desc(dappVersions.createdAt));
  }

  /**
   * Gets all branches for a DApp
   * @param userDappId DApp ID
   * @returns List of branch names
   */
  async getDappBranches(userDappId: number) {
    const result = await db.select({ branch: dappVersions.branch })
      .from(dappVersions)
      .where(eq(dappVersions.userDappId, userDappId))
      .groupBy(dappVersions.branch);
    
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
  async createBranch(userDappId: number, sourceVersionId: number, newBranchName: string, userId: number) {
    // Get the source version
    const sourceVersions = await db.select().from(dappVersions)
      .where(eq(dappVersions.id, sourceVersionId));
    
    if (sourceVersions.length === 0) {
      throw new Error('Source version not found');
    }
    
    const sourceVersion = sourceVersions[0];
    
    // Get files from the source version
    const sourceFiles = await db.select().from(dappFiles)
      .where(eq(dappFiles.dappVersionId, sourceVersionId));
    
    // Create new version in the new branch
    const [newVersion] = await db.insert(dappVersions).values({
      userDappId,
      version: this.generateVersionString(),
      branch: newBranchName,
      createdBy: userId,
      parentVersionId: sourceVersionId,
      commitMessage: `Created branch ${newBranchName} from ${sourceVersion.branch}/${sourceVersion.version}`
    }).returning();
    
    // Copy files to the new version
    for (const file of sourceFiles) {
      await db.insert(dappFiles).values({
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
  async mergeBranches(userDappId: number, sourceBranch: string, targetBranch: string, userId: number) {
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
    const sourceFiles = await db.select().from(dappFiles)
      .where(eq(dappFiles.dappVersionId, sourceVersion.id));
    
    const targetFiles = await db.select().from(dappFiles)
      .where(eq(dappFiles.dappVersionId, targetVersion.id));
    
    // Create a map of target files by name for easier access
    const targetFileMap = new Map(targetFiles.map(file => [file.fileName, file]));
    
    // Create new version in the target branch
    const [mergedVersion] = await db.insert(dappVersions).values({
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
        const targetFile = targetFileMap.get(sourceFile.fileName)!;
        
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
        } else {
          // Try to auto-merge
          try {
            const mergedContent = this.mergeContents(
              targetFile.content,
              sourceFile.content,
              `${targetBranch} version`,
              `${sourceBranch} version`
            );
            
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
          } catch (error) {
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
      } else {
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
        await db.insert(dappFiles).values(file);
      }
      
      return {
        success: true,
        version: mergedVersion,
        message: `Successfully merged ${sourceBranch} into ${targetBranch}`
      };
    } else {
      // Delete the created version since merge failed
      await db.delete(dappVersions).where(eq(dappVersions.id, mergedVersion.id));
      
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
  async trackFileChange(
    fileId: number,
    userId: number,
    changeType: 'create' | 'modify' | 'delete',
    previousContent?: string,
    newContent?: string
  ) {
    const [change] = await db.insert(fileChangeHistory).values({
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
  async getFileHistory(fileId: number) {
    return await db.select().from(fileChangeHistory)
      .where(eq(fileChangeHistory.fileId, fileId))
      .orderBy(desc(fileChangeHistory.changedAt));
  }

  /**
   * Computes the difference between two versions of a file
   * @param oldContent Old content
   * @param newContent New content
   * @returns Diff in unified format
   */
  diffContents(oldContent: string, newContent: string) {
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
  mergeContents(
    baseContent: string,
    newContent: string,
    baseLabel: string = 'base',
    newLabel: string = 'new'
  ) {
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
    } catch (error) {
      throw new Error(`Merge failed: ${error.message}`);
    }
  }

  /**
   * Generates a version string
   * @returns Version string in format v1.0.0
   */
  private generateVersionString() {
    // In a real implementation, this would be more sophisticated
    // and would follow semantic versioning based on the changes
    const timestamp = Date.now();
    return `v${timestamp}`;
  }
}

export const versionService = new VersionService();