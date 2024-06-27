import React from 'react';
import Welcome from 'components/Welcome';
import RequestTabs from 'components/RequestTabs';
import RequestTabPanel from 'components/RequestTabPanel';
import { useSelector } from 'react-redux';
import 'codemirror/theme/material.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/addon/scroll/simplescrollbars.css';
import { Sidebar } from 'src/feature/sidebar';
import classes from './Bruno.module.scss';

const SERVER_RENDERED = typeof navigator === 'undefined' || global['PREVENT_CODEMIRROR_RENDER'] === true;
if (!SERVER_RENDERED) {
  require('codemirror/mode/javascript/javascript');
  require('codemirror/mode/xml/xml');
  require('codemirror/mode/sparql/sparql');
  require('codemirror/addon/comment/comment');
  require('codemirror/addon/dialog/dialog');
  require('codemirror/addon/edit/closebrackets');
  require('codemirror/addon/edit/matchbrackets');
  require('codemirror/addon/fold/brace-fold');
  require('codemirror/addon/fold/foldgutter');
  require('codemirror/addon/fold/xml-fold');
  require('codemirror/addon/hint/javascript-hint');
  require('codemirror/addon/hint/show-hint');
  require('codemirror/addon/lint/lint');
  require('codemirror/addon/lint/json-lint');
  require('codemirror/addon/mode/overlay');
  require('codemirror/addon/scroll/simplescrollbars');
  require('codemirror/addon/search/jump-to-line');
  require('codemirror/addon/search/search');
  require('codemirror/addon/search/searchcursor');
  require('codemirror/keymap/sublime');

  require('codemirror-graphql/hint');
  require('codemirror-graphql/info');
  require('codemirror-graphql/jump');
  require('codemirror-graphql/lint');
  require('codemirror-graphql/mode');

  require('utils/codemirror/brunoVarInfo');
  require('utils/codemirror/javascript-lint');
  require('utils/codemirror/autocomplete');
}

export default function Main() {
  const activeTabUid = useSelector((state) => state.tabs.activeTabUid);
  const showHomePage = useSelector((state) => state.app.showHomePage);

  return (
    <div className={classes.wrapper}>
      <Sidebar />
      <section>
        {showHomePage ? (
          <Welcome />
        ) : (
          <>
            <RequestTabs />
            <RequestTabPanel key={activeTabUid} />
          </>
        )}
      </section>
    </div>
  );
}
