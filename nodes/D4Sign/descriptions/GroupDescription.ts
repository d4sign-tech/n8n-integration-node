import { INodeProperties } from 'n8n-workflow';

export const groupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['group'],
			},
		},
		options: [
			{
				name: 'List Groups',
				value: 'getAll',
				description: 'List signature groups inside a safe',
				action: 'List groups',
			},
			{
				name: 'Get Group Details',
				value: 'getDetails',
				description: 'Retrieve details of a specific signature group',
				action: 'Get group details',
			},
		],
		default: 'getAll',
	},
];

export const groupFields: INodeProperties[] = [
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
				resource: ['group'],
				operation: ['getAll', 'getDetails'],
			},
		},
		description: 'UUID of the safe (vault)',
	},
	{
		displayName: 'Group UUID',
		name: 'groupUuid',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getGroups',
			loadOptionsDependsOn: ['safeUuid'],
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['getDetails'],
			},
		},
		description: 'UUID of the group',
	},
];
