import { CodeForIBMi } from "@halcyontech/vscode-ibmi-types";
import Instance from "@halcyontech/vscode-ibmi-types/Instance";
import { VscodeTools } from "@halcyontech/vscode-ibmi-types/ui/Tools";
import { FrontendTables } from "@halcyontech/vscode-ibmi-types/ui/frontendTables";
import { Extension, extensions } from "vscode";

/** Reference to the base Code for IBM i extension */
let baseExtension: Extension<CodeForIBMi> | undefined;

/**
 * Load and return the base Code for IBM i extension
 * @returns The CodeForIBMi extension API if available, undefined otherwise
 */
export function loadBase(): CodeForIBMi | undefined {
  if (!baseExtension) {
    baseExtension = (extensions ? extensions.getExtension(`halcyontechltd.code-for-ibmi`) : undefined);
  }

  return (baseExtension && baseExtension.isActive && baseExtension.exports ? baseExtension.exports : undefined);
}

/**
 * Get the current IBM i connection instance
 * @returns The active Instance if available, undefined otherwise
 */
export function getInstance(): Instance | undefined {
  return (baseExtension && baseExtension.isActive && baseExtension.exports ? baseExtension.exports.instance : undefined);
}

/**
 * Get the VS Code tools from the base extension
 * @returns The VscodeTools if available, undefined otherwise
 */
export function getVSCodeTools(): typeof VscodeTools | undefined {
  return (baseExtension && baseExtension.isActive && baseExtension.exports ? baseExtension.exports.tools : undefined);
}

/** Column definition for FastTable, re-exported from the base extension's frontendTables API */
export type FastTableColumn<T> = FrontendTables.FastTableColumn<T>;
/** Options for generating a FastTable, re-exported from the base extension's frontendTables API */
export type FastTableOptions<T> = FrontendTables.FastTableOptions<T>;
/** Options for generating a detail table, re-exported from the base extension's frontendTables API */
export type DetailTableOptions = FrontendTables.DetailTableOptions;
/** Action button configuration for detail tables, re-exported from the base extension's frontendTables API */
export type DetailTableAction = FrontendTables.DetailTableAction;

/**
 * Generate an enhanced detail table (key-value pairs) via the base extension's frontendTables API
 * @param options - Detail table configuration options
 * @returns Complete HTML page string
 */
export function generateDetailTable(options: DetailTableOptions): string {
  return loadBase()!.frontendTables.generateDetailTable(options);
}

/**
 * Generate a complete HTML page with a FAST Element table via the base extension's frontendTables API
 * @param options - Table configuration options
 * @returns Complete HTML page string
 */
export function generateFastTable<T>(options: FastTableOptions<T>): string {
  return loadBase()!.frontendTables.generateFastTable(options);
}