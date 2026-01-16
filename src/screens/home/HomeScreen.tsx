/**
 * 主页 - 项目列表
 */
import React, {useEffect} from 'react';
import {StyleSheet, View, FlatList} from 'react-native';
import {FAB, Text, ActivityIndicator} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '@/navigation/RootNavigator';
import {ProjectCard} from '@/components/common/ProjectCard';
import {useProjectStore} from '@/store/projectStore';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {projects, loading, loadProjects} = useProjectStore();

  useEffect(() => {
    loadProjects();
  }, []);

  const handleProjectPress = (projectId: number) => {
    navigation.navigate('ProjectDetail', {projectId});
  };

  const handleCreateProject = () => {
    navigation.navigate('CreateProject');
  };

  if (loading && projects.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!loading && projects.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>还没有项目</Text>
        <Text style={styles.emptyHint}>点击右下角 + 号创建第一个项目</Text>
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={handleCreateProject}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <ProjectCard
            project={item}
            onPress={() => handleProjectPress(item.id!)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleCreateProject}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});
