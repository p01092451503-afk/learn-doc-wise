import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PublicMain from "./PublicMain";

interface Template {
  id: string;
  name: string;
  template_key: string;
  style_config: {
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
    heroStyle: string;
  };
}

const TemplatePreview = () => {
  const { templateKey } = useParams<{ templateKey: string }>();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (templateKey) {
      fetchTemplate();
    }
  }, [templateKey]);

  const fetchTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("template_key", templateKey)
        .single();

      if (error) throw error;
      
      if (data) {
        const templateData = {
          ...data,
          style_config: data.style_config as Template['style_config']
        };
        setTemplate(templateData);
        applyTemplateStyles(templateData.style_config);
      }
    } catch (error) {
      console.error("Error fetching template:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplateStyles = (styleConfig: Template['style_config']) => {
    const root = document.documentElement;
    
    // Convert hex to HSL
    const hexToHSL = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return "0 0% 0%";
      
      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    root.style.setProperty('--primary', hexToHSL(styleConfig.primaryColor));
    root.style.setProperty('--accent', hexToHSL(styleConfig.accentColor));
    
    // Apply font family if needed
    if (styleConfig.fontFamily) {
      root.style.setProperty('font-family', styleConfig.fontFamily);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">템플릿을 찾을 수 없습니다</h1>
          <p className="text-muted-foreground">요청한 템플릿이 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Template Preview Banner */}
      <div className="bg-primary/10 border-b border-primary/20 py-2 px-4 text-center">
        <p className="text-sm font-medium text-primary">
          템플릿 미리보기: <span className="font-bold">{template.name}</span>
        </p>
      </div>
      
      {/* Render the main page with template styles */}
      <PublicMain />
    </div>
  );
};

export default TemplatePreview;