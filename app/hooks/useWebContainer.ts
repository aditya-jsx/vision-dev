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
















// import { useEffect, useState, useRef } from "react";
// import { WebContainer, WebContainerProcess } from "@webcontainer/api";
// import "@xterm/xterm/css/xterm.css";

// type ShellInputWriter = WritableStreamDefaultWriter<string> | null;

// export function useWebContainer() {
//     const [webContainer, setWebContainer] = useState<WebContainer | null>(null);
//     const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//     const terminalEl = useRef<HTMLDivElement>(null);
//     const [inputWriter, setInputWriter] = useState<ShellInputWriter>(null);
//     const shellProcessRef = useRef<WebContainerProcess | null>(null);

//     useEffect(() => {
//         if (typeof window !== 'undefined') {
//             const bootWebContainer = async () => {
//                 try {
//                     const webcontainerInstance = await WebContainer.boot();
//                     setWebContainer(webcontainerInstance);
//                     webcontainerInstance.on('server-ready', (port, url) => {
//                         setPreviewUrl(url);
//                     });
//                 } catch (error) {
//                     console.error("Failed to boot WebContainer:", error);
//                 }
//             };
//             bootWebContainer();
//         }
//     }, []);

//     useEffect(() => {
//         if (!webContainer || !terminalEl.current) return;

//         let terminal: any = null;
//         let fitAddon: any = null;

//         const setupTerminal = async () => {
//             if (shellProcessRef.current) return;

//             const { Terminal } = await import('@xterm/xterm');
//             const { FitAddon } = await import('@xterm/addon-fit');

//             terminal = new Terminal({
//                 convertEol: true,
//                 cursorBlink: true,
//             });
//             fitAddon = new FitAddon();
//             terminal.loadAddon(fitAddon);

//             if (terminalEl.current) {
//                 terminal.open(terminalEl.current);
//                 fitAddon.fit();
//             }

//             const shellProcess = await webContainer.spawn("jsh", {
//                 terminal: {
//                     cols: terminal.cols,
//                     rows: terminal.rows,
//                 },
//             });
//             shellProcessRef.current = shellProcess;

//             shellProcess.output.pipeTo(
//                 new WritableStream({
//                     write(data) {
//                         terminal.write(data);
//                     },
//                 })
//             );

//             const writer = shellProcess.input.getWriter();
//             setInputWriter(writer);

//             terminal.onData((data: string) => {
//                 writer.write(data);
//             });

//             terminal.onResize((size: { cols: number; rows: number }) => {
//                 shellProcess.resize(size);
//             });

//             const handleResize = () => fitAddon.fit();
//             window.addEventListener('resize', handleResize);

//             (terminal as any)._resizeHandler = handleResize;
//         };

//         setupTerminal();

//         return () => {
//             if (terminal) {
//                 if ((terminal as any)._resizeHandler) {
//                     window.removeEventListener('resize', (terminal as any)._resizeHandler);
//                 }
//                 terminal.dispose();
//             }
//             if (shellProcessRef.current) {
//                 shellProcessRef.current.kill();
//                 shellProcessRef.current = null;
//             }
//         };
//     }, [webContainer]);

//     return { webContainer, terminalEl, previewUrl, inputWriter };
// }


















import { useEffect, useState, useRef, useCallback } from "react";
import { WebContainer, WebContainerProcess } from "@webcontainer/api";
import "@xterm/xterm/css/xterm.css";
import type { Terminal } from '@xterm/xterm';
import type { FitAddon } from '@xterm/addon-fit';

type ShellInputWriter = WritableStreamDefaultWriter<string> | null;

let webContainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

export function useWebContainer() {
    const [webContainer, setWebContainer] = useState<WebContainer | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const terminalEl = useRef<HTMLDivElement>(null);
    const [inputWriter, setInputWriter] = useState<ShellInputWriter>(null);
    
    const shellProcessRef = useRef<WebContainerProcess | null>(null);
    const terminalRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const boot = async () => {
            if (webContainerInstance) {
                setWebContainer(webContainerInstance);
            } else {
                if (!bootPromise) {
                    bootPromise = WebContainer.boot();
                }
                
                try {
                    const wc = await bootPromise;
                    webContainerInstance = wc;
                    setWebContainer(wc);

                    wc.on('server-ready', (port, url) => {
                        setPreviewUrl(url); 
                    });
                    
                    wc.on('error', (error) => {
                        console.error("WebContainer Error:", error);
                    });

                } catch (error) {
                    console.error("Failed to boot WebContainer:", error);
                    bootPromise = null;
                }
            }
        };
        
        boot();
    }, []);

    const setupTerminal = useCallback(async (): Promise<ShellInputWriter | null> => {
        if (!webContainer || !terminalEl.current) {
            return null;
        }

        if (terminalRef.current) {
            const oldResizeHandler = (terminalRef.current as any)._resizeHandler;
            if (oldResizeHandler) {
                window.removeEventListener('resize', oldResizeHandler);
            }
            terminalRef.current.dispose();
            terminalRef.current = null;
            fitAddonRef.current = null;
        }

        if (shellProcessRef.current) {
            shellProcessRef.current.kill();
            shellProcessRef.current = null;
        }

        terminalEl.current.innerHTML = '';

        const { Terminal } = await import('@xterm/xterm');
        const { FitAddon } = await import('@xterm/addon-fit');

        const terminal = new Terminal({
            convertEol: true,
            cursorBlink: true,
        });
        const fitAddon = new FitAddon();

        terminalRef.current = terminal;
        fitAddonRef.current = fitAddon;
        
        terminal.loadAddon(fitAddon);
        terminal.open(terminalEl.current);
        setTimeout(() => fitAddon.fit(), 100);

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

        shellProcess.exit.then(() => {
            shellProcessRef.current = null;
            setInputWriter(null);
            if (terminalRef.current) {
                terminalRef.current.write('\r\nShell process exited. \r\n');
            }
        });

        return writer;

    }, [webContainer]);

    useEffect(() => {
        if (webContainer) {
            setupTerminal();
        }
    }, [webContainer, setupTerminal]);

    const restartShellProcess = useCallback(async () => {
        const newWriter = await setupTerminal();
        return newWriter;
    }, [setupTerminal]);

    const refitTerminal = () => {
        fitAddonRef.current?.fit();
    };

    return { 
        webContainer, 
        terminalEl, 
        previewUrl, 
        inputWriter,
        refitTerminal, 
        restartShellProcess
    };
}