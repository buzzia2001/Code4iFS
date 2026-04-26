// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import ObjectProvider from './objectProvider';
import { DataQueueActions } from './types/dataQueue';
import { SaveFileActions } from './types/saveFile';
import { loadBase } from './ibmi';
import { DataAreaActions } from './types/dataArea';
import { JobQueueActions } from './types/jobQueue';
import { OutputQueueActions } from './types/outputQueue';
import { UserSpaceActions } from './types/userSpace';
import { BindingDirectoryActions } from './types/bindingDirectory';
import { JournalActions } from './types/journal';
import { SubsystemActions } from './types/subsystemDescription';
import { MessageQueueActions } from './types/messageQueue';
import { FileActions } from './types/file';
import { UserIndexActions } from './types/userIndex';
import { DspobjActions } from './dspobj';
import { DocumentManager } from './documentManager';

/**
 * Extension activation function
 * This method is called when the extension is activated for the first time
 * @param context - The extension context provided by VS Code
 */
export async function activate(context: vscode.ExtensionContext) {
  // Load the base IBM i extension
  loadBase();

  // Register the document manager
  DocumentManager.register(context);

  // Register the custom editor provider for IBM i file system objects
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(`vscode-ibmi-fs.editor`, new ObjectProvider(), {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    })
  );

  SaveFileActions.register(context);
  DataQueueActions.register(context);
  DataAreaActions.register(context);
  JobQueueActions.register(context);
  OutputQueueActions.register(context);
  UserSpaceActions.register(context);
  BindingDirectoryActions.register(context);
  JournalActions.register(context);
  SubsystemActions.register(context);
  MessageQueueActions.register(context);
  FileActions.register(context);
  UserIndexActions.register(context);
  DspobjActions.register(context);

  // === FS Actions Status Bar ===
  const fsActionsStatusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  fsActionsStatusBar.text = "$(tools) FS Actions";
  fsActionsStatusBar.tooltip = "IBM i FS Actions";
  fsActionsStatusBar.command = "vscode-ibmi-fs.showFsActionsMenu";
  fsActionsStatusBar.show();
  context.subscriptions.push(fsActionsStatusBar);

  // Command to show the FS Actions menu
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-ibmi-fs.showFsActionsMenu', async () => {
      const action = await vscode.window.showQuickPick(
        [
          { label: 'WRKJOB', description: 'Work with Job' },
          { label: 'DSPMSG QSYSOPR', description: 'Display System Operator Messages' },
          { label: 'DSPOBJ', description: 'Display Object Information' },
          { label: 'DSPOBJ Detailed', description: 'Display Object Information (single input)' }
        ],
        { placeHolder: 'Select an FS action' }
      );

      if (action?.label === 'WRKJOB') {
        vscode.commands.executeCommand('vscode-ibmi-fs.wrkjob');
      } else if (action?.label === 'DSPMSG QSYSOPR') {
        vscode.commands.executeCommand('vscode-ibmi-fs.dspmsgQsysopr');
      } else if (action?.label === 'DSPOBJ') {
        vscode.commands.executeCommand('vscode-ibmi-fs.dspobj');
      } else if (action?.label === 'DSPOBJ Detailed') {
        vscode.commands.executeCommand('vscode-ibmi-fs.dspobjDetailed');
      }
    })
  );

  // WRKJOB Command - Example of read-only output with working search
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-ibmi-fs.wrkjob', async () => {
      // Create the content
      const output = [
        '╔════════════════════════════════════════════════════════════╗',
        '║           Work with Job - Example                         ║',
        '╚════════════════════════════════════════════════════════════╝',
        '',
        'Hello world!',
        '',
        'This is an example of read-only display.',
        'The content is static and cannot be modified.',
        '',
        '💡 Tip: Press Ctrl+F (Cmd+F on Mac) to search in the text',
        '',
        '────────────────────────────────────────────────────────────',
        'Command output:',
        '────────────────────────────────────────────────────────────',
        '',
        'Hello world!',
        'This is a read-only tab.',
        'You cannot modify this text.',
        '',
        'Try searching for the word "world" or "read-only".',
        'The search function is fully enabled!',
        '',
        'You can also search for:',
        '  - "hello"',
        '  - "example"',
        '  - "command"',
        '  - any other word present in this document',
        '',
        '════════════════════════════════════════════════════════════',
        'End of document',
        '════════════════════════════════════════════════════════════'
      ];

      // Optional metadata
      const metadata = {
        'Command': 'WRKJOB',
        'Date': new Date().toLocaleString('en-US'),
        'Status': 'Completed'
      };

      // Show the read-only document
      await DocumentManager.showOutput('WRKJOB - Output', output, metadata);
      
      vscode.window.showInformationMessage('Read-only tab opened! Use Ctrl+F to search in the text.');
    })
  );

  // DSPMSG QSYSOPR Command - Opens the QSYSOPR message queue
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-ibmi-fs.dspmsgQsysopr', async () => {
      try {
        // Create the URI for the QSYSOPR message queue in QSYS library
        const uri = vscode.Uri.parse('member:/QSYS/QSYSOPR.MSGQ');
        
        // Open the file with the custom editor
        await vscode.commands.executeCommand('vscode.openWith', uri, 'vscode-ibmi-fs.editor');
      } catch (error) {
        vscode.window.showErrorMessage(vscode.l10n.t('Failed to open QSYSOPR: {0}', String(error)));
      }
    })
  );

  // DSPOBJ Detailed Command - Display object with custom editor using same prompts as DSPOBJ
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-ibmi-fs.dspobjDetailed', async () => {
      // Prompt for library name
      const library = await vscode.window.showInputBox({
        prompt: vscode.l10n.t("Enter library name"),
        placeHolder: vscode.l10n.t("Library"),
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return vscode.l10n.t("Library name is required");
          }
          if (value.length > 10) {
            return vscode.l10n.t("Library name must be 10 characters or less");
          }
          return null;
        }
      });

      if (!library) {
        return;
      }

      // Prompt for object name
      const name = await vscode.window.showInputBox({
        prompt: vscode.l10n.t("Enter object name"),
        placeHolder: vscode.l10n.t("Object name"),
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return vscode.l10n.t("Object name is required");
          }
          if (value.length > 10) {
            return vscode.l10n.t("Object name must be 10 characters or less");
          }
          return null;
        }
      });

      if (!name) {
        return;
      }

      // Prompt for object type
      const type = await vscode.window.showInputBox({
        prompt: vscode.l10n.t("Enter object type (e.g., *PGM, *FILE, *DTAARA)"),
        placeHolder: vscode.l10n.t("*PGM"),
        value: "*PGM",
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return vscode.l10n.t("Object type is required");
          }
          if (!value.startsWith('*')) {
            return vscode.l10n.t("Object type must start with *");
          }
          return null;
        }
      });

      if (!type) {
        return;
      }

      try {
        // Remove asterisk from type for URI
        const typeExt = type.substring(1).toUpperCase();
        const libraryUpper = library.toUpperCase();
        const nameUpper = name.toUpperCase();

        // Create URI and open with custom editor
        const uriPath = `member:/${libraryUpper}/${nameUpper}.${typeExt}`;
        const uri = vscode.Uri.parse(uriPath);
        await vscode.commands.executeCommand('vscode.openWith', uri, 'vscode-ibmi-fs.editor');
      } catch (error) {
        vscode.window.showErrorMessage(vscode.l10n.t('Failed to display object information: {0}', String(error)));
      }
    })
  );

  console.log(vscode.l10n.t('Congratulations, your extension "vscode-ibmi-fs" is now active!'));
}

/**
 * Extension deactivation function
 * This method is called when the extension is deactivated
 */
export function deactivate() { }
