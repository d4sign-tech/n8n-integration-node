import { INodeProperties } from 'n8n-workflow';

export const templateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['template'],
			},
		},
		options: [
			{
				name: 'Create Document from HTML Template',
				value: 'createDocumentHtml',
				description: 'Create a new document from an HTML template',
				action: 'Create a document from an HTML template',
			},
			{
				name: 'List Templates',
				value: 'listTemplates',
				description: 'List all templates available in the safe',
				action: 'List templates',
			},
			{
				name: 'Create Document from Word Template',
				value: 'createDocumentWord',
				description: 'Create a new document from a Word template',
				action: 'Create a document from a Word template',
			},
		],
		default: 'createDocumentWord',
	},
];

export const templateFields: INodeProperties[] = [
	{
		displayName: 'Safe UUID',
		name: 'safeUuid',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getSafes',
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['createDocumentHtml', 'createDocumentWord'],
			},
		},
		description: 'UUID of the safe where the document will be created',
	},
	{
		displayName: 'Folder UUID',
		name: 'folderUuid',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getFolders',
			loadOptionsDependsOn: ['safeUuid'],
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['createDocumentHtml', 'createDocumentWord'],
			},
		},
		description: 'Optional: UUID of the folder where the document will be created',
	},
	{
		displayName: 'Template UUID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['createDocumentHtml', 'createDocumentWord'],
			},
		},
		description: 'UUID of the template to be used',
	},
	{
		displayName: 'New Document Name',
		name: 'documentName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['createDocumentHtml', 'createDocumentWord'],
			},
		},
		description: 'Name of the new document to be created',
	},
	{
		displayName: 'Template Variables (JSON)',
		name: 'templatesJson',
		type: 'string',
		typeOptions: {
			rows: 6,
		},
		default: '{}',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['createDocumentHtml', 'createDocumentWord'],
			},
		},
		description:
			'JSON object with the variables to fill the template (the object will be wrapped under the selected Template UUID)',
	},
];
