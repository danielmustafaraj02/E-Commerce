# Reports index

| Report | Contents |
| --- | --- |
| [qa-log.md](./qa-log.md) | Browser QA findings log — console/network/flow checks against the running dev site, one `## Pass N` section per session |

This folder holds *results* from QA passes. There's no separate how-to doc
(the old `docs/` walkthrough was removed from the repo — see commit
`84927e1` — since it documented security/deployment gaps alongside setup
steps). In short: run `npm run dev`, then drive Firefox through the
project-scoped `firefox-devtools` MCP server in [`../.mcp.json`](../.mcp.json)
(or click through by hand) checking console errors, failed network
requests, and the flows called out in `qa-log.md`'s own header — home,
products, PDP, cart, checkout, and admin.

New findings go at the top of `qa-log.md` as a new `## Pass N — <date>` section, following the existing severity-tag format (🔴 real bug, 🟠 medium, 🟢 low, ✅ verified working, 🟡 false positive). Skip anything already logged in a prior pass.
