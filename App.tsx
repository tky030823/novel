/**
 * 应用入口
 */
import React, {useEffect, useState} from 'react';
import {StatusBar, View, ActivityIndicator, StyleSheet} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {RootNavigator} from '@/navigation/RootNavigator';
import {databaseService} from '@/services/database/databaseService';

const App: React.FC = () => {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // 初始化数据库
      await databaseService.initialize();
      setDbReady(true);
    } catch (err: any) {
      console.error('数据库初始化失败:', err);
      setError(err.message);
    }
  };

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f44336" />
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
      <RootNavigator />
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default App;
