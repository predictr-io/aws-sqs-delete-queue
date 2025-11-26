import {
  SQSClient,
  DeleteQueueCommand
} from '@aws-sdk/client-sqs';
import * as core from '@actions/core';

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Validate queue URL format
 */
export function validateQueueUrl(queueUrl: string): void {
  if (!queueUrl || queueUrl.trim().length === 0) {
    throw new Error('Queue URL cannot be empty');
  }

  // Basic URL validation
  try {
    new URL(queueUrl);
  } catch {
    throw new Error(`Invalid queue URL format: "${queueUrl}"`);
  }

  // Check if it looks like an SQS queue URL
  if (!queueUrl.includes('.amazonaws.com') && !queueUrl.includes('localhost')) {
    core.warning(
      `Queue URL "${queueUrl}" does not appear to be a valid AWS SQS queue URL. ` +
      'Expected format: https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>'
    );
  }
}

/**
 * Delete an SQS queue
 */
export async function deleteQueue(
  client: SQSClient,
  queueUrl: string
): Promise<DeleteResult> {
  try {
    // Validate input
    validateQueueUrl(queueUrl);

    core.info(`Deleting queue: ${queueUrl}`);

    // Delete queue
    const command = new DeleteQueueCommand({
      QueueUrl: queueUrl
    });

    await client.send(command);

    core.info('✓ Queue deleted successfully');

    return {
      success: true
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.error(`Failed to delete queue: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage
    };
  }
}
