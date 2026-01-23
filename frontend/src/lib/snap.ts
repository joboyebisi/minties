export const defaultSnapOrigin = 'local:http://localhost:8080';

export type GetSnapsResponse = Record<string, Snap>;

export type Snap = {
    permissionName: string;
    id: string;
    version: string;
    initialPermissions: Record<string, unknown>;
};

export const getSnaps = async (): Promise<GetSnapsResponse> => {
    return (await window.ethereum.request({
        method: 'wallet_getSnaps',
    })) as GetSnapsResponse;
};

export const connectSnap = async (snapId: string = defaultSnapOrigin, params: Record<string, unknown> = {}) => {
    await window.ethereum.request({
        method: 'wallet_requestSnaps',
        params: {
            [snapId]: params,
        },
    });
};

export const getSnap = async (version?: string): Promise<Snap | undefined> => {
    try {
        const snaps = await getSnaps();
        return Object.values(snaps).find(
            (snap) =>
                snap.id === defaultSnapOrigin && (!version || snap.version === version),
        );
    } catch (e) {
        console.log('Failed to obtain installed snap', e);
        return undefined;
    }
};

export const invokeSnap = async (method: string, params: Record<string, unknown> = {}) => {
    return await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: defaultSnapOrigin,
            request: { method, params }
        }
    });
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
