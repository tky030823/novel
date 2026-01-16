/**
 * 设置页面
 */
import React, {useState} from 'react';
import {StyleSheet, View, ScrollView, Alert} from 'react-native';
import {TextInput, Button, Card, Title, Paragraph, List} from 'react-native-paper';
import {useAIStore} from '@/store/aiStore';

export const SettingsScreen: React.FC = () => {
  const {apiConfigured, configureAPI} = useAIStore();
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveAPIKey = () => {
    if (!apiKey.trim()) {
      Alert.alert('错误', '请输入 API Key');
      return;
    }

    setSaving(true);
    try {
      configureAPI(apiKey.trim());
      Alert.alert('成功', 'API Key 配置成功');
      setApiKey('');
    } catch (error: any) {
      Alert.alert('错误', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Claude API 配置</Title>
          <Paragraph>
            当前状态: {apiConfigured ? '✅ 已配置' : '❌ 未配置'}
          </Paragraph>

          <TextInput
            label="API Key"
            value={apiKey}
            onChangeText={setApiKey}
            mode="outlined"
            secureTextEntry
            placeholder="sk-ant-api03-..."
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSaveAPIKey}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}>
            保存配置
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>如何获取 API Key</Title>
          <List.Item
            title="1. 访问 Anthropic 官网"
            description="https://console.anthropic.com/"
            left={props => <List.Icon {...props} icon="numeric-1-circle" />}
          />
          <List.Item
            title="2. 注册并登录账号"
            left={props => <List.Icon {...props} icon="numeric-2-circle" />}
          />
          <List.Item
            title="3. 在 API Keys 页面创建新的 API Key"
            left={props => <List.Icon {...props} icon="numeric-3-circle" />}
          />
          <List.Item
            title="4. 复制 API Key 并粘贴到上方输入框"
            left={props => <List.Icon {...props} icon="numeric-4-circle" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>重要说明</Title>
          <Paragraph style={styles.paragraph}>
            • API Key 仅存储在本地设备，不会上传到任何服务器
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            • 使用 Claude API 会产生费用，请在 Anthropic 控制台查看用量
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            • 建议设置用量限制以控制成本
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            • 本应用纯单机运行，支持 R18 内容，无审查
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>关于本应用</Title>
          <Paragraph style={styles.paragraph}>
            版本: 1.0.0
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            基于 FDD 分析的 AI 小说创作辅助工具
          </Paragraph>
          <Paragraph style={styles.paragraph}>
            核心功能: 对抗 AI 的 10 大创作盲区
          </Paragraph>
        </Card.Content>
      </Card>
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
  input: {
    marginTop: 16,
    marginBottom: 16,
  },
  saveButton: {
    paddingVertical: 8,
  },
  paragraph: {
    marginTop: 8,
    lineHeight: 20,
  },
});
