import LandingPage from './pages/LandingPage';
import WorkspaceApp from './App.workspace';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const showWorkspace = params.get('workspace') === '1';

  if (showWorkspace) {
    return <WorkspaceApp />;
  }

  return <LandingPage />;
}
