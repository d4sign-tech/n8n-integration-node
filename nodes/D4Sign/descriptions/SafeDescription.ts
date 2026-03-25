import { INodeProperties } from 'n8n-workflow';

export const safeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['safe'],
			},
		},
		options: [
			{
				name: 'List Safes',
				value: 'getAll',
				description: 'List all safes (vaults) in the account',
				action: 'List safes',
			},
			{
				name: 'List Folders',
				value: 'listFolders',
				description: 'List all folders inside a safe (vault)',
				action: 'List folders',
			},
			{
				name: 'Create Folder',
				value: 'createFolder',
				description: 'Create a folder (or subfolder) inside a safe',
				action: 'Create a folder',
			},
			{
				name: 'Rename Folder',
				value: 'renameFolder',
				description: 'Rename a folder (or subfolder) inside a safe',
				action: 'Rename a folder',
			},
		],
		default: 'getAll',
	},
];

export const safeFields: INodeProperties[] = [
	{
		displayName: 'Safe UUID',
		name: 'safeUuid',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getSafes',
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['safe'],
				operation: ['listFolders', 'createFolder', 'renameFolder'],
			},
		},
		description: 'The UUID of the safe (vault)',
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
		required: true,
		displayOptions: {
			show: {
				resource: ['safe'],
				operation: ['renameFolder'],
			},
		},
		description: 'UUID of the folder (or subfolder) to rename',
	},
	{
		displayName: 'Folder Name',
		name: 'folderName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['safe'],
				operation: ['createFolder', 'renameFolder'],
			},
		},
		description: 'Name of the folder (for Create) or the new folder name (for Rename)',
	},
	{
		displayName: 'Parent Folder UUID',
		name: 'parentFolderUuid',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getFolders',
			loadOptionsDependsOn: ['safeUuid'],
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['safe'],
				operation: ['createFolder'],
			},
		},
		description: 'Optional: UUID of the parent folder (to create a subfolder)',
	},
];
