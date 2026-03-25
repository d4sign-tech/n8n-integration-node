import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { d4signApiRequest, d4signApiRequestRaw } from '../../transport/D4SignApiRequest';
import { normalizeUuid, toExecutionData } from './DocumentShared';

export async function executeDocumentActions(
	this: IExecuteFunctions,
	itemIndex: number,
	operation: string,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	if (operation === 'send') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const message = this.getNodeParameter('message', itemIndex, '') as string;
		const skipEmail = this.getNodeParameter('skipEmail', itemIndex, false) as boolean;
		const workflow = this.getNodeParameter('workflow', itemIndex, false) as boolean;

		const body: IDataObject = {
			message,
			skip_email: skipEmail ? '1' : '0',
			workflow: workflow ? '1' : '0',
		};

		const response = await d4signApiRequest.call(this, 'POST', `/documents/${documentUuid}/sendtosigner`, body);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'cancel') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const comment = this.getNodeParameter('comment', itemIndex, '') as string;

		const body: IDataObject = {};
		if (comment) body.comment = comment;

		const response = await d4signApiRequest.call(this, 'POST', `/documents/${documentUuid}/cancel`, body);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'download') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const downloadType = this.getNodeParameter('downloadType', itemIndex, 'original') as string;
		const downloadLanguage = this.getNodeParameter('downloadLanguage', itemIndex, 'pt') as string;
		const includeSignerDocuments = this.getNodeParameter('includeSignerDocuments', itemIndex, false) as boolean;
		const downloadEncoding = this.getNodeParameter('downloadEncoding', itemIndex, false) as boolean;
		const binaryPropertyName = this.getNodeParameter('downloadBinaryPropertyName', itemIndex, 'data') as string;

		const body: IDataObject = {
			type: downloadType,
			language: downloadLanguage,
			document: includeSignerDocuments ? 'true' : 'false',
		};
		if (downloadEncoding) body.encoding = true;

		const response = await d4signApiRequest.call(this, 'POST', `/documents/${documentUuid}/download`, body);
		const responseData =
			typeof response === 'object' && response !== null && !Array.isArray(response)
				? (response as IDataObject)
				: {};
		const downloadUrl = typeof responseData.url === 'string' ? responseData.url : '';
		if (!downloadUrl) {
			throw new Error('D4Sign did not return a valid download URL.');
		}

		const fileBuffer = await d4signApiRequestRaw.call(this, 'GET', downloadUrl);
		const fileName =
			typeof responseData.name === 'string' && responseData.name.length > 0
				? responseData.name
				: `document_${documentUuid}`;
		const binaryData = await this.helpers.prepareBinaryData(fileBuffer, fileName);

		return {
			json: responseData,
			binary: {
				[binaryPropertyName]: binaryData,
			},
			pairedItem: itemIndex,
		};
	}

	if (operation === 'addHighlight') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const email = this.getNodeParameter('highlightSignerEmail', itemIndex) as string;
		const keySigner = this.getNodeParameter('highlightKeySigner', itemIndex) as string;
		const text = this.getNodeParameter('highlightText', itemIndex) as string;

		const body: IDataObject = {
			email,
			key_signer: keySigner,
			text,
		};

		const response = await d4signApiRequest.call(this, 'POST', `/documents/${documentUuid}/addhighlight`, body);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'resend') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const recipient = this.getNodeParameter('resendRecipient', itemIndex) as string;
		const keySigner = this.getNodeParameter('resendKeySigner', itemIndex) as string;

		const body: IDataObject = {
			email: recipient,
			'key-signer': keySigner,
		};

		const response = await d4signApiRequest.call(this, 'POST', `/documents/${documentUuid}/resend`, body);
		return toExecutionData.call(this, itemIndex, response);
	}

	throw new Error(`The operation "${operation}" is not supported for resource "documentActions".`);
}
