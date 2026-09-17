#!/usr/bin/env python3
"""Fail if BOARD.md references an item ID with no matching work/items/{id}.md file."""
import os
import re
import sys

def main():
    board = open("state/BOARD.md").read()
    ids = re.findall(r"\| (CP-[A-Z0-9-]+) \|", board)
    missing = [i for i in ids if not os.path.exists(f"work/items/{i}.md")]
    if missing:
        print("missing work items for:", missing, file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
