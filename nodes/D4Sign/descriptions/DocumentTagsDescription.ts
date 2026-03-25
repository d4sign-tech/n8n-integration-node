import { INodeProperties } from 'n8n-workflow';

export const documentTagsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['documentTags'],
			},
		},
		options: [
			{ name: 'List Tags', value: 'listTags', description: 'List tags of a document', action: 'List tags' },
			{ name: 'Add Tag', value: 'addTag', description: 'Add a tag to a document', action: 'Add a tag' },
			{ name: 'Remove Tag', value: 'removeTag', description: 'Remove a tag from a document', action: 'Remove a tag' },
			{ name: 'Add Urgent Tag', value: 'addUrgent', description: 'Mark a document as urgent', action: 'Add urgent tag' },
			{ name: 'Remove Urgent Tag', value: 'removeUrgent', description: 'Remove urgent mark from a document', action: 'Remove urgent tag' },
			{ name: 'Erase Tags', value: 'eraseTags', description: 'Remove all tags from a document', action: 'Erase tags' },
		],
		default: 'listTags',
	},
];

export const documentTagsFields: INodeProperties[] = [
	{
		displayName: 'Document UUID',
		name: 'documentUuid',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['documentTags'],
				operation: ['listTags', 'addTag', 'removeTag', 'addUrgent', 'removeUrgent', 'eraseTags'],
			},
		},
		description: 'UUID of the document',
	},
	{
		displayName: 'Tag',
		name: 'tag',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['documentTags'],
				operation: ['addTag', 'removeTag'],
			},
		},
		description: 'Tag name',
	},
];
