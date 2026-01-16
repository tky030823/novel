/**
 * 根导航器
 */
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {HomeScreen} from '@/screens/home/HomeScreen';
import {ProjectDetailScreen} from '@/screens/project/ProjectDetailScreen';
import {CreateProjectScreen} from '@/screens/project/CreateProjectScreen';
import {CharacterListScreen} from '@/screens/character/CharacterListScreen';
import {CreateCharacterScreen} from '@/screens/character/CreateCharacterScreen';
import {AIGenerateScreen} from '@/screens/ai/AIGenerateScreen';
import {SettingsScreen} from '@/screens/settings/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  ProjectDetail: {projectId: number};
  CreateProject: undefined;
  CharacterList: {projectId: number};
  CreateCharacter: {projectId: number};
  AIGenerate: {projectId: number};
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ee',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: '我的项目'}}
        />
        <Stack.Screen
          name="ProjectDetail"
          component={ProjectDetailScreen}
          options={{title: '项目详情'}}
        />
        <Stack.Screen
          name="CreateProject"
          component={CreateProjectScreen}
          options={{title: '创建项目'}}
        />
        <Stack.Screen
          name="CharacterList"
          component={CharacterListScreen}
          options={{title: '角色管理'}}
        />
        <Stack.Screen
          name="CreateCharacter"
          component={CreateCharacterScreen}
          options={{title: '创建角色'}}
        />
        <Stack.Screen
          name="AIGenerate"
          component={AIGenerateScreen}
          options={{title: 'AI 创作'}}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{title: '设置'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
