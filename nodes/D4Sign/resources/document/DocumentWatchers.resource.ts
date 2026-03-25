import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { d4signApiRequest } from '../../transport/D4SignApiRequest';
import { normalizeUuid, toExecutionData } from './DocumentShared';

export async function executeDocumentWatchers(
	this: IExecuteFunctions,
	itemIndex: number,
	operation: string,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	if (operation === 'listWatchers') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const response = await d4signApiRequest.call(this, 'GET', `/watcher/${documentUuid}`);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'addWatcher') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const watcherEmail = this.getNodeParameter('watcherEmail', itemIndex) as string;
		const watcherPermission = this.getNodeParameter('watcherPermission', itemIndex, '') as string;

		const body: IDataObject = { email: watcherEmail };
		if (watcherPermission !== '') body.permission = watcherPermission;

		const response = await d4signApiRequest.call(this, 'POST', `/watcher/${documentUuid}/add`, body);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'removeWatcher') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const watcherEmail = this.getNodeParameter('watcherEmail', itemIndex) as string;

		const response = await d4signApiRequest.call(this, 'POST', `/watcher/${documentUuid}/remove`, {
			email: watcherEmail,
		});
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'eraseWatchers') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const response = await d4signApiRequest.call(this, 'POST', `/watcher/${documentUuid}/erase`);
		return toExecutionData.call(this, itemIndex, response);
	}

	throw new Error(`The operation "${operation}" is not supported for resource "documentWatchers".`);
}
