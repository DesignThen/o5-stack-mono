#!/bin/bash
# Symlink skills from .agents/skills/ to IDE-specific directories

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

SKILLS_DIR="$ROOT_DIR/.agents/skills"
COMMANDS_DIR="$ROOT_DIR/.agents/commands"
IDE_DIRS=(".claude") # you can add dirs here like .cursor

# Symlink skills
for ide in "${IDE_DIRS[@]}"; do
  target_dir="$ROOT_DIR/$ide/skills"
  mkdir -p "$target_dir"

  for skill in "$SKILLS_DIR"/*; do
    if [ -d "$skill" ]; then
      skill_name=$(basename "$skill")
      link_path="$target_dir/$skill_name"

      rm -rf "$link_path" 2>/dev/null || true
      ln -s "../../.agents/skills/$skill_name/" "$link_path"
    fi
  done

  echo "Linked skills to $ide/skills"
done

# Symlink commands
for ide in "${IDE_DIRS[@]}"; do
  target_dir="$ROOT_DIR/$ide/commands"
  mkdir -p "$target_dir"

  for cmd in "$COMMANDS_DIR"/*; do
    cmd_name=$(basename "$cmd")
    link_path="$target_dir/$cmd_name"

    rm -rf "$link_path" 2>/dev/null || true
    if [ -d "$cmd" ]; then
      ln -s "../../.agents/commands/$cmd_name/" "$link_path"
    else
      ln -s "../../.agents/commands/$cmd_name" "$link_path"
    fi
  done

  echo "Linked commands to $ide/commands"
done

# Symlink CLAUDE.md to AGENTS.md (AGENTS.md is source of truth)
rm -f "$ROOT_DIR/CLAUDE.md" 2>/dev/null || true
ln -s "AGENTS.md" "$ROOT_DIR/CLAUDE.md"
echo "Linked CLAUDE.md -> AGENTS.md"

echo "Done. agent Skills symlinked to all IDE directories."
