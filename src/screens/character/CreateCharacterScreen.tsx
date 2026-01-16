/**
 * 创建角色页面
 */
import React, {useState} from 'react';
import {StyleSheet, View, ScrollView, Alert} from 'react-native';
import {TextInput, Button, SegmentedButtons, Chip, Text} from 'react-native-paper';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '@/navigation/RootNavigator';
import {useCharacterStore} from '@/store/characterStore';

type CreateCharacterScreenRouteProp = RouteProp<RootStackParamList, 'CreateCharacter'>;
type CreateCharacterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateCharacter'>;

export const CreateCharacterScreen: React.FC = () => {
  const route = useRoute<CreateCharacterScreenRouteProp>();
  const navigation = useNavigation<CreateCharacterScreenNavigationProp>();
  const {projectId} = route.params;
  const {createCharacter} = useCharacterStore();

  const [name, setName] = useState('');
  const [roleType, setRoleType] = useState<string>('supporting');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [appearance, setAppearance] = useState('');
  const [background, setBackground] = useState('');
  const [deepMotivation, setDeepMotivation] = useState('');
  const [currentTrait, setCurrentTrait] = useState('');
  const [personalityTraits, setPersonalityTraits] = useState<string[]>([]);
  const [currentNeverDo, setCurrentNeverDo] = useState('');
  const [thingsNeverDo, setThingsNeverDo] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const handleAddTrait = () => {
    if (currentTrait.trim()) {
      setPersonalityTraits([...personalityTraits, currentTrait.trim()]);
      setCurrentTrait('');
    }
  };

  const handleRemoveTrait = (index: number) => {
    setPersonalityTraits(personalityTraits.filter((_, i) => i !== index));
  };

  const handleAddNeverDo = () => {
    if (currentNeverDo.trim()) {
      setThingsNeverDo([...thingsNeverDo, currentNeverDo.trim()]);
      setCurrentNeverDo('');
    }
  };

  const handleRemoveNeverDo = (index: number) => {
    setThingsNeverDo(thingsNeverDo.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('错误', '请输入角色名称');
      return;
    }

    if (personalityTraits.length === 0) {
      Alert.alert('错误', '请至少添加一个性格特质');
      return;
    }

    if (!deepMotivation.trim()) {
      Alert.alert('错误', '请输入深层动机（核心对抗人格侵蚀）');
      return;
    }

    if (thingsNeverDo.length === 0) {
      Alert.alert('错误', '请至少添加一个"绝不会做"的事（核心对抗人格侵蚀）');
      return;
    }

    setCreating(true);
    try {
      await createCharacter({
        projectId,
        name: name.trim(),
        roleType: roleType as any,
        age: age.trim() ? parseInt(age) : undefined,
        gender: gender.trim() || undefined,
        appearance: appearance.trim() || undefined,
        background: background.trim() || undefined,
        personalityTraits,
        deepMotivation: deepMotivation.trim(),
        thingsNeverDo,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      Alert.alert('成功', '角色创建成功', [
        {
          text: '确定',
          onPress: () => navigation.goBack(),
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
          label="角色名称 *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <Text style={styles.label}>角色类型 *</Text>
        <SegmentedButtons
          value={roleType}
          onValueChange={setRoleType}
          buttons={[
            {value: 'protagonist', label: '主角'},
            {value: 'major', label: '主要'},
            {value: 'supporting', label: '配角'},
            {value: 'minor', label: '次要'},
            {value: 'antagonist', label: '反派'},
          ]}
          style={styles.input}
        />

        <TextInput
          label="年龄"
          value={age}
          onChangeText={setAge}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          label="性别"
          value={gender}
          onChangeText={setGender}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="外貌描述"
          value={appearance}
          onChangeText={setAppearance}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <TextInput
          label="背景故事"
          value={background}
          onChangeText={setBackground}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <Text style={styles.sectionTitle}>性格特质 * (至少 1 个)</Text>
        <View style={styles.chipInputContainer}>
          <TextInput
            label="添加性格特质"
            value={currentTrait}
            onChangeText={setCurrentTrait}
            mode="outlined"
            style={styles.chipInput}
            onSubmitEditing={handleAddTrait}
          />
          <Button mode="contained" onPress={handleAddTrait} style={styles.addButton}>
            添加
          </Button>
        </View>
        <View style={styles.chipsContainer}>
          {personalityTraits.map((trait, index) => (
            <Chip
              key={index}
              onClose={() => handleRemoveTrait(index)}
              style={styles.chip}>
              {trait}
            </Chip>
          ))}
        </View>

        <TextInput
          label="深层动机 * (对抗人格侵蚀关键字段)"
          value={deepMotivation}
          onChangeText={setDeepMotivation}
          mode="outlined"
          multiline
          numberOfLines={3}
          placeholder="角色最核心的内在驱动力，例如：为了复仇、保护家人、证明自己等"
          style={styles.input}
        />

        <Text style={styles.sectionTitle}>"绝不会做" * (至少 1 个，核心对抗字段)</Text>
        <Text style={styles.hint}>
          列出角色基于其核心价值观绝对不会做的事情，这是对抗 AI 人格侵蚀的关键
        </Text>
        <View style={styles.chipInputContainer}>
          <TextInput
            label='添加"绝不会做"的事'
            value={currentNeverDo}
            onChangeText={setCurrentNeverDo}
            mode="outlined"
            style={styles.chipInput}
            onSubmitEditing={handleAddNeverDo}
          />
          <Button mode="contained" onPress={handleAddNeverDo} style={styles.addButton}>
            添加
          </Button>
        </View>
        <View style={styles.chipsContainer}>
          {thingsNeverDo.map((item, index) => (
            <Chip
              key={index}
              onClose={() => handleRemoveNeverDo(index)}
              style={styles.chip}>
              {item}
            </Chip>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={handleCreate}
          loading={creating}
          disabled={creating}
          style={styles.createButton}>
          创建角色
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
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  chipInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chipInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    marginTop: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  createButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
});
