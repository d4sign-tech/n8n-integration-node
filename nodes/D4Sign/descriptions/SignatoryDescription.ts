import { INodeProperties } from 'n8n-workflow';

export const signatoryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['signatory'],
			},
		},
		options: [
			{
				name: 'Add Signatory',
				value: 'add',
				description: 'Add a new signatory to a document',
				action: 'Add a signatory',
			},
			{
				name: 'Get Signatories',
				value: 'getAll',
				description: 'List all signatories of a document',
				action: 'List signatories',
			},
			{
				name: 'Remove Signatory',
				value: 'remove',
				description: 'Remove a signatory from a document',
				action: 'Remove a signatory',
			},
			{
				name: 'Add Signer Info',
				value: 'addInfo',
				description: 'Register additional information for a signer (display name, docs, birthday)',
				action: 'Add signer info',
			},
			{
				name: 'Change Signer Email',
				value: 'changeEmail',
				description: 'Change the email of a signer already added to the document',
				action: 'Change signer email',
			},
			{
				name: 'Change Signer Access Code',
				value: 'changePasswordCode',
				description: 'Change the access code (password) for a signer',
				action: 'Change signer access code',
			},
			{
				name: 'Change Signer SMS Number',
				value: 'changeSmsNumber',
				description: 'Change the SMS number for a signer',
				action: 'Change signer SMS number',
			},
		],
		default: 'getAll',
	},
];

export const signatoryFields: INodeProperties[] = [
	{
		displayName: 'Document UUID',
		name: 'documentUuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['signatory'],
				operation: [
					'add',
					'getAll',
					'remove',
					'addInfo',
					'changeEmail',
					'changePasswordCode',
					'changeSmsNumber',
				],
			},
		},
		default: '',
		description: 'The UUID of the document',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['signatory'],
				operation: ['add', 'remove', 'addInfo', 'changePasswordCode', 'changeSmsNumber'],
			},
		},
		default: '',
		description: 'Email of the signatory',
	},
{
	displayName: 'Action (act)',
	name: 'role',
	type: 'options',
	options: [
		{ name: 'Assinar', value: '1' },
		{ name: 'Aprovar', value: '2' },
		{ name: 'Reconhecer', value: '3' },
		{ name: 'Assinar como Parte', value: '4' },
		{ name: 'Assinar como Testemunha', value: '5' },
		{ name: 'Assinar como Interveniente', value: '6' },
		{ name: 'Acusar recebimento', value: '7' },
		{ name: 'Assinar como Emissor, Endossante e Avalista', value: '8' },
		{ name: 'Assinar como Emissor, Endossante, Avalista, Fiador', value: '9' },
		{ name: 'Assinar como Fiador', value: '10' },
		{ name: 'Assinar como Parte e Fiador', value: '11' },
		{ name: 'Assinar como Responsável Solidário', value: '12' },
		{ name: 'Assinar como Parte e Responsável Solidário', value: '13' },
	],
	default: '1',
	required: true,
	displayOptions: {
		show: {
			resource: ['signatory'],
			operation: ['add'],
		},
	},
	description: 'Signature action for this signer (act)',
},
	{
		displayName: 'Foreign',
	name: 'foreign',
	type: 'options',
	required: true,
	options: [
		{ name: 'Has CPF (Brazilian)', value: '0' },
		{ name: 'No CPF (Foreign)', value: '1' },
	],
	default: '0',
	displayOptions: {
		show: {
			resource: ['signatory'],
			operation: ['add'],
		},
	},
	description: 'Required by D4Sign: 0 = signer has CPF; 1 = signer does not have CPF',
},
{
	displayName: 'Foreign Language',
	name: 'foreignLang',
	type: 'options',
	options: [
		{ name: 'Portuguese (pt)', value: 'pt' },
		{ name: 'English (en)', value: 'en' },
		{ name: 'Spanish (es)', value: 'es' },
	],
	default: 'pt',
	displayOptions: {
		show: {
			resource: ['signatory'],
			operation: ['add'],
			foreign: ['1'],
		},
	},
	description: 'Optional: Language used for foreign signer flows',
},
{
	displayName: 'ICP-Brasil Certificate',
	name: 'certificadoicpbr',
	type: 'options',
	required: true,
	options: [
		{ name: 'No (standard D4Sign signature)', value: '0' },
		{ name: 'Yes (ICP-Brasil)', value: '1' },
	],
	default: '0',
	displayOptions: {
		show: {
			resource: ['signatory'],
			operation: ['add'],
		},
	},
	description: 'Required by D4Sign: 0 = standard signature; 1 = ICP-Brasil certificate',
},
{
	displayName: 'In-person Signature',
	name: 'assinaturaPresencial',
	type: 'options',
	required: true,
	options: [
		{ name: 'No', value: '0' },
		{ name: 'Yes', value: '1' },
	],
	default: '0',
	displayOptions: {
		show: {
			resource: ['signatory'],
			operation: ['add'],
		},
	},
	description: 'Required by D4Sign: 1 = in-person signature; 0 = not in-person',
},
{
	displayName: 'Require Document Photo (docauth)',
	name: 'docauth',
	type: 'options',
	options: [
		{ name: 'No', value: '0' },
		{ name: 'Yes', value: '1' },
	],
	default: '0',
	displayOptions: {
		show: {
			resource: ['signatory'],
			operation: ['add'],
		},
	},
	description: 'Optional: 1 = require document photo; 0 = do not require',
},
{
	displayName: 'Require Document + Selfie (docauthandselfie)',
	name: 'docauthandselfie',
	type: 'options',
	options: [
		{ name: 'No', value: '0' },
		{ name: 'Yes', value: '1' },
	],
	default: '0',
	displayOptions: {
		show: {
			resource: ['signatory'],
			operation: ['add'],
		},
	},
	description: 'Optional: 1 = require document + selfie; 0 = do not require',
},
{
	displayName: 'Embedded Auth Method',
	name: 'embedMethodAuth',
	type: 'options',
	options: [
		{ name: 'Email', value: 'email' },
		{ name: 'Password', value: 'password' },
		{ name: 'SMS', value: 'sms' },
		{ name: 'WhatsApp', value: 'whats' },
	],
	default: 'email',
	displayOptions: {
		show: {
			resource: ['signatory'],
			operation: ['add'],
		},
	},
	description: 'Optional: Authentication method for embedded signature flows',
},
{
	displayName: 'Embedded SMS/Whats Number',
	name: 'embedSmsNumber',
	type: 'string',
	default: '',
	displayOptions: {
		show: {
			resource: ['signatory'],
			operation: ['add'],
			embedMethodAuth: ['sms', 'whats'],
		},
	},
	description: 'Optional: Phone number for SMS/WhatsApp auth (e.g., +5511953020202)',
},
{
	displayName: 'Allow Uploads From Signer',
	name: 'uploadAllow',
	type: 'options',
	options: [
		{ name: 'No', value: '0' },
		{ name: 'Yes', value: '1' },
	],
	default: '0',
	displayOptions: {
		show: {
			resource: ['signatory'],
			operation: ['add'],
		},
	},
	description: 'Optional: Whether signer can upload extra documents',
},
{
	displayName: 'Upload Instructions',
	name: 'uploadObs',
	type: 'string',
	default: '',
	displayOptions: {
		show: {
			resource: ['signatory'],
			operation: ['add'],
			uploadAllow: ['1'],
		},
	},
	description: 'Optional: Which documents the signer should upload (if Allow Uploads = Yes)',
},
{
	displayName: 'WhatsApp Number',
	name: 'whatsappNumber',
	type: 'string',
	default: '',
	displayOptions: {
		show: {
			resource: ['signatory'],
			operation: ['add'],
		},
	},
	description: 'Optional: WhatsApp number for signature (e.g., +5511981876540)',
},
{
	displayName: 'Group UUID (uuid_grupo)',
	name: 'uuidGrupo',
	type: 'string',
	default: '',
	displayOptions: {
		show: {
			resource: ['signatory'],
			operation: ['add'],
		},
	},
	description: 'Optional: Signature group UUID to add instead of individual signer settings',
},
{
	displayName: 'Password Code',
	name: 'passwordCode',
	type: 'string',
	default: '',
	displayOptions: {
		show: {
			resource: ['signatory'],
			operation: ['add'],
		},
	},
	description: 'Optional: Access code for the signer (password_code)',
},
{
	displayName: 'Skip Email',
	name: 'skipEmail',
	type: 'boolean',
	default: false,
	displayOptions: {
		show: {
			resource: ['signatory'],
			operation: ['add'],
		},
	},
	description: 'Optional: Do not send emails to signer',
},
	{
		displayName: 'Key Signer',
		name: 'keySigner',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['signatory'],
				operation: [
					'remove',
					'addInfo',
					'changeEmail',
					'changePasswordCode',
					'changeSmsNumber',
				],
			},
		},
		default: '',
		description: 'Key signer value from D4Sign (key-signer)',
	},
	{
		displayName: 'Display Name',
		name: 'displayName',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['signatory'],
				operation: ['addInfo'],
			},
		},
		description: 'Optional: Display name for the signer',
	},
	{
		displayName: 'Documentation',
		name: 'documentation',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['signatory'],
				operation: ['addInfo'],
			},
		},
		description: 'Optional: Documentation (e.g., CPF)',
	},
	{
		displayName: 'Birthday',
		name: 'birthday',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['signatory'],
				operation: ['addInfo'],
			},
		},
		description: 'Optional: Birthday (format as required by D4Sign)',
	},
	{
		displayName: 'Email (Before)',
		name: 'emailBefore',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['signatory'],
				operation: ['changeEmail'],
			},
		},
		description: 'Current signer email (email-before)',
	},
	{
		displayName: 'Email (After)',
		name: 'emailAfter',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['signatory'],
				operation: ['changeEmail'],
			},
		},
		description: 'New signer email (email-after)',
	},
	{
		displayName: 'Password Code',
		name: 'passwordCode',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['signatory'],
				operation: ['changePasswordCode'],
			},
		},
		description: 'New access code for the signer (password-code)',
	},
	{
		displayName: 'SMS Number',
		name: 'smsNumber',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['signatory'],
				operation: ['changeSmsNumber'],
			},
		},
		description: 'New SMS number for the signer (sms-number)',
	},
];
