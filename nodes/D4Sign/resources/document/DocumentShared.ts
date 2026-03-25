import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

function normalizeToJsonObject(data: unknown): IDataObject {
	if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
		return data as IDataObject;
	}

	if (data === null || typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
		return { value: data };
	}

	return { value: data === undefined ? 'undefined' : JSON.stringify(data) };
}

export function toExecutionData(
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

export function stripDocumentsListMeta(data: unknown): unknown {
	if (!Array.isArray(data) || data.length === 0) return data;
	const first = data[0];
	if (typeof first !== 'object' || first === null || Array.isArray(first)) return data;

	const firstData = first as IDataObject;
	if (
		'total_documents' in firstData &&
		'total_in_this_page' in firstData &&
		'current_page' in firstData &&
		'total_pages' in firstData
	) {
		return data.slice(1);
	}
	return data;
}

export function normalizeUuid(input: string): string {
	const s = (input ?? '').toString().trim();
	const match = s.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
	return (match ? match[0] : s).trim();
}
