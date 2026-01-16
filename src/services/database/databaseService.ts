/**
 * 数据库服务 - SQLite 初始化和管理
 */
import SQLite, { SQLiteDatabase, Transaction, ResultSet } from 'react-native-sqlite-storage';
import { MIGRATION_V1_INITIAL, MIGRATION_V1_VERSION } from './migrations/v1_initial';

// 启用 Promise API
SQLite.enablePromise(true);

class DatabaseService {
  private db: SQLiteDatabase | null = null;
  private readonly DB_NAME = 'novel_creation.db';
  private readonly DB_VERSION = MIGRATION_V1_VERSION;

  /**
   * 初始化数据库
   */
  async initialize(): Promise<void> {
    try {
      console.log('[Database] Initializing...');

      // 打开数据库
      this.db = await SQLite.openDatabase({
        name: this.DB_NAME,
        location: 'default',
      });

      console.log('[Database] Opened successfully');

      // 检查并执行迁移
      await this.migrate();

      console.log('[Database] Ready');
    } catch (error) {
      console.error('[Database] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * 执行数据库迁移
   */
  private async migrate(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // 获取当前版本
    const currentVersion = await this.getCurrentVersion();
    console.log(`[Database] Current version: ${currentVersion}`);

    if (currentVersion < this.DB_VERSION) {
      console.log(`[Database] Migrating from v${currentVersion} to v${this.DB_VERSION}...`);

      // 执行迁移
      if (currentVersion < 1) {
        await this.executeSql(MIGRATION_V1_INITIAL);
        await this.setVersion(1);
        console.log('[Database] Migration v1 completed');
      }

      // 未来的迁移在这里添加
      // if (currentVersion < 2) { ... }

      console.log('[Database] All migrations completed');
    }
  }

  /**
   * 获取当前数据库版本
   */
  private async getCurrentVersion(): Promise<number> {
    if (!this.db) {
      return 0;
    }

    try {
      const result = await this.db.executeSql('PRAGMA user_version');
      return result[0].rows.item(0).user_version;
    } catch (error) {
      console.warn('[Database] Could not get version, assuming 0');
      return 0;
    }
  }

  /**
   * 设置数据库版本
   */
  private async setVersion(version: number): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.db.executeSql(`PRAGMA user_version = ${version}`);
  }

  /**
   * 执行 SQL
   */
  async executeSql(sql: string, params: any[] = []): Promise<[ResultSet]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      return await this.db.executeSql(sql, params);
    } catch (error) {
      console.error('[Database] SQL execution error:', error);
      console.error('[Database] SQL:', sql);
      console.error('[Database] Params:', params);
      throw error;
    }
  }

  /**
   * 批量执行 SQL（事务）
   */
  async transaction(callback: (tx: Transaction) => void): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      this.db!.transaction(
        callback,
        (error: Error) => {
          console.error('[Database] Transaction error:', error);
          reject(error);
        },
        () => {
          resolve();
        }
      );
    });
  }

  /**
   * 关闭数据库
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('[Database] Closed');
    }
  }

  /**
   * 获取数据库实例（用于 repositories）
   */
  getDatabase(): SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }
}

// 导出单例
export const databaseService = new DatabaseService();
