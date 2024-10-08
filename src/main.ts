import { Plugin, Notice } from 'obsidian'; // Import the Plugin class from Obsidian API
import { DailyNotesConfig } from './types';

export default class MultipleDailyNotes extends Plugin {
  // Called when the plugin is loaded
  async onload() {
    console.log('Loading MyPlugin');
    // Example: Add a simple command
    const configs: DailyNotesConfig[] = [
    {
      templateFileLocation: 'fold1/Template1',
      fileLocation: 'fold1/',
      timeOffset: 0
    },
    {
      templateFileLocation: 'fold2/Template2',
      fileLocation: 'fold2/',
      timeOffset: 0
    }
    ];
    this.addCommand({
      id: 'create-daily-notes',
      name: 'Create Daily Notes from config',
      callback: () => {
        for(const config of configs) {
          new Notice(`Hello from MyPlugin! Current config is ${JSON.stringify(config)}`);
        }    
      }
    });


  }


  // Called when the plugin is unloaded (e.g., when disabled or removed)
  onunload() {
    console.log('Unloading MyPlugin');
  }
}