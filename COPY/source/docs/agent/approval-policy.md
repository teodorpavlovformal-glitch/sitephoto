# Approval Policy

The control plane stops automatically when any of these gates are present and still pending:

- `dependency_change`
- `secret_change`
- `auth_change`
- `data_model_change`
- `production_promotion`
- `merge`

## Expected operator behavior

- Approve only after reviewing the plan, affected files, and intended execution path.
- Reject when the request is unclear, too broad, or risky for unattended execution.
- Treat merge and promotion approval as separate from implementation approval when production impact is involved.

## API

- `POST /runs/:id/approve`

Request body:

```json
{
  "gateType": "merge",
  "approved": true,
  "approvedBy": "operator",
  "note": "Safe to continue"
}
```
