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

export async function executeGroup(
	this: IExecuteFunctions,
	itemIndex: number,
	operation: string,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	const safeUuid = this.getNodeParameter('safeUuid', itemIndex) as string;

	if (operation === 'getAll') {
		const response = await d4signApiRequest.call(this, 'GET', `/groups/${safeUuid}`);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'getDetails') {
		const groupUuid = this.getNodeParameter('groupUuid', itemIndex) as string;
		const response = await d4signApiRequest.call(
			this,
			'GET',
			`/groups/${safeUuid}/groupdetails/${groupUuid}`,
		);
		return toExecutionData.call(this, itemIndex, response);
	}

	throw new Error(`The operation "${operation}" is not supported for resource "group".`);
}
