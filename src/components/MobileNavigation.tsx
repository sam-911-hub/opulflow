"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, BarChart3, Users, TrendingUp } from "lucide-react";
import useResponsive from "@/hooks/useResponsive";

interface MobileNavigationProps {
  navigation: { id: string; name: string; icon: React.ReactNode }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function MobileNavigation({ navigation, activeTab, setActiveTab }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const { isMobile } = useResponsive();
  
  // Only render on mobile devices
  if (!isMobile) return null;
  
  const quickNavItems = [
    { id: 'overview', name: 'Overview', icon: <BarChart3 className="h-5 w-5" /> },
    { id: 'leads', name: 'Leads', icon: <Users className="h-5 w-5" /> },
    { id: 'pipeline', name: 'Pipeline', icon: <TrendingUp className="h-5 w-5" /> },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 glass-effect z-40 p-3">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {quickNavItems.map((item) => (
          <div key={item.id} className="flex-1 flex justify-center">
            <Button 
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`flex flex-col items-center gap-1 h-auto py-3 px-4 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'gradient-primary text-white shadow-lg scale-105' 
                  : 'hover:bg-orange-50 hover:scale-105'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.name}</span>
            </Button>
          </div>
        ))}
        
        <div className="flex-1 flex justify-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex flex-col items-center gap-1 h-auto py-3 px-4 rounded-xl hover:bg-orange-50 hover:scale-105 transition-all duration-300"
              >
                <Menu className="h-5 w-5" />
                <span className="text-xs font-medium">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] glass-effect">
              <div className="grid grid-cols-3 gap-4 pt-6">
                {navigation
                  .filter(item => !['overview', 'leads', 'pipeline'].includes(item.id))
                  .map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className="flex flex-col items-center gap-3 h-auto py-6 rounded-xl hover:bg-orange-50 hover:scale-105 transition-all duration-300"
                      onClick={() => {
                        setActiveTab(item.id);
                        setOpen(false);
                      }}
                    >
                      <div className="text-orange-600">{item.icon}</div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </Button>
                  ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}