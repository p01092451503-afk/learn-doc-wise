import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
}

mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  securityLevel: "loose",
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: "basis",
  },
});

const MermaidDiagram = ({ chart }: MermaidDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      const div = document.createElement("div");
      div.className = "mermaid";
      div.textContent = chart;
      containerRef.current.appendChild(div);
      
      mermaid.contentLoaded();
    }
  }, [chart]);

  return <div ref={containerRef} className="flex justify-center" />;
};

export default MermaidDiagram;
