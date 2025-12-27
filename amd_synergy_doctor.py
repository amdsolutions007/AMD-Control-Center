#!/usr/bin/env python3
"""amd_synergy_doctor.py

Phase 2: THE SYNERGY BRIDGE

Watches a drop-zone folder for incoming .txt "transmissions", prints their
contents, then archives them into a Processed_Orders subfolder.
"""

from __future__ import annotations

import os
import time
import shutil
from pathlib import Path

# Google Drive "Drive for desktop" commonly mounts under ~/Library/CloudStorage/...
GOOGLE_DRIVE_DROPZONES = [
    Path(
        "/Users/mac/Library/CloudStorage/GoogleDrive-amdmediaoffice@gmail.com/My Drive/@Amd_Ascend_Solutions_Ai_Synergy_Hub/00_BROADCASTS"
    ),
    # Legacy/alternate mount path (kept as a fallback)
    Path("/Users/mac/Google Drive/My Drive/@Cmd_Ascend_Solutions/00_BROADCASTS"),
]
FALLBACK_DROPZONE = Path("Synergy_Inbox")
PROCESSED_SUBFOLDER = "Processed_Orders"
POLL_SECONDS = 5


def pick_watch_folder() -> Path:
    for candidate in GOOGLE_DRIVE_DROPZONES:
        if candidate.exists():
            return candidate

    FALLBACK_DROPZONE.mkdir(parents=True, exist_ok=True)
    return FALLBACK_DROPZONE


def ensure_processed_folder(watch_folder: Path) -> Path:
    processed = watch_folder / PROCESSED_SUBFOLDER
    processed.mkdir(parents=True, exist_ok=True)
    return processed


def safe_move_to_processed(src: Path, processed_folder: Path) -> Path:
    """Move src into processed folder, avoiding name collisions."""
    dest = processed_folder / src.name
    if not dest.exists():
        shutil.move(str(src), str(dest))
        return dest

    stem = src.stem
    suffix = src.suffix
    i = 1
    while True:
        candidate = processed_folder / f"{stem}__{i}{suffix}"
        if not candidate.exists():
            shutil.move(str(src), str(candidate))
            return candidate
        i += 1


def read_text_file(path: Path) -> str:
    # Use replacement to avoid crashes on odd encodings.
    return path.read_text(encoding="utf-8", errors="replace")


def main() -> None:
    watch_folder = pick_watch_folder()
    processed_folder = ensure_processed_folder(watch_folder)

    def out(message: str) -> None:
        print(message, flush=True)

    out("🛰️  SYNERGY DOCTOR ONLINE")
    out(f"👁️  WATCH_FOLDER: {watch_folder}")
    out(f"📦 PROCESSED_ORDERS: {processed_folder}")
    out(f"⏱️  Polling every {POLL_SECONDS}s. Press Ctrl+C to stop.\n")

    while True:
        try:
            # Only watch .txt files in the root of WATCH_FOLDER
            for txt_file in sorted(watch_folder.glob("*.txt")):
                if not txt_file.is_file():
                    continue

                out(f">> 📨 INCOMING TRANSMISSION DETECTED: {txt_file.name}")
                try:
                    content = read_text_file(txt_file)
                except Exception as e:
                    content = f"[ERROR READING FILE: {e}]"

                out("----- BEGIN TRANSMISSION -----")
                out(content.rstrip("\n"))
                out("----- END TRANSMISSION -----\n")

                try:
                    archived_path = safe_move_to_processed(txt_file, processed_folder)
                    out(f"✅ ARCHIVED: {archived_path.name}\n")
                except Exception as e:
                    out(f"❌ ARCHIVE FAILED for {txt_file.name}: {e}\n")

            time.sleep(POLL_SECONDS)
        except KeyboardInterrupt:
            out("\n🛑 SYNERGY DOCTOR OFFLINE")
            return
        except Exception as loop_err:
            # Don't die if Drive hiccups; keep running.
            out(f"⚠️  LOOP ERROR: {loop_err}")
            time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    main()
