/**
 * AI 创作页面 - 核心功能
 */
import React, {useState, useEffect} from 'react';
import {StyleSheet, View, ScrollView, Alert} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  ActivityIndicator,
  Text,
  SegmentedButtons,
} from 'react-native-paper';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '@/navigation/RootNavigator';
import {useAIStore} from '@/store/aiStore';
import {useProjectStore} from '@/store/projectStore';
import {useCharacterStore} from '@/store/characterStore';
import {BlindspotType} from '@/services/ai/antiBiasEngine';

type AIGenerateScreenRouteProp = RouteProp<RootStackParamList, 'AIGenerate'>;
type AIGenerateScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AIGenerate'>;

export const AIGenerateScreen: React.FC = () => {
  const route = useRoute<AIGenerateScreenRouteProp>();
  const navigation = useNavigation<AIGenerateScreenNavigationProp>();
  const {projectId} = route.params;

  const {apiConfigured, generating, error, generateChapter, clearError} = useAIStore();
  const {currentProject, selectProject} = useProjectStore();
  const {characters, loadCharacters} = useCharacterStore();

  const [outline, setOutline] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [selectedBlindspots, setSelectedBlindspots] = useState<BlindspotType[]>([
    'personality_erosion',
    'conflict_reduction',
    'cultural_context',
  ]);

  useEffect(() => {
    selectProject(projectId);
    loadCharacters(projectId);
  }, [projectId]);

  useEffect(() => {
    if (error) {
      Alert.alert('错误', error, [{text: '确定', onPress: clearError}]);
    }
  }, [error]);

  const handleGenerate = async () => {
    if (!apiConfigured) {
      Alert.alert('错误', 'Claude API 未配置，请先在设置中配置 API Key', [
        {
          text: '去设置',
          onPress: () => navigation.navigate('Settings'),
        },
        {text: '取消'},
      ]);
      return;
    }

    if (!outline.trim()) {
      Alert.alert('错误', '请输入章节大纲');
      return;
    }

    if (!currentProject) {
      Alert.alert('错误', '项目信息加载失败');
      return;
    }

    try {
      const content = await generateChapter({
        projectId,
        outline: outline.trim(),
        targetBlindspots: selectedBlindspots,
      });
      setGeneratedContent(content);
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const toggleBlindspot = (blindspot: BlindspotType) => {
    if (selectedBlindspots.includes(blindspot)) {
      setSelectedBlindspots(selectedBlindspots.filter(b => b !== blindspot));
    } else {
      setSelectedBlindspots([...selectedBlindspots, blindspot]);
    }
  };

  const getBlindspotLabel = (blindspot: BlindspotType): string => {
    const labels: Record<BlindspotType, string> = {
      personality_erosion: '人格侵蚀',
      foreshadowing_forgotten: '伏笔遗忘',
      conflict_reduction: '冲突降级',
      background_character_quantum: '背景量子化',
      power_inflation: '战力膨胀',
      micro_rhythm_loss: '语气丢失',
      negative_emotion_dampening: '负面钝化',
      timeline_distortion: '时间线扭曲',
      motivation_substitution: '动机替换',
      cultural_context: '文化语境',
    };
    return labels[blindspot] || blindspot;
  };

  if (!currentProject) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>项目信息</Title>
          <Paragraph>项目: {currentProject.name}</Paragraph>
          <Paragraph>类型: {currentProject.genre || '未分类'}</Paragraph>
          <Paragraph>已创建角色: {characters.length} 个</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>对抗偏差选择</Title>
          <Text style={styles.hint}>
            选择需要对抗的 AI 盲区（基于 FDD 分析的 10 大盲区）
          </Text>
          <View style={styles.chipsContainer}>
            {(
              [
                'personality_erosion',
                'foreshadowing_forgotten',
                'conflict_reduction',
                'background_character_quantum',
                'power_inflation',
                'micro_rhythm_loss',
                'negative_emotion_dampening',
                'timeline_distortion',
                'motivation_substitution',
                'cultural_context',
              ] as BlindspotType[]
            ).map(blindspot => (
              <Chip
                key={blindspot}
                selected={selectedBlindspots.includes(blindspot)}
                onPress={() => toggleBlindspot(blindspot)}
                style={styles.chip}>
                {getBlindspotLabel(blindspot)}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>章节生成</Title>
          <TextInput
            label="章节大纲 *"
            value={outline}
            onChangeText={setOutline}
            mode="outlined"
            multiline
            numberOfLines={6}
            placeholder="描述本章节的主要情节、冲突、角色行为等"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleGenerate}
            loading={generating}
            disabled={generating || !apiConfigured}
            icon="robot"
            style={styles.generateButton}>
            {generating ? 'AI 生成中...' : '生成章节'}
          </Button>

          {!apiConfigured && (
            <Text style={styles.warningText}>
              ⚠️ 未配置 Claude API Key，请先前往设置页面配置
            </Text>
          )}
        </Card.Content>
      </Card>

      {generatedContent && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>生成结果</Title>
            <Paragraph style={styles.generatedContent}>{generatedContent}</Paragraph>
            <View style={styles.actionsContainer}>
              <Button
                mode="outlined"
                onPress={() => {
                  // TODO: Save to chapter
                  Alert.alert('提示', '保存章节功能待实现');
                }}
                style={styles.actionButton}>
                保存为章节
              </Button>
              <Button
                mode="outlined"
                onPress={() => setGeneratedContent('')}
                style={styles.actionButton}>
                清空
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
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
  card: {
    margin: 8,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  generateButton: {
    paddingVertical: 8,
  },
  warningText: {
    marginTop: 8,
    color: '#f44336',
    fontSize: 12,
  },
  generatedContent: {
    marginTop: 8,
    lineHeight: 24,
  },
  actionsContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
