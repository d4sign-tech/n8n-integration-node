import { INodeProperties } from 'n8n-workflow';

export const documentPinsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['documentPins'] } },
		options: [
			{ name: 'List Pins', value: 'listPins', description: 'List document pins by UUID', action: 'List pins' },
			{ name: 'Add Pins', value: 'addPins', description: 'Add signature pins (markers) to a document', action: 'Add pins' },
			{ name: 'Remove Pins', value: 'removePins', description: 'Remove signature pins (markers) from a document', action: 'Remove pins' },
		],
		default: 'listPins',
	},
];

export const documentPinsFields: INodeProperties[] = [
	{
		displayName: 'Document UUID',
		name: 'documentUuid',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['documentPins'], operation: ['listPins', 'addPins', 'removePins'] } },
		description: 'UUID of the document',
	},
	{
		displayName: 'Add Pins',
		name: 'addPinsUi',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		required: true,
		displayOptions: { show: { resource: ['documentPins'], operation: ['addPins'] } },
		options: [
			{
				displayName: 'Pin',
				name: 'pinsValues',
				values: [
					{ displayName: 'Signer Email', name: 'email', type: 'string', default: '', required: true },
					{ displayName: 'Page', name: 'page', type: 'number', default: 1, required: true },
					{ displayName: 'Position X', name: 'positionX', type: 'number', default: 0, required: true },
					{ displayName: 'Position Y', name: 'positionY', type: 'number', default: 0, required: true },
					{ displayName: 'Page Width', name: 'pageWidth', type: 'number', default: 0, description: 'Required for Add Pins (ignored for Remove Pins)' },
					{ displayName: 'Page Height', name: 'pageHeight', type: 'number', default: 0, description: 'Required for Add Pins (ignored for Remove Pins)' },
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'Signature', value: 'signature' },
							{ name: 'Initials', value: 'initials' },
							{ name: 'Approve', value: 'approve' },
							{ name: 'Seal', value: 'seal' },
						],
						default: 'signature',
						description: 'Required for Add Pins (ignored for Remove Pins)',
					},
				],
			},
		],
		description: 'List of pins to add.',
	},
	{
		displayName: 'Remove Pins',
		name: 'removePinsUi',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		required: true,
		displayOptions: { show: { resource: ['documentPins'], operation: ['removePins'] } },
		options: [
			{
				displayName: 'Pin',
				name: 'pinsValues',
				values: [
					{ displayName: 'Signer Email', name: 'email', type: 'string', default: '', required: true },
					{ displayName: 'Page', name: 'page', type: 'number', default: 1, required: true },
					{ displayName: 'Position X', name: 'positionX', type: 'number', default: 0, required: true },
					{ displayName: 'Position Y', name: 'positionY', type: 'number', default: 0, required: true },
				],
			},
		],
		description: 'List of pins to remove.',
	},
];
