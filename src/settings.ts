import { Plugin } from 'obsidian';

/**
 * Defines the structure of each daily note configuration.
 */
export interface DailyNoteConfiguration {
  folder: string;
  template: string;
  dateFormat: string;
  timeOffset?: string; // HH:mm format
}

/**
 * Defines the overall plugin settings.
 */
export interface MyPluginSettings {
  dailyNotesConfigs: DailyNoteConfiguration[];
}

/**
 * Default settings for the plugin.
 */
export const DEFAULT_SETTINGS: MyPluginSettings = {
  dailyNotesConfigs: []
};

/**
 * A helper class to manage loading and saving settings.
 */
export class MyPluginSettingsManager {
  plugin: Plugin;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  /**
   * Load settings from Obsidian storage.
   */
  async loadSettings(): Promise<MyPluginSettings> {
    const data = await this.plugin.loadData();
    return Object.assign({}, DEFAULT_SETTINGS, data);
  }

  /**
   * Save settings to Obsidian storage.
   */
  async saveSettings(settings: MyPluginSettings): Promise<void> {
    await this.plugin.saveData(settings);
  }
}
