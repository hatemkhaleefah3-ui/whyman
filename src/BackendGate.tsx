import {useEffect, useState} from 'react';
import {Cloud, CloudOff, RefreshCw} from 'lucide-react';
import {api} from './lib/api';
import {NavExperience} from './NavExperience';

type ConnectionState = 'checking' | 'online' | 'offline';

export function BackendGate() {
  const [state, setState] = useState<ConnectionState>('checking');
  const [message, setMessage] = useState('Connecting to Whyman services…');

  const check = async () => {
    setState('checking');
    setMessage('Connecting to Whyman services…');
    try {
      const result = await api.health();
      if (!result.ok) throw new Error('The API did not report a healthy state.');
      setState('online');
      setMessage('Cloud backend connected');
    } catch (error) {
      setState('offline');
      setMessage(error instanceof Error ? error.message : 'Backend connection failed');
    }
  };

  useEffect(() => {
    void check();
  }, []);

  return (
    <>
      <NavExperience />
      <aside className={`backend-status ${state}`} role="status" aria-live="polite">
        <span className="backend-status-icon">
          {state === 'offline' ? <CloudOff size={16} /> : <Cloud size={16} />}
        </span>
        <span>
          <strong>{state === 'checking' ? 'Checking backend' : state === 'online' ? 'Backend online' : 'Backend unavailable'}</strong>
          <small>{message}</small>
        </span>
        {state === 'offline' && (
          <button type="button" onClick={() => void check()} aria-label="Retry backend connection">
            <RefreshCw size={15} />
          </button>
        )}
      </aside>
    </>
  );
}
