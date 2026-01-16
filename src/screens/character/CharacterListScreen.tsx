/**
 * 角色列表页面
 */
import React, {useEffect} from 'react';
import {StyleSheet, View, FlatList} from 'react-native';
import {FAB, Text, ActivityIndicator, SegmentedButtons} from 'react-native-paper';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '@/navigation/RootNavigator';
import {CharacterCard} from '@/components/common/CharacterCard';
import {useCharacterStore} from '@/store/characterStore';

type CharacterListScreenRouteProp = RouteProp<RootStackParamList, 'CharacterList'>;
type CharacterListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CharacterList'>;

export const CharacterListScreen: React.FC = () => {
  const route = useRoute<CharacterListScreenRouteProp>();
  const navigation = useNavigation<CharacterListScreenNavigationProp>();
  const {projectId} = route.params;

  const {characters, loading, loadCharacters} = useCharacterStore();
  const [filter, setFilter] = React.useState<string>('all');

  useEffect(() => {
    loadCharacters(projectId);
  }, [projectId]);

  const handleCharacterPress = (characterId: number) => {
    // TODO: Navigate to character detail screen
    console.log('Character pressed:', characterId);
  };

  const handleCreateCharacter = () => {
    navigation.navigate('CreateCharacter', {projectId});
  };

  const filteredCharacters = React.useMemo(() => {
    if (filter === 'all') {
      return characters;
    }
    return characters.filter(c => c.roleType === filter);
  }, [characters, filter]);

  if (loading && characters.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!loading && characters.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>还没有角色</Text>
        <Text style={styles.emptyHint}>点击右下角 + 号创建第一个角色</Text>
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={handleCreateCharacter}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            {value: 'all', label: '全部'},
            {value: 'protagonist', label: '主角'},
            {value: 'major', label: '主要'},
            {value: 'supporting', label: '配角'},
            {value: 'antagonist', label: '反派'},
          ]}
        />
      </View>

      <FlatList
        data={filteredCharacters}
        keyExtractor={item => item.id!.toString()}
        renderItem={({item}) => (
          <CharacterCard
            character={item}
            onPress={() => handleCharacterPress(item.id!)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleCreateCharacter}
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
  filterContainer: {
    padding: 8,
    backgroundColor: '#fff',
    elevation: 2,
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
