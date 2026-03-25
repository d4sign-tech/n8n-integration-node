import { INodeProperties } from 'n8n-workflow';

export const documentWatchersOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['documentWatchers'] } },
		options: [
			{ name: 'List Watchers', value: 'listWatchers', description: 'List watchers (observers) of a document', action: 'List watchers' },
			{ name: 'Add Watcher', value: 'addWatcher', description: 'Add a watcher (observer) to a document', action: 'Add a watcher' },
			{ name: 'Remove Watcher', value: 'removeWatcher', description: 'Remove a watcher (observer) from a document', action: 'Remove a watcher' },
			{ name: 'Erase Watchers', value: 'eraseWatchers', description: 'Remove all watchers from a document', action: 'Erase watchers' },
		],
		default: 'listWatchers',
	},
];

export const documentWatchersFields: INodeProperties[] = [
	{
		displayName: 'Document UUID',
		name: 'documentUuid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['documentWatchers'], operation: ['listWatchers', 'addWatcher', 'removeWatcher', 'eraseWatchers'] } },
		description: 'UUID of the document',
	},
	{
		displayName: 'Watcher Email',
		name: 'watcherEmail',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['documentWatchers'], operation: ['addWatcher', 'removeWatcher'] } },
		description: 'Watcher email',
	},
	{
		displayName: 'Permission',
		name: 'watcherPermission',
		type: 'options',
		options: [
			{ name: '(Not set)', value: '' },
			{ name: 'Read-only (0)', value: '0' },
			{ name: 'Manage (1)', value: '1' },
		],
		default: '',
		displayOptions: { show: { resource: ['documentWatchers'], operation: ['addWatcher'] } },
		description: 'Watcher permission (0 = read-only, 1 = manage)',
	},
];
