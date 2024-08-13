import { useSelector } from 'react-redux';

const MainView: React.FC = () => {
  const tabs = useSelector((state) => state.tabs.tabs);
  const activeTabUid = useSelector((state) => state.tabs.activeTabUid);

  return <div></div>;
};
