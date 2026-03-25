import { INodeProperties } from 'n8n-workflow';

const uploadOperations = ['uploadDocument', 'uploadAttachment'];
const documentUploadOperationsOnly = ['uploadDocument'];
const attachmentUploadOperationsOnly = ['uploadAttachment'];

export const documentUploadOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['documentUpload'] } },
		options: [
			{
				name: 'Upload Document',
				value: 'uploadDocument',
				description: 'Upload a new document to a safe using Binary Property or Base64 content.',
				action: 'Upload a document',
			},
			{
				name: 'Upload Attachment',
				value: 'uploadAttachment',
				description: 'Attach a file to an existing document using Binary Property or Base64 content.',
				action: 'Upload an attachment',
			},
		],
		default: 'uploadDocument',
	},
];

export const documentUploadFields: INodeProperties[] = [
	{
		displayName: 'Document UUID',
		name: 'documentUuid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['documentUpload'], operation: attachmentUploadOperationsOnly } },
		description: 'UUID of the target document. Example: 123e4567-e89b-12d3-a456-426614174000.',
	},
	{
		displayName: 'Safe',
		name: 'safeUuid',
		type: 'options',
		typeOptions: { loadOptionsMethod: 'getSafes' },
		required: true,
		default: '',
		displayOptions: { show: { resource: ['documentUpload'], operation: documentUploadOperationsOnly } },
		description: 'Select the safe (vault) where the document will be uploaded.',
	},
	{
		displayName: 'Folder',
		name: 'folderUuid',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getFolders',
			loadOptionsDependsOn: ['safeUuid'],
		},
		default: '',
		displayOptions: { show: { resource: ['documentUpload'], operation: documentUploadOperationsOnly } },
		description: 'Optional folder UUID inside the selected safe.',
	},
	{
		displayName: 'Content Source',
		name: 'contentSource',
		type: 'options',
		options: [
			{ name: 'Binary Property', value: 'binary' },
			{ name: 'Base64 Content', value: 'base64' },
		],
		default: 'binary',
		displayOptions: { show: { resource: ['documentUpload'], operation: uploadOperations } },
		description: 'Choose how the file content will be provided.',
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: ['documentUpload'],
				operation: uploadOperations,
				contentSource: ['binary'],
			},
		},
		description: 'Name of the incoming binary property. Example: data.',
	},
	{
		displayName: 'File Name',
		name: 'uploadFileName',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['documentUpload'], operation: uploadOperations } },
		description:
			'Optional filename override sent to D4Sign. If empty, defaults to source name, "document", or "attachment".',
	},
	{
		displayName: 'Base64 Content',
		name: 'base64BinaryFile',
		type: 'string',
		typeOptions: { rows: 6 },
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['documentUpload'],
				operation: uploadOperations,
				contentSource: ['base64'],
			},
		},
		description:
			'Base64 payload (raw or data URL). Whitespace/new lines are removed and content is validated.',
	},
	{
		displayName: 'MIME Type',
		name: 'mimeType',
		type: 'string',
		default: 'application/pdf',
		required: true,
		displayOptions: {
			show: {
				resource: ['documentUpload'],
				operation: uploadOperations,
				contentSource: ['base64'],
			},
		},
		description: 'MIME type for Base64 content. Examples: application/pdf, image/png, image/jpeg.',
	},
];
