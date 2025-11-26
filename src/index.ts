import * as core from '@actions/core';
import { SQSClient } from '@aws-sdk/client-sqs';
import { deleteQueue } from './sqs';

async function run(): Promise<void> {
  try {
    // Get inputs
    const queueUrl = core.getInput('queue-url', { required: true });

    core.info('AWS SQS Delete Queue');
    core.info(`Queue URL: ${queueUrl}`);

    // Create SQS client (uses AWS credentials from environment)
    const client = new SQSClient({});

    // Delete queue
    const result = await deleteQueue(client, queueUrl);

    // Handle result
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete queue');
    }

    // Set outputs
    core.setOutput('deleted', 'true');

    // Summary
    core.info('');
    core.info('='.repeat(50));
    core.info('Queue deleted successfully');
    core.info(`Queue URL: ${queueUrl}`);
    core.info('='.repeat(50));

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.setFailed(errorMessage);
  }
}

run();
