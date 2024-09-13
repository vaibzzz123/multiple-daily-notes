import { Plugin, Notice } from 'obsidian'; // Import the Plugin class from Obsidian API
import DailyNotesSettingTab from './settingsTab';

export default class MultipleDailyNotes extends Plugin {
  // Called when the plugin is loaded
  async onload() {
    console.log('Loading MyPlugin');

    this.addSettingTab(new DailyNotesSettingTab(this.app, this));

    // Example: Add a simple command
    this.addCommand({
      id: 'example-command',
      name: 'Example Command',
      callback: () => {
        new Notice('Hello from MyPlugin!');  // Show a message when the command is invoked
      }
    });


  }

  // Called when the plugin is unloaded (e.g., when disabled or removed)
  onunload() {
    console.log('Unloading MyPlugin');
  }
}
