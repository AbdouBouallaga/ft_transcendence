export {};

declare module "socket.io" {
    interface Socket {
        user: number;
    }
}