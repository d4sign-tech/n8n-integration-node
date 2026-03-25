import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { d4signApiRequest } from '../../transport/D4SignApiRequest';
import { normalizeUuid, stripDocumentsListMeta, toExecutionData } from './DocumentShared';

export async function executeDocument(
	this: IExecuteFunctions,
	itemIndex: number,
	operation: string,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	if (operation === 'getAll') {
		const pg = this.getNodeParameter('pg', itemIndex, 1) as number;
		const responseRaw = await d4signApiRequest.call(this, 'GET', '/documents', {}, { pg });
		const response = stripDocumentsListMeta(responseRaw);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'getAllInSafe') {
		const safeUuid = this.getNodeParameter('safeUuid', itemIndex) as string;
		const folderUuid = this.getNodeParameter('folderUuid', itemIndex, '') as string;
		const pg = this.getNodeParameter('pg', itemIndex, 1) as number;

		const endpoint = folderUuid
			? `/documents/${safeUuid}/safe/${folderUuid}`
			: `/documents/${safeUuid}/safe`;

		const responseRaw = await d4signApiRequest.call(this, 'GET', endpoint, {}, { pg });
		const response = stripDocumentsListMeta(responseRaw);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'get') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const response = await d4signApiRequest.call(this, 'GET', `/documents/${documentUuid}`);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'getDimensions') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const response = await d4signApiRequest.call(
			this,
			'GET',
			`/documents/${documentUuid}/dimensions`,
		);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'getStatus') {
		const phaseId = this.getNodeParameter('phaseId', itemIndex) as number;
		const pg = this.getNodeParameter('pg', itemIndex, 1) as number;
		const response = await d4signApiRequest.call(
			this,
			'GET',
			`/documents/${phaseId}/status`,
			{},
			{ pg },
		);
		return toExecutionData.call(this, itemIndex, stripDocumentsListMeta(response));
	}

	throw new Error(`The operation "${operation}" is not supported for resource "document".`);
}
