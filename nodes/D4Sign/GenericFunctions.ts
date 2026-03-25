import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHttpRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';

import FormData from 'form-data';

type D4SignContext = IExecuteFunctions | ILoadOptionsFunctions;
type D4SignErrorLike = {
	message?: string;
	response?: {
		data?: unknown;
		body?: unknown;
	};
};

/**
 * Wrapper principal for JSON calls to D4Sign API.
 * D4Sign uses tokenAPI and cryptKey query parameters for auth in v1.
 */
export async function d4signApiRequest(
	this: D4SignContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
): Promise<unknown> {
	const credentials = await this.getCredentials('d4SignApi');

	const options: IHttpRequestOptions = {
		method,
		url: `https://secure.d4sign.com.br/api/v1${endpoint}`,
		qs: {
			...query,
			tokenAPI: credentials.tokenApi,
			cryptKey: credentials.cryptKey,
		},
		json: true,
	};

	if (method !== 'GET') {
		options.body = body;
	} else if (body && Object.keys(body).length) {
		// Avoid silently sending a body in GET (D4Sign ignores it, but it can confuse debugging)
		options.qs = { ...(options.qs as IDataObject), ...(body as IDataObject) };
	}

	try {
		return await this.helpers.httpRequest(options);
	} catch (error: unknown) {
		const typedError = error as D4SignErrorLike;
		const responseData = typedError.response?.data ?? typedError.response?.body;
		if (responseData) {
			throw new Error(
				`D4Sign API Error: ${typeof responseData === 'string' ? responseData : JSON.stringify(responseData)}`,
			);
		}
		throw new Error(`D4Sign Network Error: ${typedError.message ?? 'Unknown error'}`);
	}
}

function normalizeBase64(input: string): string {
	// Accept raw base64 or a data URI (data:...;base64,XXXXX)
	const trimmed = (input || '').trim();
	return trimmed.replace(/^data:[^;]+;base64,/i, '').replace(/\s+/g, '');
}

// --------------------
// Document helpers
// --------------------

export async function getAllDocuments(this: IExecuteFunctions, pg?: number): Promise<unknown> {
	const query: IDataObject = {};
	if (pg && pg > 0) query.pg = pg;

	return await d4signApiRequest.call(this, 'GET', '/documents', {}, query);
}

export async function getDocumentsBySafe(
	this: IExecuteFunctions,
	safeUuid: string,
	folderUuid?: string,
	pg?: number,
): Promise<unknown> {
	const endpoint = folderUuid ? `/documents/${safeUuid}/safe/${folderUuid}` : `/documents/${safeUuid}/safe`;

	const query: IDataObject = {};
	if (pg && pg > 0) query.pg = pg;

	return await d4signApiRequest.call(this, 'GET', endpoint, {}, query);
}

export async function getDocumentById(this: IExecuteFunctions, uuid: string): Promise<unknown> {
	return await d4signApiRequest.call(this, 'GET', `/documents/${uuid}`);
}

// Send to signers
export async function sendDocumentToSigner(this: IExecuteFunctions, uuid: string, body: IDataObject): Promise<unknown> {
	return await d4signApiRequest.call(this, 'POST', `/documents/${uuid}/sendtosigner`, body);
}

// Cancel document
export async function cancelDocument(this: IExecuteFunctions, uuid: string, body: IDataObject): Promise<unknown> {
	return await d4signApiRequest.call(this, 'POST', `/documents/${uuid}/cancel`, body);
}

/**
 * Upload via multipart/form-data (POST /documents/{UUID-SAFE}/upload)
 */
export async function uploadDocument(
	this: IExecuteFunctions,
	safeUuid: string,
	fileBuffer: Buffer,
	fileName: string,
	mimeType = 'application/octet-stream',
	uuidFolder?: string,
	workflow?: '1' | '2',
): Promise<unknown> {
	const credentials = await this.getCredentials('d4SignApi');

	const form = new FormData();
	form.append('file', fileBuffer, {
		filename: fileName,
		contentType: mimeType,
	});

	if (uuidFolder) form.append('uuid_folder', uuidFolder);
	if (workflow) form.append('workflow', workflow);

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `https://secure.d4sign.com.br/api/v1/documents/${safeUuid}/upload`,
		qs: {
			tokenAPI: credentials.tokenApi,
			cryptKey: credentials.cryptKey,
		},
		body: form,
		headers: form.getHeaders(),
	};

	try {
		const response = await this.helpers.httpRequest(options);
		return typeof response === 'string' ? JSON.parse(response) : response;
	} catch (error: unknown) {
		const typedError = error as D4SignErrorLike;
		const responseData = typedError.response?.data ?? typedError.response?.body;
		if (responseData) {
			throw new Error(
				`D4Sign API Error: ${typeof responseData === 'string' ? responseData : JSON.stringify(responseData)}`,
			);
		}
		throw new Error(`D4Sign Network Error: ${typedError.message ?? 'Unknown error'}`);
	}
}

/**
 * Upload via Base64 JSON body (POST /documents/{UUID-SAFE}/uploadbinary)
 * Docs: base64_binary_file, mime_type, (optional) name, uuid_folder.
 */
export async function uploadDocumentBinary(
	this: IExecuteFunctions,
	safeUuid: string,
	base64BinaryFile: string,
	mimeType: string,
	name?: string,
	uuidFolder?: string,
): Promise<unknown> {
	const body: IDataObject = {
		base64_binary_file: normalizeBase64(base64BinaryFile),
		mime_type: mimeType,
	};

	if (name) body.name = name;
	if (uuidFolder) body.uuid_folder = uuidFolder;

	return await d4signApiRequest.call(this, 'POST', `/documents/${safeUuid}/uploadbinary`, body);
}

// --------------------
// Template helpers
// --------------------

export async function createDocumentFromTemplate(
	this: IExecuteFunctions,
	safeUuid: string,
	templateId: string,
	documentName: string,
): Promise<unknown> {
	const body: IDataObject = {
		templates: {
			[templateId]: {},
		},
		name_document: documentName,
	};

	// Endpoint for Template WORD
	return await d4signApiRequest.call(this, 'POST', `/documents/${safeUuid}/makedocumentbytemplateword`, body);
}

// --------------------
// Signer helpers
// --------------------

export async function addSignatory(this: IExecuteFunctions, uuid: string, data: IDataObject): Promise<unknown> {
	return await d4signApiRequest.call(this, 'POST', `/documents/${uuid}/createlist`, { signers: [data] });
}

export async function getSignatories(this: IExecuteFunctions, uuid: string): Promise<unknown> {
	return await d4signApiRequest.call(this, 'GET', `/documents/${uuid}/list`);
}

/**
 * Delete signer (POST /documents/{UUID-DOCUMENT}/removeemaillist)
 * Docs require: email-signer and key-signer.
 */
export async function removeSignatory(
	this: IExecuteFunctions,
	uuid: string,
	emailSigner: string,
	keySigner: string,
): Promise<unknown> {
	const body: IDataObject = {
		'email-signer': emailSigner,
		'key-signer': keySigner,
	};

	return await d4signApiRequest.call(this, 'POST', `/documents/${uuid}/removeemaillist`, body);
}

// --------------------
// Safe (vault) helpers
// --------------------

/**
 * List all safes (GET /safes)
 */
export async function listSafes(this: IExecuteFunctions): Promise<unknown> {
	return await d4signApiRequest.call(this, 'GET', '/safes');
}

/**
 * List all folders in a safe (GET /folders/{UUID-SAFE}/find)
 */
export async function listFolders(this: IExecuteFunctions, safeUuid: string): Promise<unknown> {
	return await d4signApiRequest.call(this, 'GET', `/folders/${safeUuid}/find`);
}

/**
 * Create folder (or subfolder) in a safe (POST /folders/{UUID-SAFE}/create)
 */
export async function createFolder(
	this: IExecuteFunctions,
	safeUuid: string,
	folderName: string,
	parentFolderUuid?: string,
): Promise<unknown> {
	const body: IDataObject = {
		folder_name: folderName,
	};

	if (parentFolderUuid) body.uuid_folder = parentFolderUuid;

	return await d4signApiRequest.call(this, 'POST', `/folders/${safeUuid}/create`, body);
}

// --------------------
// Download
// --------------------

export async function downloadDocument(
	this: IExecuteFunctions,
	uuid: string,
	type: string,
	language: 'pt' | 'en' = 'pt',
	includeSignerDocuments = false,
	encoding = false,
): Promise<unknown> {
	const body: IDataObject = {
		type,
	};

	if (language) body.language = language;
	if (includeSignerDocuments) body.document = 'true';
	if (encoding) body.encoding = true;

	return await d4signApiRequest.call(this, 'POST', `/documents/${uuid}/download`, body);
}

// --------------------
// Document Tags
// --------------------

/**
 * List document tags (GET /tags/{UUID-DOCUMENTO})
 */
export async function listDocumentTags(this: IExecuteFunctions, documentUuid: string): Promise<unknown> {
	return await d4signApiRequest.call(this, 'GET', `/tags/${documentUuid}`);
}

/**
 * Add a tag to a document (POST /tags/{UUID-DOCUMENTO}/add)
 */
export async function addDocumentTag(this: IExecuteFunctions, documentUuid: string, tag: string): Promise<unknown> {
	const body: IDataObject = { tag };
	return await d4signApiRequest.call(this, 'POST', `/tags/${documentUuid}/add`, body);
}

/**
 * Remove a tag from a document (POST /tags/{UUID-DOCUMENTO}/remove)
 */
export async function removeDocumentTag(this: IExecuteFunctions, documentUuid: string, tag: string): Promise<unknown> {
	const body: IDataObject = { tag };
	return await d4signApiRequest.call(this, 'POST', `/tags/${documentUuid}/remove`, body);
}

// --------------------
// Document Observers (Watchers)
// --------------------

/**
 * List document observers (GET /watcher/{UUID-DOCUMENTO})
 */
export async function listDocumentWatchers(this: IExecuteFunctions, documentUuid: string): Promise<unknown> {
	return await d4signApiRequest.call(this, 'GET', `/watcher/${documentUuid}`);
}

/**
 * Add an observer to a document (POST /watcher/{UUID-DOCUMENTO}/add)
 */
export async function addDocumentWatcher(
	this: IExecuteFunctions,
	documentUuid: string,
	email: string,
	permission?: '0' | '1',
): Promise<unknown> {
	const body: IDataObject = { email };
	if (permission !== undefined && permission !== null) body.permission = permission;
	return await d4signApiRequest.call(this, 'POST', `/watcher/${documentUuid}/add`, body);
}

/**
 * Remove an observer from a document (POST /watcher/{UUID-DOCUMENTO}/remove)
 */
export async function removeDocumentWatcher(this: IExecuteFunctions, documentUuid: string, email: string): Promise<unknown> {
	const body: IDataObject = { email };
	return await d4signApiRequest.call(this, 'POST', `/watcher/${documentUuid}/remove`, body);
}

