# MCP configuration (example)

[`mcp-config.example.json`](mcp-config.example.json) shows the shape of a least-privilege MCP setup for the Copilot cloud agent. It is an example: the URLs are placeholders and nothing in this repository runs it.

The config does not live in the repository. To use it, paste a real version into **Settings → Copilot → MCP servers** of your fork.

What it demonstrates:

- `tools` is an allow-list. `"*"` would allow every tool the server exposes. Here `reader` gets one read tool and `writer` gets exactly one write tool.
- Secrets never go into the JSON. They are repository secrets for the agent, and their names must start with `COPILOT_MCP_`.
- The agent firewall does not cover MCP servers you add yourself. Least privilege in `tools` is the first layer, not the firewall.
