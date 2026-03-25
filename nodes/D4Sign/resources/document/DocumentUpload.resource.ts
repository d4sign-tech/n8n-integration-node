import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import {
	d4signApiRequest,
	d4signApiRequestFormData,
	normalizeBase64,
} from '../../transport/D4SignApiRequest';
import { normalizeUuid, toExecutionData } from './DocumentShared';

type UploadTarget = 'document' | 'attachment';
type UploadSource = 'binary' | 'base64';
type UploadTransport = 'multipart' | 'base64';

type UploadPlan = {
	target: UploadTarget;
	source: UploadSource;
	transport: UploadTransport;
};

type BinarySourceData = {
	base64Content: string;
	buffer: Buffer;
	fileExtension: string;
	fileName: string;
	mimeType: string;
};

type Base64SourceData = {
	base64Content: string;
	mimeType: string;
};

const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DEFAULT_DOCUMENT_NAME = 'document';
const DEFAULT_ATTACHMENT_NAME = 'attachment';

const ALLOWED_ATTACHMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'bmp']);

const MIME_TO_EXTENSION: Record<string, string> = {
	'application/pdf': 'pdf',
	'application/msword': 'doc',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
	'image/jpeg': 'jpg',
	'image/jpg': 'jpg',
	'image/png': 'png',
	'image/bmp': 'bmp',
};

const REMOVED_LEGACY_OPERATIONS = new Set([
	'upload',
	'uploadBinary',
	'uploadBase64',
	'uploadSlave',
	'uploadSlaveBinary',
]);

function asTrimmedString(value: unknown): string {
	return String(value ?? '').trim();
}

function sanitizeUuid(value: string, label: string, required: boolean): string {
	const trimmed = asTrimmedString(value);
	if (!trimmed) {
		if (!required) return '';
		throw new Error(`${label} is required.`);
	}

	const normalized = normalizeUuid(trimmed);
	if (!UUID_REGEX.test(normalized)) {
		throw new Error(`${label} must be a valid UUID. Received: "${trimmed}".`);
	}

	return normalized;
}

function normalizeExtension(value: string): string {
	const ext = value.toLowerCase().replace(/^\./, '').trim();
	if (ext === 'jpeg') return 'jpg';
	return ext;
}

function extensionFromName(fileName: string): string {
	const match = /\.([A-Za-z0-9]+)$/.exec(fileName);
	if (!match?.[1]) return '';
	return normalizeExtension(match[1]);
}

function extensionFromMimeType(mimeType: string): string {
	return MIME_TO_EXTENSION[mimeType.toLowerCase()] ?? '';
}

function ensureSupportedAttachmentExtension(ext: string): void {
	if (!ext || !ALLOWED_ATTACHMENT_EXTENSIONS.has(ext)) {
		throw new Error(
			`Unsupported attachment file extension ".${ext || 'unknown'}". Allowed: PDF, DOC, DOCX, JPG, PNG, BMP.`,
		);
	}
}

function resolveDocumentFileName(preferredName: string, fallbackName: string): string {
	return asTrimmedString(preferredName) || asTrimmedString(fallbackName) || DEFAULT_DOCUMENT_NAME;
}

function resolveAttachmentFileName(
	preferredName: string,
	fallbackName: string,
	fileExtension: string,
	mimeType: string,
): string {
	const rawName = asTrimmedString(preferredName) || asTrimmedString(fallbackName) || DEFAULT_ATTACHMENT_NAME;
	const extFromRawName = extensionFromName(rawName);
	const extFromMeta = fileExtension ? normalizeExtension(fileExtension) : '';
	const extFromMime = extensionFromMimeType(mimeType);
	const extension = extFromRawName || extFromMeta || extFromMime;

	ensureSupportedAttachmentExtension(extension);

	if (extFromRawName) return rawName;
	return `${rawName}.${extension}`;
}

async function readBinarySource(
	this: IExecuteFunctions,
	itemIndex: number,
	binaryPropertyName: string,
): Promise<BinarySourceData> {
	const propertyName = asTrimmedString(binaryPropertyName) || 'data';
	const binaryData = this.helpers.assertBinaryData(itemIndex, propertyName);
	const buffer = await this.helpers.getBinaryDataBuffer(itemIndex, propertyName);

	return {
		base64Content: buffer.toString('base64'),
		buffer,
		fileExtension: asTrimmedString(binaryData.fileExtension),
		fileName: asTrimmedString(binaryData.fileName),
		mimeType: asTrimmedString(binaryData.mimeType) || 'application/octet-stream',
	};
}

function readBase64Source(base64BinaryFile: string, mimeType: string): Base64SourceData {
	const normalizedMimeType = asTrimmedString(mimeType) || 'application/octet-stream';
	return {
		base64Content: normalizeBase64(base64BinaryFile),
		mimeType: normalizedMimeType,
	};
}

function readUploadPlan(this: IExecuteFunctions, itemIndex: number, operation: string): UploadPlan | null {
	if (operation === 'uploadDocument') {
		const source = this.getNodeParameter('contentSource', itemIndex, 'binary') as UploadSource;
		return {
			target: 'document',
			source,
			transport: 'base64',
		};
	}

	if (operation === 'uploadAttachment') {
		const source = this.getNodeParameter('contentSource', itemIndex, 'binary') as UploadSource;
		return {
			target: 'attachment',
			source,
			transport: source === 'binary' ? 'multipart' : 'base64',
		};
	}

	return null;
}

export async function executeDocumentUpload(
	this: IExecuteFunctions,
	itemIndex: number,
	operation: string,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	if (REMOVED_LEGACY_OPERATIONS.has(operation)) {
		throw new Error(
			`The operation "${operation}" was removed. Use "Upload Document" or "Upload Attachment" with "Content Source".`,
		);
	}

	const plan = readUploadPlan.call(this, itemIndex, operation);
	if (!plan) {
		throw new Error(`The operation "${operation}" is not supported for resource "documentUpload".`);
	}

	const safeUuidRaw =
		plan.target === 'document' ? (this.getNodeParameter('safeUuid', itemIndex, '') as string) : '';
	const folderUuidRaw =
		plan.target === 'document' ? (this.getNodeParameter('folderUuid', itemIndex, '') as string) : '';
	const documentUuidRaw =
		plan.target === 'attachment' ? (this.getNodeParameter('documentUuid', itemIndex, '') as string) : '';

	const safeUuid = sanitizeUuid(safeUuidRaw, 'Safe UUID', plan.target === 'document');
	const folderUuid = sanitizeUuid(folderUuidRaw, 'Folder UUID', false);
	const documentUuid = sanitizeUuid(documentUuidRaw, 'Document UUID', plan.target === 'attachment');

	const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'data') as string;
	const base64BinaryFile = this.getNodeParameter('base64BinaryFile', itemIndex, '') as string;
	const mimeType = this.getNodeParameter('mimeType', itemIndex, 'application/pdf') as string;
	const uploadFileName = this.getNodeParameter('uploadFileName', itemIndex, '') as string;

	const binarySource =
		plan.source === 'binary' ? await readBinarySource.call(this, itemIndex, binaryPropertyName) : null;
	const base64Source = plan.source === 'base64' ? readBase64Source(base64BinaryFile, mimeType) : null;

	const effectiveMimeType = binarySource?.mimeType ?? base64Source?.mimeType ?? 'application/octet-stream';
	const documentFileName = resolveDocumentFileName(uploadFileName, binarySource?.fileName ?? DEFAULT_DOCUMENT_NAME);
	const attachmentFileName =
		plan.target === 'attachment'
			? resolveAttachmentFileName(
					uploadFileName,
					binarySource?.fileName ?? DEFAULT_ATTACHMENT_NAME,
					binarySource?.fileExtension ?? '',
					effectiveMimeType,
			  )
			: '';

	if (plan.transport === 'multipart' && plan.target === 'attachment') {
		if (!binarySource) {
			throw new Error('Binary upload selected, but no binary data was found on the input item.');
		}

		const formData: IDataObject = {
			file: {
				value: binarySource.buffer,
				options: {
					filename: attachmentFileName,
					contentType: binarySource.mimeType,
				},
			},
		};

		try {
			const response = await d4signApiRequestFormData.call(
				this,
				`/documents/${documentUuid}/uploadslave`,
				formData,
			);
			return toExecutionData.call(this, itemIndex, response);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			if (!message.toLowerCase().includes('file empty')) {
				throw error;
			}

			const fallbackBody: IDataObject = {
				base64_binary_file: binarySource.base64Content,
				mime_type: binarySource.mimeType,
				name: attachmentFileName,
			};

			const fallbackResponse = await d4signApiRequest.call(
				this,
				'POST',
				`/documents/${documentUuid}/uploadslavebinary`,
				fallbackBody,
			);
			return toExecutionData.call(this, itemIndex, fallbackResponse);
		}
	}

	const base64Content = binarySource?.base64Content ?? base64Source?.base64Content;
	if (!base64Content) {
		throw new Error('Base64 upload selected, but no valid Base64 content was provided.');
	}

	if (plan.target === 'document') {
		const body: IDataObject = {
			base64_binary_file: base64Content,
			mime_type: effectiveMimeType,
			name: documentFileName,
		};

		if (folderUuid) body.uuid_folder = folderUuid;

		const response = await d4signApiRequest.call(this, 'POST', `/documents/${safeUuid}/uploadbinary`, body);
		return toExecutionData.call(this, itemIndex, response);
	}

	const body: IDataObject = {
		base64_binary_file: base64Content,
		mime_type: effectiveMimeType,
		name: attachmentFileName,
	};

	const response = await d4signApiRequest.call(
		this,
		'POST',
		`/documents/${documentUuid}/uploadslavebinary`,
		body,
	);

	return toExecutionData.call(this, itemIndex, response);
}
