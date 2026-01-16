/**
 * 创建项目页面
 */
import React, {useState} from 'react';
import {StyleSheet, View, ScrollView, Alert} from 'react-native';
import {TextInput, Button, SegmentedButtons} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '@/navigation/RootNavigator';
import {useProjectStore} from '@/store/projectStore';

type CreateProjectScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateProject'>;

export const CreateProjectScreen: React.FC = () => {
  const navigation = useNavigation<CreateProjectScreenNavigationProp>();
  const {createProject} = useProjectStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [culturalContext, setCulturalContext] = useState<string>('chinese');
  const [worldSetting, setWorldSetting] = useState('');
  const [writingStyle, setWritingStyle] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('错误', '请输入项目名称');
      return;
    }

    setCreating(true);
    try {
      const projectId = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        genre: genre.trim() || undefined,
        culturalContext: culturalContext as any,
        worldSetting: worldSetting.trim() || undefined,
        writingStyle: writingStyle.trim() || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      Alert.alert('成功', '项目创建成功', [
        {
          text: '确定',
          onPress: () => {
            navigation.goBack();
            navigation.navigate('ProjectDetail', {projectId});
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('错误', error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          label="项目名称 *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="简介"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <TextInput
          label="题材类型"
          value={genre}
          onChangeText={setGenre}
          mode="outlined"
          placeholder="例如：玄幻、都市、科幻"
          style={styles.input}
        />

        <SegmentedButtons
          value={culturalContext}
          onValueChange={setCulturalContext}
          buttons={[
            {value: 'chinese', label: '中式'},
            {value: 'japanese', label: '日式'},
            {value: 'western', label: '西式'},
            {value: 'classical', label: '古典'},
          ]}
          style={styles.input}
        />

        <TextInput
          label="世界观设定"
          value={worldSetting}
          onChangeText={setWorldSetting}
          mode="outlined"
          multiline
          numberOfLines={4}
          placeholder="描述故事发生的世界背景、规则等"
          style={styles.input}
        />

        <TextInput
          label="写作风格"
          value={writingStyle}
          onChangeText={setWritingStyle}
          mode="outlined"
          multiline
          numberOfLines={3}
          placeholder="描述期望的写作风格：语言特点、叙事节奏等"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleCreate}
          loading={creating}
          disabled={creating}
          style={styles.createButton}>
          创建项目
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
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  createButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
});
