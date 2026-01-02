import { Component } from '@angular/core'
import { ConfigService } from 'tabby-core'

@Component({
    template: `
        <h3>iflow Newline Settings</h3>
        <div class="form-group">
            <label>Custom Command to Send:</label>
            <div class="input-group">
                <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="customCommand"
                    (input)="onCommandChange()"
                    placeholder="Enter custom command (e.g., \\u000A\\u0011)"
                />
                <div class="input-group-append">
                    <button class="btn btn-outline-secondary" type="button" (click)="resetToDefault()">
                        Reset
                    </button>
                </div>
            </div>
            <small class="form-text text-muted">
                Enter the command to send when hotkey is pressed. Use \\n for newline, \\t for tab, \\\\ for backslash, \\uXXXX for Unicode (e.g., \\u0001 for Ctrl+A).
                <span class="text-success" *ngIf="saveStatus">✓ Settings saved automatically</span>
            </small>
        </div>
        <div class="form-group">
            <label>Preview:</label>
            <code class="form-control-plaintext bg-light p-2 rounded">{{getPreviewText()}}</code>
        </div>
        <div class="form-group">
            <div class="alert alert-info">
                <strong><i class="fas fa-info-circle"></i> How to use:</strong>
                <ol class="mb-0 mt-2">
                    <li>Configure your custom command above</li>
                    <li>Go to Settings → Hotkeys</li>
                    <li>Find "iflow Newline"</li>
                    <li>Set your preferred hotkey (default: Ctrl+Enter)</li>
                    <li>Press the hotkey in any terminal to send your command</li>
                </ol>
            </div>
        </div>
        <div class="form-group">
            <div class="alert alert-secondary">
                <strong><i class="fas fa-keyboard"></i> Unicode Examples:</strong>
                <ul class="mb-0 mt-2">
                    <li><code>\\u000A\\u0011</code> = 换行+Ctrl+Q (iflow newline)</li>
                    <li><code>\\u0001</code> = Ctrl+A (SOH - Start of Heading)</li>
                    <li><code>\\u0003</code> = Ctrl+C (ETX - End of Text)</li>
                    <li><code>\\u0005</code> = Ctrl+E (ENQ - Enquiry)</li>
                    <li><code>\\u001B</code> = Esc (Escape)</li>
                    <li><code>\\u007F</code> = Delete</li>
                </ul>
            </div>
        </div>
    `,
})
export class ClearSettingsTabComponent {
    customCommand: string = '\\u000A\\u0011'
    saveStatus: boolean = false
    private readonly defaultCommand = '\\u000A\\u0011'

    constructor(private config: ConfigService) {
        this.customCommand = this.config.store?.clearCommand?.customCommand || this.defaultCommand
    }

    onCommandChange() {
        // 直接設定配置值
        if (!this.config.store.clearCommand) {
            (this.config.store as any).clearCommand = {}
        }
        (this.config.store as any).clearCommand.customCommand = this.customCommand
        this.config.save()

        // Show save status for 2 seconds
        this.saveStatus = true
        setTimeout(() => {
            this.saveStatus = false
        }, 2000)
    }

    resetToDefault() {
        this.customCommand = this.defaultCommand
        this.onCommandChange()
    }

    getPreviewText(): string {
        return this.customCommand
            .replace(/\\\\/g, '\\')
            .replace(/\\n/g, '⏎')
            .replace(/\\t/g, '→')
            .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
                const charCode = parseInt(hex, 16)
                if (charCode < 32) {
                    return `[Ctrl+${String.fromCharCode(64 + charCode)}]`
                }
                return `[U+${hex}]`
            })
            .replace(/ /g, '·')
    }
}