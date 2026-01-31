import { messages } from "../messages/index.js";
import { validateSchema } from "./validateSchema.js";

/** @import { PageMeta } from "../types.d.ts" */

/**
 * @param {PageMeta} meta
 * @param {string} sourceFileName
 * @returns {PageMeta}
 */
export function validateMeta(meta, sourceFileName) {
	const validationErrors = validateSchema(meta, {
		title: { type: "string", required: false },
		layout: { type: ["string", "boolean"], required: false },
	});

	if (validationErrors.length > 0) {
		throw new Error(
			messages.errors.invalidMeta(sourceFileName, validationErrors),
		);
	}

	return meta;
}
