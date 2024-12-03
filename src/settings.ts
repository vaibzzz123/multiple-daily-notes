import { App, PluginSettingTab } from "obsidian";
import MultipleDailyNotes from "./main";


export default class SettingsTab extends PluginSettingTab {
  plugin: MultipleDailyNotes;

  constructor(app: App, plugin: MultipleDailyNotes) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;

    containerEl.empty();
  }
}