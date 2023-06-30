import { ButtonComponent, PluginSettingTab, Setting } from "obsidian";
import StyleText from './main';
export interface Style {
	name: string;
	css: string;
	contextMenu: boolean;
}
export interface StyleTextSettings {
	styles: Style[];
}

export const DEFAULT_SETTINGS: StyleTextSettings = {
	styles: [
		{ name: "Super Big Font", css: "font-size: 28px;", contextMenu: false },
		{ name: "Big Font", css: "font-size: 24px;", contextMenu: false }
	]
}

export class GeneralSettingsTab extends PluginSettingTab {

	plugin: StyleText;

	constructor(app: App, plugin: StyleText) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;

		this.clearHtml();

		containerEl.empty();
		containerEl.createEl('div').createEl('span', { text: 'Created by ' }).createEl('a', { text: 'Juanjo Arranz', href: 'https://github.com/juanjoarranz' });

		containerEl.createEl('p', { text: 'CSS styles to be applied to the selected text.' });

		const settingHeader: HTMLDivElement = containerEl.createDiv({ cls: "setting-header" });
		settingHeader.createDiv({ text: "Name", cls: "name-header" });
		settingHeader.createDiv({ text: "Style", cls: "style-header" });

		// Add Style Button
		let containerButton = settingHeader.createEl('div', { cls: 'container_add_button' });
		let addStyleButton = containerButton.createEl('button', { text: 'Add Style' });

		// Setting Items
		const settingContainer: HTMLDivElement = containerEl.createDiv();
		addStyleButton.onclick = ev => this.addStyle(settingContainer);

		this.plugin.settings.styles.forEach((s, i) => this.addStyle(settingContainer, i + 1));

		this.addInstructions(containerEl);

		this.donate(containerEl);
	}


	private clearHtml() {
		// remove disruptive classes and elements
		setTimeout(() => {
			removeClass("setting-item");
			removeClass("setting-item-info");
			removeClass("setting-item-control");
			deleteContainer(".setting-item-description");
		}, 0);

		function removeClass(className: string) {
			document.querySelectorAll("." + className)
				.forEach(i => i.removeClass(className));
		}

		function deleteContainer(selector: string) {
			document.querySelectorAll(selector)
				.forEach(i => i.parentElement?.remove());
		}
	}

	private addStyle(containerEl: HTMLElement, counter?: number) {

		this.clearHtml();

		const settingItemContainer: HTMLDivElement = containerEl.createDiv({ cls: 'setting-item-container' });
		const stylesCounter = counter ?? this.plugin.settings.styles.length + 1;
		const newStyle: Style = { name: "Medium Size Yellow", css: "font-size: 20px; color: yellow", contextMenu: false };

		if (!counter) {
			this.plugin.settings.styles.push(newStyle);
			this.plugin.addStyleCommand(newStyle, stylesCounter);
			this.plugin.saveSettings();
		}

		const currentStyle = this.plugin.settings.styles[stylesCounter - 1];

		let styleNameInput = settingItemContainer.createEl('input', { cls: 'style-text-setting-item-name' });
		styleNameInput.value = currentStyle.name ?? newStyle.name;
		styleNameInput.onchange = (async (event) => {
			const value = styleNameInput.value;
			currentStyle.name = value;
			await this.plugin.saveSettings();
			this.plugin.addStyleCommand({
				name: value,
				css: currentStyle.css,
				contextMenu: currentStyle.contextMenu
			}, stylesCounter);
		});

		// new Setting(settingItemContainer)
		// 	.setClass('setting-item-name')
		// 	.addText(text => {
		// 		return text.setValue(this.plugin.settings.styles[stylesCounter - 1]?.name ?? newStyle.name)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.styles[stylesCounter - 1].name = value;
		// 				await this.plugin.saveSettings();
		// 				this.plugin.addStyleCommand({
		// 					name: value,
		// 					css: this.plugin.settings.styles[stylesCounter - 1].css
		// 				}, stylesCounter);
		// 			})
		// 	});

		new Setting(settingItemContainer)
			.setClass('setting-item-css')
			.addText(text => {
				return text.setValue(currentStyle.css ?? newStyle.css)
					.onChange(async (value) => {
						currentStyle.css = value;
						await this.plugin.saveSettings();
						this.plugin.addStyleCommand({
							name: currentStyle.name,
							css: value,
							contextMenu: currentStyle.contextMenu
						}, stylesCounter);
					})
			});

		new Setting(settingItemContainer)
			.setClass('setting-item-contextMenu')
			.addToggle(toggle => {
				toggle.setValue(currentStyle.contextMenu)
					.setTooltip((toggle.getValue() ? "disable" : "enable") + " contex menu")
					.onChange(async () => {
						const value = toggle.getValue();
						toggle.setTooltip((value ? "disable" : "enable") + " contex menu");
						currentStyle.contextMenu = value;
						await this.plugin.saveSettings();
					})
			});

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

		const containerInstructions = containerEl.createEl('div', { cls: 'container-instructions' });

		// Instructions
		// With Command Palette
		containerInstructions.createEl('p', { text: 'Usage with the Command Palette:', cls: 'instructions' });
		const commandPaletteUl = containerInstructions.createEl('ul', { cls: 'instructions' });
		commandPaletteUl.createEl('li', { text: 'Select text on the editor' });
		commandPaletteUl.createEl('li', { text: 'Open the Command Palette: <Ctrl> or <Cmd> + <P>' });
		commandPaletteUl.createEl('li', { text: 'Look up the Style to apply: "Style Text ..."' });
		commandPaletteUl.createEl('li', { text: 'Choose the Style: <Enter>' });


		// Remove Applied Styles
		containerInstructions.createEl('p', { text: 'Remove Applied Styles:', cls: 'instructions' });
		const removeUl = containerInstructions.createEl('ul', { cls: 'instructions' });
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
