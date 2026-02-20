import { Tabs, TabList, Tab, TabPanel } from '@/shared/ui/tabs';

export const IndexPage = () => {
  return (
    <Tabs defaultTab="morning">
      <TabList className="flex gap-1 p-1">
        <Tab
          value="market"
          className="flex-1 rounded px-4 py-2 text-white transition-colors data-[active=false]:bg-[rgba(121,121,121,1)] data-[active=true]:bg-white/20"
        >
          Рынок
        </Tab>
        <Tab
          value="orders"
          className="flex-1 rounded px-4 py-2 text-white transition-colors data-[active=false]:bg-[rgba(121,121,121,1)] data-[active=true]:bg-white/20"
        >
          Мои ордера
        </Tab>
      </TabList>
      <TabPanel value="market">Маркет</TabPanel>
      <TabPanel value="orders">Мои ордера</TabPanel>
    </Tabs>
  );
};
