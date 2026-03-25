import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { d4signApiRequest } from '../../transport/D4SignApiRequest';
import { normalizeUuid, toExecutionData } from './DocumentShared';

export async function executeDocumentWebhooks(
	this: IExecuteFunctions,
	itemIndex: number,
	operation: string,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	if (operation === 'listWebhooks') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const response = await d4signApiRequest.call(this, 'GET', `/documents/${documentUuid}/webhooks`);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'setWebhook') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const webhookUrl = this.getNodeParameter('webhookUrl', itemIndex) as string;

		const body: IDataObject = { url: webhookUrl };
		const response = await d4signApiRequest.call(
			this,
			'POST',
			`/documents/${documentUuid}/webhooks`,
			body,
		);
		return toExecutionData.call(this, itemIndex, response);
	}

	throw new Error(`The operation "${operation}" is not supported for resource "documentWebhooks".`);
}
