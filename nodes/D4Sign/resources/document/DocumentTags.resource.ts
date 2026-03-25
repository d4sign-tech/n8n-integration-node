import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { d4signApiRequest } from '../../transport/D4SignApiRequest';
import { normalizeUuid, toExecutionData } from './DocumentShared';

export async function executeDocumentTags(
	this: IExecuteFunctions,
	itemIndex: number,
	operation: string,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	if (operation === 'listTags') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const response = await d4signApiRequest.call(this, 'GET', `/tags/${documentUuid}`);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'addTag') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const tag = this.getNodeParameter('tag', itemIndex) as string;

		const response = await d4signApiRequest.call(
			this,
			'POST',
			`/tags/${documentUuid}/add`,
			{ tag },
		);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'removeTag') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const tag = this.getNodeParameter('tag', itemIndex) as string;

		const response = await d4signApiRequest.call(
			this,
			'POST',
			`/tags/${documentUuid}/remove`,
			{ tag },
		);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'addUrgent') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const response = await d4signApiRequest.call(this, 'POST', `/tags/${documentUuid}/addurgent`);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'removeUrgent') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const response = await d4signApiRequest.call(this, 'POST', `/tags/${documentUuid}/removeurgent`);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'eraseTags') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const response = await d4signApiRequest.call(this, 'POST', `/tags/${documentUuid}/erase`);
		return toExecutionData.call(this, itemIndex, response);
	}

	throw new Error(`The operation "${operation}" is not supported for resource "documentTags".`);
}
