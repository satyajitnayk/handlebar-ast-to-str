import {HbsNodeType} from "./constants";

/**
 * Interface for specifying modification options.
 *
 * @property {string} [helper] - Indicates if the target is a parameter.
 * @property {HbsNodeType} [paramType] - Specifies the param type of the target.
 * @property {number} [paramPosition] - Specifies the position of the parameter.
 * @property {Function[]} [modifiers] - Array of functions to modify the target.
 */
export interface ModificationOptions {
  helper?: string;
  paramType?: HbsNodeType;
  paramPosition?: number;
  modifiers?: Function[];
}
