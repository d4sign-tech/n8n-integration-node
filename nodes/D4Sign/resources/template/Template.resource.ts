import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { d4signApiRequest } from '../../transport/D4SignApiRequest';

function safeJsonParse(input: string, fallback: IDataObject = {}): IDataObject {
	if (!input) return fallback;
	try {
		const parsed = JSON.parse(input);
		return (parsed && typeof parsed === 'object') ? (parsed as IDataObject) : fallback;
	} catch {
		return fallback;
	}
}

export async function executeTemplate(
	this: IExecuteFunctions,
	itemIndex: number,
	operation: string,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	if (!['createDocumentHtml','listTemplates', 'createDocumentWord'].includes(operation)) {
		throw new Error(`The operation "${operation}" is not supported for resource "template".`);
	}

	const safeUuid = this.getNodeParameter('safeUuid', itemIndex) as string;
	const folderUuid = this.getNodeParameter('folderUuid', itemIndex, '') as string;
	const templateId = this.getNodeParameter('templateId', itemIndex) as string;
	const documentName = this.getNodeParameter('documentName', itemIndex) as string;
	const templatesJson = this.getNodeParameter('templatesJson', itemIndex, '{}') as string;

	const templateVars = safeJsonParse(templatesJson, {});

	const body: IDataObject = {
		templates: {
			[templateId]: templateVars,
		},
		name_document: documentName,
	};

	if (folderUuid) body.uuid_folder = folderUuid;

	const endpoint =
		operation === 'createDocumentHtml'
			? `/documents/${safeUuid}/makedocumentbytemplate`
			: `/documents/${safeUuid}/makedocumentbytemplateword`;

	const response = await d4signApiRequest.call(this, 'POST', endpoint, body);

	return {
		json: response as IDataObject,
		pairedItem: itemIndex,
	};
}
