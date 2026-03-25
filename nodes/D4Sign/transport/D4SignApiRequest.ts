import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

type D4SignContext = IExecuteFunctions | ILoadOptionsFunctions;
type FormDataRequestOptions = IHttpRequestOptions & { formData?: IDataObject };

type D4SignErrorLike = {
	httpCode?: number;
	statusCode?: number;
	message?: string;
	response?: {
		status?: number;
		data?: unknown;
		body?: unknown;
	};
};

const BASE_URL = 'https://secure.d4sign.com.br/api/v1';

export function normalizeBase64(input: string): string {
	const trimmed = String(input ?? '').trim();
	if (!trimmed) {
		throw new Error('Base64 content is empty.');
	}

	const commaIndex = trimmed.indexOf(',');
	const payload = commaIndex !== -1 ? trimmed.slice(commaIndex + 1) : trimmed;

	let normalized = payload.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
	if (!normalized) {
		throw new Error('Base64 content is empty after normalization.');
	}

	if (/[^A-Za-z0-9+/=]/.test(normalized)) {
		throw new Error('Base64 content contains invalid characters.');
	}

	const modulo = normalized.length % 4;
	if (modulo === 1) {
		throw new Error('Base64 content has invalid length.');
	}

	if (modulo > 1) {
		normalized = `${normalized}${'='.repeat(4 - modulo)}`;
	}

	try {
		const decoded = Buffer.from(normalized, 'base64');
		if (!decoded.length) {
			throw new Error('Base64 content decodes to empty data.');
		}

		const normalizedNoPadding = normalized.replace(/=+$/u, '');
		const reencodedNoPadding = decoded.toString('base64').replace(/=+$/u, '');
		if (normalizedNoPadding !== reencodedNoPadding) {
			throw new Error('Base64 content is malformed.');
		}
	} catch (error: unknown) {
		const reason = error instanceof Error ? error.message : 'Invalid Base64 payload.';
		throw new Error(`Invalid Base64 content: ${reason}`);
	}

	return normalized;
}

export async function d4signApiRequest(
	this: D4SignContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
): Promise<unknown> {
	const options: IHttpRequestOptions = {
		method,
		url: `${BASE_URL}${endpoint}`,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		qs: {
			...query,
		},
		json: true,
	};

	if (method !== 'GET' && method !== 'HEAD') {
		options.body = body;
	}

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'd4SignApi', options);
	} catch (error: unknown) {
		const typedError = error as D4SignErrorLike;
		const statusCode = typedError.httpCode ?? typedError.statusCode ?? typedError.response?.status;
		const responseBody =
			typedError.response?.data ??
			typedError.response?.body ??
			typedError.message ??
			'Unknown error';

		throw new Error(
			`D4Sign API Error${statusCode ? ` (${statusCode})` : ''}: ${
				typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)
			}`,
		);
	}
}

export async function d4signApiRequestFormData(
	this: D4SignContext,
	endpoint: string,
	formData: IDataObject,
	query: IDataObject = {},
): Promise<unknown> {
	const options: FormDataRequestOptions = {
		method: 'POST',
		url: `${BASE_URL}${endpoint}`,
		headers: {
			Accept: 'application/json',
		},
		qs: {
			...query,
		},
		json: true,
	};

	options.formData = formData;

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'd4SignApi', options);
	} catch (error: unknown) {
		const typedError = error as D4SignErrorLike;
		const statusCode = typedError.httpCode ?? typedError.statusCode ?? typedError.response?.status;
		const responseBody =
			typedError.response?.data ??
			typedError.response?.body ??
			typedError.message ??
			'Unknown error';

		throw new Error(
			`D4Sign API Error${statusCode ? ` (${statusCode})` : ''}: ${
				typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)
			}`,
		);
	}
}


export async function d4signApiRequestRaw(
	this: D4SignContext,
	method: IHttpRequestMethods,
	url: string,
): Promise<Buffer> {
	const options: IHttpRequestOptions = {
		method,
		url,
		json: false,
		encoding: 'arraybuffer',
	};

	try {
		const response = await this.helpers.httpRequest(options);
		if (Buffer.isBuffer(response)) return response;
		if (response instanceof ArrayBuffer) return Buffer.from(response);
		if (ArrayBuffer.isView(response)) return Buffer.from(response.buffer);
		if (typeof response === 'string') return Buffer.from(response);

		throw new Error('D4Sign download response was not binary data.');
	} catch (error: unknown) {
		const typedError = error as D4SignErrorLike;
		const statusCode = typedError.httpCode ?? typedError.statusCode ?? typedError.response?.status;
		const responseBody =
			typedError.response?.data ??
			typedError.response?.body ??
			typedError.message ??
			'Unknown error';

		throw new Error(
			`D4Sign API Error${statusCode ? ` (${statusCode})` : ''}: ${
				typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)
			}`,
		);
	}
}
