import { ButtonComponent, PluginSettingTab, Setting, ToggleComponent } from "obsidian";
import StyleText from './main';
export interface Style {
	name: string;
	css: string;
	contextMenu: boolean;
}
export interface StyleTextSettings {
	groupContextMenu: boolean;
	styles: Style[];
}

export const DEFAULT_SETTINGS: StyleTextSettings = {
	groupContextMenu: false,
	styles: [
		{ name: "Super Big", css: "font-size: 28px;", contextMenu: true },
		{ name: "Super Big Yellow Highlight", css: "font-size: 28px; background-color: #fff88f; color: black", contextMenu: false },
		{ name: "Big", css: "font-size: 24px", contextMenu: false },
		{ name: "Big Green Highlight", css: "font-size: 24px; background-color: #1EFF00; color: black", contextMenu: true },
		{ name: "Large", css: "font-size: 20px", contextMenu: false },
		{ name: "Large Yellow", css: "font-size: 20px; color: yellow", contextMenu: false },
		{ name: "Large Orange", css: "font-size: 20px; color: orange", contextMenu: true },
		{ name: "Large Red", css: "font-size: 20px; color: red", contextMenu: false },
		{ name: "Green Highlight", css: "background-color: #1EFF00; color: black", contextMenu: true },
		{ name: "Yellow Highlight", css: "background-color: #fff88f; color: black", contextMenu: true },
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
		
		const groupSettingContainer = containerEl.createDiv({ cls: 'setting-item group-context-menu-setting' });
		groupSettingContainer.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';
		
		const infoContainer = groupSettingContainer.createDiv({ cls: 'setting-item-info' });
		infoContainer.createEl('div', { cls: 'setting-item-name', text: 'Group context menu' });
		infoContainer.createEl('div', { cls: 'setting-item-description', text: 'Combine styles into a submenu in the context menu' });
		
		new ToggleComponent(groupSettingContainer.createDiv({ cls: 'setting-item-control' }))
				.setValue(this.plugin.settings.groupContextMenu)
				.onChange(async (value) => {
						this.plugin.settings.groupContextMenu = value;
						await this.plugin.saveSettings();
				});
		
		this.addInstructions(containerEl);

		this.donate(containerEl);
	}


	private clearHtml() {
		// remove disruptive classes and elements
			setTimeout(() => {
					removeClass("setting-item", ".group-context-menu-setting");
					removeClass("setting-item-info", ".group-context-menu-setting");
					removeClass("setting-item-control", ".group-context-menu-setting");
					deleteContainer(".setting-item-description:not(.group-context-menu-setting .setting-item-description)");
			}, 0);
	
			function removeClass(className: string, excludeSelector: string) {
					document.querySelectorAll(`.${className}:not(${excludeSelector})`)
							.forEach(i => i.removeClass(className));
			}
	
		function deleteContainer(selector: string) {
			document.querySelectorAll(selector)
				.forEach(i => i.parentElement?.remove());
		}
	}

	private addStyle(containerEl: HTMLElement, counter?: number) {

		this.clearHtml();

		const { styles } = this.plugin.settings;

		const settingItemContainer: HTMLDivElement = containerEl.createDiv({ cls: 'setting-item-container' });
		const stylesCounter = counter ?? styles.length + 1; // 1-based

		if (!counter) {
			const newStyle: Style = { name: "Large Yellow", css: "font-size: 20px; color: yellow", contextMenu: false };
			styles.push(newStyle);
			this.plugin.addStyleCommand(newStyle, stylesCounter);
			this.plugin.saveSettings();
		}

		const currentStyle = styles[stylesCounter - 1];

		// Style Name
		let styleNameInput = settingItemContainer.createEl('input', { cls: 'style-text-setting-item-name' });
		styleNameInput.value = currentStyle.name;
		styleNameInput.onchange = (async (event) => {
			const value = styleNameInput.value;
			currentStyle.name = value;
			await this.plugin.saveSettings();
			this.plugin.addStyleCommand({
				name: value,
				css: currentStyle.css,
				contextMenu: currentStyle.contextMenu
			}, stylesCounter + 1);
		});

		// Style
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
			.setClass('style-text-setting-item-css')
			.addText(text => {
				return text.setValue(currentStyle.css)
					.onChange(async (value) => {
						currentStyle.css = value;
						await this.plugin.saveSettings();
						this.plugin.addStyleCommand({
							name: currentStyle.name,
							css: value,
							contextMenu: currentStyle.contextMenu
						}, stylesCounter + 1);
					})
			});

		// Toggle Context Menu
		new Setting(settingItemContainer)
			.setClass('style-text-setting-item-contextMenu')
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

		// Up Button
		const upDisabled = stylesCounter - 1 === 0;
		const upButtonContainer = settingItemContainer.createDiv({ cls: 'style-text-button-container' });
		if (!upDisabled) {
			const upButton = new ButtonComponent(upButtonContainer);
			upButton.setIcon('arrow-up').setClass('style-text-delete-style-button')
				.setTooltip("Move up")
				.onClick(() => this.moveStyle("up", stylesCounter, styles));
		}

		// Down Button
		const downDisabled = (stylesCounter === styles.length);
		const downButtonContainer = settingItemContainer.createDiv({ cls: 'style-text-button-container' });
		if (!downDisabled) {
			const downButton = new ButtonComponent(downButtonContainer);
			downButton.setIcon('arrow-down').setClass('style-text-delete-style-button')
				.setTooltip("Move down")
				.onClick(() => this.moveStyle("down", stylesCounter, styles));
		}

		// Delete Button
		const deleteButtonContainer = settingItemContainer.createDiv({ cls: 'style-text-button-container' });
		const deleteButton = new ButtonComponent(deleteButtonContainer);
		deleteButton.setIcon('trash-2').setClass('style-text-delete-style-button')
			.setTooltip("Remove Style")
			.onClick(async () => {
				this.plugin.settings.styles.splice(stylesCounter - 1, 1);
				await this.plugin.saveSettings();
				this.display();
			});

		if (!counter) setTimeout(() => this.display(), 0);
	}

	private async moveStyle(direction: "up" | "down", stylesCounter: number, styles: Style[]) {
		this.plugin.settings.styles = moveStyle(direction, stylesCounter, styles);
		await this.plugin.saveSettings();
		this.plugin.settings.styles.forEach((style, index) => {
			this.plugin.addStyleCommand(style, index + 1);
		});
		this.display();

		function moveStyle(direction: "up" | "down", stylesCounter: number, styles: Style[]): Style[] {
			const movingStyle = styles.splice(stylesCounter - 1, 1)[0];
			const newPosition = direction === "up" ? stylesCounter - 2 : stylesCounter;
			const newStyles = [
				...styles.slice(0, newPosition),
				movingStyle,
				...styles.slice(newPosition)
			];
			return newStyles;
		}
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
