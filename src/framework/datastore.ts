interface KeyValueDatastore<T> {
  store: {
    [key: string]: T;
  };
}

export abstract class DataStore<T> implements KeyValueDatastore<T> {
  store: { [key: string]: T };
  constructor() {
    this.store = {};
  }
  public get(key: string): T | undefined {
    return this.store[key];
  }

  public set(key: string, value: T) {
    this.store = { ...this.store, [key]: value };
  }
}
