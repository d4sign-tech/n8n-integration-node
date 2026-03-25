# @d4sign/n8n-nodes-d4sign

Community node to integrate n8n with the D4Sign API.

## Requirements

- n8n with support for community nodes
- valid D4Sign API credentials (`tokenAPI` and `cryptKey`)

## Installation

Install in your n8n custom nodes environment:

```bash
npm install @d4sign/n8n-nodes-d4sign
```

## Credential Setup

Create a credential of type `D4Sign API` and fill:

- `tokenAPI`
- `cryptKey`

Credential fields are masked in the UI and n8n stores credentials encrypted at rest.

## Supported Resources

- Document List
- Document Workflow
- Document Pins
- Document Tags
- Document Upload
- Document Watchers
- Document Webhooks
- Signatory
- Template
- Safe
- Group

## Upload Document (Binary) Quick Start

1. Add an `HTTP Request` node and download a file with `Response Format = File`.
2. Add `D4Sign` node with:
   - `Resource = Document Upload`
   - `Operation = Upload Document`
   - `Content Source = Binary Property`
   - `Binary Property = data` (or the property name from previous node)
3. Select `Safe` and optional `Folder`.
4. Execute workflow.

## Example Workflow (Sanitized)

This repository includes a sanitized example exported from a real test flow:

- [examples/workflows/d4sign-upload-main-document-sanitized.json](examples/workflows/d4sign-upload-main-document-sanitized.json)

Sanitization applied:

- removed workflow and node IDs
- removed `meta`, `versionId`, `active`, `pinData`
- removed credential IDs
- replaced environment-specific UUIDs with placeholders where needed

## Common Troubleshooting

- `File empty. Check the document path.`
  - confirm previous node outputs real binary data
  - confirm `Binary Property` name matches the binary key (usually `data`)
  - set `File Name` explicitly (example: `contract.pdf`)
- `Safe UUID must be a valid UUID`
  - select Safe from dropdown or use a valid UUID
- `Base64 content is malformed`
  - ensure the base64 input is valid and complete

## Development

```bash
npm run lint
npm run build
```

## Publishing

Package name follows the n8n standard:

- `@d4sign/n8n-nodes-d4sign`

For Creator Portal verification, n8n requires publish via GitHub Actions with provenance.

## License

MIT
