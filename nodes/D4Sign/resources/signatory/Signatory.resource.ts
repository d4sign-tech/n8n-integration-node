import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { d4signApiRequest } from '../../transport/D4SignApiRequest';

function normalizeToJsonObject(data: unknown): IDataObject {
	if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
		return data as IDataObject;
	}

	if (data === null || typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
		return { value: data };
	}

	return { value: data === undefined ? 'undefined' : JSON.stringify(data) };
}

function toExecutionData(
	this: IExecuteFunctions,
	itemIndex: number,
	data: unknown,
): INodeExecutionData | INodeExecutionData[] {
	if (Array.isArray(data)) {
		const normalized = data.map((entry) => normalizeToJsonObject(entry));
		return this.helpers.returnJsonArray(normalized).map((d) => ({ ...d, pairedItem: itemIndex }));
	}

	return {
		json: normalizeToJsonObject(data),
		pairedItem: itemIndex,
	};
}

export async function executeSignatory(
	this: IExecuteFunctions,
	itemIndex: number,
	operation: string,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	const documentUuid = this.getNodeParameter('documentUuid', itemIndex) as string;

	if (operation === 'add') {
const email = this.getNodeParameter('email', itemIndex) as string;
const role = this.getNodeParameter('role', itemIndex) as string;

// Required by D4Sign for /createlist
const foreign = this.getNodeParameter('foreign', itemIndex) as string; // 0 = has CPF, 1 = no CPF
const certificadoicpbr = this.getNodeParameter('certificadoicpbr', itemIndex) as string; // 0/1
const assinaturaPresencial = this.getNodeParameter('assinaturaPresencial', itemIndex) as string; // 0/1

// Optional controls
const foreignLang = this.getNodeParameter('foreignLang', itemIndex, '') as string;
const docauth = this.getNodeParameter('docauth', itemIndex, '0') as string;
const docauthandselfie = this.getNodeParameter('docauthandselfie', itemIndex, '0') as string;
const embedMethodAuth = this.getNodeParameter('embedMethodAuth', itemIndex, 'email') as string;
const embedSmsNumber = this.getNodeParameter('embedSmsNumber', itemIndex, '') as string;
const uploadAllow = this.getNodeParameter('uploadAllow', itemIndex, '0') as string;
const uploadObs = this.getNodeParameter('uploadObs', itemIndex, '') as string;
const whatsappNumber = this.getNodeParameter('whatsappNumber', itemIndex, '') as string;
const uuidGrupo = this.getNodeParameter('uuidGrupo', itemIndex, '') as string;
const passwordCode = this.getNodeParameter('passwordCode', itemIndex, '') as string;
const skipEmail = this.getNodeParameter('skipEmail', itemIndex, false) as boolean;

const signer: IDataObject = {
	email,
	act: role, // D4Sign expects `act`
	foreign,
	certificadoicpbr,
	assinatura_presencial: assinaturaPresencial,
	docauth,
	docauthandselfie,
	embed_methodauth: embedMethodAuth,
};

if (foreign === '1' && foreignLang) signer.foreign_lang = foreignLang;
if (embedSmsNumber) signer.embed_smsnumber = embedSmsNumber;

// Upload requirements requested from signer
if (uploadAllow) signer.upload_allow = uploadAllow;
if (uploadAllow === '1' && uploadObs) signer.upload_obs = uploadObs;

if (whatsappNumber) signer.whatsapp_number = whatsappNumber;
if (uuidGrupo) signer.uuid_grupo = uuidGrupo;
if (passwordCode) signer.password_code = passwordCode;
if (skipEmail) signer.skipemail = '1';

const body: IDataObject = {
	signers: [signer],
};

const response = await d4signApiRequest.call(
	this,
	'POST',
	`/documents/${documentUuid}/createlist`,
	body,
);

return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'getAll') {
		const response = await d4signApiRequest.call(this, 'GET', `/documents/${documentUuid}/list`);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'remove') {
		const email = this.getNodeParameter('email', itemIndex) as string;
		const keySigner = this.getNodeParameter('keySigner', itemIndex) as string;

		const body: IDataObject = {
			'email-signer': email,
			'key-signer': keySigner,
		};

		const response = await d4signApiRequest.call(
			this,
			'POST',
			`/documents/${documentUuid}/removeemaillist`,
			body,
		);

		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'addInfo') {
		const email = this.getNodeParameter('email', itemIndex) as string;
		const keySigner = this.getNodeParameter('keySigner', itemIndex) as string;
		const displayName = this.getNodeParameter('displayName', itemIndex, '') as string;
		const documentation = this.getNodeParameter('documentation', itemIndex, '') as string;
		const birthday = this.getNodeParameter('birthday', itemIndex, '') as string;

		const body: IDataObject = {
			key_signer: keySigner,
			email,
		};

		if (displayName) body.display_name = displayName;
		if (documentation) body.documentation = documentation;
		if (birthday) body.birthday = birthday;

		const response = await d4signApiRequest.call(
			this,
			'POST',
			`/documents/${documentUuid}/addinfo`,
			body,
		);

		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'changeEmail') {
		const keySigner = this.getNodeParameter('keySigner', itemIndex) as string;
		const emailBefore = this.getNodeParameter('emailBefore', itemIndex) as string;
		const emailAfter = this.getNodeParameter('emailAfter', itemIndex) as string;

		const body: IDataObject = {
			'email-before': emailBefore,
			'email-after': emailAfter,
			'key-signer': keySigner,
		};

		const response = await d4signApiRequest.call(
			this,
			'POST',
			`/documents/${documentUuid}/changeemail`,
			body,
		);

		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'changePasswordCode') {
		const email = this.getNodeParameter('email', itemIndex) as string;
		const keySigner = this.getNodeParameter('keySigner', itemIndex) as string;
		const passwordCode = this.getNodeParameter('passwordCode', itemIndex) as string;

		const body: IDataObject = {
			email,
			'password-code': passwordCode,
			'key-signer': keySigner,
		};

		const response = await d4signApiRequest.call(
			this,
			'POST',
			`/documents/${documentUuid}/changepasswordcode`,
			body,
		);

		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'changeSmsNumber') {
		const email = this.getNodeParameter('email', itemIndex) as string;
		const keySigner = this.getNodeParameter('keySigner', itemIndex) as string;
		const smsNumber = this.getNodeParameter('smsNumber', itemIndex) as string;

		const body: IDataObject = {
			email,
			'sms-number': smsNumber,
			'key-signer': keySigner,
		};

		const response = await d4signApiRequest.call(
			this,
			'POST',
			`/documents/${documentUuid}/changesmsnumber`,
			body,
		);

		return toExecutionData.call(this, itemIndex, response);
	}

	throw new Error(`The operation "${operation}" is not supported for resource "signatory".`);
}
