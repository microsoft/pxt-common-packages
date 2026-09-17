#!/usr/bin/env python3
"""Fetch the pinned MIT-licensed Box2D release and list its sources in pxt.json."""

import hashlib
import io
import json
from pathlib import Path
import re
import tarfile
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
VERSION = "2.4.1"
PREFIX = f"box2d-{VERSION}"
DEST = ROOT / "vendor" / PREFIX
URL = f"https://codeload.github.com/erincatto/box2d/tar.gz/refs/tags/v{VERSION}"
SHA256 = "d6b4650ff897ee1ead27cf77a5933ea197cbeef6705638dd181adc2e816b23c2"


def main():
    data = urllib.request.urlopen(URL, timeout=60).read()
    if hashlib.sha256(data).hexdigest() != SHA256:
        raise RuntimeError("Box2D archive checksum mismatch")
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
        for member in archive.getmembers():
            path = Path(member.name)
            if not member.isfile() or path.parts[0] != PREFIX:
                continue
            relative = Path(*path.parts[1:])
            if ".." in relative.parts:
                raise RuntimeError("Unexpected archive path")
            if relative.as_posix() != "LICENSE" and not (
                relative.parts[0] in ("include", "src")
                and relative.suffix in (".cpp", ".h")
            ):
                continue
            contents = archive.extractfile(member).read().decode("utf-8")
            if relative.suffix in (".h", ".cpp"):
                # PXT's line-based shim parser exports every named enum, even private ones.
                # Reflow the declaration without changing what the C++ compiler sees.
                contents = re.sub(
                    r"^([ \t]*)enum[ \t]+(\w+)[ \t]*(?=\r?$|\{)",
                    r"\1enum\n\1\2",
                    contents,
                    flags=re.MULTILINE,
                )
            if relative.as_posix() == "include/box2d/b2_stack_allocator.h":
                contents = contents.replace(
                    "const int32 b2_stackSize = 100 * 1024;\t// 100k",
                    "const int32 b2_stackSize = 8 * 1024; // Arcade: spill larger steps to the heap",
                )
            if relative.as_posix() == "src/common/b2_block_allocator.cpp":
                contents = contents.replace(
                    "static const int32 b2_chunkSize = 16 * 1024;",
                    "static const int32 b2_chunkSize = 4 * 1024;",
                ).replace(
                    "static const int32 b2_chunkArrayIncrement = 128;",
                    "static const int32 b2_chunkArrayIncrement = 16;",
                )
            if relative.as_posix() == "src/dynamics/b2_joint.cpp":
                start = contents.index("b2Joint* b2Joint::Create(")
                end = contents.index("b2Joint::b2Joint(")
                factory, count = re.subn(
                    r"^\tcase e_(?:mouse|prismatic|pulley|gear|weld|friction|motor)Joint:\n.*?^\t\tbreak;",
                    lambda match: "#if B2_ENABLE_EXTRA_JOINTS\n" + match[0] + "\n#endif",
                    contents[start:end],
                    flags=re.MULTILINE | re.DOTALL,
                )
                if count != 14:
                    raise RuntimeError("Unexpected Box2D joint factory layout")
                contents = (
                    contents[:start]
                    + "// Arcade only exposes distance, revolute, and wheel joints; avoid linking unused solvers.\n"
                    + "#ifndef B2_ENABLE_EXTRA_JOINTS\n#define B2_ENABLE_EXTRA_JOINTS 0\n#endif\n\n"
                    + factory
                    + contents[end:]
                )
            if relative.parts[0] == "src":
                # PXT builds each listed file; relative includes need no target-specific -I flags.
                contents = re.sub(
                    r'#include "box2d/([^"]+)"',
                    r'#include "../../include/box2d/\1"',
                    contents,
                )
                contents = re.sub(
                    r'#include "dynamics/([^"]+)"',
                    r'#include "../dynamics/\1"',
                    contents,
                )
            output = DEST / relative
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(contents)
    manifest_path = ROOT / "pxt.json"
    manifest = json.loads(manifest_path.read_text())
    files = [f for f in manifest["files"] if not f.startswith("vendor/")]
    files += sorted(
        p.relative_to(ROOT).as_posix()
        for p in DEST.rglob("*")
        if p.is_file() and (p.suffix in (".h", ".cpp") or p.name == "LICENSE")
    )
    manifest["files"] = files
    manifest_path.write_text(json.dumps(manifest, indent=4) + "\n")


if __name__ == "__main__":
    main()
