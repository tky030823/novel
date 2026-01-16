/**
 * 角色卡片组件
 */
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Title, Paragraph, Chip} from 'react-native-paper';
import {Character} from '@/types/models/Character';

interface Props {
  character: Character;
  onPress: () => void;
}

export const CharacterCard: React.FC<Props> = ({character, onPress}) => {
  const getRoleTypeLabel = (roleType: string) => {
    const map: Record<string, string> = {
      protagonist: '主角',
      major: '主要',
      supporting: '配角',
      minor: '次要',
      antagonist: '反派',
    };
    return map[roleType] || roleType;
  };

  const getRoleTypeColor = (roleType: string) => {
    const map: Record<string, string> = {
      protagonist: '#f44336',
      major: '#ff9800',
      supporting: '#4caf50',
      minor: '#9e9e9e',
      antagonist: '#9c27b0',
    };
    return map[roleType] || '#757575';
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <Title>{character.name}</Title>
          <Chip
            style={[styles.roleChip, {backgroundColor: getRoleTypeColor(character.roleType)}]}
            textStyle={styles.roleChipText}>
            {getRoleTypeLabel(character.roleType)}
          </Chip>
        </View>
        <Paragraph numberOfLines={2}>
          {character.personalityTraits.join('、')}
        </Paragraph>
        {character.deepMotivation && (
          <Paragraph numberOfLines={1} style={styles.motivation}>
            💡 {character.deepMotivation}
          </Paragraph>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleChip: {
    height: 24,
  },
  roleChipText: {
    color: '#fff',
    fontSize: 12,
  },
  motivation: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#666',
  },
});
