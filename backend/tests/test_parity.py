"""The Earth copy (Python) and the base copy (the web app's TypeScript) must pack identically.

This runs web/lib/engine.ts in Node on the same bookings and compares every manifest fingerprint and
the days a base goes short. Skipped when Node is not installed (Node 23.6+ runs TypeScript directly).
"""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

from app.packer import pack
from tests.scenario import STAGES

ENGINE = Path(__file__).resolve().parents[2] / "web" / "lib" / "engine.ts"

RUNNER = """
import { readFileSync } from "node:fs";
import { d, daysShort, fingerprint, pack } from "%s";

const input = JSON.parse(readFileSync(0, "utf8"));
const bookings = input.map((b) => ({ id: b.id, dest: b.dest, item: b.item, shipper: b.shipper, priority: b.priority,
  mass: b.mass, vol: b.vol, neededBy: d(b.needed_by), bid: b.bid }));
const plan = pack(bookings);
const fingerprints = {};
for (const [id, m] of plan.manifests) fingerprints[id] = fingerprint(m);
process.stdout.write(JSON.stringify({ fingerprints, daysShort: daysShort(bookings, plan) }));
"""

node = shutil.which("node")


@pytest.mark.skipif(node is None, reason="Node is needed to run the web app's packer")
@pytest.mark.parametrize("stage", list(STAGES))
def test_web_and_server_pack_identically(stage, tmp_path):
    bookings = STAGES[stage]
    script = tmp_path / "runner.mjs"
    script.write_text(RUNNER % ENGINE.as_uri())
    payload = json.dumps([b.model_dump(mode="json") for b in bookings])
    result = subprocess.run([node, str(script)], input=payload, capture_output=True, text=True, check=True)
    web = json.loads(result.stdout)

    server = pack(bookings)
    assert web["fingerprints"] == {m.flight_id: m.fingerprint for m in server.manifests}
    assert web["daysShort"] == server.days_short
