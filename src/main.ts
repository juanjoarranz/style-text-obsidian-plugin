import { App, Editor, MarkdownView, Menu, Modal, Plugin } from 'obsidian';

import { DEFAULT_SETTINGS, StyleTextSettings, GeneralSettingsTab, Style } from './settings'

export type EnhancedApp = App & {
	commands: { executeCommandById: Function };
};

export default class StyleText extends Plugin {
	settings: StyleTextSettings;

	async onload(): Promise<void> {

		await this.loadSettings();
		this.addCommand({
			id: 'remove-style',
			name: 'Remove Style',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				editor.replaceSelection(this.betterClearHTMLTags(selection));
			}
		});

		// Style Commands
		this.settings.styles.forEach((style, index) => {
			this.addStyleCommand(style, index + 1);
		});


		// Styles Context Menu
		this.registerEvent(
			this.app.workspace.on("editor-menu", this.styleTextInContextMenu)
		);

		this.updateBodyListClass();
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
	addStyleCommand(style: Style, index: number) {
		const isHighlight = style.css.indexOf("background-color") !== -1;
		const tag = isHighlight ? "mark" : "span";
		this.addCommand({
			id: `style${index}`,
			name: `${style.name}`,
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				editor.replaceSelection(`<${tag} style="${style.css}">${selection}</${tag}>`);
			}
		});
	}

	styleTextInContextMenu = (menu: Menu, editor: Editor) => {
    const enhancedApp = this.app as EnhancedApp;

    menu.addItem((item) =>
        item
            .setTitle("Remove Style")
            .setIcon("eraser")
            .onClick(() => {
                enhancedApp.commands.executeCommandById(`style-text:remove-style`);
            })
    );

    const addStyleItems = (submenu: Menu) => {
        this.settings.styles.forEach((style, index) => {
            if (style.contextMenu) {
                submenu.addItem((item) =>
                    item
                        .setTitle(style.name)
                        .setIcon("highlighter")
                        .onClick(() => {
                            enhancedApp.commands.executeCommandById(`style-text:style${index + 1}`);
                        })
                );
            }
        });
    };

		if (this.settings.groupContextMenu) {
			menu.addItem((item) => {
					item.setTitle("Style selected text")
							.setIcon("highlighter");
					
					// @ts-ignore
					item.setSubmenu();
	
					const submenu = new Menu();
					this.settings.styles.forEach((style, index) => {
							if (style.contextMenu) {
									submenu.addItem((subItem) =>
											subItem
													.setTitle(style.name)
													.setIcon("highlighter")
													.onClick(() => {
															enhancedApp.commands.executeCommandById(`style-text:style${index + 1}`);
													})
									);
							}
					});
					// @ts-ignore
					item.submenu = submenu;
			});
	} else {
			addStyleItems(menu);
	}
	
};


	updateBodyListClass() {
		document.body.classList.add("style-text");
	}
}


