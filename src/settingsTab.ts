import MultipleDailyNotes from "./main";
import { App, PluginSettingTab } from "obsidian";

export default class DailyNotesSettingTab extends PluginSettingTab {
  plugin: MultipleDailyNotes;

  constructor(app: App, plugin: MultipleDailyNotes) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Multiple Daily Notes Settings" });
  }
}