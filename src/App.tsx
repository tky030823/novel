/**
 * 应用入口文件
 */
import React, {useEffect, useState} from 'react';
import {StatusBar, View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {databaseService} from './services/database/databaseService';

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('[App] Initializing...');

      // 初始化数据库
      await databaseService.initialize();

      console.log('[App] Ready');
      setIsReady(true);
    } catch (err: any) {
      console.error('[App] Initialization failed:', err);
      setError(err.message || 'Failed to initialize app');
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>初始化失败</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>正在初始化...</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>小说创作助手</Text>
        <Text style={styles.subtitle}>AI 辅助创作，对抗默认偏差</Text>
        <Text style={styles.version}>v0.1.0 - MVP</Text>
        <Text style={styles.status}>✅ 核心服务已就绪</Text>
        <View style={styles.features}>
          <Text style={styles.featureItem}>✓ 数据库服务</Text>
          <Text style={styles.featureItem}>✓ 对抗偏差引擎</Text>
          <Text style={styles.featureItem}>✓ AI 生成服务</Text>
          <Text style={styles.featureItem}>✓ Repository 层</Text>
        </View>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  version: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  status: {
    fontSize: 18,
    color: '#4caf50',
    fontWeight: '600',
    marginBottom: 20,
  },
  features: {
    marginTop: 20,
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default App;
