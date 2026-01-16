/**
 * 项目卡片组件
 */
import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, Title, Paragraph, Chip} from 'react-native-paper';
import {Project} from '@/types/models/Project';

interface Props {
  project: Project;
  onPress: () => void;
}

export const ProjectCard: React.FC<Props> = ({project, onPress}) => {
  const getCulturalContextLabel = (context: string) => {
    const map: Record<string, string> = {
      chinese: '中式',
      japanese: '日式',
      western: '西式',
      classical: '古典',
    };
    return map[context] || context;
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Title>{project.name}</Title>
        {project.description && (
          <Paragraph numberOfLines={2}>{project.description}</Paragraph>
        )}
        <Chip style={styles.chip} mode="outlined">
          {project.genre || '未分类'} · {getCulturalContextLabel(project.culturalContext)}
        </Chip>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 2,
  },
  chip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});
