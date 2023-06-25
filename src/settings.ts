import { ButtonComponent, PluginSettingTab, Setting } from "obsidian";
import StyleText from './main';

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
		containerEl.createEl('h1', { text: 'Style Text' });
		containerEl.createEl('div').createEl('span', { text: 'Created by ' }).createEl('a', { text: 'Juanjo Arranz', href: 'https://github.com/juanjoarranz' });

		containerEl.createEl('h2', { text: 'Plugin Settings' });
		containerEl.createEl('p', { text: 'CSS styles to be applied to the selected text.' });

		// Add Style Button
		let containerButton = containerEl.createEl('div', { cls: 'container_button' });
		let addStyleButton = containerButton.createEl('button', { text: 'Add Style' });

		// Setting Items
		const settingContainer: HTMLDivElement = containerEl.createDiv();
		addStyleButton.onclick = ev => this.addStyle(settingContainer);
		this.plugin.settings.styles.forEach((s, i) => this.addStyle(settingContainer, i + 1));

		this.addInstructions(containerEl);

		this.donate(containerEl);
	}

	private addStyle(containerEl: HTMLElement, counter?: number) {

		const settingItemContainer: HTMLDivElement = containerEl.createDiv({ cls: 'setting-item-container' });
		const stylesCounter = counter ?? this.plugin.settings.styles.length + 1;
		const newStyle = "font-size: 20px; color: yellow";

		new Setting(settingItemContainer)
			.setClass('setting-item-text')
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

		// delete button
		const deleteButtonContainer: HTMLDivElement = settingItemContainer.createDiv({ cls: 'delete-button-container' });
		const deleteButton: ButtonComponent = new ButtonComponent(deleteButtonContainer);
		deleteButton.setIcon('trash-2').setClass('setting-item-delete-style-button')
			.onClick(async () => {
				this.plugin.settings.styles.splice(stylesCounter - 1, 1);
				await this.plugin.saveSettings();
				this.display();
			});
	}

	private addInstructions(containerEl: HTMLElement) {
		// Instructions
		// With Command Palette
		containerEl.createEl('p', { text: 'Usage with the Command Palette:', cls: 'instructions' });
		const commandPaletteUl = containerEl.createEl('ul', { cls: 'instructions' });
		commandPaletteUl.createEl('li', { text: 'Select text on the editor' });
		commandPaletteUl.createEl('li', { text: 'Open the Command Palette: <Ctrl> or <Cmd> + <P>' });
		commandPaletteUl.createEl('li', { text: 'Look up the Style to apply: "Style Text 1 ..."' });
		commandPaletteUl.createEl('li', { text: 'Choose the Style: <Enter>' });

		// With Commander Plugin
		containerEl.createEl('p', { text: 'Usage with Commander Plugin:', cls: 'instructions' });
		const commanderUl = containerEl.createEl('ul', { cls: 'instructions' });
		commanderUl.createEl('li').createEl('a', { text: 'Install and enable Commander Plugin', href: 'https://github.com/phibr0/obsidian-commander' });
		commanderUl.createEl('li', { text: 'Open the Editor Menu Setting of Commander Plugin' });
		commanderUl.createEl('li', { text: 'Look up the Style to apply: "Style Text 1 ..."' });
		commanderUl.createEl('li', { text: 'Choose the Style: <Enter>' });
		commanderUl.createEl('li', { text: 'Choose an Icon' });
		commanderUl.createEl('li', { text: 'Choose a Custom Name for the new Command' });
		commanderUl.createEl('li', { text: 'The command will be availble from the editor by right-clicking on a selected text', cls: 'instructions' });

		// With Commander Plugin
		containerEl.createEl('p', { text: 'Remove Applied Styles:', cls: 'instructions' });
		const removeUl = containerEl.createEl('ul', { cls: 'instructions' });
		removeUl.createEl('li', { text: 'Select the styled text on the editor' });
		removeUl.createEl('li', { text: 'Open the Command Palette: <Ctrl> or <Cmd> + <P>' });
		removeUl.createEl('li', { text: 'Look up: "Style Remove"' });
		removeUl.createEl('li', { text: 'Press <Enter>' });
	}

	private donate(containerEl: HTMLElement) {
		const donateContainer = containerEl.createEl('div', { cls: 'donate' });
		donateContainer.setCssStyles({ marginTop: '40px' });

		let buyMeCoffeeImage = new Image(130);
		buyMeCoffeeImage.src = 'https://cdn.ko-fi.com/cdn/kofi3.png?v=3';
		donateContainer.createEl('a', { href: 'https://ko-fi.com/F1F6H4TAR', text: '' }).appendChild(buyMeCoffeeImage);

	}
}
