import { INodeProperties } from 'n8n-workflow';

export const documentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['document'],
			},
		},
		options: [
			{
				name: 'List Documents',
				value: 'getAll',
				description: 'List documents in the account',
				action: 'List documents',
			},
			{
				name: 'List Documents in Safe/Folder',
				value: 'getAllInSafe',
				description: 'List documents in a safe (and optionally a folder)',
				action: 'List documents in a safe/folder',
			},
			{
				name: 'Get Document',
				value: 'get',
				description: 'Get a document by UUID',
				action: 'Get a document',
			},
			{
				name: 'Get Document Dimensions',
				value: 'getDimensions',
				description: 'Get document dimensions by UUID',
				action: 'Get document dimensions',
			},
			{
				name: 'List Documents by Phase',
				value: 'getStatus',
				description: 'List all documents in a phase (status)',
				action: 'List documents by phase',
			},
		],
		default: 'getAll',
	},
];

export const documentFields: INodeProperties[] = [
	{
		displayName: 'Document UUID',
		name: 'documentUuid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['get', 'getDimensions'],
			},
		},
		description: 'UUID of the document',
	},
	{
		displayName: 'Phase',
		name: 'phaseId',
		type: 'options',
		default: 3,
		required: true,
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['getStatus'],
			},
		},
		options: [
			{ name: 'Processando', value: 1 },
			{ name: 'Aguardando Signatários', value: 2 },
			{ name: 'Aguardando Assinaturas', value: 3 },
			{ name: 'Finalizado', value: 4 },
			{ name: 'Arquivado', value: 5 },
			{ name: 'Cancelado', value: 6 },
			{ name: 'Editando', value: 7 },
		],
		description: 'Select which phase (status) to list documents from.',
	},
	{
		displayName: 'Page',
		name: 'pg',
		type: 'number',
		default: 1,
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['getAll', 'getAllInSafe', 'getStatus'],
			},
		},
		description: 'Page number (pg)',
	},
	{
		displayName: 'Safe',
		name: 'safeUuid',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getSafes',
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['getAllInSafe'],
			},
		},
		description: 'Select a safe (vault)',
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
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['getAllInSafe'],
			},
		},
		description: 'Optional folder within the safe',
	},
];
