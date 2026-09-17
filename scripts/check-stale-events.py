#!/usr/bin/env python3
"""Fail if any state/events.jsonl entry is PENDING_RECONCILIATION past the staleness threshold."""
import json
import sys
from datetime import datetime, timezone, timedelta

STALE_AFTER = timedelta(hours=24)

def main():
    now = datetime.now(timezone.utc)
    stale_found = False
    with open("state/events.jsonl") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            event = json.loads(line)
            if event.get("outcome") == "PENDING_RECONCILIATION":
                ts = datetime.fromisoformat(event["timestamp"].replace("Z", "+00:00"))
                if now - ts > STALE_AFTER:
                    print(f"STALE: {event['id']} pending since {event['timestamp']}", file=sys.stderr)
                    stale_found = True
    sys.exit(1 if stale_found else 0)

if __name__ == "__main__":
    main()
