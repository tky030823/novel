declare module 'react-native-sqlite-storage' {
  export interface Transaction {
    executeSql(
      sql: string,
      params?: any[],
      success?: (tx: Transaction, results: ResultSet) => void,
      error?: (tx: Transaction, error: Error) => void
    ): void;
  }

  export interface ResultSet {
    insertId: number;
    rowsAffected: number;
    rows: {
      length: number;
      item(index: number): any;
      raw(): any[];
    };
  }

  export interface SQLiteDatabase {
    transaction(
      callback: (tx: Transaction) => void,
      error?: (error: Error) => void,
      success?: () => void
    ): void;

    executeSql(
      sql: string,
      params?: any[]
    ): Promise<[ResultSet]>;

    close(): Promise<void>;
  }

  export interface SQLiteOptions {
    name: string;
    location?: string;
  }

  namespace SQLite {
    export type Database = SQLiteDatabase;
  }

  const SQLite: {
    openDatabase(
      options: SQLiteOptions,
      success?: () => void,
      error?: (error: Error) => void
    ): SQLiteDatabase;
    enablePromise(enable: boolean): void;
    SQLiteDatabase: typeof SQLiteDatabase;
    Transaction: typeof Transaction;
    ResultSet: typeof ResultSet;
  };

  export default SQLite;
}
