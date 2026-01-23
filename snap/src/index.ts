import { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { Box, Text, Heading } from '@metamask/snaps-sdk';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as defined by `@metamask/snaps-sdk`.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - The request object.
 * @returns The result of `snap_dialog` if approved, otherwise null.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
    switch (request.method) {
        case 'hello':
            return snap.request({
                method: 'snap_dialog',
                params: {
                    type: 'confirmation',
                    content: Box([
                        Text(`Hello, **${origin}**!`),
                        Text('This is the Minties Snap for managing your multi-network assets.')
                    ]),
                },
            });

        case 'get_network_status':
            // Mock method to return status
            return {
                currentNetwork: 'Mantle Sepolia',
                isConnected: true
            };

        default:
            throw new Error('Method not found.');
    }
};
