# Triage Labels

The skills speak in terms of five canonical triage roles. In Linear these are
applied as issue **labels** (not workflow statuses). Default string = the role
name. Labels are created on first use via `create_issue_label` in the
`ClaudeCode` team.

| Role in mattpocock/skills | Label in Linear   | Meaning                                  |
| ------------------------- | ----------------- | ---------------------------------------- |
| `needs-triage`            | `needs-triage`    | Maintainer needs to evaluate this issue  |
| `needs-info`              | `needs-info`      | Waiting on reporter for more information |
| `ready-for-agent`         | `ready-for-agent` | Fully specified, ready for an AFK agent  |
| `ready-for-human`         | `ready-for-human` | Requires human implementation            |
| `wontfix`                 | `wontfix`         | Will not be actioned                     |

Notes:

- None of these five labels exist yet (the team only has `Bug`, `Feature`,
  `Improvement`). Create each one the first time `triage` needs to apply it.
- `wontfix` can alternatively be expressed by moving the issue to the **Canceled**
  status — prefer the label so triage state stays explicit and queryable.
- When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the
  corresponding label string from this table.
