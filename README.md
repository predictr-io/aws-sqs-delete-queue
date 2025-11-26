# AWS SQS Delete Queue

> **⚠️ DESTRUCTIVE ACTION WARNING ⚠️**
>
> **This action permanently deletes SQS queues and all messages in them.**
>
> - All queued messages will be **permanently lost**
> - Deletion is **irreversible** and **immediate**
> - Carefully verify the `queue-url` parameter before use
> - Consider using queue policies or AWS Backup for important data
> - **Test thoroughly in non-production environments first**

A GitHub Action to delete AWS SQS queues. Primarily intended for test workflows and temporary queue cleanup.

## Features

- **Delete queues** - Permanently delete SQS queues (standard or FIFO)
- **Simple integration** - Easy to use in GitHub Actions workflows
- **URL validation** - Basic validation of queue URL format

## Prerequisites

Configure AWS credentials before using this action.

### Option 1: AWS Credentials (Production)

```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/my-github-actions-role
    aws-region: us-east-1
```

### Option 2: LocalStack (Testing)

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      localstack:
        image: localstack/localstack
        ports:
          - 4566:4566
        env:
          SERVICES: sqs
    steps:
      - name: Delete queue in LocalStack
        uses: predictr-io/aws-sqs-delete-queue@v0
        env:
          AWS_ENDPOINT_URL: http://localhost:4566
          AWS_ACCESS_KEY_ID: test
          AWS_SECRET_ACCESS_KEY: test
          AWS_DEFAULT_REGION: us-east-1
        with:
          queue-url: 'http://localhost:4566/000000000000/test-queue'
```

## Usage

### Delete Queue

> **⚠️ WARNING:** This will permanently delete the queue and all its messages.

```yaml
- name: Delete SQS queue
  uses: predictr-io/aws-sqs-delete-queue@v0
  with:
    queue-url: 'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue'
```

### Delete FIFO Queue

```yaml
- name: Delete FIFO queue
  uses: predictr-io/aws-sqs-delete-queue@v0
  with:
    queue-url: 'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue.fifo'
```

### Test Workflow Example

Delete temporary test queues after integration tests:

```yaml
name: Integration Tests

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      localstack:
        image: localstack/localstack
        ports:
          - 4566:4566
        env:
          SERVICES: sqs

    steps:
      - uses: actions/checkout@v4

      - name: Create test queue
        id: create
        uses: predictr-io/aws-sqs-create-queue@v0
        env:
          AWS_ENDPOINT_URL: http://localhost:4566
          AWS_ACCESS_KEY_ID: test
          AWS_SECRET_ACCESS_KEY: test
          AWS_DEFAULT_REGION: us-east-1
        with:
          queue-name: 'test-queue'

      - name: Run integration tests
        run: |
          export QUEUE_URL="${{ steps.create.outputs.queue-url }}"
          npm test

      - name: Clean up test queue
        if: always()
        uses: predictr-io/aws-sqs-delete-queue@v0
        env:
          AWS_ENDPOINT_URL: http://localhost:4566
          AWS_ACCESS_KEY_ID: test
          AWS_SECRET_ACCESS_KEY: test
          AWS_DEFAULT_REGION: us-east-1
        with:
          queue-url: ${{ steps.create.outputs.queue-url }}
```

## Inputs

### Required Inputs

| Input | Description |
|-------|-------------|
| `queue-url` | SQS queue URL to delete (e.g., `https://sqs.us-east-1.amazonaws.com/123456789012/my-queue`) |

## Outputs

| Output | Description |
|--------|-------------|
| `deleted` | Whether the queue was successfully deleted (`"true"` or `"false"`) |

## Queue URL Format

### Standard Queue

```
https://sqs.{region}.amazonaws.com/{account-id}/{queue-name}
```

### FIFO Queue

```
https://sqs.{region}.amazonaws.com/{account-id}/{queue-name}.fifo
```

You can find your queue URL in the AWS Console or using AWS CLI:

```bash
aws sqs get-queue-url --queue-name my-queue
```

## Error Handling

The action handles common scenarios:

- **Invalid queue URL**: Fails with validation error
- **Queue does not exist**: Fails with AWS error
- **AWS permission errors**: Fails with AWS SDK error message
- **Queue URL format warning**: Warns if URL doesn't match expected AWS format

## Safety Considerations

> **⚠️ IMPORTANT:** Before using this action, consider:

1. **Data Loss**: All messages in the queue will be permanently deleted
2. **No Undo**: Queue deletion cannot be reversed
3. **Dependencies**: Verify no applications are actively using the queue
4. **Monitoring**: Deletion may trigger CloudWatch alarms or break monitoring
5. **Billing**: Queue deletion stops billing immediately
6. **Testing**: Always test in non-production environments first

### Best Practices

- Use in temporary/test workflows only
- Store queue URLs in secrets, not hardcoded
- Use `if: always()` for cleanup steps to ensure execution
- Consider queue policies before deletion
- Verify queue URL is correct before running
- Review AWS permissions for delete operations

## Development

### Setup

```bash
git clone https://github.com/predictr-io/aws-sqs-delete-queue.git
cd aws-sqs-delete-queue
npm install
```

### Scripts

```bash
npm run build      # Build the action
npm run type-check # TypeScript checking
npm run lint       # ESLint
npm run check      # Run all checks
```

## License

MIT
