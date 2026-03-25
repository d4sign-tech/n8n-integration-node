import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { d4signApiRequest } from './transport/D4SignApiRequest';

import {
	documentActionsFields,
	documentActionsOperations,
	documentFields,
	documentOperations,
	documentPinsFields,
	documentPinsOperations,
	documentTagsFields,
	documentTagsOperations,
	documentUploadFields,
	documentUploadOperations,
	documentWatchersFields,
	documentWatchersOperations,
	documentWebhooksFields,
	documentWebhooksOperations,
	safeFields,
	safeOperations,
	signatoryFields,
	signatoryOperations,
	templateFields,
	templateOperations,
	groupFields,
	groupOperations,
} from './descriptions/index';

import { executeDocument } from './resources/document/Document.resource';
import { executeDocumentActions } from './resources/document/DocumentActions.resource';
import { executeDocumentPins } from './resources/document/DocumentPins.resource';
import { executeDocumentTags } from './resources/document/DocumentTags.resource';
import { executeDocumentUpload } from './resources/document/DocumentUpload.resource';
import { executeDocumentWatchers } from './resources/document/DocumentWatchers.resource';
import { executeDocumentWebhooks } from './resources/document/DocumentWebhooks.resource';
import { executeSafe } from './resources/safe/Safe.resource';
import { executeSignatory } from './resources/signatory/Signatory.resource';
import { executeTemplate } from './resources/template/Template.resource';
import { executeGroup } from './resources/group/Group.resource';

function asDataObject(value: unknown): IDataObject {
	if (typeof value === 'object' && value !== null) {
		return value as IDataObject;
	}
	return {};
}

function asString(value: unknown): string {
	if (value === undefined || value === null) return '';
	return String(value);
}

export class D4Sign implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'D4Sign',
		name: 'd4Sign',
		icon: 'file:d4sign.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the D4Sign API',
		defaults: {
			name: 'D4Sign',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'd4SignApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Document List', value: 'document' },
					{ name: 'Document Workflow', value: 'documentActions' },
					{ name: 'Document Pins', value: 'documentPins' },
					{ name: 'Document Tags', value: 'documentTags' },
					{ name: 'Document Upload', value: 'documentUpload' },
					{ name: 'Document Watchers', value: 'documentWatchers' },
					{ name: 'Document Webhooks', value: 'documentWebhooks' },
					{ name: 'Signatory', value: 'signatory' },
					{ name: 'Template', value: 'template' },
					{ name: 'Safe', value: 'safe' },
					{ name: 'Group', value: 'group' },
				],
				default: 'document',
			},
			...documentOperations,
			...documentFields,
			...documentActionsOperations,
			...documentActionsFields,
			...documentPinsOperations,
			...documentPinsFields,
			...documentTagsOperations,
			...documentTagsFields,
			...documentUploadOperations,
			...documentUploadFields,
			...documentWatchersOperations,
			...documentWatchersFields,
			...documentWebhooksOperations,
			...documentWebhooksFields,
			...signatoryOperations,
			...signatoryFields,
			...templateOperations,
			...templateFields,
			...safeOperations,
			...safeFields,
			...groupOperations,
			...groupFields,
		],
	};

	methods = {
		loadOptions: {
			async getSafes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await d4signApiRequest.call(this, 'GET', '/safes');
				if (!Array.isArray(response)) return [];

				const uuidRegex =
					/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

				return response
					.map((safeItem: unknown) => {
						const safe = asDataObject(safeItem);
						const value = asString(safe.uuid_safe ?? safe.uuid ?? safe.id);

						let name =
							safe.safeName ??
							safe['name-safe'] ??
							safe.safe_name ??
							safe.name ??
							safe.nome ??
							'';
						name = asString(name);

						if (!name || uuidRegex.test(name) || name === value) {
							name = 'Safe';
						}

						return { name, value };
					})
					.filter((opt) => opt.value);
			},

			async getFolders(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const safeUuid = this.getCurrentNodeParameter('safeUuid') as string;

				if (!safeUuid) return [];

				const response = await d4signApiRequest.call(this, 'GET', `/folders/${safeUuid}/find`);

				if (!Array.isArray(response)) return [];

				return response.map((folderItem: unknown) => {
					const folder = asDataObject(folderItem);
					return {
						name: asString(
							folder.path ?? folder.folder_name ?? folder.name ?? folder.uuid_folder ?? 'Folder',
						),
						value: asString(folder.uuid_folder ?? folder.uuid ?? folder.id),
					};
				});
			},

			async getGroups(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const safeUuid = this.getCurrentNodeParameter('safeUuid') as string;

				if (!safeUuid) return [];

				const response = await d4signApiRequest.call(this, 'GET', `/groups/${safeUuid}`);

				if (!Array.isArray(response)) return [];

				return response.map((groupItem: unknown) => {
					const group = asDataObject(groupItem);
					return {
						name: asString(group.nome) || 'Group',
						value: asString(group.uuid_grupo),
					};
				});
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			let result: INodeExecutionData | INodeExecutionData[];

			if (resource === 'document') {
				result = await executeDocument.call(this, itemIndex, operation);
			} else if (resource === 'documentActions') {
				result = await executeDocumentActions.call(this, itemIndex, operation);
			} else if (resource === 'documentPins') {
				result = await executeDocumentPins.call(this, itemIndex, operation);
			} else if (resource === 'documentTags') {
				result = await executeDocumentTags.call(this, itemIndex, operation);
			} else if (resource === 'documentUpload') {
				result = await executeDocumentUpload.call(this, itemIndex, operation);
			} else if (resource === 'documentWatchers') {
				result = await executeDocumentWatchers.call(this, itemIndex, operation);
			} else if (resource === 'documentWebhooks') {
				result = await executeDocumentWebhooks.call(this, itemIndex, operation);
			} else if (resource === 'signatory') {
				result = await executeSignatory.call(this, itemIndex, operation);
			} else if (resource === 'template') {
				result = await executeTemplate.call(this, itemIndex, operation);
			} else if (resource === 'safe') {
				result = await executeSafe.call(this, itemIndex, operation);
			} else if (resource === 'group') {
				result = await executeGroup.call(this, itemIndex, operation);
			} else {
				throw new Error(`The resource "${resource}" is not supported.`);
			}

			if (Array.isArray(result)) {
				returnData.push(...result);
			} else {
				returnData.push(result);
			}
		}

		return [returnData];
	}
}
