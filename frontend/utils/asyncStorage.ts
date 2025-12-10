// Try to use the native AsyncStorage module; if it's not linked (Expo Go, missing native
// install), fall back to a lightweight in-memory implementation that matches the async API.
let AsyncStorage: any = null;
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const mod = require('@react-native-async-storage/async-storage');
	// Some environments may return a module whose native part is null; guard against that.
	if (mod && typeof mod.getItem === 'function') {
		AsyncStorage = mod;
	}
} catch (e) {
	// ignore and fall back
}

if (!AsyncStorage) {
	// Simple in-memory async storage fallback for dev / Expo Go
	const store = new Map<string, string>();

	AsyncStorage = {
		getItem: async (key: string) => {
			return store.has(key) ? (store.get(key) as string) : null;
		},
		setItem: async (key: string, value: string) => {
			store.set(key, value);
		},
		removeItem: async (key: string) => {
			store.delete(key);
		},
		clear: async () => {
			store.clear();
		},
		getAllKeys: async () => {
			return Array.from(store.keys());
		},
		multiGet: async (keys: string[]) => {
			return keys.map((k) => [k, store.get(k) || null]);
		},
		// no-op multiSet/multiRemove for parity
		multiSet: async (pairs: [string, string][]) => {
			pairs.forEach(([k, v]) => store.set(k, v));
		},
		multiRemove: async (keys: string[]) => {
			keys.forEach((k) => store.delete(k));
		},
	};
}

export default AsyncStorage;
