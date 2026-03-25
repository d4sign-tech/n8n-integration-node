import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { d4signApiRequest } from '../../transport/D4SignApiRequest';
import { normalizeUuid, toExecutionData } from './DocumentShared';

export async function executeDocumentPins(
	this: IExecuteFunctions,
	itemIndex: number,
	operation: string,
): Promise<INodeExecutionData | INodeExecutionData[]> {
	if (operation === 'listPins') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const response = await d4signApiRequest.call(this, 'GET', `/documents/${documentUuid}/listpins`);
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'addPins') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const pinsUi = this.getNodeParameter('addPinsUi', itemIndex) as IDataObject;
		const pinsValues = (pinsUi?.pinsValues as IDataObject[]) || [];

		const pins = pinsValues.map((p) => ({
			email: p.email,
			page: p.page,
			position_x: p.positionX,
			position_y: p.positionY,
			page_width: p.pageWidth,
			page_height: p.pageHeight,
			type: p.type,
		}));

		const response = await d4signApiRequest.call(this, 'POST', `/documents/${documentUuid}/addpins`, { pins });
		return toExecutionData.call(this, itemIndex, response);
	}

	if (operation === 'removePins') {
		const documentUuid = normalizeUuid(this.getNodeParameter('documentUuid', itemIndex) as string);
		const pinsUi = this.getNodeParameter('removePinsUi', itemIndex) as IDataObject;
		const pinsValues = (pinsUi?.pinsValues as IDataObject[]) || [];

		const pins = pinsValues.map((p) => ({
			email: p.email,
			page: p.page,
			position_x: p.positionX,
			position_y: p.positionY,
		}));

		const response = await d4signApiRequest.call(this, 'POST', `/documents/${documentUuid}/removepins`, { pins });
		return toExecutionData.call(this, itemIndex, response);
	}

	throw new Error(`The operation "${operation}" is not supported for resource "documentPins".`);
}
