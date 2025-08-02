'use client';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
/**
 * Debug component to help troubleshoot authentication issues
 * Remove this component in production
 */
export const AuthDebug: React.FC = () => {
  const { user, session, loading, isGuest } = useAuth();
  const styles = {
    debug: {
      position: 'fixed' as const,
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      border: '1px solid #333'
    },
    title: {
      fontWeight: 'bold',
      marginBottom: '5px',
      color: '#ffd700'
    },
    item: {
      marginBottom: '3px'
    },
    value: {
      color: '#90EE90'
    },
    null: {
      color: '#ff6b6b'
    }
  };
  return (
    <div style={styles.debug}>
      <div style={styles.title}>🔍 Auth Debug</div>
      <div style={styles.item}>
        Loading: <span style={styles.value}>{loading ? 'true' : 'false'}</span>
      </div>
      <div style={styles.item}>
        Is Guest: <span style={styles.value}>{isGuest ? 'true' : 'false'}</span>
      </div>
      <div style={styles.item}>
        User: <span style={user ? styles.value : styles.null}>
          {user ? `${user.email} (${user.id.slice(0, 8)}...)` : 'null'}
        </span>
      </div>
      <div style={styles.item}>
        Session: <span style={session ? styles.value : styles.null}>
          {session ? `Active (${session.access_token.slice(0, 20)}...)` : 'null'}
        </span>
      </div>
      {user && (
        <div style={styles.item}>
          Provider: <span style={styles.value}>
            {user.app_metadata?.provider || 'unknown'}
          </span>
        </div>
      )}
    </div>
  );
};
