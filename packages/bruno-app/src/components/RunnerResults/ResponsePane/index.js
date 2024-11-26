import { useMemo, useState } from 'react';
import get from 'lodash/get';
import ResponseHeaders from 'components/ResponsePane/ResponseHeaders';
import TestResults from 'components/ResponsePane/TestResults';
import { DebugTab } from 'components/ResponsePane/Debug';
import { TimelineNew } from 'components/ResponsePane/TimelineNew';
import { ResponsePaneBody } from 'src/feature/response-pane-body';
import { PaneWrapper } from 'src/feature/main-view/components/panes/PaneWrapper';
import { ResponseSummary } from 'src/feature/main-view/components/panes/response/ResponseSummary';

const ResponsePane = ({ rightPaneWidth, item, collection }) => {
  const [selectedTab, setSelectedTab] = useState('response');

  const { responseReceived, testResults, assertionResults, error, timings, debug, timeline } = item;

  const headers = get(item, 'responseReceived.headers', []);

  const getTabPanel = (tab) => {
    switch (tab) {
      case 'response': {
        return (
          <ResponsePaneBody
            item={item}
            collection={collection}
            width={rightPaneWidth}
            disableRun={true} // Running request from Runner view does not make sense
            error={error}
            key={item.filename}
          />
        );
      }
      case 'headers': {
        return <ResponseHeaders headers={headers} />;
      }
      case 'timeline': {
        return <TimelineNew timeline={timeline} />;
      }
      case 'tests': {
        return <TestResults results={testResults} assertionResults={assertionResults} />;
      }
      case 'debug': {
        return <DebugTab debugInfo={debug} timings={timings || {}} />;
      }
      default: {
        return <div>404 | Not found</div>;
      }
    }
  };

  const tabs = useMemo(() => {
    const headerCount = headers ? Object.entries(headers).length : null;

    return [
      { value: 'response', label: 'Response' },
      { value: 'headers', label: <>Headers {headerCount ? <sup>{headerCount}</sup> : null}</> },
      { value: 'timeline', label: 'Timeline' },
      { value: 'tests', label: 'Tests' },
      { value: 'debug', label: 'Debug' }
    ];
  }, [item]);

  return (
    <PaneWrapper
      tabs={tabs}
      activeTab={selectedTab}
      aboveTabs={<ResponseSummary collection={collection} item={item} response={responseReceived} />}
      onTabChange={(tab) => {
        setSelectedTab(tab);
      }}
      content={getTabPanel(selectedTab)}
    />
  );
};

export default ResponsePane;
