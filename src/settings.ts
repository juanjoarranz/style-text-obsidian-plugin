import { PluginSettingTab, Setting } from "obsidian";
import StyleText from './main';

// export interface StyleTextSettings {
// 	styleOne: string;
// 	styleTwo: string;
// }

// export const DEFAULT_SETTINGS: StyleTextSettings = {
// 	styleOne: "font-size: 28px;",
// 	styleTwo: "font-size: 24px;"
// }

export interface StyleTextSettings {
	styles: string[];
}

export const DEFAULT_SETTINGS: StyleTextSettings = {
	styles: ["font-size: 28px;", "font-size: 24px;"]
}


export class GeneralSettingsTab extends PluginSettingTab {

	plugin: StyleText;

	constructor(app: App, plugin: StyleText) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Style Text Plugin' });
		containerEl.createEl('p', { text: 'CSS styles that can be applied to the selected text.' });
		containerEl.createEl('p', {
			text: 'Usage: on the editor, Select a text, <Ctrl>|<Cmd>+P, write and select "Style Text: Style 1, 2, ...", <Enter>',
			cls: 'instructions'
		});

		containerEl.createEl('p', {
			text: 'or with Commander Plugin: add the commands to the Editor Menu Comands ',
			cls: 'instructions'
		});

		let containerButton = containerEl.createEl('div', { cls: 'container_button' });
		let addStyleButton = containerButton.createEl('button', { text: 'Add Style' });
		addStyleButton.onclick = ev => this.addStyle(containerEl);

		this.plugin.settings.styles.forEach((s, i) => this.addStyle(containerEl, i + 1));

		//@ts-ignore
		//console.log('ja2 this.app.commands.editorCommands', this.app.commands.editorCommands);
	}

	addStyle(containerEl: HTMLElement, counter?: number) {

		const stylesCounter = counter ?? this.plugin.settings.styles.length + 1;
		const newStyle = "font-size: 20px; color: yellow";

		new Setting(containerEl)
			.setClass('setting_text')
			.setName(`CSS Style ${stylesCounter}`)
			.addText(text => {
				if (!counter) this.plugin.settings.styles.push(newStyle);
				return text.setValue(this.plugin.settings.styles[stylesCounter - 1] ?? newStyle)
					.onChange(async (value) => {
						this.plugin.settings.styles[stylesCounter - 1] = value;
						await this.plugin.saveSettings();
						this.plugin.addStyleCommand(value, stylesCounter);
					})
			});

		if (!counter) {
			this.plugin.addStyleCommand(newStyle, stylesCounter);
			this.plugin.saveSettings();
		}
	}
}
