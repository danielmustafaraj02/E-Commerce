# Reports index

| Report | Contents |
| --- | --- |
| [qa-log.md](./qa-log.md) | Browser QA findings log — console/network/flow checks against the running dev site, one `## Pass N` section per session |

This folder holds *results* from QA passes. For how to actually run a QA pass (Firefox setup, automated MCP driving, what to check), see [`../docs/QA_BROWSER_TESTING.md`](../docs/QA_BROWSER_TESTING.md).

New findings go at the top of `qa-log.md` as a new `## Pass N — <date>` section, following the existing severity-tag format (🔴 real bug, 🟠 medium, 🟢 low, ✅ verified working, 🟡 false positive). Skip anything already logged in a prior pass.
