# Back-end part

## Transaction Request DTO Model (JSON)

This model describes the expected format for creating or updating transaction data.

```json
{
    "amount": "number (required)",
    "date": "string (ISO 8601 format, required)",
    "type": "string ('income' or 'expense', required)",
    "category": "string (required)",
    "description": "string (optional)"
}
```
## Transaction Response DTO Model (JSON)

This model describes the structure of the transaction data returned by the API.

```json
{
    "_id": "string (MongoDB ObjectId, read-only)",
    "amount": "number",
    "date": "string (ISO 8601 format)",
    "type": "string ('income' or 'expense')",
    "category": "string",
    "description": "string"
}
```