import { App, Editor, MarkdownView, Modal, Plugin } from 'obsidian';

import { DEFAULT_SETTINGS, StyleTextSettings, GeneralSettingsTab } from './settings'

export default class StyleText extends Plugin {
	settings: StyleTextSettings;

	async onload(): Promise<void> {

		await this.loadSettings();
		this.addCommand({
			id: 'remove-style',
			name: 'Style Remove',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				editor.replaceSelection(this.betterClearHTMLTags(selection));
			}
		});

		this.settings.styles.forEach((value, index) => {
			this.addStyleCommand(value, index + 1);
		});

		this.addSettingTab(new GeneralSettingsTab(this.app, this));
	}

	async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...await this.loadData() };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	clearHTMLTags(strToSanitize: string): string {
		return strToSanitize.replace(/(<([^>]+)>)/gi, '');
	}

	betterClearHTMLTags(strToSanitize: string): string {
		let myHTML = new DOMParser()
			.parseFromString(strToSanitize, 'text/html');
		return myHTML.body.textContent || '';
	}

	// index: 1-based
	addStyleCommand(style: string, index: number) {
		this.addCommand({
			id: `style${index}`,
			name: `Style ${index}`,
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				editor.replaceSelection(`<span style="${style}">${selection}</span>`)
			}
		})
	}
}


