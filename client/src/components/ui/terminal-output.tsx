import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TerminalOutput } from "@/types/security";

interface TerminalProps {
  output: TerminalOutput;
  className?: string;
}

export function Terminal({ output, className }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div
      ref={terminalRef}
      className={cn(
        "bg-zinc-900 text-zinc-100 font-mono text-sm p-4 rounded-md overflow-auto",
        className
      )}
    >
      {output.lines.map((line, index) => (
        <div
          key={index}
          className={cn({
            "text-blue-400": line.type === "info",
            "text-green-400": line.type === "success",
            "text-red-400": line.type === "error",
            "text-yellow-400": line.type === "warning",
            "text-zinc-500": line.type === "command",
            "text-zinc-300": line.type === "output",
          })}
        >
          {line.type === "command" ? "$ " : ""}
          {line.text}
        </div>
      ))}
      <div className="mt-1 flex items-center">
        <span className="text-zinc-500">$</span>
        <span className="ml-1 h-4 w-2 bg-zinc-300 animate-pulse"></span>
      </div>
    </div>
  );
}
