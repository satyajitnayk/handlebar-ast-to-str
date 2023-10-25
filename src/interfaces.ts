import {HbsNodeType} from "./constants";

/**
 * Interface for specifying modification options.
 *
 * @property {string} [helper] - Indicates if the target is a parameter.
 * @property {HbsNodeType} [nodeType] - Specifies the node type of the target.
 * @property {number} [paramIndex] - Specifies the index of the parameter.
 * @property {Function} [modify] - A function to modify the target.
 */

export interface ModificationOptions {
  helper?: string;
  // isParam?: boolean;
  // isHash?: boolean;
  nodeType?: HbsNodeType;
  paramIndex?: number;
  // hashNo?: number;
  modifiers?: Function[];
}
