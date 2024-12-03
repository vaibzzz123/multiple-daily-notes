import { App, PluginSettingTab, Setting } from "obsidian";
import MultipleDailyNotes from "./main";

export default class SettingsTab extends PluginSettingTab {
	plugin: MultipleDailyNotes;
	constructor(app: App, plugin: MultipleDailyNotes) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h1", { text: "Configurations" });

		for (let i = 0; i < this.plugin.settings.settings.length; i++) {
			const setting = this.plugin.settings.settings[i];

			// Configuration header
			new Setting(containerEl).setName(`Config ${i + 1}`);

			// Template File Location
			new Setting(containerEl)
				.setName("Template File Location")
				.setDesc("Path to the template file")
				.addText((text) => {
					const inputEl = text.inputEl;
					const styleEl = document.createElement("style");
					styleEl.innerText = `
            .suggestion-container {
              position: absolute;
              background: var(--background-primary);
              border: 1px solid var(--background-modifier-border);
              max-height: 200px;
              overflow-y: auto;
              z-index: 100;
            }
            .suggestion-item {
              padding: 8px;
              cursor: pointer;
            }
            .suggestion-item:hover {
              background: var(--background-modifier-hover);
            }
          `;
					containerEl.appendChild(styleEl);

					const suggestionContainer = createDiv({
						cls: "suggestion-container",
					});
					containerEl.appendChild(suggestionContainer);
					suggestionContainer.style.right =
						containerEl.getCssPropertyValue("padding-right");

					inputEl.addEventListener("focus", async () => {
						suggestionContainer.style.display = "block";
						if (suggestionContainer.innerHTML === "") {
							const files = this.app.vault.getFiles();
							const matchingFiles = files.filter((file) =>
								file.path
									.toLowerCase()
									.includes(inputEl.value.toLowerCase())
							);
							for (const file of matchingFiles) {
								const suggestionItem = createDiv({
									cls: "suggestion-item",
								});
								suggestionItem.textContent = file.path;
								suggestionItem.addEventListener(
									"click",
									async () => {
										console.log(
											"inside onfocus - suggestion selected"
										);
										text.setValue(file.path);
										suggestionContainer.innerHTML = "";

										this.plugin.settings.settings[
											i
										].templateFileLocation =
											text.getValue();

										await this.plugin.saveSettings();
									}
								);
								suggestionContainer.appendChild(suggestionItem);
							}
						}
					});

					inputEl.addEventListener("blur", () => {
						setTimeout(() => {
							suggestionContainer.style.display = "none";
						}, 200); // Delay to allow clicking on suggestions
					});

					return text
						.setPlaceholder("Location of template file")
						.setValue(setting.templateFileLocation)
						.onChange(async (value) => {
							const files = this.app.vault.getFiles();
							const matchingFiles = files.filter((file) =>
								file.path
									.toLowerCase()
									.includes(value.toLowerCase())
							);

							// Clear previous suggestions
							suggestionContainer.innerHTML = "";

							for (const file of matchingFiles) {
								const suggestionItem = createDiv({
									cls: "suggestion-item",
								});
								suggestionItem.textContent = file.path;
								suggestionItem.addEventListener(
									"click",
									async () => {
										console.log(
											"inside main onchange - suggestion selected"
										);
										text.setValue(file.path);
										suggestionContainer.innerHTML = "";

										this.plugin.settings.settings[
											i
										].templateFileLocation =
											text.getValue();

										await this.plugin.saveSettings();
									}
								);
								suggestionContainer.appendChild(suggestionItem);
							}

							this.plugin.settings.settings[
								i
							].templateFileLocation = value;
							await this.plugin.saveSettings();
						});
				});

			// New File Folder
			new Setting(containerEl)
				.setName("New File Folder")
				.setDesc("Folder where new files will be created")
				.addText((text) =>
					text
						.setPlaceholder("Location of folder for new file")
						.setValue(setting.newFileFolder)
						.onChange(async (value) => {
							this.plugin.settings.settings[i].newFileFolder =
								value;
							await this.plugin.saveSettings();
						})
				);

			// Date Format
			new Setting(containerEl)
				.setName("Date Format")
				.setDesc("Date format for new files")
				.addText((text) =>
					text
						.setPlaceholder("YYYY-MM-DD")
						.setValue(setting.dateFormat)
						.onChange(async (value) => {
							this.plugin.settings.settings[i].dateFormat = value;
							await this.plugin.saveSettings();
						})
				);

			// Time Offset
			new Setting(containerEl)
				.setName("Time Offset")
				.setDesc("Time offset for the note")
				.addText((text) =>
					text
						.setPlaceholder("00:00")
						.setValue(setting.timeOffset)
						.onChange(async (value) => {
							this.plugin.settings.settings[i].timeOffset = value;
							await this.plugin.saveSettings();
						})
				);

			// Ribbon Icon
			new Setting(containerEl)
				.setName("Ribbon Icon")
				.setDesc("Icon to display in the ribbon")
				.addText((text) =>
					text
						.setPlaceholder("Ribbon icon to use")
						.setValue(setting.ribbonIcon ?? "")
						.onChange(async (value) => {
							this.plugin.settings.settings[i].ribbonIcon = value;
							await this.plugin.saveSettings();
						})
				);

			// Command Description
			new Setting(containerEl)
				.setName("Command Description")
				.setDesc("Description for the custom command")
				.addText((text) =>
					text
						.setPlaceholder("Custom command description")
						.setValue(setting.commandDescription ?? "")
						.onChange(async (value) => {
							this.plugin.settings.settings[
								i
							].commandDescription = value;
							await this.plugin.saveSettings();
						})
				);

			// Delete Button
			new Setting(containerEl)
				.setName("Delete Configuration")
				.addButton((button) => {
					button.setButtonText("Delete").onClick(async () => {
						this.plugin.settings.settings.splice(i, 1);
						await this.plugin.saveSettings();
						this.display();
					});
				});

			// Add a visual separator
			// containerEl.createEl("hr");
		}

		// Add New Configuration Button
		new Setting(containerEl)
			.setName("Add New Configuration")
			.addButton((button) => {
				button.setButtonText("Add").onClick(async () => {
					this.plugin.settings.settings.push({
						templateFileLocation: "",
						newFileFolder: "",
						dateFormat: "",
						timeOffset: "",
						ribbonIcon: "",
						commandDescription: "",
					});
					await this.plugin.saveSettings();
					this.display();
				});
			});
	}
}
