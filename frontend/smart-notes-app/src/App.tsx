import { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useAppSelector } from './hooks/useAppDispatch';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Sidebar from './components/layout/Sidebar';
import NoteList from './components/notes/NoteList';
import NoteEditor from './components/notes/NoteEditor';

function AppContent() {
  const { user } = useAppSelector(s => s.auth);
  const [isLogin, setIsLogin] = useState(true);

  if (!user) {
    return isLogin
      ? <LoginForm onSwitch={() => setIsLogin(false)} />
      : <RegisterForm onSwitch={() => setIsLogin(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      <Sidebar />
      <NoteList />
      <div className="flex-1 relative overflow-hidden">
        <NoteEditor />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
