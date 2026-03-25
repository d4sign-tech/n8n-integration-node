import { INodeProperties } from 'n8n-workflow';

export const documentWebhooksOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['documentWebhooks'] } },
		options: [
			{ name: 'List Webhooks', value: 'listWebhooks', description: 'List document webhooks by UUID', action: 'List webhooks' },
			{ name: 'Set Webhook', value: 'setWebhook', description: 'Register a webhook URL for a document', action: 'Set webhook' },
		],
		default: 'listWebhooks',
	},
];

export const documentWebhooksFields: INodeProperties[] = [
	{
		displayName: 'Document UUID',
		name: 'documentUuid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['documentWebhooks'], operation: ['listWebhooks', 'setWebhook'] } },
		description: 'UUID of the document',
	},
	{
		displayName: 'Webhook URL',
		name: 'webhookUrl',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['documentWebhooks'], operation: ['setWebhook'] } },
		description: 'Webhook URL to register for document events',
	},
];
