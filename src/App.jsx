import LandingPage from './pages/LandingPage';
import WorkspaceApp from './App.workspace';

export default function App() {
  const { pathname, search } = window.location;
  const params = new URLSearchParams(window.location.search);
  if (pathname === '/auth/callback') {
    const nextPath = params.get('next') || '/?workspace=1';
    const destination = nextPath.startsWith('/') ? nextPath : '/?workspace=1';
    window.location.replace(destination);
    return null;
  }

  const showWorkspace = params.get('workspace') === '1';

  if (showWorkspace) {
    return <WorkspaceApp />;
  }

  return <LandingPage />;
}
