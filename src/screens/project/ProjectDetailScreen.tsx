/**
 * 项目详情页
 */
import React, {useEffect} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {Card, Title, Paragraph, Button, Chip, Divider} from 'react-native-paper';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '@/navigation/RootNavigator';
import {useProjectStore} from '@/store/projectStore';
import {useChapterStore} from '@/store/chapterStore';

type ProjectDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProjectDetail'>;
type ProjectDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProjectDetail'>;

export const ProjectDetailScreen: React.FC = () => {
  const route = useRoute<ProjectDetailScreenRouteProp>();
  const navigation = useNavigation<ProjectDetailScreenNavigationProp>();
  const {projectId} = route.params;

  const {currentProject, selectProject} = useProjectStore();
  const {chapters, loadChapters} = useChapterStore();

  useEffect(() => {
    selectProject(projectId);
    loadChapters(projectId);
  }, [projectId]);

  if (!currentProject) {
    return null;
  }

  const getCulturalContextLabel = (context: string) => {
    const map: Record<string, string> = {
      chinese: '中式',
      japanese: '日式',
      western: '西式',
      classical: '古典',
    };
    return map[context] || context;
  };

  const handleCharacterManagement = () => {
    navigation.navigate('CharacterList', {projectId});
  };

  const handleAIGenerate = () => {
    navigation.navigate('AIGenerate', {projectId});
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{currentProject.name}</Title>
          {currentProject.description && (
            <Paragraph>{currentProject.description}</Paragraph>
          )}

          <View style={styles.chipsContainer}>
            <Chip style={styles.chip} mode="outlined">
              {currentProject.genre || '未分类'}
            </Chip>
            <Chip style={styles.chip} mode="outlined">
              {getCulturalContextLabel(currentProject.culturalContext)}
            </Chip>
          </View>

          {currentProject.worldSetting && (
            <>
              <Divider style={styles.divider} />
              <Title style={styles.sectionTitle}>世界观设定</Title>
              <Paragraph>{currentProject.worldSetting}</Paragraph>
            </>
          )}

          {currentProject.writingStyle && (
            <>
              <Divider style={styles.divider} />
              <Title style={styles.sectionTitle}>写作风格</Title>
              <Paragraph>{currentProject.writingStyle}</Paragraph>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>统计信息</Title>
          <Paragraph>章节数量: {chapters.length}</Paragraph>
          <Paragraph>
            总字数: {chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0).toLocaleString()}
          </Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          icon="account-group"
          onPress={handleCharacterManagement}
          style={styles.actionButton}>
          角色管理
        </Button>
        <Button
          mode="contained"
          icon="robot"
          onPress={handleAIGenerate}
          style={styles.actionButton}>
          AI 创作
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 8,
    elevation: 2,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  actionsContainer: {
    padding: 8,
  },
  actionButton: {
    marginVertical: 8,
  },
});
