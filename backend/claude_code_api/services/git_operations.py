"""
Git Operations Service

Provides git functionality for mobile app:
- Status, commit, log, diff
- Branch management
- Remote information

Uses GitPython library for reliable git operations.
"""

import os
from pathlib import Path
from datetime import datetime
from typing import List, Optional, Dict, Any
import structlog
from git import Repo, InvalidGitRepositoryError, GitCommandError

logger = structlog.get_logger()


class GitNotFoundError(Exception):
    """Not a git repository."""
    pass


class GitOperationError(Exception):
    """Git operation failed."""
    pass


class GitOperationsService:
    """Git operations service using GitPython."""

    def get_status(self, repo_path: str) -> dict:
        """
        Get full git status.

        Returns:
            Dict with modified, untracked, staged, current_branch, has_commits, conflicted
        """
        try:
            repo = Repo(repo_path)
        except InvalidGitRepositoryError:
            raise GitNotFoundError(f"Not a git repository: {repo_path}")

        # Get current branch
        try:
            current_branch = repo.active_branch.name
        except TypeError:
            # Detached HEAD
            current_branch = "detached HEAD"

        # Get file statuses
        modified = [item.a_path for item in repo.index.diff(None)]
        staged = [item.a_path for item in repo.index.diff('HEAD')]
        untracked = repo.untracked_files
        conflicted = [item[0] for item in repo.index.unmerged_blobs().items()]

        # Check if repo has commits
        try:
            has_commits = bool(repo.head.commit)
        except ValueError:
            has_commits = False

        status = {
            "current_branch": current_branch,
            "modified": modified,
            "staged": staged,
            "untracked": untracked,
            "conflicted": conflicted,
            "has_commits": has_commits,
            "is_detached": current_branch == "detached HEAD",
        }

        logger.debug("Git status retrieved", repo=repo_path, status=status)

        return status

    def create_commit(
        self,
        repo_path: str,
        message: str,
        files: Optional[List[str]] = None,
        author: Optional[dict] = None
    ) -> dict:
        """
        Create git commit.

        Args:
            repo_path: Repository path
            message: Commit message
            files: Files to stage (None = all modified)
            author: Optional author dict with 'name' and 'email'

        Returns:
            Commit info: sha, short_sha, message, author, timestamp
        """
        try:
            repo = Repo(repo_path)
        except InvalidGitRepositoryError:
            raise GitNotFoundError(f"Not a git repository: {repo_path}")

        # Stage files
        if files:
            repo.index.add(files)
        else:
            # Stage all modified and untracked
            repo.git.add(A=True)

        # Create commit
        try:
            if author:
                commit = repo.index.commit(
                    message,
                    author=f"{author['name']} <{author['email']}>"
                )
            else:
                commit = repo.index.commit(message)

            commit_info = {
                "sha": commit.hexsha,
                "short_sha": commit.hexsha[:7],
                "message": commit.message,
                "author": commit.author.name,
                "email": commit.author.email,
                "timestamp": datetime.fromtimestamp(commit.committed_date).isoformat(),
            }

            logger.info("Commit created", repo=repo_path, sha=commit_info["short_sha"])

            return commit_info

        except GitCommandError as e:
            raise GitOperationError(f"Failed to create commit: {e}")

    def get_log(
        self,
        repo_path: str,
        max_count: int = 50,
        skip: int = 0,
        file_path: Optional[str] = None
    ) -> List[dict]:
        """
        Get commit log.

        Args:
            repo_path: Repository path
            max_count: Maximum commits to return
            skip: Number of commits to skip (pagination)
            file_path: Optional file path to filter commits

        Returns:
            List of commit dicts
        """
        try:
            repo = Repo(repo_path)
        except InvalidGitRepositoryError:
            raise GitNotFoundError(f"Not a git repository: {repo_path}")

        try:
            if file_path:
                commits = list(repo.iter_commits(paths=file_path, max_count=max_count, skip=skip))
            else:
                commits = list(repo.iter_commits(max_count=max_count, skip=skip))

            log = []
            for commit in commits:
                log.append({
                    "sha": commit.hexsha,
                    "short_sha": commit.hexsha[:7],
                    "message": commit.message.strip(),
                    "author": commit.author.name,
                    "email": commit.author.email,
                    "timestamp": datetime.fromtimestamp(commit.committed_date).isoformat(),
                    "files_changed": len(commit.stats.files),
                })

            logger.debug("Git log retrieved", repo=repo_path, commits=len(log))

            return log

        except GitCommandError as e:
            raise GitOperationError(f"Failed to get log: {e}")

    def get_diff(
        self,
        repo_path: str,
        staged: bool = False,
        file_path: Optional[str] = None,
        context_lines: int = 3
    ) -> str:
        """
        Get git diff in unified format.

        Args:
            repo_path: Repository path
            staged: Show staged changes (vs unstaged)
            file_path: Optional file to diff
            context_lines: Number of context lines

        Returns:
            Diff string in unified format
        """
        try:
            repo = Repo(repo_path)
        except InvalidGitRepositoryError:
            raise GitNotFoundError(f"Not a git repository: {repo_path}")

        try:
            if staged:
                # Staged changes (index vs HEAD)
                diff = repo.git.diff('--staged', '--unified=' + str(context_lines), file_path or '')
            else:
                # Unstaged changes (working tree vs index)
                diff = repo.git.diff('--unified=' + str(context_lines), file_path or '')

            return diff

        except GitCommandError as e:
            raise GitOperationError(f"Failed to get diff: {e}")

    def get_branches(self, repo_path: str, include_remote: bool = False) -> List[dict]:
        """
        List all branches.

        Args:
            repo_path: Repository path
            include_remote: Include remote branches

        Returns:
            List of branch dicts
        """
        try:
            repo = Repo(repo_path)
        except InvalidGitRepositoryError:
            raise GitNotFoundError(f"Not a git repository: {repo_path}")

        branches = []

        # Local branches
        for branch in repo.heads:
            branches.append({
                "name": branch.name,
                "is_current": branch == repo.active_branch,
                "last_commit": branch.commit.hexsha[:7],
                "remote": None,
            })

        # Remote branches
        if include_remote:
            for remote in repo.remotes:
                for ref in remote.refs:
                    branches.append({
                        "name": ref.name,
                        "is_current": False,
                        "last_commit": ref.commit.hexsha[:7],
                        "remote": remote.name,
                    })

        logger.debug("Branches listed", repo=repo_path, count=len(branches))

        return branches

    def create_branch(
        self,
        repo_path: str,
        branch_name: str,
        from_branch: Optional[str] = None
    ) -> dict:
        """
        Create new branch.

        Args:
            repo_path: Repository path
            branch_name: New branch name
            from_branch: Optional source branch/commit

        Returns:
            Branch info dict
        """
        try:
            repo = Repo(repo_path)
        except InvalidGitRepositoryError:
            raise GitNotFoundError(f"Not a git repository: {repo_path}")

        try:
            if from_branch:
                new_branch = repo.create_head(branch_name, from_branch)
            else:
                new_branch = repo.create_head(branch_name)

            branch_info = {
                "name": new_branch.name,
                "commit": new_branch.commit.hexsha[:7],
            }

            logger.info("Branch created", repo=repo_path, branch=branch_name)

            return branch_info

        except GitCommandError as e:
            raise GitOperationError(f"Failed to create branch: {e}")

    def checkout_branch(self, repo_path: str, branch_name: str) -> dict:
        """
        Switch to branch.

        Args:
            repo_path: Repository path
            branch_name: Branch to checkout

        Returns:
            Branch info after checkout
        """
        try:
            repo = Repo(repo_path)
        except InvalidGitRepositoryError:
            raise GitNotFoundError(f"Not a git repository: {repo_path}")

        try:
            # Check for uncommitted changes
            if repo.is_dirty():
                raise GitOperationError("Cannot checkout: working directory has uncommitted changes")

            repo.git.checkout(branch_name)

            branch_info = {
                "name": repo.active_branch.name,
                "commit": repo.active_branch.commit.hexsha[:7],
            }

            logger.info("Branch checked out", repo=repo_path, branch=branch_name)

            return branch_info

        except GitCommandError as e:
            raise GitOperationError(f"Failed to checkout branch: {e}")

    def get_remote_info(self, repo_path: str) -> List[dict]:
        """
        Get remote information.

        Returns:
            List of remote dicts with name, url, fetch_url, push_url
        """
        try:
            repo = Repo(repo_path)
        except InvalidGitRepositoryError:
            raise GitNotFoundError(f"Not a git repository: {repo_path}")

        remotes = []
        for remote in repo.remotes:
            remotes.append({
                "name": remote.name,
                "url": list(remote.urls)[0] if remote.urls else None,
                "fetch_url": remote.url if hasattr(remote, 'url') else None,
                "push_url": remote.url if hasattr(remote, 'url') else None,
            })

        logger.debug("Remotes listed", repo=repo_path, count=len(remotes))

        return remotes
