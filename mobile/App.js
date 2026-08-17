import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, StatusBar } from 'react-native';

const API_BASE = 'https://web-production-a267.up.railway.app';
const GOLD = '#C8A951';
const BG = '#0D0800';
const CREAM = '#F5F0E6';

export default function App() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/stats`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.loadingText}>CONNECTING TO BEST...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <Text style={styles.errorText}>CONNECTION FAILED</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <Text style={styles.logo}>BEST</Text>
      <Text style={styles.subtitle}>WORLD RANKING PLATFORM</Text>

      <View style={styles.card}>
        <StatRow label="VIDEOS RANKED" value={stats.videos_ranked} />
        <StatRow label="TOTAL USERS" value={stats.total_users} />
        <StatRow label="MARKS PLACED" value={stats.total_marks} />
        <StatRow label="FIREFLAGS" value={stats.total_fireflags} />
        <StatRow label="CREATOR APPLICATIONS" value={stats.creator_applications} />
        <StatRow label="EARLY ACCESS SIGNUPS" value={stats.early_access_signups} />
      </View>

      {stats.last_snapshot_date && (
        <Text style={styles.footer}>
          LAST RANKING: {stats.last_snapshot_date}
        </Text>
      )}

      <Text style={styles.proof}>
        BACKEND CONNECTED — RAILWAY API LIVE
      </Text>
    </View>
  );
}

function StatRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? 0}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontFamily: 'serif',
    fontSize: 48,
    fontWeight: 'bold',
    color: GOLD,
    letterSpacing: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 6,
    marginBottom: 40,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#3A2E14',
    backgroundColor: 'rgba(200,169,81,0.03)',
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1408',
  },
  rowLabel: {
    fontSize: 11,
    color: '#888',
    letterSpacing: 2,
  },
  rowValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: GOLD,
  },
  footer: {
    marginTop: 24,
    fontSize: 10,
    color: '#444',
    letterSpacing: 2,
  },
  proof: {
    position: 'absolute',
    bottom: 40,
    fontSize: 10,
    color: GOLD,
    letterSpacing: 2,
    opacity: 0.5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 12,
    color: GOLD,
    letterSpacing: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#C0392B',
    letterSpacing: 4,
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
