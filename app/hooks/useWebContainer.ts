import { useEffect, useState, useRef } from "react";
import { WebContainer } from "@webcontainer/api";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

export function useWebContainer() {
    const [webContainer, setWebContainer] = useState<WebContainer | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const terminalEl = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const bootWebContainer = async () => {
            const webcontainerInstance = await WebContainer.boot();
            setWebContainer(webcontainerInstance);

            webcontainerInstance.on('server-ready', (port, url) => {
                setPreviewUrl(url);
            });
        };
        bootWebContainer();
    }, []);

    useEffect(() => {
        if (!webContainer || !terminalEl.current) {
            return;
        }

        const terminal = new Terminal({
            convertEol: true,
        });

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.open(terminalEl.current);
        fitAddon.fit();

        const shellProcess = webContainer.spawn("jsh");

        shellProcess.output.pipeTo(
            new WritableStream({
                write(data) {
                    terminal.write(data);
                },
            })
        );

        const input = shellProcess.input.getWriter();
        terminal.onData((data) => {
            input.write(data);
        });

        return () => {
            terminal.dispose();
        };
    }, [webContainer, terminalEl]);


    return { webContainer, terminalEl, previewUrl };
}