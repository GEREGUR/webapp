import { createContext, useContext, type ReactNode } from 'react';
import { useQueryState } from 'nuqs';
import { backButton } from '@tma.js/sdk-react';
import { useEffect } from 'react';
import { cn } from '@/shared/lib/utils';

type TabsContextValue = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

export type TabsProps = {
  children: ReactNode;
  onBack?: () => void;
  queryParamName?: string;
  defaultTab?: string;
};

export const Tabs = ({ children, onBack, queryParamName = 'tab', defaultTab = '0' }: TabsProps) => {
  const [activeTab, setActiveTab] = useQueryState(queryParamName, {
    defaultValue: defaultTab,
    throttleMs: 100,
    clearOnDefault: false,
  });

  useEffect(() => {
    if (!onBack) return;

    backButton.show();
    const offClick = backButton.onClick(onBack);

    return () => {
      offClick();
      backButton.hide();
    };
  }, [onBack]);

  return (
    <TabsContext.Provider
      value={{
        activeTab: activeTab ?? defaultTab,
        setActiveTab: (tab) => void setActiveTab(tab),
      }}
    >
      {children}
    </TabsContext.Provider>
  );
};

export type TabListProps = {
  children: ReactNode;
  className?: string;
};

export const TabList = ({ children, className }: TabListProps) => {
  return <div className={cn(className)}>{children}</div>;
};

export type TabProps = {
  value: string;
  children: ReactNode;
  className?: string;
};

export const Tab = ({ value, children, className }: TabProps) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      type="button"
      className={cn(
        'relative w-fit cursor-pointer appearance-none border-none bg-transparent px-3 py-1.5 text-start text-2xl font-medium transition-all duration-300 ease-out outline-none select-none',
        isActive ? 'text-white' : 'text-gray-700/60 blur-[0.5px] hover:text-gray-300',
        className
      )}
      style={{
        filter: isActive ? 'none' : 'blur(0.5px)',
      }}
    >
      {children}
    </button>
  );
};

export type TabPanelProps = {
  value: string;
  children: ReactNode;
};

export const TabPanel = ({ value, children }: TabPanelProps) => {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) {
    return null;
  }

  return <>{children}</>;
};
