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

export async function executeSafe(
	this: IExecuteFunctions,
	itemIndex: number,
	operation: string,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	if (operation === 'getAll') {
		const response = await d4signApiRequest.call(this, 'GET', '/safes');
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'listFolders') {
		const safeUuid = this.getNodeParameter('safeUuid', itemIndex) as string;
		const response = await d4signApiRequest.call(this, 'GET', `/folders/${safeUuid}/find`);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'createFolder') {
		const safeUuid = this.getNodeParameter('safeUuid', itemIndex) as string;
		const folderName = this.getNodeParameter('folderName', itemIndex) as string;
		const parentFolderUuid = this.getNodeParameter('parentFolderUuid', itemIndex, '') as string;

		const body: IDataObject = {
			folder_name: folderName,
		};

		if (parentFolderUuid) body.uuid_folder = parentFolderUuid;

		const response = await d4signApiRequest.call(
			this,
			'POST',
			`/folders/${safeUuid}/create`,
			body,
		);

		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'renameFolder') {
		const safeUuid = this.getNodeParameter('safeUuid', itemIndex) as string;
		const folderUuid = this.getNodeParameter('folderUuid', itemIndex) as string;
		const folderName = this.getNodeParameter('folderName', itemIndex) as string;

		const body: IDataObject = {
			folder_name: folderName,
			uuid_folder: folderUuid,
		};

		const response = await d4signApiRequest.call(
			this,
			'POST',
			`/folders/${safeUuid}/rename`,
			body,
		);

		return toExecutionData.call(this, itemIndex, response);
	}

	throw new Error(`The operation "${operation}" is not supported for resource "safe".`);
}
