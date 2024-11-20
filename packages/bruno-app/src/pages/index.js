import { useSelector } from 'react-redux';
import { Sidebar } from 'src/feature/sidebar';
import classes from './Main.module.scss';
import { Homepage } from 'src/feature/homepage';
import { MainView } from 'src/feature/main-view';
import { CodeEditorVariableProvider } from 'components/CodeEditor/CodeEditorVariableProvider';

export function Main() {
  const showHomePage = useSelector((state) => state.app.showHomePage);

  return (
    <div className={classes.wrapper}>
      <CodeEditorVariableProvider>
        <Sidebar />
        <section>{showHomePage ? <Homepage /> : <MainView />}</section>
      </CodeEditorVariableProvider>
    </div>
  );
}
