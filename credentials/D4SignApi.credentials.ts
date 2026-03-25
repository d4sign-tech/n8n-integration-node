import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class D4SignApi implements ICredentialType {
	name = 'd4SignApi';
	displayName = 'D4Sign API';
	documentationUrl = 'https://docapi.d4sign.com.br/';
	authenticate: IAuthenticateGeneric = {
		type: 'generic' as const,
		properties: {
			qs: {
				tokenAPI: '={{$credentials.tokenApi}}',
				cryptKey: '={{$credentials.cryptKey}}',
			},
		},
	};
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://secure.d4sign.com.br/api/v1',
			url: '/safes',
			method: 'GET' as const,
		},
	};
	properties: INodeProperties[] = [
		{
			displayName: 'tokenAPI',
			name: 'tokenApi',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your D4Sign tokenAPI',
		},
		{
			displayName: 'cryptKey',
			name: 'cryptKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your D4Sign cryptKey',
		},
	];
}
