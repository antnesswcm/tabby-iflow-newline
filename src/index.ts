// src/index.ts - Tabby Ctrl+Enter plugin
import { NgModule, Injectable } from '@angular/core'
import { FormsModule } from '@angular/forms'
import {
    HotkeyDescription,
    HotkeyProvider,
    HotkeysService,
    AppService,
    ConfigProvider,
    ConfigService,
    BaseTabComponent
} from 'tabby-core'
import { SettingsTabProvider } from 'tabby-settings'

// Import our components
import { ClearSettingsTabComponent } from './settings-tab.component'
import { ClearSettingsTabProvider } from './settings-tab-provider'

// Type definitions
interface SplitTabComponent extends BaseTabComponent {
    getFocusedTab(): BaseTabComponent | null
    focusedTab?: BaseTabComponent
}

interface TerminalTab extends BaseTabComponent {
    session?: any
    frontend?: { write?: (data: string) => void }
    sendInput?: (data: string) => void
}

@Injectable()
export class ClearConfigProvider extends ConfigProvider {
    defaults = {
        hotkeys: {
            'iflow-ctrl-enter': ['Ctrl-Enter'],
        },
        clearCommand: {
            customCommand: '\\u000A\\u0011',
        },
    }
}

@Injectable()
export class ClearHotkeyProvider extends HotkeyProvider {
    async provide(): Promise<HotkeyDescription[]> {
        return [
            {
                id: 'iflow-ctrl-enter',
                name: 'iflow newline',
            },
        ]
    }
}

@Injectable()
export class ClearHandler {
    constructor(
        private hotkeys: HotkeysService,
        private app: AppService,
        private config: ConfigService
    ) {
        // Delayed initialization to ensure ConfigProvider is ready
        setTimeout(() => this.init(), 100)
    }

    private init() {
        this.hotkeys.matchedHotkey.subscribe(hotkey => {
            if (hotkey === 'iflow-ctrl-enter') {
                this.handleClear()
            }
        })
    }

    private handleClear() {
        const activeTab = this.app.activeTab

        // 统一处理：取得实际的终端标签
        const terminal = this.getActiveTerminal(activeTab)
        if (terminal) {
            this.sendClearCommand(terminal)
        } else {
        }
    }

    private getActiveTerminal(tab: BaseTabComponent | null): TerminalTab | null {
        if (!tab) {
            return null
        }

        // 检查是否有 getFocusedTab 方法（容器组件）
        const container = tab as any
        if (typeof container.getFocusedTab === 'function') {
            try {
                const focusedTab = container.getFocusedTab()
                if (focusedTab && this.isTerminalTab(focusedTab)) {
                    return focusedTab as TerminalTab
                }
            } catch (error) {
                console.error('getFocusedTab() failed:', error)
            }
        }

        // Check if current tab is a terminal
        if (this.isTerminalTab(tab)) {
            return tab as TerminalTab
        }

        return null
    }

    private isTerminalTab(tab: BaseTabComponent | null): boolean {
        if (!tab) return false
        const terminalTab = tab as any
        return !!(terminalTab.session || terminalTab.frontend || terminalTab.sendInput)
    }

    private sendClearCommand(tab: TerminalTab | BaseTabComponent | null) {
        if (!tab) {
            return
        }

        const terminalTab = tab as TerminalTab

        // 从配置中读取自定义命令，如果没有则使用默认值
        const customCommand = this.config.store?.clearCommand?.customCommand || '\\u000A\\u0011'
        const commandToSend = this.processEscapeSequences(customCommand)

        try {
            // Try using session
            if (terminalTab.session) {
                terminalTab.session.write(Buffer.from(commandToSend, 'utf8'))
                return
            }

            // Try using frontend
            if (terminalTab.frontend && terminalTab.frontend.write) {
                terminalTab.frontend.write(commandToSend)
                return
            }

            // Try using sendInput
            if (typeof terminalTab.sendInput === 'function') {
                terminalTab.sendInput(commandToSend)
                return
            }

            console.error('No available send method found')
            console.error('Tab properties:', Object.keys(terminalTab).filter(key => !key.startsWith('_')))

        } catch (error) {
            console.error('Error sending command:', error)
        }
    }

    private processEscapeSequences(text: string): string {
        // 先处理 Unicode 转义序列 \uXXXX
        let result = text.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
            return String.fromCharCode(parseInt(hex, 16))
        })

        // 再处理其他转义序列
        return result
            .replace(/\\n/g, '\n')       // 换行符
            .replace(/\\t/g, '\t')       // Tab 字符
            .replace(/\\r/g, '\r')       // 回车符
            .replace(/\\\\/g, '\\')      // 反斜线（必须放在最后）
    }
}

@NgModule({
    imports: [FormsModule],
    declarations: [ClearSettingsTabComponent],
    providers: [
        {
            provide: ConfigProvider,
            useClass: ClearConfigProvider,
            multi: true,
        },
        {
            provide: HotkeyProvider,
            useClass: ClearHotkeyProvider,
            multi: true,
        },
        {
            provide: SettingsTabProvider,
            useClass: ClearSettingsTabProvider,
            multi: true,
        },
        ClearHandler,
    ],
})
export default class ClearModule {
    constructor(private handler: ClearHandler) {
    }
}