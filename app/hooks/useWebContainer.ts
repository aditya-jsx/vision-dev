// import { useEffect, useState, useRef } from "react";
// import { WebContainer } from "@webcontainer/api";
// import { Terminal } from "@xterm/xterm";
// import { FitAddon } from "@xterm/addon-fit";
// import "@xterm/xterm/css/xterm.css";

// export function useWebContainer() {
//     const [webContainer, setWebContainer] = useState<WebContainer | null>(null);
//     const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//     const terminalEl = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         const bootWebContainer = async () => {
//             const webcontainerInstance = await WebContainer.boot();
//             setWebContainer(webcontainerInstance);

//             webcontainerInstance.on('server-ready', (port, url) => {
//                 setPreviewUrl(url);
//             });
//         };
//         bootWebContainer();
//     }, []);

//     useEffect(() => {
//         if (!webContainer || !terminalEl.current) {
//             return;
//         }

//         const terminal = new Terminal({
//             convertEol: true,
//         });

//         const fitAddon = new FitAddon();
//         terminal.loadAddon(fitAddon);
//         terminal.open(terminalEl.current);
//         fitAddon.fit();

//         const shellProcess = webContainer.spawn("jsh");

//         shellProcess.output.pipeTo(
//             new WritableStream({
//                 write(data) {
//                     terminal.write(data);
//                 },
//             })
//         );

//         const input = shellProcess.input.getWriter();
//         terminal.onData((data) => {
//             input.write(data);
//         });

//         return () => {
//             terminal.dispose();
//         };
//     }, [webContainer, terminalEl]);


//     return { webContainer, terminalEl, previewUrl };
// }
















import { useEffect, useState, useRef } from "react";
import { WebContainer, WebContainerProcess } from "@webcontainer/api";
import "@xterm/xterm/css/xterm.css";

type ShellInputWriter = WritableStreamDefaultWriter<string> | null;

export function useWebContainer() {
    const [webContainer, setWebContainer] = useState<WebContainer | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const terminalEl = useRef<HTMLDivElement>(null);
    const [inputWriter, setInputWriter] = useState<ShellInputWriter>(null);
    const shellProcessRef = useRef<WebContainerProcess | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const bootWebContainer = async () => {
                try {
                    const webcontainerInstance = await WebContainer.boot();
                    setWebContainer(webcontainerInstance);
                    webcontainerInstance.on('server-ready', (port, url) => {
                        setPreviewUrl(url);
                    });
                } catch (error) {
                    console.error("Failed to boot WebContainer:", error);
                }
            };
            bootWebContainer();
        }
    }, []);

    useEffect(() => {
        if (!webContainer || !terminalEl.current) return;

        let terminal: any = null;
        let fitAddon: any = null;

        const setupTerminal = async () => {
            if (shellProcessRef.current) return;

            const { Terminal } = await import('@xterm/xterm');
            const { FitAddon } = await import('@xterm/addon-fit');

            terminal = new Terminal({
                convertEol: true,
                cursorBlink: true,
            });
            fitAddon = new FitAddon();
            terminal.loadAddon(fitAddon);

            if (terminalEl.current) {
                terminal.open(terminalEl.current);
                fitAddon.fit();
            }

            const shellProcess = await webContainer.spawn("jsh", {
                terminal: {
                    cols: terminal.cols,
                    rows: terminal.rows,
                },
            });
            shellProcessRef.current = shellProcess;

            shellProcess.output.pipeTo(
                new WritableStream({
                    write(data) {
                        terminal.write(data);
                    },
                })
            );

            const writer = shellProcess.input.getWriter();
            setInputWriter(writer);

            terminal.onData((data: string) => {
                writer.write(data);
            });

            terminal.onResize((size: { cols: number; rows: number }) => {
                shellProcess.resize(size);
            });

            const handleResize = () => fitAddon.fit();
            window.addEventListener('resize', handleResize);

            (terminal as any)._resizeHandler = handleResize;
        };

        setupTerminal();

        return () => {
            if (terminal) {
                if ((terminal as any)._resizeHandler) {
                    window.removeEventListener('resize', (terminal as any)._resizeHandler);
                }
                terminal.dispose();
            }
            if (shellProcessRef.current) {
                shellProcessRef.current.kill();
                shellProcessRef.current = null;
            }
        };
    }, [webContainer]);

    return { webContainer, terminalEl, previewUrl, inputWriter };
}